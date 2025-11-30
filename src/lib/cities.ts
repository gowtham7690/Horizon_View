export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

// Major airports database - comprehensive global coverage
export const AIRPORTS: Airport[] = [
  // North America - USA
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, timezone: 'America/New_York' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081, timezone: 'America/Los_Angeles' },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073, timezone: 'America/Chicago' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', lat: 25.7932, lng: -80.2906, timezone: 'America/New_York' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', lat: 47.4502, lng: -122.3088, timezone: 'America/Los_Angeles' },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'USA', lat: 42.3601, lng: -71.0589, timezone: 'America/New_York' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'USA', lat: 39.7392, lng: -104.9903, timezone: 'America/Denver' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', lat: 33.7490, lng: -84.3880, timezone: 'America/New_York' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', lat: 32.7767, lng: -96.7970, timezone: 'America/Chicago' },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'USA', lat: 36.1699, lng: -115.1398, timezone: 'America/Los_Angeles' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', lat: 33.4484, lng: -112.0740, timezone: 'America/Phoenix' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'USA', lat: 44.9778, lng: -93.2650, timezone: 'America/Chicago' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', country: 'USA', lat: 42.3314, lng: -83.0458, timezone: 'America/Detroit' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington DC', country: 'USA', lat: 38.9072, lng: -77.0369, timezone: 'America/New_York' },

  // North America - Canada & Mexico
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673, timezone: 'America/Montreal' },
  { code: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719, timezone: 'America/Edmonton' },
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City' },

  // Europe - Western Europe
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK', lat: 51.4775, lng: -0.4614, timezone: 'Europe/London' },
  { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'UK', lat: 51.1481, lng: -0.1903, timezone: 'Europe/London' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, timezone: 'Europe/Paris' },
  { code: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France', lat: 48.7262, lng: 2.3652, timezone: 'Europe/Paris' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, timezone: 'Europe/Berlin' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, timezone: 'Europe/Berlin' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, timezone: 'Europe/Amsterdam' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', lat: 50.9010, lng: 4.4844, timezone: 'Europe/Brussels' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna' },

  // Europe - Southern & Eastern Europe
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389, timezone: 'Europe/Rome' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, timezone: 'Europe/Rome' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', lat: 40.4983, lng: -3.5676, timezone: 'Europe/Madrid' },
  { code: 'BCN', name: 'Barcelona El Prat Airport', city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, timezone: 'Europe/Madrid' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', lat: 37.9364, lng: 23.9445, timezone: 'Europe/Athens' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, timezone: 'Europe/Copenhagen' },
  { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm' },
  { code: 'OSL', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', lat: 60.1939, lng: 11.1004, timezone: 'Europe/Oslo' },
  { code: 'HEL', name: 'Helsinki Vantaa Airport', city: 'Helsinki', country: 'Finland', lat: 60.3172, lng: 24.9633, timezone: 'Europe/Helsinki' },

  // Middle East
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, timezone: 'Asia/Dubai' },
  { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.276987, lng: 51.522476, timezone: 'Asia/Qatar' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', lat: 30.1219, lng: 31.4056, timezone: 'Africa/Cairo' },
  { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel', lat: 32.0040, lng: 34.8765, timezone: 'Asia/Jerusalem' },

  // Asia - East Asia
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929, timezone: 'Asia/Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798, timezone: 'Asia/Tokyo' },
  { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan', lat: 34.4320, lng: 135.2306, timezone: 'Asia/Tokyo' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407, timezone: 'Asia/Seoul' },
  { code: 'GMP', name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea', lat: 37.5587, lng: 126.7945, timezone: 'Asia/Seoul' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', lat: 40.0801, lng: 116.5846, timezone: 'Asia/Shanghai' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lng: 121.2342, timezone: 'Asia/Taipei' },

  // Asia - Southeast Asia
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, timezone: 'Asia/Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501, timezone: 'Asia/Bangkok' },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', lat: 14.5086, lng: 121.0198, timezone: 'Asia/Manila' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7072, timezone: 'Asia/Kuala_Lumpur' },

  // Asia - South Asia
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },

  // Oceania
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753, timezone: 'Australia/Sydney' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', lat: -37.6733, lng: 144.8433, timezone: 'Australia/Melbourne' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251, timezone: 'Australia/Brisbane' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', lat: -31.9505, lng: 115.8605, timezone: 'Australia/Perth' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, timezone: 'Pacific/Auckland' },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', lat: -23.4356, lng: -46.4731, timezone: 'America/Sao_Paulo' },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', lat: 4.7016, lng: -74.1469, timezone: 'America/Bogota' },
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, timezone: 'America/Lima' },
  { code: 'SCL', name: 'Comodoro Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, timezone: 'America/Santiago' },

  // Africa
  { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg' },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', lat: 8.9806, lng: 38.7578, timezone: 'Africa/Addis_Ababa' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi' },
];

/**
 * Find airport by IATA code
 */
export function findAirportByCode(code: string): Airport | undefined {
  return AIRPORTS.find(airport => airport.code.toLowerCase() === code.toLowerCase());
}

/**
 * Search airports by city, country, or airport name
 */
export function searchAirports(query: string): Airport[] {
  const lowercaseQuery = query.toLowerCase();
  return AIRPORTS.filter(airport =>
    airport.city.toLowerCase().includes(lowercaseQuery) ||
    airport.country.toLowerCase().includes(lowercaseQuery) ||
    airport.name.toLowerCase().includes(lowercaseQuery) ||
    airport.code.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Get airports sorted by distance from a location
 */
export function getAirportsByDistance(lat: number, lng: number, limit: number = 10): Airport[] {
  return AIRPORTS
    .map(airport => ({
      ...airport,
      distance: Math.sqrt(
        Math.pow(airport.lat - lat, 2) + Math.pow(airport.lng - lng, 2)
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Get popular airports (hardcoded for demo)
 */
export function getPopularAirports(): Airport[] {
  const popularCodes = ['JFK', 'LAX', 'LHR', 'CDG', 'NRT', 'SYD', 'DXB', 'FRA'];
  return popularCodes
    .map(code => findAirportByCode(code))
    .filter((airport): airport is Airport => airport !== undefined);
}

/**
 * Validate airport code format
 */
export function isValidAirportCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code.toUpperCase());
}
