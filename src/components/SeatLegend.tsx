'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SeatLegendProps {
  scenicSide: 'left' | 'right' | 'both';
  recommendedSeats: string[];
}

export default function SeatLegend({ scenicSide, recommendedSeats }: SeatLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      type: 'scenic',
      label: 'Scenic Window Seats',
      description: 'Best views for sunrise/sunset',
      color: 'bg-accent',
      seats: recommendedSeats,
    },
    {
      type: 'standard',
      label: 'Standard Window Seats',
      description: 'Good views but not optimal for sun',
      color: 'bg-primary/50',
      seats: ['A', 'C', 'D', 'F'],
    },
    {
      type: 'aisle',
      label: 'Aisle Seats',
      description: 'Convenient access, limited views',
      color: 'bg-secondary/50',
      seats: ['B', 'E'],
    },
  ];

  return (
    <div className="card-soft p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-lg">Seat Guide</h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-primary"
        >
          ▼
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {legendItems.map((item) => (
                <div key={item.type} className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-sm mt-1 flex-shrink-0 ${item.color}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-foreground/70 mb-1">{item.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {item.seats.map((seat) => (
                        <span
                          key={seat}
                          className={`px-2 py-1 text-xs rounded ${
                            item.type === 'scenic'
                              ? 'bg-accent/20 text-accent-foreground border border-accent/30'
                              : 'bg-foreground/10 text-foreground/70'
                          }`}
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Scenic side indicator */}
              <div className="mt-6 p-3 bg-primary/10 rounded-lg">
                <div className="font-medium text-primary mb-1">Scenic Side: {scenicSide.toUpperCase()}</div>
                <div className="text-sm text-foreground/70">
                  {scenicSide === 'left' && 'Left side (A, B, C) offers the best sunrise/sunset views'}
                  {scenicSide === 'right' && 'Right side (D, E, F) offers the best sunrise/sunset views'}
                  {scenicSide === 'both' && 'Both sides offer excellent sunrise/sunset views'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

