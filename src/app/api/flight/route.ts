import { NextRequest, NextResponse } from 'next/server';
import { findAirportByCode } from '@/lib/cities';
import { haversineDistance, calculateBearing, calculateFlightDuration, generateGreatCirclePath } from '@/lib/geo';
import { calculateFlightSunData, getRecommendedSeats } from '@/lib/sun';

export interface FlightRouteResponse {
  success: boolean;
  data?: {
    departure: {
      code: string;
      name: string;
      city: string;
      lat: number;
      lng: number;
    };
    arrival: {
      code: string;
      name: string;
      city: string;
      lat: number;
      lng: number;
    };
    distance: number;
    bearing: number;
    duration: number;
    path: [number, number][];
    sunData: {
      scenicSide: 'left' | 'right' | 'both' | 'none';
      recommendedSeats: string[];
      sunriseTime: string;
      sunsetTime: string;
      departureSunAltitude: number;
      arrivalSunAltitude: number;
    };
    departureTime: string;
    arrivalTime: string;
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const dt = searchParams.get('dt');

    // Validate required parameters
    if (!from || !to || !dt) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: from, to, dt'
      } as FlightRouteResponse, { status: 400 });
    }

    // Find airports
    const departureAirport = findAirportByCode(from);
    const arrivalAirport = findAirportByCode(to);

    if (!departureAirport) {
      return NextResponse.json({
        success: false,
        error: `Departure airport '${from}' not found`
      } as FlightRouteResponse, { status: 404 });
    }

    if (!arrivalAirport) {
      return NextResponse.json({
        success: false,
        error: `Arrival airport '${to}' not found`
      } as FlightRouteResponse, { status: 404 });
    }

    // Prevent same airport selection
    if (departureAirport.code === arrivalAirport.code) {
      return NextResponse.json({
        success: false,
        error: 'Departure and arrival airports cannot be the same'
      } as FlightRouteResponse, { status: 400 });
    }

    // Parse departure time
    const departureTime = new Date(dt);
    if (isNaN(departureTime.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid departure time format'
      } as FlightRouteResponse, { status: 400 });
    }

    // Calculate flight parameters
    const distance = haversineDistance(
      departureAirport.lat, departureAirport.lng,
      arrivalAirport.lat, arrivalAirport.lng
    );

    const bearing = calculateBearing(
      departureAirport.lat, departureAirport.lng,
      arrivalAirport.lat, arrivalAirport.lng
    );

    const duration = calculateFlightDuration(distance);

    // Generate flight path with fewer points for straighter appearance
    const path = generateGreatCirclePath(
      departureAirport.lat, departureAirport.lng,
      arrivalAirport.lat, arrivalAirport.lng,
      20 // Fewer points for straighter path
    );

    // Calculate sun data using custom sunrise/sunset calculation
    const sunData = calculateFlightSunData(
      departureAirport.lat, departureAirport.lng,
      arrivalAirport.lat, arrivalAirport.lng,
      departureTime,
      duration
    );

    const recommendedSeats = getRecommendedSeats(sunData.scenicSide);

    // Calculate arrival time
    const arrivalTime = new Date(departureTime.getTime() + duration * 60 * 60 * 1000);

    const response: FlightRouteResponse = {
      success: true,
      data: {
        departure: {
          code: departureAirport.code,
          name: departureAirport.name,
          city: departureAirport.city,
          lat: departureAirport.lat,
          lng: departureAirport.lng,
        },
        arrival: {
          code: arrivalAirport.code,
          name: arrivalAirport.name,
          city: arrivalAirport.city,
          lat: arrivalAirport.lat,
          lng: arrivalAirport.lng,
        },
        distance: Math.round(distance),
        bearing: Math.round(bearing),
        duration: Math.round(duration * 10) / 10, // Round to 1 decimal place
        path,
        sunData: {
          scenicSide: sunData.scenicSide,
          recommendedSeats,
          sunriseTime: sunData.sunriseTime.toISOString(),
          sunsetTime: sunData.sunsetTime.toISOString(),
          departureSunAltitude: Math.round(sunData.departureSun.altitude * 10) / 10,
          arrivalSunAltitude: Math.round(sunData.arrivalSun.altitude * 10) / 10,
        },
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Flight route calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as FlightRouteResponse, { status: 500 });
  }
}
