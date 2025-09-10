export interface SSHSession {
  ip: string;
  user: string;
  method: 'password' | 'publickey';
  startTime: string;
  endTime: string;
  duration: string;
}

export interface LiveConnection {
  ip: string;
  user?: string;
  timestamp: string;
  type: 'login' | 'established';
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
  isLocal?: boolean;
}

export interface LocationData {
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  sessionCount: number;
  sessions: SSHSession[];
  totalDuration: number;
  methods: string[];
  isLive?: boolean; // New field for live connections
}

export interface IPGeolocation {
  ip: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip_code: string;
  time_zone: string;
  latitude: number;
  longitude: number;
  metro_code: number;
}