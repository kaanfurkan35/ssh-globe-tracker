import { SSHSession, LocationData } from '@/types/ssh';
import { differenceInSeconds } from 'date-fns';

export function parseSSHData(markdownData: string): SSHSession[] {
  const lines = markdownData.split('\n');
  const sessions: SSHSession[] = [];
  
  // Find the table start (skip header and separator)
  let dataStartIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('| :-------------- |')) {
      dataStartIndex = i + 1;
      break;
    }
  }
  
  if (dataStartIndex === -1) return sessions;
  
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('|')) continue;
    
    const parts = line.split('|').map(part => part.trim()).filter(part => part);
    if (parts.length < 6) continue;
    
    const [ip, user, method, start, end, duration] = parts;
    
    sessions.push({
      ip,
      user,
      method: method as 'password' | 'publickey',
      startTime: start,
      endTime: end,
      duration
    });
  }
  
  return sessions;
}

export function groupSessionsByLocation(sessions: SSHSession[]): Map<string, LocationData> {
  const locationMap = new Map<string, LocationData>();
  
  sessions.forEach(session => {
    if (!locationMap.has(session.ip)) {
      locationMap.set(session.ip, {
        ip: session.ip,
        country: '',
        city: '',
        latitude: 0,
        longitude: 0,
        sessionCount: 0,
        sessions: [],
        totalDuration: 0,
        methods: []
      });
    }
    
    const location = locationMap.get(session.ip)!;
    location.sessionCount++;
    location.sessions.push(session);
    
    // Calculate duration in seconds for aggregation
    const durationSeconds = parseDurationToSeconds(session.duration);
    location.totalDuration += durationSeconds;
    
    // Track unique methods
    if (!location.methods.includes(session.method)) {
      location.methods.push(session.method);
    }
  });
  
  return locationMap;
}

function parseDurationToSeconds(duration: string): number {
  if (!duration || duration === '0s') return 0;
  
  let totalSeconds = 0;
  const parts = duration.match(/(\d+)([hms])/g);
  
  if (parts) {
    parts.forEach(part => {
      const value = parseInt(part.slice(0, -1));
      const unit = part.slice(-1);
      
      switch (unit) {
        case 'h':
          totalSeconds += value * 3600;
          break;
        case 'm':
          totalSeconds += value * 60;
          break;
        case 's':
          totalSeconds += value;
          break;
      }
    });
  }
  
  return totalSeconds;
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}