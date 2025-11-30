'use client';

import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';

interface Map2DProps {
  departureLat: number;
  departureLng: number;
  arrivalLat: number;
  arrivalLng: number;
  path: [number, number][];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function Map2D({ departureLat, departureLng, arrivalLat, arrivalLng, path }: Map2DProps) {

  // Calculate bounding box
  const allPoints = path && path.length > 0 ? path : [[departureLng, departureLat], [arrivalLng, arrivalLat]];
  
  let minLat = Math.min(departureLat, arrivalLat);
  let maxLat = Math.max(departureLat, arrivalLat);
  let minLng = Math.min(departureLng, arrivalLng);
  let maxLng = Math.max(departureLng, arrivalLng);

  allPoints.forEach(([lng, lat]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  const lngSpan = maxLng - minLng;
  const lngSpanWrapped = (360 - lngSpan) % 360;
  const crossesDateLine = lngSpanWrapped < lngSpan;

  let centerLng: number;
  let centerLat = (minLat + maxLat) / 2;

  if (crossesDateLine) {
    centerLng = ((minLng + maxLng + 360) / 2) % 360;
    if (centerLng > 180) centerLng -= 360;
  } else {
    centerLng = (minLng + maxLng) / 2;
  }

  const latSpan = maxLat - minLat;
  const effectiveLngSpan = crossesDateLine ? lngSpanWrapped : lngSpan;
  const padding = 0.2;
  const paddedLatSpan = latSpan * (1 + padding * 2);
  const paddedLngSpan = effectiveLngSpan * (1 + padding * 2);
  const maxSpan = Math.max(paddedLatSpan, paddedLngSpan);
  
  let scale: number;
  if (maxSpan > 90) {
    scale = Math.max(80, Math.min(200, 150 / (maxSpan / 180)));
  } else if (maxSpan > 45) {
    scale = Math.max(150, Math.min(400, 300 / (maxSpan / 90)));
  } else {
    scale = Math.max(200, Math.min(800, 600 / (maxSpan / 45)));
  }


  return (
    <div className="card-elevated p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Flight Path</h3>
        <p className="text-sm text-foreground/60">Great circle route visualization</p>
      </div>

      <div className="w-full h-[350px] md:h-[450px] overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-border/50 shadow-inner relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale,
            center: [centerLng, centerLat],
            rotate: crossesDateLine ? [-centerLng, 0, 0] : [0, 0, 0],
          }}
          width={1200}
          height={600}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {/* World map background */}
          <Geographies geography={geoUrl}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {({ geographies }: any) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e0f2fe"
                  stroke="#bae6fd"
                  strokeWidth={0.3}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#7dd3fc', transition: 'all 0.3s' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Great circle flight path with gradient */}
          {path.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = path[index - 1];
            return (
              <Line
                key={index}
                from={prevPoint}
                to={point}
                stroke="url(#flightGradient)"
                strokeWidth={4}
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))',
                }}
              />
            );
          })}
          <defs>
            <linearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>


          {/* Departure marker */}
          <Marker coordinates={[departureLng, departureLat]}>
            <g>
              <motion.circle
                r={10}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={3}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                filter="url(#glow)"
              />
              <motion.circle
                r={15}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                strokeOpacity={0.3}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.text
                textAnchor="middle"
                y={-20}
                style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  fill: '#10b981',
                  textShadow: '0 1px 3px rgba(255,255,255,0.9)',
                  letterSpacing: '0.5px'
                }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                DEPART
              </motion.text>
            </g>
          </Marker>

          {/* Arrival marker */}
          <Marker coordinates={[arrivalLng, arrivalLat]}>
            <g>
              <motion.circle
                r={10}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={3}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.5, type: "spring" }}
                filter="url(#glow)"
              />
              <motion.circle
                r={15}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                strokeOpacity={0.3}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
              <motion.text
                textAnchor="middle"
                y={-20}
                style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  fill: '#ef4444',
                  textShadow: '0 1px 3px rgba(255,255,255,0.9)',
                  letterSpacing: '0.5px'
                }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                ARRIVE
              </motion.text>
            </g>
          </Marker>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 md:gap-8 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-md ring-2 ring-emerald-200 dark:ring-emerald-900"></div>
          <span className="text-sm font-semibold text-foreground/80">Departure</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-red-500 rounded-full"></div>
          <span className="text-sm font-semibold text-foreground/80">Flight Path</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-md ring-2 ring-red-200 dark:ring-red-900"></div>
          <span className="text-sm font-semibold text-foreground/80">Arrival</span>
        </div>
      </div>
    </div>
  );
}
