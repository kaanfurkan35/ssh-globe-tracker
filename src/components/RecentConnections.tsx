import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Connections</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentSessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent connections found
            </p>
          ) : (
            recentSessions.map((session, index) => {
              const { date, time } = formatDateTime(session.startTime);
              return (
                <div
                  key={`${session.ip}-${session.startTime}-${index}`}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onSessionClick?.(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">
                          {session.ip}
                        </span>
                        <Badge 
                          variant={session.method === 'password' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {session.method === 'password' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <Key className="h-3 w-3 mr-1" />
                          )}
                          {session.method}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{session.user}</span>
                        <span>•</span>
                        <span>{date} {time}</span>
                        <span>•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};