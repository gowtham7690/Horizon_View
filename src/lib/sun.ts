import * as SunCalc from 'suncalc';
import { calculateBearing } from './geo';

export interface SunPosition {
  azimuth: number; // degrees from north, clockwise
  altitude: number; // degrees above horizon
}

export interface FlightSunData {
  departureSun: SunPosition;
  arrivalSun: SunPosition;
  scenicSide: 'left' | 'right' | 'both';
  sunriseTime: Date;
  sunsetTime: Date;
  flightDuration: number; // hours
}

/**
 * Calculate sunrise and sunset times using astronomical formulas
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param date Date to calculate for
 * @returns Object with sunrise and sunset Date objects (UTC)
 */
export function calculateSunriseSunset(lat: number, lon: number, date: Date): { sunrise: Date | null; sunset: Date | null } {
  const zenith = 90.833; // official zenith for sunrise/sunset

  // Helper: day of the year
  function dayOfYear(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const N = dayOfYear(date);
  const latRad = lat * Math.PI / 180;

  // Approximate times
  const tRise = N + ((6 - lon / 15) / 24);
  const tSet = N + ((18 - lon / 15) / 24);

  function sunTime(t: number, isRise: boolean): Date | null {
    // Mean anomaly
    const M = (0.9856 * t) - 3.289;

    // Sun true longitude
    let L = M + (1.916 * Math.sin(M * Math.PI / 180)) + (0.020 * Math.sin(2 * M * Math.PI / 180)) + 282.634;
    L = L % 360;
    if (L < 0) L += 360;

    // Right ascension
    let RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI;
    RA = RA % 360;
    if (RA < 0) RA += 360;

    // Correct quadrant
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15; // convert to hours

    // Sun declination
    const sinDec = 0.39782 * Math.sin(L * Math.PI / 180);
    const cosDec = Math.cos(Math.asin(sinDec));

    // Hour angle
    const cosH = (Math.cos(zenith * Math.PI / 180) - sinDec * Math.sin(latRad)) / (cosDec * Math.cos(latRad));

    if (cosH > 1) return null; // sun never rises
    if (cosH < -1) return null; // sun never sets

    let H = Math.acos(cosH) * 180 / Math.PI;
    if (isRise) H = 360 - H;
    H = H / 15; // convert to hours

    // Local mean time
    const T = H + RA - (0.06571 * t) - 6.622;

    // UTC time
    let UT = T - (lon / 15);
    UT = (UT + 24) % 24;
    if (UT < 0) UT += 24;

    // Convert to Date object
    const hour = Math.floor(UT);
    const min = Math.floor((UT - hour) * 60);
    const sec = Math.floor(((UT - hour) * 60 - min) * 60);

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour, min, sec));
  }

  const sunrise = sunTime(tRise, true);
  const sunset = sunTime(tSet, false);

  return { sunrise, sunset };
}

/**
 * Get sun position at a specific location and time
 */
export function getSunPosition(date: Date, lat: number, lng: number): SunPosition {
  const pos = SunCalc.getPosition(date, lat, lng);
  // Convert from radians to degrees
  // SunCalc azimuth: measured from south (0° = South, 90° = West, 180° = North, 270° = East)
  // Convert to standard: 0° = North, 90° = East, 180° = South, 270° = West
  let azimuth = (pos.azimuth * 180 / Math.PI + 180) % 360;
  // Normalize to 0-360 range
  if (azimuth < 0) azimuth += 360;
  
  return {
    azimuth,
    altitude: pos.altitude * 180 / Math.PI,
  };
}

/**
 * Determine which side of the aircraft offers scenic views
 * @param flightBearing The bearing/direction of flight (0° = North)
 * @param sunAzimuth The azimuth of the sun (0° = North)
 * @returns 'left', 'right', or 'both' indicating scenic side(s)
 */
export function determineScenicSide(flightBearing: number, sunAzimuth: number): 'left' | 'right' | 'both' {
  // Normalize angles to 0-360 range
  const normalizedFlight = ((flightBearing % 360) + 360) % 360;
  const normalizedSun = ((sunAzimuth % 360) + 360) % 360;

  // Calculate the relative angle between flight direction and sun
  let relativeAngle = normalizedSun - normalizedFlight;

  // Normalize to -180 to 180 range
  if (relativeAngle > 180) relativeAngle -= 360;
  if (relativeAngle < -180) relativeAngle += 360;

  // Sun is directly ahead or behind (within 45°)
  if (Math.abs(relativeAngle) < 45 || Math.abs(relativeAngle) > 135) {
    return 'both'; // Sun visible from both sides (ahead/behind)
  }

  // Sun is to the left or right side
  if (relativeAngle > 0 && relativeAngle <= 135) {
    return 'right'; // Sun is to the right of flight path
  } else if (relativeAngle < 0 && relativeAngle >= -135) {
    return 'left'; // Sun is to the left of flight path
  }

  // Default fallback
  return 'both';
}

/**
 * Calculate sun data for a flight using custom sunrise/sunset calculation
 * @param departureLat Departure latitude
 * @param departureLng Departure longitude
 * @param arrivalLat Arrival latitude
 * @param arrivalLng Arrival longitude
 * @param departureTime Departure time
 * @param flightDuration Flight duration in hours
 * @returns Flight sun data
 */
export function calculateFlightSunData(
  departureLat: number,
  departureLng: number,
  arrivalLat: number,
  arrivalLng: number,
  departureTime: Date,
  flightDuration: number
): FlightSunData {
  // Get sun position at departure
  const departureSun = getSunPosition(departureTime, departureLat, departureLng);

  // Calculate arrival time
  const arrivalTime = new Date(departureTime.getTime() + flightDuration * 60 * 60 * 1000);
  const arrivalSun = getSunPosition(arrivalTime, arrivalLat, arrivalLng);

  // Calculate flight bearing (direction)
  const flightBearing = calculateBearing(departureLat, departureLng, arrivalLat, arrivalLng);

  // Get sunrise/sunset times using custom calculation
  const departureTimes = calculateSunriseSunset(departureLat, departureLng, departureTime);
  const arrivalTimes = calculateSunriseSunset(arrivalLat, arrivalLng, arrivalTime);

  // Determine which sunrise/sunset is most relevant during the flight
  let sunriseTime: Date;
  let sunsetTime: Date;

  // Use departure times as default
  sunriseTime = departureTimes.sunrise || new Date(departureTime);
  sunsetTime = departureTimes.sunset || new Date(departureTime);

  // If flight crosses into next day, check arrival location times
  if (arrivalTime.getDate() !== departureTime.getDate()) {
    // Use the sunrise/sunset that occurs during the flight
    if (arrivalTimes.sunrise && arrivalTimes.sunrise > departureTime && arrivalTimes.sunrise < arrivalTime) {
      sunriseTime = arrivalTimes.sunrise;
    }
    if (arrivalTimes.sunset && arrivalTimes.sunset > departureTime && arrivalTimes.sunset < arrivalTime) {
      sunsetTime = arrivalTimes.sunset;
    }
  } else {
    // Same day - check if sunrise/sunset occurs during flight
    if (departureTimes.sunrise && departureTimes.sunrise > departureTime && departureTimes.sunrise < arrivalTime) {
      sunriseTime = departureTimes.sunrise;
    }
    if (departureTimes.sunset && departureTimes.sunset > departureTime && departureTimes.sunset < arrivalTime) {
      sunsetTime = departureTimes.sunset;
    }
  }

  // Determine scenic side by checking sun position at multiple points during flight
  // Sample sun positions at start, middle, and end of flight
  const midTime = new Date(departureTime.getTime() + (flightDuration / 2) * 60 * 60 * 1000);
  const midLat = (departureLat + arrivalLat) / 2;
  const midLng = (departureLng + arrivalLng) / 2;
  const midSun = getSunPosition(midTime, midLat, midLng);

  // Check sun positions at multiple points
  const sunPositions = [
    { azimuth: departureSun.azimuth, altitude: departureSun.altitude },
    { azimuth: midSun.azimuth, altitude: midSun.altitude },
    { azimuth: arrivalSun.azimuth, altitude: arrivalSun.altitude },
  ];

  // Determine scenic side based on average sun position relative to flight path
  // Only consider positions where sun is above horizon or near horizon (sunrise/sunset)
  const visibleSunPositions = sunPositions.filter(
    pos => pos.altitude > -6 // Include sun near horizon (civil twilight)
  );

  if (visibleSunPositions.length === 0) {
    // Sun not visible during flight
    return {
      departureSun,
      arrivalSun,
      scenicSide: 'both', // Default to both if sun not visible
      sunriseTime,
      sunsetTime,
      flightDuration,
    };
  }

  // Calculate average azimuth of visible sun positions
  const avgAzimuth = visibleSunPositions.reduce((sum, pos) => sum + pos.azimuth, 0) / visibleSunPositions.length;
  const scenicSide = determineScenicSide(flightBearing, avgAzimuth);

  return {
    departureSun,
    arrivalSun,
    scenicSide,
    sunriseTime,
    sunsetTime,
    flightDuration,
  };
}

/**
 * Check if sun will be visible during flight
 * @param sunData Flight sun data
 * @returns True if sun is above horizon during flight
 */
export function isSunVisibleDuringFlight(sunData: FlightSunData): boolean {
  // Simplified check: sun is visible if it's above horizon at either end
  return sunData.departureSun.altitude > 0 || sunData.arrivalSun.altitude > 0;
}

/**
 * Get recommended seats based on scenic side
 * Only window seats are recommended (A and F are the only window seats)
 * @param scenicSide The determined scenic side
 * @returns Array of recommended seat positions (only window seats)
 */
export function getRecommendedSeats(scenicSide: 'left' | 'right' | 'both'): string[] {
  const leftWindowSeat = 'A';  // Left side window seat
  const rightWindowSeat = 'F'; // Right side window seat

  switch (scenicSide) {
    case 'left':
      return [leftWindowSeat];
    case 'right':
      return [rightWindowSeat];
    case 'both':
      return [leftWindowSeat, rightWindowSeat];
    default:
      return [];
  }
}

/**
 * Calculate sun position at any point along the flight path
 * @param departureTime Departure time
 * @param flightDuration Total flight duration in hours
 * @param progress Progress along flight (0-1)
 * @param currentLat Current latitude
 * @param currentLng Current longitude
 * @returns Sun position at that point
 */
export function getSunPositionAtFlightProgress(
  departureTime: Date,
  flightDuration: number,
  progress: number,
  currentLat: number,
  currentLng: number
): SunPosition {
  const currentTime = new Date(departureTime.getTime() + flightDuration * progress * 60 * 60 * 1000);
  return getSunPosition(currentTime, currentLat, currentLng);
}
