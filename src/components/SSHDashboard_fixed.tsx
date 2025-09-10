import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SSHMap } from './SSHMap';
import { LocationDetails } from './LocationDetails';
import { RecentConnections } from './RecentConnections';
import { SSHSession, LocationData, LiveConnection } from '@/types/ssh';
import { parseSSHData, groupSessionsByLocation, formatDuration } from '@/utils/sshParser';
import { batchGetIPLocations, getIPLocation } from '@/utils/geolocation';
import { sshMonitorAPI } from '@/services/sshMonitorAPI';
import { 
  Shield, 
  Activity, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Key,
  Upload,
  RefreshCw,
  FileText,
  Server,
  Wifi,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export const SSHDashboard: React.FC = () => {
  const [sshData, setSshData] = useState<string>('');
  const [sessions, setSessions] = useState<SSHSession[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [liveConnections, setLiveConnections] = useState<LiveConnection[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFromServer, setIsLoadingFromServer] = useState(false);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [showDataInput, setShowDataInput] = useState(false);
  const [dataSource, setDataSource] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSshData(content);
      setDataSource('file');
      toast.success('SSH log file loaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read the file');
    };
    reader.readAsText(file);
  };

  const handleSessionClick = (session: SSHSession) => {
    // Find the location for this session's IP
    const location = locations.find(loc => loc.ip === session.ip);
    if (location) {
      setSelectedLocation(location);
    }
  };

  const loadFromServerFile = async () => {
    setIsLoadingFromServer(true);
    toast.info('Loading SSH data from server...');

    try {
      const response = await sshMonitorAPI.loadSSHSummary();
      
      if (response.success && response.data) {
        setSshData(response.data);
        setDataSource('server');
        toast.success('SSH data loaded from server successfully!');
        
        // Process the loaded data
        await processData(response.data);
      } else {
        toast.error(response.error || 'Failed to load SSH data from server');
      }
    } catch (error) {
      console.error('Error loading from server:', error);
      toast.error('Failed to connect to SSH monitor server');
    } finally {
      setIsLoadingFromServer(false);
    }
  };

  const toggleLiveMonitoring = async () => {
    if (!isLiveMonitoring) {
      // Start live monitoring
      setIsLiveMonitoring(true);
      toast.success('Live SSH monitoring enabled - watching for new connections');
      
      // Connect to WebSocket for real-time updates
      sshMonitorAPI.connectWebSocket(handleLiveConnection);
      
      // Load initial live connections
      loadLiveConnections();
      
      // Set up periodic refresh for live connections
      const interval = setInterval(loadLiveConnections, 10000); // Every 10 seconds
      
      // Store interval for cleanup
      (window as any).liveMonitorInterval = interval;
    } else {
      // Stop live monitoring
      setIsLiveMonitoring(false);
      setLiveConnections([]);
      toast.info('Live SSH monitoring disabled');
      
      // Disconnect WebSocket
      sshMonitorAPI.disconnectWebSocket();
      
      // Clear interval
      if ((window as any).liveMonitorInterval) {
        clearInterval((window as any).liveMonitorInterval);
        delete (window as any).liveMonitorInterval;
      }
    }
  };

  const loadLiveConnections = async () => {
    try {
      const response = await sshMonitorAPI.getLiveConnections();
      
      if (response.success) {
        console.log('Live connections response:', response);
        
        const connectionsWithGeo = await Promise.all(
          response.connections.map(async (conn) => {
            // For local connections, use a special handling
            if (conn.isLocal) {
              return {
                ip: conn.remoteIP,
                timestamp: conn.timestamp,
                type: 'established' as const,
                latitude: 40.7128, // New York coordinates as placeholder for local
                longitude: -74.0060,
                country: 'Local',
                city: 'Localhost',
                isLocal: true
              };
            }
            
            const geo = await getIPLocation(conn.remoteIP);
            if (geo && geo.latitude !== 0 && geo.longitude !== 0) {
              return {
                ip: conn.remoteIP,
                timestamp: conn.timestamp,
                type: 'established' as const,
                latitude: geo.latitude,
                longitude: geo.longitude,
                country: geo.country_name || geo.country_code || 'Unknown',
                city: geo.city || 'Unknown',
                isLocal: false
              };
            }
            return null;
          })
        );
        
        const validConnections = connectionsWithGeo.filter(conn => conn !== null);
        setLiveConnections(validConnections);
        
        if (validConnections.length > 0) {
          console.log(`Updated live connections: ${validConnections.length} active`);
        }
      } else {
        console.error('Failed to load live connections:', response.error);
      }
    } catch (error) {
      console.error('Error loading live connections:', error);
    }
  };

  const handleLiveConnection = (data: any) => {
    if (data.type === 'live_connection') {
      toast.info(`🔴 Live SSH connection from ${data.data.ip}`, {
        duration: 3000
      });
      
      // Add the new connection to live connections
      getIPLocation(data.data.ip).then(geo => {
        if (geo && geo.latitude !== 0 && geo.longitude !== 0) {
          const newConnection: LiveConnection = {
            ip: data.data.ip,
            user: data.data.user,
            timestamp: data.data.timestamp,
            type: data.data.type,
            latitude: geo.latitude,
            longitude: geo.longitude,
            country: geo.country_name || geo.country_code || 'Unknown',
            city: geo.city || 'Unknown'
          };
          
          setLiveConnections(prev => [newConnection, ...prev.slice(0, 9)]); // Keep last 10
        }
      });
    }
  };

  const processData = async (inputData?: string) => {
    const dataToProcess = inputData || sshData;
    
    if (!dataToProcess.trim()) {
      // Clear all data when input is empty
      setSessions([]);
      setLocations([]);
      setSelectedLocation(null);
      setDataSource(null);
      toast.info('Data cleared');
      return;
    }

    setIsProcessing(true);
    toast.info('Processing SSH data...');

    try {
      // Parse SSH sessions
      const parsedSessions = parseSSHData(dataToProcess);
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
      console.log('Geolocation data:', geoData);

      // Merge location data
      const locationArray: LocationData[] = [];
      locationMap.forEach((data, ip) => {
        const geo = geoData.get(ip);
        console.log(`Processing IP ${ip}:`, { data, geo });
        if (geo && geo.latitude !== 0 && geo.longitude !== 0) {
          const locationData = {
            ...data,
            country: geo.country_name || geo.country_code,
            city: geo.city,
            latitude: geo.latitude,
            longitude: geo.longitude,
          };
          console.log('Adding location with geo:', locationData);
          locationArray.push(locationData);
        } else {
          console.log('Skipping location without valid coordinates:', { ip, geo });
        }
      });

      console.log('Final location array:', locationArray);
      setLocations(locationArray);
      
      // Set data source if not already set (manual input)
      if (!inputData && !dataSource) {
        setDataSource('manual');
      }
      
      toast.success(`Successfully processed ${parsedSessions.length} SSH sessions!`);
      setShowDataInput(false);
      
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Failed to process SSH data');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup live monitoring on unmount
  useEffect(() => {
    return () => {
      if (isLiveMonitoring) {
        sshMonitorAPI.disconnectWebSocket();
        if ((window as any).liveMonitorInterval) {
          clearInterval((window as any).liveMonitorInterval);
        }
      }
    };
  }, [isLiveMonitoring]);

  // Calculate statistics
  const stats = {
    totalSessions: sessions.length,
    uniqueIPs: locations.length,
    passwordSessions: sessions.filter(s => s.method === 'password').length,
    publickeySessions: sessions.filter(s => s.method === 'publickey').length,
    totalDuration: locations.reduce((sum, loc) => sum + loc.totalDuration, 0),
    riskScore: Math.round((sessions.filter(s => s.method === 'password').length / Math.max(sessions.length, 1)) * 100),
    liveConnections: liveConnections.length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header with Glass Morphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                SSH Security Monitor
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time visualization and analysis of SSH connections worldwide
              </p>
              {dataSource && (
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {dataSource === 'server' ? (
                      <>
                        <Server className="h-3 w-3 mr-1" />
                        Loaded from Server
                      </>
                    ) : dataSource === 'file' ? (
                      <>
                        <FileText className="h-3 w-3 mr-1" />
                        Loaded from File
                      </>
                    ) : (
                      <>
                        <Upload className="h-3 w-3 mr-1" />
                        Manual Input
                      </>
                    )}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={isLiveMonitoring ? "default" : "outline"}
                size="sm"
                onClick={toggleLiveMonitoring}
                title={isLiveMonitoring ? "Stop monitoring live SSH connections" : "Start monitoring live SSH connections"}
              >
                <Wifi className={`h-4 w-4 mr-2 ${isLiveMonitoring ? 'animate-pulse text-green-400' : ''}`} />
                {isLiveMonitoring ? 'Live SSH ON' : 'Monitor Live SSH'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDataInput(!showDataInput)}
              >
                <Upload className="h-4 w-4 mr-2" />
                {showDataInput ? 'Hide' : 'Input'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Collapsible Data Input */}
        {showDataInput && (
          <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>SSH Log Data Input</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Paste your SSH log data here (markdown table format)..."
                  value={sshData}
                  onChange={(e) => setSshData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".md,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Upload SSH log file"
                      />
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadFromServerFile}
                      disabled={isLoadingFromServer}
                    >
                      {isLoadingFromServer ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Load from Server
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => processData()}
                    disabled={isProcessing}
                    size="sm"
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
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Paste SSH summary data in markdown table format, upload a file, or load from server.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Modern Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
                <Activity className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unique IPs</p>
                  <p className="text-2xl font-bold">{stats.uniqueIPs}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password Auth</p>
                  <p className="text-2xl font-bold text-destructive">{stats.passwordSessions}</p>
                </div>
                <Shield className="h-8 w-8 text-destructive opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Auth</p>
                  <p className="text-2xl font-bold text-green-600">{stats.publickeySessions}</p>
                </div>
                <Key className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Time</p>
                  <p className="text-lg font-bold text-accent">
                    {formatDuration(stats.totalDuration)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-accent opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Score</p>
                  <p className="text-2xl font-bold text-warning">{stats.riskScore}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live Connections</p>
                  <p className="text-2xl font-bold text-green-500">{stats.liveConnections}</p>
                </div>
                <Wifi className={`h-8 w-8 text-green-500 opacity-80 ${isLiveMonitoring ? 'animate-pulse' : ''}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Modern Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map Section - Takes 3 columns */}
          <div className="xl:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Global SSH Connections</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <span>Mixed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-destructive"></div>
                      <span>Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <SSHMap
                  locations={locations}
                  liveConnections={liveConnections}
                  onLocationClick={setSelectedLocation}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Takes 1 column */}
          <div className="xl:col-span-1 space-y-4">
            {/* Recent Connections */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Clock className="h-4 w-4" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  <RecentConnections 
                    sessions={sessions} 
                    onSessionClick={handleSessionClick}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            {selectedLocation ? (
              <LocationDetails
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <MapPin className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">
                      Select a location on the map to view detailed connection information
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
