'use client';

import React from 'react';
import SunFlightTimeline from '@/components/SunFlightTimeline';
import { calculateFlightSunData, getRecommendedSeats } from '@/lib/sun';

interface FlightSunExperienceProps {
    departureLat: number;
    departureLng: number;
    arrivalLat: number;
    arrivalLng: number;
    departureTime: Date;
    flightDuration: number;
    path: [number, number][];
    flightBearing: number;
}

export default function FlightSunExperience({
    departureLat,
    departureLng,
    arrivalLat,
    arrivalLng,
    departureTime,
    flightDuration,
    path,
    flightBearing,
}: FlightSunExperienceProps) {
    // Calculate sun data for the flight
    const sunData = calculateFlightSunData(
        departureLat,
        departureLng,
        arrivalLat,
        arrivalLng,
        departureTime,
        flightDuration
    );

    const arrivalTime = new Date(
        departureTime.getTime() + flightDuration * 60 * 60 * 1000
    );

    // Calculate recommended seats based on scenic side
    const recommendedSeats = getRecommendedSeats(sunData.scenicSide);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <SunFlightTimeline
                departureTime={departureTime}
                arrivalTime={arrivalTime}
                flightDuration={flightDuration}
                path={path}
                scenicSide={sunData.scenicSide}
                flightBearing={flightBearing}
                sunriseTime={sunData.sunriseTime}
                sunsetTime={sunData.sunsetTime}
                recommendedSeats={recommendedSeats}
                departureLat={departureLat}
                departureLng={departureLng}
                arrivalLat={arrivalLat}
                arrivalLng={arrivalLng}
            />
        </div>
    );
}
