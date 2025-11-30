'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AirplaneSeatsProps {
  scenicSide: 'left' | 'right' | 'both';
  recommendedSeats: string[];
}

interface Seat {
  id: string;
  row: number;
  position: string;
  type: 'window' | 'middle' | 'aisle';
  side: 'left' | 'right';
}

export default function AirplaneSeats({ scenicSide, recommendedSeats }: AirplaneSeatsProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Generate seats for a typical narrow-body aircraft (6 seats per row: A-F)
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const rows = 30; // More rows for better detail

    for (let row = 1; row <= rows; row++) {
      // Left side: A B C
      seats.push({ id: `${row}A`, row, position: 'A', type: 'window', side: 'left' });
      seats.push({ id: `${row}B`, row, position: 'B', type: 'middle', side: 'left' });
      seats.push({ id: `${row}C`, row, position: 'C', type: 'aisle', side: 'left' });

      // Right side: D E F
      seats.push({ id: `${row}D`, row, position: 'D', type: 'aisle', side: 'right' });
      seats.push({ id: `${row}E`, row, position: 'E', type: 'middle', side: 'right' });
      seats.push({ id: `${row}F`, row, position: 'F', type: 'window', side: 'right' });
    }

    return seats;
  };

  const seats = generateSeats();

  const getSeatColor = (seat: Seat) => {
    const isScenic = recommendedSeats.includes(seat.position);
    const isWindow = seat.type === 'window';

    if (isScenic && isWindow) {
      return 'glow-seat bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400 text-white font-bold';
    } else if (isWindow) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300';
    } else if (seat.type === 'aisle') {
      return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400';
    } else {
      return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400';
    }
  };

  const getSeatTooltip = (seat: Seat) => {
    if (recommendedSeats.includes(seat.position) && seat.type === 'window') {
      return scenicSide === 'both'
        ? 'Scenic window seat - excellent sunrise/sunset views!'
        : `Scenic window seat - best ${scenicSide === 'left' ? 'sunrise' : 'sunset'} views!`;
    }
    return null;
  };

  return (
    <div className="card-elevated p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Aircraft Seating</h3>
        <p className="text-sm text-foreground/60">Top-view cabin layout with detailed seat map</p>
      </div>

      <div className="flex justify-center items-center">
        <div className="relative w-full max-w-4xl">
          {/* Aircraft shape outline */}
          <div className="relative">
            {/* Nose */}
            <div className="w-16 h-8 bg-gradient-to-b from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 rounded-t-full mx-auto mb-3 shadow-lg" />

            {/* Fuselage */}
            <div className="w-full h-auto bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 shadow-inner">
              {/* Aisle indicator */}
              <div className="flex items-center mb-4">
                <div className="flex-1 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                <span className="px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AISLE</span>
                <div className="flex-1 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
              </div>

              {/* Seat rows - Detailed grid */}
              <div className="grid grid-cols-6 gap-2 md:gap-3">
                {seats.map((seat) => {
                  const tooltip = getSeatTooltip(seat);
                  const isScenic = recommendedSeats.includes(seat.position) && seat.type === 'window';

                  return (
                    <motion.div
                      key={seat.id}
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 flex items-center justify-center text-xs md:text-sm font-semibold cursor-pointer
                        transition-all duration-200 relative group shadow-sm
                        ${getSeatColor(seat)}
                        ${isScenic ? 'ring-2 md:ring-3 ring-amber-300 dark:ring-amber-600' : ''}
                      `}
                      onHoverStart={() => setHoveredSeat(seat.id)}
                      onHoverEnd={() => setHoveredSeat(null)}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {seat.position}
                      {seat.row === 1 && (
                        <span className="absolute -left-8 md:-left-10 text-xs font-bold text-foreground/40">{seat.row}</span>
                      )}

                      {/* Tooltip */}
                      {tooltip && hoveredSeat === seat.id && (
                        <motion.div
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-xl shadow-2xl z-20 whitespace-nowrap font-medium"
                          initial={{ opacity: 0, y: 5, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        >
                          {tooltip}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Row numbers on the side */}
              <div className="absolute left-2 top-20 bottom-20 flex flex-col justify-between text-xs font-bold text-foreground/30">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
              <div className="absolute right-2 top-20 bottom-20 flex flex-col justify-between text-xs font-bold text-foreground/30">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>

              {/* Aisle indicator bottom */}
              <div className="flex items-center mt-4">
                <div className="flex-1 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                <span className="px-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AISLE</span>
                <div className="flex-1 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
              </div>
            </div>

            {/* Tail */}
            <div className="w-12 h-12 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-b-full mx-auto mt-3 shadow-lg" />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg border-2 glow-seat bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400 shadow-sm"></div>
              <span className="text-sm font-semibold text-foreground/80">Scenic Window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg border-2 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-sm"></div>
              <span className="text-sm font-semibold text-foreground/80">Window Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg border-2 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm"></div>
              <span className="text-sm font-semibold text-foreground/80">Aisle Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg border-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-sm"></div>
              <span className="text-sm font-semibold text-foreground/80">Middle Seat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
