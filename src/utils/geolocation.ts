import { IPGeolocation } from '@/types/ssh';

// Using ipinfo.io for IP geolocation (free tier: 50,000 requests/month)
export async function getIPLocation(ip: string): Promise<IPGeolocation | null> {
  try {
    console.log(`Fetching geolocation for IP: ${ip}`);
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    if (!response.ok) {
      console.warn(`Geolocation API returned ${response.status} for ${ip}`);
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    console.log(`Geolocation response for ${ip}:`, data);
    
    if (data.error) {
      console.warn(`Geolocation error for ${ip}:`, data.error);
      return null;
    }
    
    // Parse location coordinates from "lat,lng" format
    const [latitude, longitude] = data.loc ? data.loc.split(',').map(Number) : [0, 0];
    
    const result = {
      ip,
      country_code: data.country || '',
      country_name: data.country || '', // ipinfo.io uses country code, not full name
      region_code: data.region || '',
      region_name: data.region || '',
      city: data.city || '',
      zip_code: data.postal || '',
      time_zone: data.timezone || '',
      latitude: latitude || 0,
      longitude: longitude || 0,
      metro_code: 0
    };
    
    console.log(`Processed geolocation for ${ip}:`, result);
    return result;
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