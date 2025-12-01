// sunUtils.ts
import * as SunCalc from 'suncalc';
import { calculateBearing, generateGreatCirclePath } from './geo';

export interface SunPosition {
  azimuth: number; // degrees from north, clockwise
  altitude: number; // degrees above horizon
}

export interface FlightSunData {
  departureSun: SunPosition;
  arrivalSun: SunPosition;
  scenicSide: 'left' | 'right' | 'both' | 'none';
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
export function calculateSunriseSunset(
  lat: number,
  lon: number,
  date: Date
): { sunrise: Date | null; sunset: Date | null } {
  const zenith = 90.833; // official zenith for sunrise/sunset

  function dayOfYear(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const N = dayOfYear(date);
  const latRad = (lat * Math.PI) / 180;

  const tRise = N + (6 - lon / 15) / 24;
  const tSet = N + (18 - lon / 15) / 24;

  function sunTime(t: number, isRise: boolean): Date | null {
    const M = 0.9856 * t - 3.289;

    let L = M +
      1.916 * Math.sin((M * Math.PI) / 180) +
      0.02 * Math.sin((2 * M * Math.PI) / 180) +
      282.634;
    L = L % 360;
    if (L < 0) L += 360;

    let RA = (Math.atan(0.91764 * Math.tan((L * Math.PI) / 180)) * 180) / Math.PI;
    RA = RA % 360;
    if (RA < 0) RA += 360;

    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15; // hours

    const sinDec = 0.39782 * Math.sin((L * Math.PI) / 180);
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH =
      (Math.cos((zenith * Math.PI) / 180) - sinDec * Math.sin(latRad)) /
      (cosDec * Math.cos(latRad));

    if (cosH > 1) return null; // sun never rises
    if (cosH < -1) return null; // sun never sets

    let H = (Math.acos(cosH) * 180) / Math.PI;
    if (isRise) H = 360 - H;
    H = H / 15;

    const T = H + RA - 0.06571 * t - 6.622;

    let UT = T - lon / 15;
    UT = (UT + 24) % 24;
    if (UT < 0) UT += 24;

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

  let azimuth = ((pos.azimuth * 180) / Math.PI + 180) % 360;
  if (azimuth < 0) azimuth += 360;

  return {
    azimuth,
    altitude: (pos.altitude * 180) / Math.PI,
  };
}

/**
 * Relative angle between sun azimuth and flight bearing
 *   - Positive: sun is to the right
 *   - Negative: sun is to the left
 */
export function calculateSunRelativeAngle(
  flightBearing: number,
  sunAzimuth: number
): number {
  const normalizedFlight = ((flightBearing % 360) + 360) % 360;
  const normalizedSun = ((sunAzimuth % 360) + 360) % 360;

  let relativeAngle = normalizedSun - normalizedFlight;

  if (relativeAngle > 180) relativeAngle -= 360;
  if (relativeAngle < -180) relativeAngle += 360;

  return relativeAngle;
}

/**
 * Determine scenic side based on a trajectory of relative angles
 */
export function determineScenicSideFromTrajectory(
  relativeAngles: number[]
): 'left' | 'right' | 'both' | 'none' {
  const threshold = 5;

  const hasLeft = relativeAngles.some((a) => a < -threshold);
  const hasRight = relativeAngles.some((a) => a > threshold);

  if (hasLeft && hasRight) return 'both';
  if (hasRight) return 'right';
  if (hasLeft) return 'left';
  return 'both';
}

/**
 * Is sun visible during flight?
 */
export function isSunVisibleDuringFlight(sunData: FlightSunData): boolean {
  return sunData.departureSun.altitude > 0 || sunData.arrivalSun.altitude > 0;
}

/**
 * Recommended window seats based on scenic side
 */
export function getRecommendedSeats(
  scenicSide: 'left' | 'right' | 'both' | 'none'
): string[] {
  const leftWindowSeat = 'A';
  const rightWindowSeat = 'F';

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
 * Sun position at a given flight progress
 */
export function getSunPositionAtFlightProgress(
  departureTime: Date,
  flightDuration: number,
  progress: number,
  currentLat: number,
  currentLng: number
): SunPosition {
  const currentTime = new Date(
    departureTime.getTime() + flightDuration * progress * 60 * 60 * 1000
  );
  return getSunPosition(currentTime, currentLat, currentLng);
}

/**
 * Main: compute sun behaviour for the flight
 */
export function calculateFlightSunData(
  departureLat: number,
  departureLng: number,
  arrivalLat: number,
  arrivalLng: number,
  departureTime: Date,
  flightDuration: number
): FlightSunData {
  const departureSun = getSunPosition(departureTime, departureLat, departureLng);

  const arrivalTime = new Date(
    departureTime.getTime() + flightDuration * 60 * 60 * 1000
  );
  const arrivalSun = getSunPosition(arrivalTime, arrivalLat, arrivalLng);

  const departureTimes = calculateSunriseSunset(departureLat, departureLng, departureTime);
  const arrivalTimes = calculateSunriseSunset(arrivalLat, arrivalLng, arrivalTime);

  let sunriseTime: Date = departureTimes.sunrise || new Date(departureTime);
  let sunsetTime: Date = departureTimes.sunset || new Date(departureTime);

  if (arrivalTime.getDate() !== departureTime.getDate()) {
    if (
      arrivalTimes.sunrise &&
      arrivalTimes.sunrise > departureTime &&
      arrivalTimes.sunrise < arrivalTime
    ) {
      sunriseTime = arrivalTimes.sunrise;
    }
    if (
      arrivalTimes.sunset &&
      arrivalTimes.sunset > departureTime &&
      arrivalTimes.sunset < arrivalTime
    ) {
      sunsetTime = arrivalTimes.sunset;
    }
  } else {
    if (
      departureTimes.sunrise &&
      departureTimes.sunrise > departureTime &&
      departureTimes.sunrise < arrivalTime
    ) {
      sunriseTime = departureTimes.sunrise;
    }
    if (
      departureTimes.sunset &&
      departureTimes.sunset > departureTime &&
      departureTimes.sunset < arrivalTime
    ) {
      sunsetTime = departureTimes.sunset;
    }
  }

  const pathPoints = generateGreatCirclePath(
    departureLat,
    departureLng,
    arrivalLat,
    arrivalLng,
    20
  );

  const visibleSunPositions: { azimuth: number; altitude: number; bearing: number }[] = [];

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const [lng, lat] = pathPoints[i];
    const [nextLng, nextLat] = pathPoints[i + 1];

    const progress = i / (pathPoints.length - 1);
    const currentTime = new Date(
      departureTime.getTime() + flightDuration * progress * 60 * 60 * 1000
    );

    const sunPos = getSunPosition(currentTime, lat, lng);
    const bearing = calculateBearing(lat, lng, nextLat, nextLng);

    if (sunPos.altitude > -6) {
      visibleSunPositions.push({
        azimuth: sunPos.azimuth,
        altitude: sunPos.altitude,
        bearing,
      });
    }
  }

  if (arrivalSun.altitude > -6) {
    const lastBearing =
      visibleSunPositions.length > 0
        ? visibleSunPositions[visibleSunPositions.length - 1].bearing
        : calculateBearing(departureLat, departureLng, arrivalLat, arrivalLng);

    visibleSunPositions.push({
      azimuth: arrivalSun.azimuth,
      altitude: arrivalSun.altitude,
      bearing: lastBearing,
    });
  }

  if (visibleSunPositions.length === 0) {
    return {
      departureSun,
      arrivalSun,
      scenicSide: 'none',
      sunriseTime,
      sunsetTime,
      flightDuration,
    };
  }

  const relativeAngles = visibleSunPositions.map((pos) =>
    calculateSunRelativeAngle(pos.bearing, pos.azimuth)
  );

  const scenicSide = determineScenicSideFromTrajectory(relativeAngles);

  return {
    departureSun,
    arrivalSun,
    scenicSide,
    sunriseTime,
    sunsetTime,
    flightDuration,
  };
}
