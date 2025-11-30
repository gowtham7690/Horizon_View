/**
 * Fetch sunrise and sunset times from external API
 * Uses sunrise-sunset.org API (free, no key required)
 */

export interface SunriseSunsetAPIResponse {
  results: {
    sunrise: string; // ISO 8601 format
    sunset: string; // ISO 8601 format
    solar_noon: string;
    day_length: number; // seconds
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

/**
 * Fetch sunrise and sunset times for a specific location and date
 * @param lat Latitude
 * @param lng Longitude
 * @param date Date to get sunrise/sunset for
 * @returns Promise with sunrise and sunset times
 */
export async function fetchSunriseSunset(
  lat: number,
  lng: number,
  date: Date
): Promise<{ sunrise: Date; sunset: Date } | null> {
  try {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    // Call sunrise-sunset.org API
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Sunrise-sunset API request failed:', response.statusText);
      return null;
    }
    
    const data: SunriseSunsetAPIResponse = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      console.warn('Sunrise-sunset API returned error:', data.status);
      return null;
    }
    
    // Parse the times (API returns in UTC)
    const sunrise = new Date(data.results.sunrise);
    const sunset = new Date(data.results.sunset);
    
    return { sunrise, sunset };
  } catch (error) {
    console.error('Error fetching sunrise/sunset from API:', error);
    return null;
  }
}

/**
 * Fetch sunrise and sunset for multiple locations
 * @param locations Array of {lat, lng, date} objects
 * @returns Promise with array of results
 */
export async function fetchMultipleSunriseSunset(
  locations: Array<{ lat: number; lng: number; date: Date }>
): Promise<Array<{ sunrise: Date; sunset: Date } | null>> {
  // Fetch all in parallel (API allows this)
  const promises = locations.map(loc => fetchSunriseSunset(loc.lat, loc.lng, loc.date));
  return Promise.all(promises);
}


