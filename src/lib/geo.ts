import { geoInterpolate } from 'd3-geo';

/**
 * Calculate the Haversine distance between two points on Earth
 * @param lat1 Latitude of first point in degrees
 * @param lng1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lng2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Convert to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Earth's radius in kilometers
  const R = 6371;
  return R * c;
}

/**
 * Calculate the bearing (direction) from point A to point B
 * @param lat1 Latitude of starting point in degrees
 * @param lng1 Longitude of starting point in degrees
 * @param lat2 Latitude of ending point in degrees
 * @param lng2 Longitude of ending point in degrees
 * @returns Bearing in degrees (0° = North, 90° = East)
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);

  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Generate great-circle path points between two coordinates
 * @param startLat Starting latitude
 * @param startLng Starting longitude
 * @param endLat Ending latitude
 * @param endLng Ending longitude
 * @param numPoints Number of points to generate (default: 100)
 * @returns Array of [longitude, latitude] coordinate pairs
 */
export function generateGreatCirclePath(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  numPoints: number = 100
): [number, number][] {
  const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat]);
  const path: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const point = interpolate(i / numPoints);
    path.push([point[0], point[1]]);
  }

  return path;
}

/**
 * Calculate flight duration based on distance (simplified model)
 * @param distance Distance in kilometers
 * @param averageSpeed Average cruise speed in km/h (default: 800 km/h)
 * @returns Duration in hours
 */
export function calculateFlightDuration(distance: number, averageSpeed: number = 800): number {
  return distance / averageSpeed;
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Normalize longitude to [-180, 180] range
 */
export function normalizeLongitude(lng: number): number {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}
