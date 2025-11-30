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
  path: [number, number][]; // array of [lng, lat]
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function Map2D({ departureLat, departureLng, arrivalLat, arrivalLng, path }: Map2DProps) {

  // Calculate bounding box (same as your existing logic)
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

  // ---- Overlay projection settings ----
  // Use the same width/height used by ComposableMap so projection -> pixels align.
  const MAP_WIDTH = 1200;
  const MAP_HEIGHT = 600;

  // Build a d3 geo projection that matches ComposableMap's geoMercator with same scale & center.
  const projection = geoMercator()
    .scale(scale as number)
    .center([centerLng, centerLat])
    .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

  // Utility to project [lng, lat] -> [x, y] in pixel space for the overlay SVG
  const projectPoint = (lng: number, lat: number) => {
    // projection expects [lng, lat]
    // types tell TS this returns [number, number] but d3 returns [number, number] | null; we assume valid
    // (the inputs are valid lat/lngs coming from your dataset)
    const p = projection([lng, lat]) as [number, number];
    return { x: p[0], y: p[1] };
  };

  // We'll draw a curve between departure and arrival (first and last in allPoints)
  const start = allPoints[0];
  const end = allPoints[allPoints.length - 1];

  const startPx = projectPoint(start[0], start[1]);
  const endPx = projectPoint(end[0], end[1]);

  // Parabola control point: midpoint raised upward by `curveHeight` (in pixels)
  // Positive curveHeight -> curve arches upward (towards smaller y because y axis grows downwards in SVG).
  const defaultCurveHeight = 120; // tweak this to change arc height
  const curveHeight = defaultCurveHeight;

  const midX = (startPx.x + endPx.x) / 2;
  const midY = (startPx.y + endPx.y) / 2;
  const controlX = midX;
  const controlY = midY - curveHeight; // lift upward

  // Path strings
  const parabolaD = `M ${startPx.x} ${startPx.y} Q ${controlX} ${controlY} ${endPx.x} ${endPx.y}`;
  const straightLineD = `M ${startPx.x} ${startPx.y} L ${endPx.x} ${endPx.y}`;

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
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
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

          {/* NOTE: We are drawing the custom overlay SVG separately below (absolutely positioned),
              so we DON'T draw the path/line here with react-simple-maps Line component.
              The overlay ensures pixel-perfect drawing using the same projection. */}
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

        {/* --------- Overlay SVG: draws either straight line OR parabolic curve --------- */}
        {/* The overlay uses the same viewBox (MAP_WIDTH x MAP_HEIGHT) so it scales the same as the map */}
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // so map interactions still work
          }}
        >
          {/* Uncomment one of the options below to choose which path to show.
              Option A: Straight linear line
              Option B: Parabolic (quadratic Bézier) curve (upward arch)
          */}

          {/* ---------- Option A: Straight line (linear) ---------- */}
          {/* Currently using: Straight linear line */}
          <line
            x1={startPx.x}
            y1={startPx.y}
            x2={endPx.x}
            y2={endPx.y}
            stroke="url(#flightGradient)"
            strokeWidth={4}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))' }}
          />

          {/* ---------- Option B: Parabolic curve (quadratic Bézier) ---------- */}
          {/* To switch back to parabolic curve, uncomment the <path> below and comment out the <line> above */}
          {/* 
          <path
            d={parabolaD}
            stroke="url(#flightGradient)"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))' }}
          />
          */}

          {/* optional: small circles at start/end for clarity in overlay (not necessary since markers exist) */}
          <circle cx={startPx.x} cy={startPx.y} r={4} fill="#10b981" stroke="#fff" strokeWidth={1} />
          <circle cx={endPx.x} cy={endPx.y} r={4} fill="#ef4444" stroke="#fff" strokeWidth={1} />
        </svg>
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
