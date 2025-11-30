'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
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
  const [sliderProgress, setSliderProgress] = useState(0);

  const sunPositions = useMemo(() => {
    const positions = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const pathIndex = Math.floor(progress * (path.length - 1));
      const currentPoint = path[pathIndex] || path[0];
      const currentTime = new Date(departureTime.getTime() + progress * flightDuration * 60 * 60 * 1000);

      const sunPos = getSunPositionAtFlightProgress(
        departureTime,
        flightDuration,
        progress,
        currentPoint[1],
        currentPoint[0]
      );

      positions.push({
        progress,
        altitude: sunPos.altitude,
        azimuth: sunPos.azimuth,
        time: currentTime,
        lat: currentPoint[1],
        lng: currentPoint[0],
      });
    }

    return positions;
  }, [departureTime, flightDuration, path]);

  const currentProgress = sliderProgress;
  const currentSunPos = sunPositions[Math.round(currentProgress * (sunPositions.length - 1))] || sunPositions[0];
  const currentTime = currentSunPos?.time || departureTime;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderProgress(parseFloat(e.target.value));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSunStatus = (altitude: number) => {
    if (altitude > 0) return { text: 'Above Horizon', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: '☀️' };
    if (altitude > -6) return { text: 'Near Horizon', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: '🌅' };
    if (altitude > -18) return { text: 'Civil Twilight', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: '🌆' };
    return { text: 'Below Horizon', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50', icon: '🌙' };
  };

  const sunStatus = currentSunPos ? getSunStatus(currentSunPos.altitude) : getSunStatus(0);

  // Find sunrise and sunset times
  const sunrisePos = sunPositions.find(p => p.altitude > -1 && p.altitude < 1 && p.progress > 0.1);
  const sunsetPos = sunPositions.find(p => p.altitude > -1 && p.altitude < 1 && p.progress > 0.5);

  return (
    <div className="card-elevated p-4 md:p-5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base md:text-lg font-bold mb-1 text-foreground">Sun Path Timeline</h3>
        <p className="text-[10px] md:text-xs text-foreground/60">Track sun position throughout your flight</p>
      </div>

      {/* Manual Slider Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-[10px] text-foreground/60 block mb-0.5">Flight Progress</label>
            <span className="text-base font-bold text-foreground">{Math.round(currentProgress * 100)}%</span>
          </div>
          <div className="text-right">
            <label className="text-[10px] text-foreground/60 block mb-0.5">Current Time</label>
            <span className="text-base font-bold text-primary">{formatTime(currentTime)}</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentProgress}
          onChange={handleSliderChange}
          className="w-full h-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, 
              #10b981 0%, 
              #10b981 ${currentProgress * 100}%, 
              #3b82f6 ${currentProgress * 100}%, 
              #ef4444 100%)`
          }}
        />
        <div className="flex justify-between text-[10px] text-foreground/60 mt-1.5 font-medium">
          <span>Departure: {formatTime(departureTime)}</span>
          <span>Arrival: {formatTime(arrivalTime)}</span>
        </div>
      </div>

      {/* Visual Sun Path Diagram */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 border-2 border-border">
        <div className="text-center mb-3">
          <h4 className="text-xs font-bold text-foreground mb-1.5">Sun Position in Sky</h4>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${sunStatus.bg} ${sunStatus.color} text-xs font-semibold`}>
            <span className="text-sm">{sunStatus.icon}</span>
            {sunStatus.text}
          </div>
        </div>
        
        {/* Visual sky representation */}
        <div className="relative h-28 rounded-lg overflow-hidden bg-gradient-to-b from-blue-400 via-orange-300 to-red-400 dark:from-blue-900 dark:via-orange-800 dark:to-red-900 mb-3">
          {/* Horizon line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-foreground/50 z-10">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-2.5 bg-foreground/80 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">
              Horizon
            </div>
          </div>
          
          {/* Airplane marker on horizon */}
          <motion.div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${currentProgress * 100}%`,
              top: '40%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FontAwesomeIcon 
              icon={faPlane} 
              className="w-14 h-14 text-white drop-shadow-lg " style={{ fontSize: "28px" }} 
              aria-hidden
            />
          </motion.div>
          
          {/* Sun position indicator */}
          {currentSunPos && (
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 z-20"
              style={{
                bottom: `${50 + (currentSunPos.altitude / 90) * 50}%`,
                transition: 'bottom 0.1s ease-out'
              }}
              animate={{
                scale: currentSunPos.altitude > 0 ? 1.2 : currentSunPos.altitude > -6 ? 1.0 : 0.7,
              }}
            >
                <motion.svg
                  className="w-8 h-8 text-amber-400 drop-shadow-2xl"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  animate={{
                    rotate: currentSunPos.altitude > 0 ? [0, 360] : [180, 540],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </motion.svg>
              {/* Altitude label - positioned above when near horizon, below when above horizon */}
              {/* <div 
                className={`absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap ${
                  currentSunPos.altitude > 5 ? 'bottom-6' : 'top-6'
                }`}
              >
                <div className="bg-foreground/95 text-white text-[10px] px-2 py-1 rounded shadow-xl font-bold">
                  {Math.round(currentSunPos.altitude)}°
                </div>
                <div className={`absolute left-1/2 transform -translate-x-1/2 border-3 border-transparent ${
                  currentSunPos.altitude > 5 
                    ? 'top-full border-t-foreground/95' 
                    : 'bottom-full border-b-foreground/95'
                }`}></div>
              </div> */}
            </motion.div>
          )}

          {/* Sunrise/Sunset markers */}
          {sunrisePos && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 z-15"
              style={{ left: `${sunrisePos.progress * 100}%` }}
            >
              <div className="w-0.5 h-6 bg-orange-500 rounded-full"></div>
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                Sunrise
              </div>
            </div>
          )}
          {sunsetPos && (
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 z-15"
              style={{ left: `${sunsetPos.progress * 100}%` }}
            >
              <div className="w-0.5 h-6 bg-red-500 rounded-full"></div>
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                Sunset
              </div>
            </div>
          )}
        </div>
        
        {/* Altitude scale */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="text-center">
            <div className="font-bold text-foreground/80">+90°</div>
            <div className="text-foreground/60">Zenith</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-foreground/80">0°</div>
            <div className="text-foreground/60">Horizon</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-foreground/80">-90°</div>
            <div className="text-foreground/60">Nadir</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Sun Altitude */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wide">Altitude</span>
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-0.5">
            {currentSunPos ? `${Math.round(currentSunPos.altitude)}°` : '0°'}
          </div>
          <div className="text-[10px] text-foreground/60">
            {currentSunPos && currentSunPos.altitude > 0 ? 'Above horizon' : currentSunPos && currentSunPos.altitude > -6 ? 'Near horizon' : 'Below horizon'}
          </div>
        </div>

        {/* Sun Azimuth */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wide">Azimuth</span>
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-0.5">
            {currentSunPos ? `${Math.round(currentSunPos.azimuth)}°` : '0°'}
          </div>
          <div className="text-[10px] text-foreground/60">
            {currentSunPos && (currentSunPos.azimuth >= 0 && currentSunPos.azimuth < 90) ? 'North-East' :
             currentSunPos && (currentSunPos.azimuth >= 90 && currentSunPos.azimuth < 180) ? 'South-East' :
             currentSunPos && (currentSunPos.azimuth >= 180 && currentSunPos.azimuth < 270) ? 'South-West' : 'North-West'}
          </div>
        </div>
      </div>

      {/* Scenic windows indicator */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-3 border-2 border-primary/20 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <div className="text-sm font-bold text-primary">
            Best Seats: {scenicSide.toUpperCase()} Side
          </div>
        </div>
        <div className="text-xs text-foreground/80 leading-relaxed">
          {scenicSide === 'left' && 'Choose left window seat (A) for optimal sunrise/sunset views'}
          {scenicSide === 'right' && 'Choose right window seat (F) for optimal sunrise/sunset views'}
          {scenicSide === 'both' && 'Both window seats (A and F) offer excellent sunrise/sunset views'}
        </div>
      </div>

      {/* Location Info */}
      <div className="mt-auto pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-foreground/60 mb-0.5">Current Location</div>
            <div className="font-semibold text-foreground">
              {currentSunPos ? `${currentSunPos.lat.toFixed(2)}°N, ${Math.abs(currentSunPos.lng).toFixed(2)}°${currentSunPos.lng >= 0 ? 'E' : 'W'}` : 'N/A'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-foreground/60 mb-0.5">Flight Duration</div>
            <div className="font-semibold text-foreground">{flightDuration.toFixed(1)} hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
