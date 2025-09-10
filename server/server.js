import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend dist
app.use(express.static(path.join(path.dirname(import.meta.url.replace('file://', '')), '..', 'frontend')));

// File paths
const SSH_SUMMARY_PATH = '/var/log/ssh_reports/ssh_summary_last14d.md';
const SSH_REPORTS_DIR = '/var/log/ssh_reports/';

// WebSocket server for live connections
const wss = new WebSocketServer({ port: 3002 });
const connectedClients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected for live SSH monitoring');
  connectedClients.add(ws);
  
  ws.on('close', () => {
    console.log('Client disconnected');
    connectedClients.delete(ws);
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    connectedClients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcastLiveConnection(connectionData) {
  const message = JSON.stringify({
    type: 'live_connection',
    data: connectionData,
    timestamp: new Date().toISOString()
  });
  
  connectedClients.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// API Routes

// Get SSH summary data from file
app.get('/api/ssh-summary', async (req, res) => {
  try {
    const data = await fs.readFile(SSH_SUMMARY_PATH, 'utf8');
    const stats = await fs.stat(SSH_SUMMARY_PATH);
    
    // Parse the report generation date from the content
    let reportGeneratedDate = null;
    try {
      // Look for the pattern: **Generated:** DD-MM-YYYY HH:MM:SS
      const generatedMatch = data.match(/\*\*Generated:\*\*\s+(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2})/);
      if (generatedMatch) {
        reportGeneratedDate = generatedMatch[1];
      }
    } catch (parseError) {
      console.error('Error parsing report generation date:', parseError);
    }
    
    res.json({ 
      success: true, 
      data: data,
      lastModified: stats.mtime,
      fileSize: stats.size,
      reportGeneratedDate: reportGeneratedDate
    });
  } catch (error) {
    console.error('Error reading SSH summary:', error);
    res.status(404).json({ 
      success: false, 
      error: 'SSH summary file not found or cannot be read',
      path: SSH_SUMMARY_PATH
    });
  }
});

// Generate new SSH summary report
app.post('/api/generate-report', async (req, res) => {
  try {
    const reportScriptPath = path.join(process.cwd(), '../py_script/report_maker.py');
    const command = `python3 "${reportScriptPath}" "${SSH_REPORTS_DIR}ssh_report_*.csv"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Processing') && !stderr.includes('Skipping')) {
      throw new Error(stderr);
    }
    
    // Read the generated file
    const data = await fs.readFile(SSH_SUMMARY_PATH, 'utf8');
    
    res.json({ 
      success: true, 
      message: 'Report generated successfully',
      data: data,
      output: stdout
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get current live SSH connections from system
app.get('/api/live-connections', async (req, res) => {
  try {
    // Get active SSH connections using multiple methods
    const commands = [
      'ss -tn state established "( dport = :22 or sport = :22 )" 2>/dev/null || true',
      'netstat -tn 2>/dev/null | grep ":22" | grep ESTABLISHED || true',
      'lsof -i :22 2>/dev/null | grep ESTABLISHED || true'
    ];
    
    const connections = [];
    const seenIPs = new Set();
    
    for (const command of commands) {
      try {
        const { stdout } = await execAsync(command);
        const lines = stdout.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.includes('ESTAB') || line.includes('ESTABLISHED')) {
            // Parse different command outputs
            let remoteIP = null;
            
            if (command.includes('ss ')) {
              // ss command output
              const parts = line.split(/\s+/);
              if (parts.length >= 5) {
                const remoteAddr = parts[4];
                const remoteMatch = remoteAddr.match(/^(.+):(\d+)$/);
                if (remoteMatch) {
                  remoteIP = remoteMatch[1];
                }
              }
            } else if (command.includes('netstat')) {
              // netstat command output
              const parts = line.split(/\s+/);
              if (parts.length >= 5) {
                const remoteAddr = parts[4];
                const remoteMatch = remoteAddr.match(/^(.+):(\d+)$/);
                if (remoteMatch) {
                  remoteIP = remoteMatch[1];
                }
              }
            }
            
            if (remoteIP && !seenIPs.has(remoteIP)) {
              // Include localhost for testing but mark it differently
              const isLocal = remoteIP.includes('127.0.0.1') || remoteIP.includes('::1') || remoteIP === 'localhost';
              
              connections.push({
                remoteIP: remoteIP,
                remotePort: '22',
                status: 'ESTABLISHED',
                timestamp: new Date().toISOString(),
                isLocal: isLocal
              });
              
              seenIPs.add(remoteIP);
            }
          }
        }
      } catch (cmdError) {
        // Continue with next command if this one fails
        continue;
      }
    }
    
    console.log(`Found ${connections.length} SSH connections:`, connections.map(c => c.remoteIP));
    
    res.json({ 
      success: true, 
      connections: connections,
      count: connections.length
    });
  } catch (error) {
    console.error('Error getting live connections:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      connections: []
    });
  }
});

// Monitor SSH log files for new connections
async function monitorSSHLogs() {
  try {
    // Watch for new SSH connections in auth.log
    const authLogPaths = ['/var/log/auth.log', '/var/log/secure', '/var/log/messages'];
    
    for (const logPath of authLogPaths) {
      try {
        await fs.access(logPath);
        console.log(`Monitoring SSH logs: ${logPath}`);
        
        let lastLogSize = 0;
        try {
          const stats = await fs.stat(logPath);
          lastLogSize = stats.size;
        } catch (err) {
          // Ignore if can't get initial size
        }
        
        chokidar.watch(logPath).on('change', async () => {
          try {
            // Check if file grew (new content added)
            const stats = await fs.stat(logPath);
            if (stats.size <= lastLogSize) {
              return; // File didn't grow, ignore
            }
            lastLogSize = stats.size;
            
            // Get last few lines of the log and look for various SSH patterns
            const { stdout } = await execAsync(`tail -n 50 "${logPath}" | grep -E "(sshd.*Accepted|sshd.*session opened|Connection from)" | tail -n 5 || true`);
            
            if (stdout.trim()) {
              const lines = stdout.trim().split('\n');
              const latestLine = lines[lines.length - 1];
              
              console.log('Latest SSH log line:', latestLine);
              
              // Parse SSH connection info - try multiple patterns
              let ipMatch, userMatch;
              
              // Pattern 1: "Accepted password for user from IP"
              if (latestLine.includes('Accepted')) {
                ipMatch = latestLine.match(/from\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
                userMatch = latestLine.match(/for\s+([^\s]+)\s+from/);
              }
              // Pattern 2: "session opened for user"
              else if (latestLine.includes('session opened')) {
                userMatch = latestLine.match(/session opened for user\s+([^\s]+)/);
                // Try to get IP from previous lines if available
                const previousLines = lines.slice(-3);
                for (const line of previousLines) {
                  const tempIp = line.match(/from\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
                  if (tempIp) {
                    ipMatch = tempIp;
                    break;
                  }
                }
              }
              // Pattern 3: "Connection from IP"
              else if (latestLine.includes('Connection from')) {
                ipMatch = latestLine.match(/Connection from\s+([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
                userMatch = [null, 'unknown']; // Default user
              }
              
              if (ipMatch && userMatch && ipMatch[1]) {
                // Skip localhost and private network connections for live monitoring
                const ip = ipMatch[1];
                if (!ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
                  const connectionData = {
                    ip: ip,
                    user: userMatch[1] || 'unknown',
                    timestamp: new Date().toISOString(),
                    type: 'login'
                  };
                  
                  console.log('New SSH connection detected:', connectionData);
                  broadcastLiveConnection(connectionData);
                }
              }
            }
          } catch (err) {
            console.error('Error parsing SSH logs:', err);
          }
        });
        break; // Use the first available log file
      } catch (err) {
        // Log file doesn't exist, try next one
        continue;
      }
    }
  } catch (error) {
    console.error('Error setting up SSH log monitoring:', error);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connectedClients: connectedClients.size
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(path.dirname(import.meta.url.replace('file://', '')), '..', 'frontend', 'index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`SSH Monitor API server running on port ${PORT}`);
  console.log(`WebSocket server running on port 3002`);
  console.log(`SSH Summary Path: ${SSH_SUMMARY_PATH}`);
  
  // Start monitoring SSH logs
  monitorSSHLogs();
});

export default app;
