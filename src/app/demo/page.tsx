'use client';

import React from 'react';
import FlightSunExperience from '@/components/FlightSunExperience';
import { generateGreatCirclePath, calculateBearing } from '@/lib/geo';
import { motion } from 'framer-motion';

export default function DemoPage() {
    // Example: New York (JFK) to Tokyo (HND)
    const departureLat = 40.6413;
    const departureLng = -73.7781;
    const arrivalLat = 35.5494;
    const arrivalLng = 139.7798;

    const departureTime = new Date('2025-01-10T14:00:00Z');
    const flightDuration = 14; // hours

    const path = generateGreatCirclePath(
        departureLat,
        departureLng,
        arrivalLat,
        arrivalLng,
        50
    );

    const flightBearing = calculateBearing(
        departureLat,
        departureLng,
        arrivalLat,
        arrivalLng
    );

    return (
        <main className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        HorizonView Demo
                    </h1>
                    <p className="text-foreground/70">
                        Sun & Seat Helper – New York (JFK) to Tokyo (HND)
                    </p>
                </div>

                <FlightSunExperience
                    departureLat={departureLat}
                    departureLng={departureLng}
                    arrivalLat={arrivalLat}
                    arrivalLng={arrivalLng}
                    departureTime={departureTime}
                    flightDuration={flightDuration}
                    path={path}
                    flightBearing={flightBearing}
                />
            </motion.div>
        </main>
    );
}
