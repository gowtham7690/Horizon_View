'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';
import { geoMercator } from 'd3-geo';

interface Map2DProps {
  departureLat: number;
  departureLng: number;
  arrivalLat: number;
  arrivalLng: number;
  path?: [number, number][]; // optional array of [lng, lat]
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/**
 * Behavior:
 * - If the route distance is SHORT -> center on the midpoint and ZOOM IN so the segment is clear.
 * - If the route distance is LONG  -> zoom out / choose projection center so the full line fits.
 *
 * This file draws the LINE (linear) actively. The PARABOLIC path is present but commented out.
 */

export default function Map2D({
  departureLat,
  departureLng,
  arrivalLat,
  arrivalLng,
  path = [],
}: Map2DProps) {
  // Use provided path or fallback to departure->arrival
  const allPoints = path.length > 0 ? path : [[departureLng, departureLat], [arrivalLng, arrivalLat]];

  // Helper: haversine distance (km)
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Compute bounding box (handles path points)
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  allPoints.forEach(([lng, lat]) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  // If allPoints collapsed to single point, ensure bbox has some size
  if (minLat === Infinity) {
    minLat = Math.min(departureLat, arrivalLat);
    maxLat = Math.max(departureLat, arrivalLat);
    minLng = Math.min(departureLng, arrivalLng);
    maxLng = Math.max(departureLng, arrivalLng);
  }

  // handle date line: compute longitudinal span robustly
  const rawLngSpan = maxLng - minLng;
  const lngSpanWrapped = (() => {
    // compute minimal span across date line
    const span = Math.abs((maxLng - minLng + 360) % 360);
    return span === 0 ? 0 : Math.min(span, 360 - span);
  })();

  const crossesDateLine = (360 - rawLngSpan) % 360 < rawLngSpan;

  // Center lat straightforward
  const bboxCenterLat = (minLat + maxLat) / 2;

  // Center lng needs date-line handling
  let bboxCenterLng = 0;
  if (crossesDateLine) {
    // shift into positive range, average, then wrap back
    const a = (minLng + 360) % 360;
    const b = (maxLng + 360) % 360;
    let c = (a + b) / 2;
    if (a > b) {
      // across date line
      c = ((a + b + 360) / 2) % 360;
    }
    bboxCenterLng = c > 180 ? c - 360 : c;
  } else {
    bboxCenterLng = (minLng + maxLng) / 2;
  }

  // Start / end
  const start = allPoints[0];
  const end = allPoints[allPoints.length - 1];

  // Distance (km) between departure and arrival
  const distanceKm = haversineKm(start[1], start[0], end[1], end[0]);

  // Thresholds to decide "zoomed-in" vs "fit all"
  const SHORT_DISTANCE_KM = 1500; // if route shorter than this, center+zoom in
  const MEDIUM_DISTANCE_KM = 5000; // medium -> moderate zoom
  // We'll choose projection center & scale based on distance & bbox span.

  // map fixed internal width/height used for projection math
  const MAP_WIDTH = 1200;
  const MAP_HEIGHT = 600;

  // Determine projection center and scale:
  let projectionCenter: [number, number];
  let projectionScale: number;

  if (distanceKm <= SHORT_DISTANCE_KM) {
    // Short trip: center on midpoint and zoom in
    const midLng = ((start[0] + end[0]) / 2);
    const midLat = ((start[1] + end[1]) / 2);
    projectionCenter = [midLng, midLat];

    // Stronger zoom for very short trips
    // pick scale proportional to distance but clamped
    const scaleForShort = Math.max(600, Math.min(1800, 6000 / Math.max(1, distanceKm)));
    projectionScale = scaleForShort;
  } else if (distanceKm <= MEDIUM_DISTANCE_KM) {
    // Medium trip: center on bbox center and medium zoom
    projectionCenter = [bboxCenterLng, bboxCenterLat];
    // Use bbox spans to derive scale: larger span -> smaller scale
    const latSpan = Math.max(1, maxLat - minLat);
    const lngSpan = crossesDateLine ? lngSpanWrapped : Math.max(1, maxLng - minLng);
    const maxSpan = Math.max(latSpan, lngSpan);
    // simple mapping: scale decreases as maxSpan increases
    projectionScale = Math.max(200, Math.min(1200, 1800 / (maxSpan / 10)));
  } else {
    // Long trip: ensure the line fits — show much of world
    // Use global center that shows both points: midpoint longitude & lat near 20 for better world framing
    projectionCenter = [bboxCenterLng, Math.max(Math.min(bboxCenterLat, 40), -40)];
    // Lower zoom so the entire path is visible (also avoids extreme zoom)
    projectionScale = 180; // shows broad world
  }

  // Build d3 projection to match ComposableMap
  const projection = geoMercator()
    .scale(projectionScale)
    .center(projectionCenter)
    .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

  const projectPoint = (lng: number, lat: number) => {
    const p = projection([lng, lat]) as [number, number];
    return { x: p[0], y: p[1] };
  };

  // Pixel coordinates for start/end
  const startPx = projectPoint(start[0], start[1]);
  const endPx = projectPoint(end[0], end[1]);

  // For parabolic control we compute a curve height adaptive to distance
  const curveHeight = Math.min(360, Math.max(60, distanceKm / 30)); // tuned heuristics
  const midX = (startPx.x + endPx.x) / 2;
  const midY = (startPx.y + endPx.y) / 2;
  const controlX = midX;
  const controlY = midY - curveHeight;
  const parabolaD = `M ${startPx.x} ${startPx.y} Q ${controlX} ${controlY} ${endPx.x} ${endPx.y}`;

  // For linear path
  const straightLineD = `M ${startPx.x} ${startPx.y} L ${endPx.x} ${endPx.y}`;

  return (
    <div className="card-elevated p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Flight Path</h3>
        <p className="text-sm text-foreground/60">Adaptive zoom: short routes centered & zoomed; long routes zoomed out to fit.</p>
      </div>

      <div className="w-full h-[350px] md:h-[450px] overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-border/50 shadow-inner relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: projectionScale,
            center: projectionCenter,
            rotate: [0, 0, 0],
          }}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Geographies geography={geoUrl}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {({ geographies }: any) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e6f0fb"
                  stroke="#cce7fb"
                  strokeWidth={0.2}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Departure marker */}
          <Marker coordinates={[departureLng, departureLat]}>
            <g>
              <motion.circle
                r={8}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.45, type: "spring" }}
                filter="url(#glow)"
              />
              <motion.text
                textAnchor="middle"
                y={-18}
                style={{ fontSize: 11, fontWeight: 700, fill: '#10b981' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.35 }}
              >
                DEPART
              </motion.text>
            </g>
          </Marker>

          {/* Arrival marker */}
          <Marker coordinates={[arrivalLng, arrivalLat]}>
            <g>
              <motion.circle
                r={8}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.45, type: "spring" }}
                filter="url(#glow)"
              />
              <motion.text
                textAnchor="middle"
                y={-18}
                style={{ fontSize: 11, fontWeight: 700, fill: '#ef4444' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.35 }}
              >
                ARRIVE
              </motion.text>
            </g>
          </Marker>

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
        </ComposableMap>

        {/* Overlay SVG that aligns with the projection above */}
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Active: Linear straight line */}
          <path
            d={straightLineD}
            stroke="url(#flightGradient)"
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(59,130,246,0.28))' }}
          />

          {/* Parabolic version (commented out). If you want parabola instead, uncomment this block and comment the straight line above. */}
          {/*
          <path
            d={parabolaD}
            stroke="url(#flightGradient)"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.4))' }}
          />
          */}

          {/* small endpoint circles (optional) */}
          <circle cx={startPx.x} cy={startPx.y} r={4} fill="#10b981" stroke="#fff" strokeWidth={0.8} />
          <circle cx={endPx.x} cy={endPx.y} r={4} fill="#ef4444" stroke="#fff" strokeWidth={0.8} />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 md:gap-8 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-md ring-2 ring-emerald-200"></div>
          <span className="text-sm font-semibold text-foreground/80">Departure</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-red-500 rounded-full"></div>
          <span className="text-sm font-semibold text-foreground/80">Flight Path</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-md ring-2 ring-red-200"></div>
          <span className="text-sm font-semibold text-foreground/80">Arrival</span>
        </div>
      </div>
    </div>
  );
}
