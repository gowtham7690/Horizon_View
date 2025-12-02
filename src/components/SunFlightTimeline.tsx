// SunFlightTimeline.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { getSunPosition as getSunPositionFromLib, calculateSunRelativeAngle } from '@/lib/sun';
import { calculateBearing } from '@/lib/geo';

interface SunFlightTimelineProps {
  departureTime: Date;
  arrivalTime: Date;
  flightDuration: number;            // hours
  path: [number, number][];          // [lng, lat] pairs along flight path
  scenicSide: 'left' | 'right' | 'both' | 'none';
  flightBearing?: number;            // not used in simple UI but available for future refinement
  sunriseTime?: Date;
  sunsetTime?: Date;
  recommendedSeats?: string[];       // e.g. ['A'] or ['A','F']
  departureLat?: number;             // for real sun calculations
  departureLng?: number;
  arrivalLat?: number;
  arrivalLng?: number;
}

export default function SunFlightTimeline({
  departureTime,
  arrivalTime,
  flightDuration,
  path,
  scenicSide,
  flightBearing,
  sunriseTime,
  sunsetTime,
  recommendedSeats,
  departureLat,
  departureLng,
  arrivalLat,
  arrivalLng,
}: SunFlightTimelineProps) {
  const [sliderProgress, setSliderProgress] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderProgress(parseFloat(e.target.value));
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTime = new Date(
    departureTime.getTime() + sliderProgress * flightDuration * 60 * 60 * 1000
  );

  // Calculate REAL sun position based on actual coordinates and time
  const getSunPosition = () => {
    // If we have coordinates, calculate real sun position
    if (departureLat !== undefined && departureLng !== undefined &&
      arrivalLat !== undefined && arrivalLng !== undefined && path.length > 0) {

      // Interpolate current position along flight path
      const pathIndex = Math.floor(sliderProgress * (path.length - 1));
      const [currentLng, currentLat] = path[Math.min(pathIndex, path.length - 1)];

      // Calculate current time
      const currentTime = new Date(
        departureTime.getTime() + sliderProgress * flightDuration * 60 * 60 * 1000
      );

      // Get actual sun position at this location and time
      const sunPos = getSunPositionFromLib(currentTime, currentLat, currentLng);

      // Calculate flight bearing at this point
      let bearing: number;
      if (pathIndex < path.length - 1) {
        const [nextLng, nextLat] = path[pathIndex + 1];
        bearing = calculateBearing(currentLat, currentLng, nextLat, nextLng);
      } else {
        bearing = flightBearing || calculateBearing(departureLat, departureLng, arrivalLat, arrivalLng);
      }

      // Calculate relative angle: where is sun relative to flight direction?
      const relativeAngle = calculateSunRelativeAngle(bearing, sunPos.azimuth);

      // X-axis: flight progress (0 to 100%)
      const x = sliderProgress * 100;

      // Y-axis: map relative angle to left/right position
      // -180° (behind left) → 0%
      // -90° (left) → 25%
      // 0° (ahead) → 50%
      // +90° (right) → 75%
      // +180° (behind right) → 100%
      const y = ((relativeAngle + 180) / 360) * 100;

      // Return position and visibility (sun above horizon or in twilight)
      // Show sun when altitude > -6° (civil twilight threshold)
      return {
        x,
        y,
        visible: sunPos.altitude > -6,
        altitude: sunPos.altitude
      };
    }

    // Fallback to simplified visualization if coordinates not provided
    if (scenicSide === 'both') {
      const x = sliderProgress * 100;
      const y = sliderProgress * 100;
      return { x, y, visible: true, altitude: 10 };
    } else if (scenicSide === 'left') {
      const x = sliderProgress * 50;
      const y = sliderProgress * 75;
      return { x, y, visible: true, altitude: 10 };
    } else if (scenicSide === 'none') {
      // No sun visible
      const x = sliderProgress * 100;
      const y = 50; // Center
      return { x, y, visible: false, altitude: -10 };
    } else {
      const x = 100 - sliderProgress * 50;
      const y = 100 - sliderProgress * 100;
      return { x, y, visible: true, altitude: 10 };
    }
  };

  const sunPosition = getSunPosition();

  const labelForScenicSide = () => {
    if (scenicSide === 'both') return 'Both sides (A & F)';
    if (scenicSide === 'left') return 'Left side (A)';
    if (scenicSide === 'right') return 'Right side (F)';
    return 'None (Night Flight)';
  };

  const seatsText =
    recommendedSeats && recommendedSeats.length > 0
      ? recommendedSeats.join(', ')
      : scenicSide === 'both'
        ? 'A, F'
        : scenicSide === 'left'
          ? 'A'
          : scenicSide === 'right'
            ? 'F'
            : 'None';

  return (
    <div className="card-elevated p-4 md:p-5 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base md:text-lg font-bold mb-1 text-foreground">
          Sun View Timeline
        </h3>
        <p className="text-[10px] md:text-xs text-foreground/60">
          See how the sun moves relative to your window view during the flight
        </p>
      </div>

      {/* Flight Progress Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-[8px] text-foreground/60 block mb-0.5">
              Flight Progress
            </label>
            <span className="text-base font-bold text-foreground">
              {Math.round(sliderProgress * 100)}%
            </span>
          </div>
          <div className="text-right">
            <label className="text-[10px] text-foreground/60 block mb-0.5">
              Current Local Time
            </label>
            <span className="text-base font-bold text-primary">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sliderProgress}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gradient-to-r from-primary/30 to-primary rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, 
              #3b82f6 0%, 
              #3b82f6 ${sliderProgress * 100}%, 
              #cbd5e1 ${sliderProgress * 100}%, 
              #cbd5e1 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-foreground/60 mt-1.5 font-medium">
          <span>Departure: {formatTime(departureTime)}</span>
          <span>Arrival: {formatTime(arrivalTime)}</span>
        </div>
      </div>

      {/* Sky / Sun Path */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border-2 border-border">
        <div className="text-center mb-4">
          <h4 className="text-xs font-bold text-foreground mb-1">
            Sun Visibility Timeline
          </h4>
          <p className="text-[10px] text-foreground/60">
            {scenicSide === 'both' &&
              'Sun moves from left to right side throughout the flight'}
            {scenicSide === 'left' &&
              'Sun stays mostly on the left-hand windows (A side)'}
            {scenicSide === 'right' &&
              'Sun stays mostly on the right-hand windows (F side)'}
            {scenicSide === 'none' &&
              'Sun is not visible during this flight (Night Flight)'}
          </p>
        </div>

        <div className="relative h-40 rounded-lg overflow-hidden border-2 border-border/50 isolate">
          {/* Background Layers for Smooth Transitions */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }} // Night
            animate={{ opacity: !sunPosition.visible ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(to bottom, #3b0764, #f97316, #fde047)' }} // Sunset
            animate={{ opacity: sunPosition.visible && sunPosition.altitude <= 6 ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(to bottom, #3b82f6, #60a5fa, #93c5fd)' }} // Day
            animate={{ opacity: sunPosition.altitude > 6 ? 1 : 0 }}
            transition={{ duration: 1 }}
          />

          {/* Left/Right labels */}
          <div className="absolute top-2 left-2 text-[10px] font-bold text-foreground/70 bg-white/90 dark:bg-black/70 px-2 py-1 rounded shadow-sm z-10">
            Left Windows
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] font-bold text-foreground/70 bg-white/90 dark:bg-black/70 px-2 py-1 rounded shadow-sm z-10">
            Right Windows
          </div>

          {/* Start/End */}
          <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[9px] font-semibold text-foreground/50 z-10">
            Rear
          </div>
          <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[9px] font-semibold text-foreground/50 z-10">
            Rear
          </div>

          {/* Middle line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-foreground/20 z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 px-1 rounded text-[8px] font-bold text-foreground/60 z-10">
            Front of Plane
          </div>

          {/* Airplane marker */}
          <motion.div
            className="absolute z-30 pointer-events-none"
            animate={{
              left: `${sliderProgress * 100}%`
            }}
            style={{
              top: '50%',
              x: '-50%',
              y: '-50%',
            }}
            transition={{
              left: { type: "spring", stiffness: 100, damping: 20 }
            }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FontAwesomeIcon
                icon={faPlane}
                className="w-6 h-6 text-foreground drop-shadow-lg"
                style={{ fontSize: '24px' }}
                aria-hidden
              />
            </motion.div>
          </motion.div>

          {/* Sun marker - only show when above horizon */}
          {sunPosition.visible && (
            <motion.div
              className="absolute z-20"
              initial={false}
              animate={{
                left: `${sunPosition.x}%`,
                top: `${sunPosition.y}%`,
                opacity: sunPosition.altitude > 10 ? 1 :
                  sunPosition.altitude > 0 ? 0.7 :
                    sunPosition.altitude > -6 ? 0.4 : 0.2,
              }}
              style={{
                x: '-50%',
                y: '-50%',
              }}
              transition={{
                left: { type: "spring", stiffness: 200, damping: 30 },
                top: { type: "spring", stiffness: 200, damping: 30 },
                opacity: { duration: 0.5 }
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <svg
                  className="w-12 h-12 text-amber-400 drop-shadow-2xl"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {/* Progress fill */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-primary/50 transition-all duration-300 z-10"
            style={{ width: `${sliderProgress * 100}%` }}
          />
        </div>

        {/* Movement pattern */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <svg
              className="w-3 h-3 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span className="text-[10px] font-semibold text-primary">
              {scenicSide === 'both' && 'Diagonal: Left side → Right side'}
              {scenicSide === 'left' && 'Diagonal: Left side → Center'}
              {scenicSide === 'right' && 'Diagonal: Right side → Center'}
              {scenicSide === 'none' && 'No visible sun path'}
            </span>
          </div>
        </div>

        {/* Sunrise / Sunset */}
        {(sunriseTime || sunsetTime) && (
          <div className="mt-3 flex justify-between text-[10px] text-foreground/70">
            <span>Sunrise: {formatTime(sunriseTime)}</span>
            <span>Sunset: {formatTime(sunsetTime)}</span>
          </div>
        )}
      </div>

      {/* Best Seats Recommendation */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 border-2 border-primary/20 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <div className="text-sm font-bold text-primary">
            Current View: {
              !sunPosition.visible ? 'Night View' :
                sunPosition.altitude <= 6 ? 'Sunset / Sunrise' :
                  'Daylight'
            }
          </div>
        </div>
        <div className="text-xs text-foreground/80 leading-relaxed">
          <p className="font-semibold mb-1">
            Sun Position: {
              !sunPosition.visible ? 'Below Horizon' :
                (
                  <>
                    {sunPosition.y < 25 ? 'Behind Left' :
                      sunPosition.y < 50 ? 'Ahead Left' :
                        sunPosition.y < 75 ? 'Ahead Right' :
                          'Behind Right'}
                    <span className="font-normal opacity-75">
                      {' ('}
                      {sunPosition.altitude > 45 ? 'High in Sky' :
                        sunPosition.altitude > 15 ? 'Mid Sky' :
                          'Low on Horizon'}
                      {')'}
                    </span>
                  </>
                )
            }
          </p>
          <p className="opacity-80">
            {
              !sunPosition.visible
                ? 'The sun is below the horizon, so seat choice matters less for sun views.'
                : sunPosition.y < 50
                  ? 'The sun is currently on the left side of the aircraft.'
                  : 'The sun is currently on the right side of the aircraft.'
            }
          </p>
        </div>
      </div>

      {/* Flight Info */}
      <div className="mt-auto pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-foreground/60 mb-0.5">Departure</div>
            <div className="font-semibold text-foreground">
              {formatTime(departureTime)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-foreground/60 mb-0.5">Duration</div>
            <div className="font-semibold text-foreground">
              {flightDuration.toFixed(1)} hours
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-foreground/60 mb-0.5">Arrival</div>
            <div className="font-semibold text-foreground">
              {formatTime(arrivalTime)}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
