'use client';

import { useState } from 'react';
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
  // Calculate bounding box from all path points to ensure entire route is visible
  const allPoints = path && path.length > 0 ? path : [[departureLng, departureLat], [arrivalLng, arrivalLat]];
  
  // Find min/max latitudes and longitudes
  let minLat = Math.min(departureLat, arrivalLat);
  let maxLat = Math.max(departureLat, arrivalLat);
  let minLng = Math.min(departureLng, arrivalLng);
  let maxLng = Math.max(departureLng, arrivalLng);

  // Check all path points
  allPoints.forEach(([lng, lat]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  // Handle longitude wrapping (crossing date line)
  const lngSpan = maxLng - minLng;
  const lngSpanWrapped = (360 - lngSpan) % 360;
  const crossesDateLine = lngSpanWrapped < lngSpan;

  // Calculate center
  let centerLng: number;
  let centerLat = (minLat + maxLat) / 2;

  if (crossesDateLine) {
    // If crossing date line, center on the Pacific side
    centerLng = ((minLng + maxLng + 360) / 2) % 360;
    if (centerLng > 180) centerLng -= 360;
  } else {
    centerLng = (minLng + maxLng) / 2;
  }

  // Calculate span with padding
  const latSpan = maxLat - minLat;
  const effectiveLngSpan = crossesDateLine ? lngSpanWrapped : lngSpan;
  
  // Add 20% padding on all sides
  const padding = 0.2;
  const paddedLatSpan = latSpan * (1 + padding * 2);
  const paddedLngSpan = effectiveLngSpan * (1 + padding * 2);

  // Calculate scale based on the larger dimension
  // Use a formula that works well for both short and long flights
  const maxSpan = Math.max(paddedLatSpan, paddedLngSpan);
  
  // Adaptive scale calculation
  // For very long flights (span > 90 degrees), use smaller scale
  // For shorter flights, use larger scale
  let scale: number;
  if (maxSpan > 90) {
    // Very long flights (e.g., trans-Pacific, trans-Atlantic)
    scale = Math.max(80, Math.min(200, 150 / (maxSpan / 180)));
  } else if (maxSpan > 45) {
    // Long flights (e.g., cross-continental)
    scale = Math.max(150, Math.min(400, 300 / (maxSpan / 90)));
  } else {
    // Short to medium flights
    scale = Math.max(200, Math.min(800, 600 / (maxSpan / 45)));
  }

  return (
    <div className="card-soft p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">Flight Path</h3>

      <div className="w-full h-96 overflow-hidden rounded-lg">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale,
            center: [centerLng, centerLat],
            rotate: crossesDateLine ? [-centerLng, 0, 0] : [0, 0, 0],
          }}
          width={800}
          height={400}
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
                  fill="#e6f3ff"
                  stroke="#87ceeb"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#b8d4f0' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Straight flight path line from depart to arrive */}
          <Line
            from={[departureLng, departureLat]}
            to={[arrivalLng, arrivalLat]}
            stroke="#ff4500"
            strokeWidth={3}
            strokeDasharray="5,5"
            style={{
              animation: 'dash 3s linear infinite',
            }}
          />

          {/* Departure marker */}
          <Marker coordinates={[departureLng, departureLat]}>
            <motion.circle
              r={6}
              fill="#228b22"
              stroke="#ffffff"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
            <motion.text
              textAnchor="middle"
              y={-10}
              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#228b22' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              DEPART
            </motion.text>
          </Marker>

          {/* Arrival marker */}
          <Marker coordinates={[arrivalLng, arrivalLat]}>
            <motion.circle
              r={6}
              fill="#dc143c"
              stroke="#ffffff"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            />
            <motion.text
              textAnchor="middle"
              y={-10}
              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#dc143c' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              ARRIVE
            </motion.text>
          </Marker>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full" />
          <span>Departure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-orange-400 border-dashed border-t-2" style={{borderTopStyle: 'dashed'}} />
          <span>Flight Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full" />
          <span>Arrival</span>
        </div>
      </div>

    </div>
  );
}
