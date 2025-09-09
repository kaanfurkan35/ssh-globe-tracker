export interface SSHSession {
  ip: string;
  user: string;
  method: 'password' | 'publickey';
  startTime: string;
  endTime: string;
  duration: string;
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