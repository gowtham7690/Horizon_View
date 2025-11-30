'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Map2D from '@/components/Map2D';
import AirplaneSeats from '@/components/AirplaneSeats';
import SunFlightTimeline from '@/components/SunFlightTimeline';
import SeatLegend from '@/components/SeatLegend';
import { FlightRouteResponse } from '@/app/api/flight/route';

interface VisualizeClientProps {
  searchParams: {
    from: string;
    to: string;
    dt: string;
  };
}

export default function VisualizeClient({ searchParams }: VisualizeClientProps) {
  const [flightData, setFlightData] = useState<FlightRouteResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        const response = await fetch(
          `/api/flight?from=${searchParams.from}&to=${searchParams.to}&dt=${searchParams.dt}`
        );

        const data: FlightRouteResponse = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to load flight data');
          return;
        }

        setFlightData(data.data);
      } catch (err) {
        setError('Failed to fetch flight data');
        console.error('Flight data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-2xl mb-4">✈️</div>
          <div className="text-xl font-semibold mb-2">Calculating Flight Path</div>
          <div className="text-foreground/60">Finding the best scenic seats...</div>
        </motion.div>
      </div>
    );
  }

  if (error || !flightData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="card-soft p-8 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Flight Data</h2>
          <p className="text-foreground/70 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Another Flight
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-block mb-4 text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Search
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {flightData.departure.city} → {flightData.arrival.city}
          </h1>
          <div className="text-lg text-foreground/70">
            {new Date(flightData.departureTime).toLocaleDateString()} •
            {flightData.distance} km •
            {flightData.duration} hours
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Map2D
              departureLat={flightData.departure.lat}
              departureLng={flightData.departure.lng}
              arrivalLat={flightData.arrival.lat}
              arrivalLng={flightData.arrival.lng}
              path={flightData.path}
            />
          </motion.div>

          {/* Seats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AirplaneSeats
              scenicSide={flightData.sunData.scenicSide}
              recommendedSeats={flightData.sunData.recommendedSeats}
            />
          </motion.div>
        </div>

        {/* Timeline and Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SunFlightTimeline
              departureTime={new Date(flightData.departureTime)}
              arrivalTime={new Date(flightData.arrivalTime)}
              flightDuration={flightData.duration}
              path={flightData.path}
              scenicSide={flightData.sunData.scenicSide}
            />
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <SeatLegend
              scenicSide={flightData.sunData.scenicSide}
              recommendedSeats={flightData.sunData.recommendedSeats}
            />
          </motion.div>
        </div>

        {/* Flight details summary */}
        <motion.div
          className="card-soft p-6 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-xl font-semibold mb-4">Flight Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground/70">Departure</div>
              <div className="font-semibold">{flightData.departure.city} ({flightData.departure.code})</div>
              <div>{new Date(flightData.departureTime).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium text-foreground/70">Arrival</div>
              <div className="font-semibold">{flightData.arrival.city} ({flightData.arrival.code})</div>
              <div>{new Date(flightData.arrivalTime).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium text-foreground/70">Sun Information</div>
              <div>Sunrise: {new Date(flightData.sunData.sunriseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div>Sunset: {new Date(flightData.sunData.sunsetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
