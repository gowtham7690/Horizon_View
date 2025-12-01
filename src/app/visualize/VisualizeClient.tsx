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
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6 lg:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-foreground/70 hover:text-primary transition-colors group"
          >
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            <span className="font-medium">Back to Search</span>
          </Link>

          <div className="card-elevated p-4 md:p-5 lg:p-6 bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-sky-50/80 dark:from-slate-800/80 dark:via-slate-900/60 dark:to-slate-800/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {flightData.departure.city} → {flightData.arrival.city}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-foreground/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground/60">Date</div>
                      <div className="font-bold text-sm">{new Date(flightData.departureTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground/60">Distance</div>
                      <div className="font-bold text-sm">{flightData.distance.toLocaleString()} km</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground/60">Duration</div>
                      <div className="font-bold text-sm">{flightData.duration} hours</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-lg border-2 border-primary/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] text-foreground/60">Departure</div>
                    <div className="text-xs font-bold text-foreground">{flightData.departure.code}</div>
                    <div className="text-[10px] font-semibold text-primary">
                      {new Date(flightData.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-primary/30"></div>
                  <div>
                    <div className="text-[10px] text-foreground/60">Arrival</div>
                    <div className="text-xs font-bold text-foreground">{flightData.arrival.code}</div>
                    <div className="text-[10px] font-semibold text-primary">
                      {new Date(flightData.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Two-Column Layout - 65/35 split */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Left Column: Flight Summary, Map, Sun Timeline */}
          <div className="space-y-4 lg:space-y-5">
            {/* Flight Summary Card */}
            <motion.div
              className="card-elevated p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-base font-bold mb-3 text-foreground">Quick Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-foreground/60 mb-1">Distance</div>
                  <div className="text-lg font-bold text-foreground">{flightData.distance.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-[10px] text-foreground/60 mb-1">Duration</div>
                  <div className="text-lg font-bold text-foreground">{flightData.duration} hrs</div>
                </div>
                <div>
                  <div className="text-[10px] text-foreground/60 mb-1">Bearing</div>
                  <div className="text-lg font-bold text-foreground">{flightData.bearing}°</div>
                </div>
                <div>
                  <div className="text-[10px] text-foreground/60 mb-1">Best Side</div>
                  <div className="text-lg font-bold text-primary">{flightData.sunData.scenicSide.toUpperCase()}</div>
                </div>
              </div>
            </motion.div>

            {/* Map - Fixed Height to Fit Screen */}
            <motion.div
              className="w-full h-[700px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Map2D
                departureLat={flightData.departure.lat}
                departureLng={flightData.departure.lng}
                arrivalLat={flightData.arrival.lat}
                arrivalLng={flightData.arrival.lng}
                path={flightData.path}
              />
            </motion.div>

            {/* Sun Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SunFlightTimeline
                departureTime={new Date(flightData.departureTime)}
                arrivalTime={new Date(flightData.arrivalTime)}
                flightDuration={flightData.duration}
                path={flightData.path}
                scenicSide={flightData.sunData.scenicSide}
                departureLat={flightData.departure.lat}
                departureLng={flightData.departure.lng}
                arrivalLat={flightData.arrival.lat}
                arrivalLng={flightData.arrival.lng}
              />
            </motion.div>
          </div>

          {/* Right Column: Aircraft Seating, Seat Guide */}
          <div className="space-y-4 lg:space-y-5">
            {/* Aircraft Seating - Fixed Height in Pixels */}
            <motion.div
              className="w-full h-[900px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AirplaneSeats
                scenicSide={flightData.sunData.scenicSide}
                recommendedSeats={flightData.sunData.recommendedSeats}
              />
            </motion.div>

            {/* Seat Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <SeatLegend
                scenicSide={flightData.sunData.scenicSide}
                recommendedSeats={flightData.sunData.recommendedSeats}
              />
            </motion.div>
          </div>
        </div>

        {/* Flight details summary */}
        <motion.div
          className="card-soft p-6 md:p-8 mt-6 lg:mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-2xl font-bold mb-6 text-foreground">Flight Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <div className="font-semibold text-sm text-foreground/70 uppercase tracking-wide">Departure</div>
              </div>
              <div className="font-bold text-lg mb-1 text-foreground">{flightData.departure.city}</div>
              <div className="text-sm text-foreground/60 mb-2">{flightData.departure.name}</div>
              <div className="text-sm font-medium text-foreground/80">{new Date(flightData.departureTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="font-semibold text-sm text-foreground/70 uppercase tracking-wide">Arrival</div>
              </div>
              <div className="font-bold text-lg mb-1 text-foreground">{flightData.arrival.city}</div>
              <div className="text-sm text-foreground/60 mb-2">{flightData.arrival.name}</div>
              <div className="text-sm font-medium text-foreground/80">{new Date(flightData.arrivalTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-800/10 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                <div className="font-semibold text-sm text-foreground/70 uppercase tracking-wide">Sun Information</div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Sunrise</div>
                  <div className="font-semibold text-foreground">{new Date(flightData.sunData.sunriseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60 mb-1">Sunset</div>
                  <div className="font-semibold text-foreground">{new Date(flightData.sunData.sunsetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
