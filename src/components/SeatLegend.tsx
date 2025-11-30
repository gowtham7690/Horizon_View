'use client';

import { motion } from 'framer-motion';

interface SeatLegendProps {
  scenicSide: 'left' | 'right' | 'both';
  recommendedSeats: string[];
}

export default function SeatLegend({ scenicSide, recommendedSeats }: SeatLegendProps) {
  const allWindowSeats = ['A', 'F'];
  const standardWindowSeats = allWindowSeats.filter(seat => !recommendedSeats.includes(seat));
  const aisleSeats = ['C', 'D'];
  const middleSeats = ['B', 'E'];

  const legendItems = [
    {
      type: 'scenic',
      label: 'Recommended Scenic Seats',
      description: 'Best window seats for sunrise/sunset views',
      icon: '⭐',
      seats: recommendedSeats.filter(seat => allWindowSeats.includes(seat)),
    },
    {
      type: 'standard',
      label: 'Other Window Seats',
      description: 'Window seats but not optimal for sun viewing',
      icon: '🪟',
      seats: standardWindowSeats,
    },
    {
      type: 'middle',
      label: 'Middle Seats',
      description: 'Between window and aisle, limited views',
      icon: '🪑',
      seats: middleSeats,
    },
    {
      type: 'aisle',
      label: 'Aisle Seats',
      description: 'Easy access, no window views',
      icon: '🚶',
      seats: aisleSeats,
    },
  ];

  const getScenicSideDescription = () => {
    const hasLeftScenic = recommendedSeats.includes('A');
    const hasRightScenic = recommendedSeats.includes('F');
    
    if (hasLeftScenic && hasRightScenic) {
      return 'Both window seats (A and F) offer excellent sunrise/sunset views throughout the flight';
    } else if (hasLeftScenic) {
      return 'Left window seat (A) offers the best sunrise/sunset views during this flight';
    } else if (hasRightScenic) {
      return 'Right window seat (F) offers the best sunrise/sunset views during this flight';
    }
    return 'Window seats available but sun may not be optimally positioned during flight time';
  };

  return (
    <div className="card-elevated p-6 md:p-8 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Seat Guide</h3>
        <p className="text-sm text-foreground/60">Understanding seat types and recommendations</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {legendItems.map((item) => {
          if (item.seats.length === 0) return null;
          
          return (
            <motion.div
              key={item.type}
              className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 border-2 border-border"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${
                  item.type === 'scenic' 
                    ? 'glow-seat bg-gradient-to-br from-amber-400 to-orange-500 border-amber-400' 
                    : item.type === 'standard'
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                    : item.type === 'middle'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    : 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-foreground mb-1">{item.label}</div>
                  <div className="text-sm text-foreground/70 mb-3 leading-relaxed">{item.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {item.seats.map((seat) => (
                      <span
                        key={seat}
                        className={`px-3 py-1.5 text-sm font-bold rounded-lg ${
                          item.type === 'scenic'
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-2 border-amber-300 shadow-md'
                            : 'bg-foreground/10 text-foreground/70 border-2 border-border'
                        }`}
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Scenic side indicator */}
        <motion.div
          className="mt-4 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707-.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="font-bold text-lg text-primary">Recommendation</div>
          </div>
          <div className="text-sm text-foreground/80 leading-relaxed mb-4">
            {getScenicSideDescription()}
          </div>
          <div className="pt-4 border-t border-primary/20">
            <div className="text-xs text-foreground/60 font-medium">
              <strong className="text-foreground/80">Seat Layout:</strong> A (window) | B (middle) | C (aisle) || D (aisle) | E (middle) | F (window)
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
