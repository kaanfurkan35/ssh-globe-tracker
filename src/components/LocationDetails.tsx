import React from 'react';
import { LocationData } from '@/types/ssh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Shield, 
  User, 
  Activity,
  Key,
  AlertTriangle
} from 'lucide-react';
import { formatDuration } from '@/utils/sshParser';

interface LocationDetailsProps {
  location: LocationData;
  onClose: () => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({ 
  location, 
  onClose 
}) => {
  const hasPasswordAuth = location.methods.includes('password');
  const hasPublickeyAuth = location.methods.includes('publickey');
  
  const getSecurityLevel = () => {
    if (hasPasswordAuth && !hasPublickeyAuth) {
      return { level: 'High Risk', color: 'destructive', icon: AlertTriangle };
    }
    if (hasPasswordAuth && hasPublickeyAuth) {
      return { level: 'Medium Risk', color: 'warning', icon: Shield };
    }
    return { level: 'Low Risk', color: 'success', icon: Key };
  };

  const security = getSecurityLevel();
  const SecurityIcon = security.icon;
  const avgDuration = location.totalDuration / location.sessionCount;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{location.ip}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {location.city && location.country ? 
                `${location.city}, ${location.country}` : 
                'Location Unknown'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Security Assessment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SecurityIcon className="h-4 w-4" />
            <span className="font-medium">Security Level</span>
          </div>
          <Badge variant={security.color as any}>
            {security.level}
          </Badge>
        </div>

        <Separator />

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {location.sessionCount}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Total Duration</span>
            </div>
            <p className="text-2xl font-bold text-accent">
              {formatDuration(location.totalDuration)}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Avg Session</span>
            </div>
            <p className="text-lg font-semibold">
              {formatDuration(Math.round(avgDuration))}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Auth Methods</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {location.methods.map(method => (
                <Badge 
                  key={method} 
                  variant={method === 'password' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Sessions */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Recent Sessions</span>
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {location.sessions.slice(0, 10).map((session, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{session.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.startTime}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge 
                    variant={session.method === 'password' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {session.method}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {session.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {location.sessions.length > 10 && (
            <p className="text-xs text-muted-foreground text-center">
              And {location.sessions.length - 10} more sessions...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};