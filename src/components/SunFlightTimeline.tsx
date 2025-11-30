'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getSunPositionAtFlightProgress } from '@/lib/sun';

interface SunFlightTimelineProps {
  departureTime: Date;
  arrivalTime: Date;
  flightDuration: number;
  path: [number, number][];
  scenicSide: 'left' | 'right' | 'both';
}

export default function SunFlightTimeline({
  departureTime,
  arrivalTime,
  flightDuration,
  path,
  scenicSide
}: SunFlightTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date(departureTime));

  const sunPositions = useMemo(() => {
    // Calculate sun positions along the flight path
    const positions = [];
    const steps = 50;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const flightProgress = progress;

      // Get position along the path
      const pathIndex = Math.floor(progress * (path.length - 1));
      const currentPoint = path[pathIndex] || path[0];

      // Get sun position at this point
      const sunPos = getSunPositionAtFlightProgress(
        departureTime,
        flightDuration,
        flightProgress,
        currentPoint[1], // latitude
        currentPoint[0]  // longitude
      );

      positions.push({
        progress,
        altitude: sunPos.altitude,
        azimuth: sunPos.azimuth,
      });
    }

    return positions;
  }, [departureTime, flightDuration, path]);

  useEffect(() => {
    // Animate timeline
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev.getTime() + (flightDuration * 60 * 60 * 1000) / 100); // 100 steps
        if (newTime >= arrivalTime) {
          clearInterval(interval);
          return arrivalTime;
        }
        return newTime;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [departureTime, arrivalTime, flightDuration]);

  const currentProgress = Math.min(
    (currentTime.getTime() - departureTime.getTime()) / (arrivalTime.getTime() - departureTime.getTime()),
    1
  );

  const currentSunPos = sunPositions[Math.floor(currentProgress * (sunPositions.length - 1))] || sunPositions[0];

  // Convert azimuth to timeline position (simplified)
  const getTimelineX = (azimuth: number) => {
    // Map azimuth (0-360) to timeline position (0-100%)
    // This is a simplification - in reality, we'd need to consider flight direction
    return (azimuth / 360) * 100;
  };

  return (
    <div className="card-soft p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">Sun Path Timeline</h3>

      {/* Timeline bar */}
      <div className="relative mb-8">
        <div className="timeline-bar h-4 rounded-full relative overflow-hidden">
          {/* Progress indicator */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${currentProgress * 100}%` }}
            transition={{ duration: 0.1 }}
          />

          {/* Sun icon moving along timeline */}
          {currentSunPos && (
            <motion.div
              className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 text-yellow-400"
              style={{
                left: `${getTimelineX(currentSunPos.azimuth)}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                rotate: currentSunPos.altitude > 0 ? 0 : 180,
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.svg
                viewBox="0 0 24 24"
                fill="currentColor"
                animate={{
                  scale: currentSunPos.altitude > -6 ? 1 : 0.5, // Sun gets smaller near horizon
                }}
                transition={{ duration: 0.3 }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </motion.svg>
            </motion.div>
          )}
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-sm text-foreground/70 mt-2">
          <span>{departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>{arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Altitude indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Sun Altitude</span>
          <span>{currentSunPos ? `${Math.round(currentSunPos.altitude)}°` : '0°'}</span>
        </div>
        <div className="w-full bg-foreground/20 rounded-full h-2">
          <motion.div
            className="bg-yellow-400 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: `${Math.max(0, Math.min(100, ((currentSunPos?.altitude || 0) + 90) / 180 * 100))}%`
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs text-foreground/50 mt-1">
          <span>-90°</span>
          <span>0°</span>
          <span>+90°</span>
        </div>
      </div>

      {/* Scenic windows indicator */}
      <div className="bg-primary/10 rounded-lg p-4">
        <div className="text-sm font-medium text-primary mb-2">
          Scenic Windows: {scenicSide.toUpperCase()}
        </div>
        <div className="text-xs text-foreground/70">
          {scenicSide === 'left' && 'Left side windows (A, B, C) for best sunrise/sunset views'}
          {scenicSide === 'right' && 'Right side windows (D, E, F) for best sunrise/sunset views'}
          {scenicSide === 'both' && 'Both sides offer excellent sunrise/sunset views throughout the flight'}
        </div>
      </div>

      {/* Current flight info */}
      <div className="mt-4 text-center text-sm text-foreground/60">
        Flight Progress: {Math.round(currentProgress * 100)}% •
        Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
