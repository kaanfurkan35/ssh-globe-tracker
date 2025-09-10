import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SSHSession } from '@/types/ssh';
import { Clock, User, Shield, Key, MapPin } from 'lucide-react';

interface RecentConnectionsProps {
  sessions: SSHSession[];
  onSessionClick?: (session: SSHSession) => void;
}

export const RecentConnections: React.FC<RecentConnectionsProps> = ({ 
  sessions, 
  onSessionClick 
}) => {
  // Sort sessions by start time (most recent first) and take top 10
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);

  const formatDateTime = (dateTime: string) => {
    try {
      // Parse the custom format: "29-08-2025 15:11:49"
      const [datePart, timePart] = dateTime.split(' ');
      const [day, month, year] = datePart.split('-');
      const formattedDate = `${year}-${month}-${day}T${timePart}`;
      const date = new Date(formattedDate);
      
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: dateTime.split(' ')[0], time: dateTime.split(' ')[1] };
    }
  };

  return (
    <div className="space-y-2">
      {recentSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <Clock className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground text-center">
            No recent connections found
          </p>
        </div>
      ) : (
        recentSessions.map((session, index) => {
          const { date, time } = formatDateTime(session.startTime);
          return (
            <div
              key={`${session.ip}-${session.startTime}-${index}`}
              className="border rounded-lg p-3 hover:bg-accent/30 transition-all duration-200 cursor-pointer group"
              onClick={() => onSessionClick?.(session)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-xs font-medium truncate">
                      {session.ip}
                    </span>
                    <Badge 
                      variant={session.method === 'password' ? 'destructive' : 'default'}
                      className="text-xs flex-shrink-0"
                    >
                      {session.method === 'password' ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <Key className="h-3 w-3 mr-1" />
                      )}
                      {session.method}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{session.user}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{time}</span>
                    <span>•</span>
                    <span className="truncate">{session.duration}</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                >
                  View
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};