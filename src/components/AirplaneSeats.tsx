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
    const rows = 25; // Typical number of rows

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
      return 'glow-seat bg-accent border-accent';
    } else if (isWindow) {
      return 'bg-primary/30 border-primary/50';
    } else if (seat.type === 'aisle') {
      return 'bg-secondary/30 border-secondary/50';
    } else {
      return 'bg-foreground/10 border-border';
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
    <div className="card-soft p-6">
      <h3 className="text-xl font-semibold mb-6 text-center">Aircraft Seating Layout</h3>

      <div className="flex justify-center">
        <div className="space-y-2">
          {/* Aircraft shape outline */}
          <div className="relative">
            {/* Nose */}
            <div className="w-8 h-4 bg-primary/20 rounded-t-full mx-auto mb-2" />

            {/* Fuselage */}
            <div className="w-64 h-auto bg-primary/10 rounded-lg border-2 border-primary/20 p-4">
              {/* Seat rows */}
              <div className="grid grid-cols-6 gap-1">
                {seats.slice(0, 150).map((seat) => {
                  const tooltip = getSeatTooltip(seat);
                  const isScenic = recommendedSeats.includes(seat.position) && seat.type === 'window';

                  return (
                    <motion.div
                      key={seat.id}
                      className={`
                        w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-medium cursor-pointer
                        transition-all duration-200 relative group
                        ${getSeatColor(seat)}
                      `}
                      onHoverStart={() => setHoveredSeat(seat.id)}
                      onHoverEnd={() => setHoveredSeat(null)}
                      whileHover={{ scale: 1.1 }}
                      animate={isScenic ? {
                        boxShadow: [
                          '0 0 0 0 rgba(255, 215, 0, 0.7)',
                          '0 0 0 10px rgba(255, 215, 0, 0)',
                        ]
                      } : {}}
                      transition={isScenic ? {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'loop'
                      } : {}}
                    >
                      {seat.position}

                      {/* Tooltip */}
                      {tooltip && hoveredSeat === seat.id && (
                        <motion.div
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-sm rounded-lg shadow-lg z-10 whitespace-nowrap"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                        >
                          {tooltip}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tail */}
            <div className="w-6 h-6 bg-primary/20 rounded-b-full mx-auto mt-2" />
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 glow-seat bg-accent border-accent" />
              <span>Scenic Window</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-primary/30 border-primary/50" />
              <span>Window Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-secondary/30 border-secondary/50" />
              <span>Aisle Seat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

