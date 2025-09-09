import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SSHMap } from './SSHMap';
import { LocationDetails } from './LocationDetails';
import { SSHSession, LocationData } from '@/types/ssh';
import { parseSSHData, groupSessionsByLocation, formatDuration } from '@/utils/sshParser';
import { batchGetIPLocations } from '@/utils/geolocation';
import { 
  Shield, 
  Activity, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Key,
  Upload,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_DATA = `# SSH Sessions (Boss view)

**Timezone:** Europe/Istanbul (UTC+03:00)

| IP              | User    | Method    | Start               | End                 | Duration   |
| :-------------- | :------ | :-------- | :------------------ | :------------------ | ---------: |
| 31.223.50.217   | hpcuser | password  | 29-08-2025 15:11:49 | 29-08-2025 17:27:11 | 2h 15m 22s |
| 135.19.36.235   | hpcuser | password  | 28-08-2025 13:54:28 | 28-08-2025 15:29:07 | 1h 34m 39s |
| 135.19.36.235   | hpcuser | password  | 27-08-2025 19:39:12 | 28-08-2025 04:01:29 | 8h 22m 17s |
| 31.223.50.217   | hpcuser | password  | 27-08-2025 15:22:05 | 27-08-2025 17:36:42 | 2h 14m 37s |
| 176.216.194.197 | hpcuser | publickey | 26-08-2025 15:17:16 | 26-08-2025 15:18:23 |      1m 7s |
| 46.1.49.68      | hpcuser | publickey | 19-08-2025 16:07:59 | 19-08-2025 20:25:52 | 4h 17m 53s |
| 70.27.245.18    | hpcuser | password  | 18-08-2025 23:12:20 | 18-08-2025 23:25:04 |    12m 44s |`;

export const SSHDashboard: React.FC = () => {
  const [sshData, setSshData] = useState<string>(SAMPLE_DATA);
  const [sessions, setSessions] = useState<SSHSession[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDataInput, setShowDataInput] = useState(false);

  const processData = async () => {
    if (!sshData.trim()) {
      toast.error('Please enter SSH data');
      return;
    }

    setIsProcessing(true);
    toast.info('Processing SSH data...');

    try {
      // Parse SSH sessions
      const parsedSessions = parseSSHData(sshData);
      setSessions(parsedSessions);

      if (parsedSessions.length === 0) {
        toast.error('No valid SSH sessions found in the data');
        setIsProcessing(false);
        return;
      }

      // Group by IP
      const locationMap = groupSessionsByLocation(parsedSessions);
      const uniqueIPs = Array.from(locationMap.keys());

      toast.info(`Found ${parsedSessions.length} sessions from ${uniqueIPs.length} unique IPs. Getting geolocation...`);

      // Get geolocation data
      const geoData = await batchGetIPLocations(uniqueIPs);

      // Merge location data
      const locationArray: LocationData[] = [];
      locationMap.forEach((data, ip) => {
        const geo = geoData.get(ip);
        if (geo) {
          locationArray.push({
            ...data,
            country: geo.country_name,
            city: geo.city,
            latitude: geo.latitude,
            longitude: geo.longitude,
          });
        } else {
          // Keep IP even without geo data
          locationArray.push(data);
        }
      });

      setLocations(locationArray);
      toast.success(`Successfully processed ${parsedSessions.length} SSH sessions!`);
      setShowDataInput(false);
      
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Failed to process SSH data');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process sample data on mount
  useEffect(() => {
    processData();
  }, []);

  const stats = {
    totalSessions: sessions.length,
    uniqueIPs: locations.length,
    passwordSessions: sessions.filter(s => s.method === 'password').length,
    publickeySessions: sessions.filter(s => s.method === 'publickey').length,
    totalDuration: locations.reduce((sum, loc) => sum + loc.totalDuration, 0),
    riskScore: Math.round((sessions.filter(s => s.method === 'password').length / sessions.length) * 100)
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SSH Security Monitor
          </h1>
          <p className="text-muted-foreground">
            Visualize and analyze SSH connections on your world map
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowDataInput(!showDataInput)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {showDataInput ? 'Hide Input' : 'Load Data'}
          </Button>
          <Button
            onClick={processData}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Process Data
          </Button>
        </div>
      </div>

      {/* Data Input */}
      {showDataInput && (
        <Card>
          <CardHeader>
            <CardTitle>SSH Log Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your SSH log data here (markdown table format)..."
              value={sshData}
              onChange={(e) => setSshData(e.target.value)}
              rows={10}
            />
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Paste the contents of your SSH summary file (markdown table format with IP, User, Method, Start, End, Duration columns).
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Unique IPs</p>
                <p className="text-2xl font-bold">{stats.uniqueIPs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Password Auth</p>
                <p className="text-2xl font-bold text-destructive">{stats.passwordSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Key Auth</p>
                <p className="text-2xl font-bold text-success">{stats.publickeySessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Total Time</p>
                <p className="text-lg font-bold text-accent">
                  {formatDuration(stats.totalDuration)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div>
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-warning">{stats.riskScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Global SSH Connections</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <SSHMap
              locations={locations}
              onLocationClick={setSelectedLocation}
            />
          </CardContent>
        </Card>

        {/* Details Panel */}
        <div className="space-y-4">
          {selectedLocation ? (
            <LocationDetails
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Click on a marker on the map to view detailed information about SSH connections from that location.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm">Public Key Auth Only</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-warning"></div>
                  <span className="text-sm">Mixed Authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-destructive"></div>
                  <span className="text-sm">Password Auth Only</span>
                </div>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Marker size indicates connection frequency. Larger markers represent more SSH sessions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
