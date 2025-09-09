import { IPGeolocation } from '@/types/ssh';

// Using ipapi.co for IP geolocation (free tier: 1000 requests/day)
export async function getIPLocation(ip: string): Promise<IPGeolocation | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error('Failed to fetch location');
    
    const data = await response.json();
    
    if (data.error) {
      console.warn(`Geolocation error for ${ip}:`, data.reason);
      return null;
    }
    
    return {
      ip,
      country_code: data.country_code || '',
      country_name: data.country_name || '',
      region_code: data.region_code || '',
      region_name: data.region_name || '',
      city: data.city || '',
      zip_code: data.postal || '',
      time_zone: data.timezone || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      metro_code: 0
    };
  } catch (error) {
    console.error(`Failed to get location for IP ${ip}:`, error);
    return null;
  }
}

export async function batchGetIPLocations(ips: string[]): Promise<Map<string, IPGeolocation>> {
  const locationMap = new Map<string, IPGeolocation>();
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  const delay = 200; // 200ms delay between requests
  
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize);
    
    const promises = batch.map(async (ip) => {
      const location = await getIPLocation(ip);
      if (location) {
        locationMap.set(ip, location);
      }
    });
    
    await Promise.all(promises);
    
    // Add delay between batches
    if (i + batchSize < ips.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return locationMap;
}