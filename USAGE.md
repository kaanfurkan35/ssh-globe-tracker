# SSH Globe Tracker - Usage Guide 📖

Complete usage instructions for SSH Globe Tracker - Real-time SSH security monitoring with global visualization.

---

## 📑 **Table of Contents**

- [🚀 Getting Started](#-getting-started)
- [💻 Command Line Interface](#-command-line-interface)
- [🌐 Web Interface](#-web-interface)
- [🔧 Management Scripts](#-management-scripts)
- [📊 Features Guide](#-features-guide)
- [🛠️ Configuration](#️-configuration)
- [🔍 Monitoring & Logs](#-monitoring--logs)
- [⚡ Advanced Usage](#-advanced-usage)

---

## 🚀 **Getting Started**

### **First Time Setup**

```bash
# 1. Clone the repository
git clone https://github.com/kaanfurkan35/ssh-globe-tracker.git
cd ssh-globe-tracker

# 2. Choose installation method
./setup-ubuntu.sh              # Interactive guide (recommended)
# OR
./ubuntu-package.sh install    # Direct installation
# OR  
./start.sh                     # Development mode
```

### **Quick Start Commands**

```bash
# Start the application
ssh-globe-tracker start

# Check if running
ssh-globe-tracker status

# View logs
ssh-globe-tracker logs

# Stop the application  
ssh-globe-tracker stop
```

### **Access the Interface**

- **Web Interface:** http://localhost:3001
- **API Health:** http://localhost:3001/api/health
- **WebSocket:** ws://localhost:3001

---

## 💻 **Command Line Interface**

### **Main Commands**

```bash
# Service Management
ssh-globe-tracker start        # Start the service
ssh-globe-tracker stop         # Stop the service
ssh-globe-tracker restart      # Restart the service
ssh-globe-tracker status       # Show service status
ssh-globe-tracker logs         # View service logs
```

### **Development Commands**

```bash
# Development Scripts
./start.sh                     # Start in development mode
./start-simple.sh              # Simple start (no sudo)
./check-status.sh              # Comprehensive status check

# Package Management
./ubuntu-package.sh install    # Install system-wide
./ubuntu-package.sh deb        # Build .deb package
./ubuntu-package.sh remove     # Remove installation

# Deployment
./deploy.sh user@server        # Deploy to remote machine
./uninstall.sh                 # Complete removal
```

### **Advanced Commands**

```bash
# Manual Operations
python3 py_script/report_maker.py    # Generate reports manually
node server/server.js                # Start backend directly

# System Integration
sudo systemctl enable ssh-globe-tracker    # Auto-start on boot
sudo systemctl disable ssh-globe-tracker   # Disable auto-start

# Debugging
DEBUG=* node server/server.js        # Debug mode
NODE_ENV=development npm start       # Development environment
```

---

## 🌐 **Web Interface**

### **Dashboard Overview**

The main dashboard provides:

1. **🗺️ Interactive Globe**
   - 3D visualization of global SSH connections
   - Country-based connection clustering
   - Real-time connection updates

2. **📊 Statistics Panel**
   - Connection counts by time period
   - Geographic distribution
   - Authentication method breakdown
   - Failed vs successful attempts

3. **📋 Recent Connections**
   - Live feed of SSH connections
   - IP addresses with geolocation
   - Timestamps and user information
   - Connection status indicators

### **Navigation**

- **Dashboard:** Main overview with globe and statistics
- **Reports:** Historical analysis and generated reports
- **Live Monitor:** Real-time connection monitoring
- **Settings:** Configuration and preferences

### **Interactive Features**

#### **Globe Interaction**
```javascript
// Click on countries to see details
// Hover over connection points for info
// Zoom and rotate for better view
// Toggle between different data views
```

#### **Data Filtering**
- **Time Range:** Select specific time periods
- **IP Filtering:** Focus on specific IP ranges
- **User Filtering:** Monitor specific users
- **Status Filtering:** Success/failure analysis

#### **Real-time Updates**
- **Live Dots:** Green dots show new connections
- **Auto-refresh:** Configurable refresh intervals
- **Sound Alerts:** Optional audio notifications
- **Browser Notifications:** Desktop alerts

---

## 🔧 **Management Scripts**

### **Setup and Installation**

#### **setup-ubuntu.sh**
```bash
./setup-ubuntu.sh

# Interactive options:
# 1. Quick System Install
# 2. Debian Package
# 3. Development Setup
# 4. Docker Installation
```

#### **ubuntu-package.sh**
```bash
./ubuntu-package.sh [command]

# Commands:
# install    - Direct system installation
# deb        - Build Debian package
# snap       - Build Snap package
# remove     - Remove installation
# clean      - Clean build artifacts
```

### **Deployment Scripts**

#### **deploy.sh**
```bash
./deploy.sh user@target-machine

# Features:
# - Automatic dependency installation
# - Service configuration
# - Health verification
# - Multiple fallback methods

# Examples:
./deploy.sh ubuntu@192.168.1.100
./deploy.sh root@example.com
./deploy.sh user@[2001:db8::1]    # IPv6 support
```

#### **start-simple.sh**
```bash
./start-simple.sh

# Features:
# - No sudo password required
# - Limited permissions mode
# - Background operation
# - Automatic process management
```

### **Monitoring Scripts**

#### **check-status.sh**
```bash
./check-status.sh

# Provides:
# - Process status
# - API health check
# - Service configuration
# - Log file analysis
# - Performance metrics
```

### **Development Scripts**

#### **start.sh**
```bash
./start.sh

# Development features:
# - Hot reload
# - Separate frontend/backend
# - Development tools
# - Error reporting
```

---

## 📊 **Features Guide**

### **🗺️ Interactive Map**

#### **Basic Usage**
1. **View Connections:** Globe shows SSH connection origins
2. **Country Information:** Click countries for detailed stats
3. **Connection Paths:** Lines show connection routes
4. **Time-based Visualization:** Historical and real-time data

#### **Advanced Features**
- **Heat Maps:** Connection density visualization
- **Clustering:** Group nearby connections
- **Animation:** Time-lapse of connection activity
- **Custom Markers:** Highlight specific IPs or events

### **📊 Analytics Dashboard**

#### **Connection Statistics**
```bash
# Metrics available:
- Total connections (daily/weekly/monthly)
- Unique IP addresses
- Geographic distribution
- Authentication success rates
- Peak activity times
- User activity patterns
```

#### **Security Analysis**
- **Failed Attempts:** Brute force detection
- **Suspicious IPs:** Unusual activity patterns
- **Geographic Anomalies:** Connections from unexpected locations
- **Time-based Analysis:** Off-hours activity monitoring

### **📋 Report Generation**

#### **Automatic Reports**
```bash
# Report types:
- Daily SSH summary
- Weekly security overview
- Monthly trends analysis
- Geographic distribution report
- User activity summary
```

#### **Manual Report Generation**
```bash
# Generate custom reports
python3 py_script/report_maker.py --days 30
python3 py_script/report_maker.py --users --geo
python3 py_script/report_maker.py --security-focus
```

### **🔄 Live Monitoring**

#### **Real-time Features**
- **WebSocket Updates:** Instant connection notifications
- **Visual Indicators:** Color-coded connection status
- **Sound Alerts:** Audio notifications for events
- **Auto-refresh:** Configurable update intervals

#### **Alert Configuration**
```javascript
// Configure alerts in web interface
{
  "failedAttempts": {
    "threshold": 5,
    "timeWindow": "5m",
    "action": "notify"
  },
  "newCountries": {
    "enabled": true,
    "action": "highlight"
  }
}
```

---

## 🛠️ **Configuration**

### **System Configuration**

#### **Service Configuration**
```bash
# Edit service file
sudo systemctl edit ssh-globe-tracker

# Common configurations:
[Service]
Environment=PORT=3001
Environment=NODE_ENV=production
Environment=LOG_LEVEL=info
```

#### **Log Configuration**
```bash
# Configure log sources
# Primary log: /var/log/auth.log
# Custom logs: Edit server/server.js

# Log rotation
sudo nano /etc/logrotate.d/ssh-globe-tracker
```

### **Application Configuration**

#### **API Configuration**
```javascript
// server/config.js
{
  "port": 3001,
  "logPath": "/var/log/auth.log",
  "reportPath": "/var/log/ssh_reports/",
  "websocket": {
    "enabled": true,
    "heartbeat": 30
  }
}
```

#### **Frontend Configuration**
```javascript
// src/config.js
{
  "apiUrl": "http://localhost:3001",
  "refreshInterval": 5000,
  "globeOptions": {
    "autoRotate": true,
    "showAtmosphere": true
  }
}
```

### **Security Configuration**

#### **Access Control**
```bash
# Firewall configuration
sudo ufw allow 3001/tcp

# API authentication (optional)
export API_KEY="your-secret-key"
```

#### **Log Access Permissions**
```bash
# Add user to adm group
sudo usermod -a -G adm $USER

# Or configure specific permissions
sudo chmod 644 /var/log/auth.log
```

---

## 🔍 **Monitoring & Logs**

### **Log Files**

#### **Application Logs**
```bash
# Systemd service logs
sudo journalctl -u ssh-globe-tracker -f

# Application logs
tail -f /tmp/ssh-globe-tracker.log

# Development logs
tail -f logs/combined.log
```

#### **SSH Logs**
```bash
# System SSH logs
tail -f /var/log/auth.log

# Generated reports
ls -la /var/log/ssh_reports/
cat /var/log/ssh_reports/ssh_summary_last14d.md
```

### **Performance Monitoring**

#### **System Resources**
```bash
# CPU and memory usage
top -p $(pgrep -f "node server.js")

# Disk usage
df -h /var/log

# Network connections
sudo netstat -tulpn | grep 3001
```

#### **Application Metrics**
```bash
# API health check
curl http://localhost:3001/api/health

# Connection statistics
curl http://localhost:3001/api/summary

# WebSocket connections
curl http://localhost:3001/api/clients
```

### **Health Checks**

#### **Automated Monitoring**
```bash
# Create monitoring script
#!/bin/bash
while true; do
  if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "$(date): Service unhealthy" >> /var/log/ssh-globe-tracker-monitor.log
    ssh-globe-tracker restart
  fi
  sleep 60
done
```

#### **Alerting Integration**
```bash
# Email alerts
echo "SSH Globe Tracker alert" | mail -s "Service Alert" admin@example.com

# Slack integration
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"SSH Globe Tracker alert"}' \
YOUR_SLACK_WEBHOOK_URL
```

---

## ⚡ **Advanced Usage**

### **Custom Deployment**

#### **Multi-Server Setup**
```bash
# Deploy to multiple servers
servers=("server1" "server2" "server3")
for server in "${servers[@]}"; do
  ./deploy.sh user@$server
done

# Load balancer configuration
# Use nginx or haproxy to distribute load
```

#### **Docker Deployment**
```bash
# Build custom image
docker build -t ssh-globe-tracker:custom .

# Run with custom configuration
docker run -d \
  -p 3001:3001 \
  -v /var/log:/var/log:ro \
  -v ./config:/app/config \
  -e NODE_ENV=production \
  ssh-globe-tracker:custom
```

### **Integration Examples**

#### **API Integration**
```python
# Python example
import requests
import json

# Get SSH data
response = requests.get('http://localhost:3001/api/ssh-data')
data = response.json()

# Process data
for connection in data:
    print(f"Connection from {connection['ip']} at {connection['timestamp']}")
```

#### **WebSocket Integration**
```javascript
// JavaScript WebSocket client
const ws = new WebSocket('ws://localhost:3001');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  if (event.type === 'ssh-connection') {
    console.log('New SSH connection:', event.data);
  }
});
```

### **Custom Reports**

#### **Report Customization**
```python
# Modify py_script/report_maker.py
def generate_custom_report():
    # Your custom logic here
    pass

# Add new report types
def security_report():
    # Focus on security metrics
    pass

def user_activity_report():
    # Detailed user analysis
    pass
```

### **Performance Optimization**

#### **High Traffic Optimization**
```javascript
// Increase connection limits
// server/server.js
const server = require('http').createServer();
server.maxConnections = 1000;

// Optimize WebSocket connections
const wss = new WebSocket.Server({
  server,
  perMessageDeflate: true
});
```

#### **Memory Optimization**
```bash
# Limit log file size
sudo nano /etc/logrotate.d/ssh-globe-tracker

# Configure garbage collection
node --max-old-space-size=512 server/server.js
```

---

## 🎯 **Best Practices**

### **Security Best Practices**
1. **Access Control:** Use SSH tunnels for remote access
2. **Regular Updates:** Keep dependencies updated
3. **Log Monitoring:** Monitor application logs regularly
4. **Backup Configuration:** Backup configuration files

### **Performance Best Practices**
1. **Log Rotation:** Configure proper log rotation
2. **Resource Monitoring:** Monitor CPU and memory usage
3. **Network Optimization:** Use compression for WebSocket
4. **Caching:** Implement caching for frequently accessed data

### **Operational Best Practices**
1. **Health Checks:** Implement automated health monitoring
2. **Alerting:** Set up proper alerting for issues
3. **Documentation:** Keep local documentation updated
4. **Testing:** Test deployments in staging environment

---

**For more detailed information, see:**
- [README.md](README.md) - Main project documentation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [README_FEATURES.md](README_FEATURES.md) - Feature overview
