'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AirplaneSeatsProps {
  scenicSide: 'left' | 'right' | 'both';
  recommendedSeats: string[]; // accepts 'A','F' or '12A' forms
  rows?: number; // minimum rows (defaults to 20)
  onSelect?: (seatId: string) => void;
}

type SeatType = 'window' | 'middle' | 'aisle';
type Side = 'left' | 'right';

interface Seat {
  id: string;
  row: number;
  letter: string;
  type: SeatType;
  side: Side;
}

/**
 * Compact, aligned seat grid that:
 * - Keeps headers perfectly aligned with columns
 * - Shows left/right row numbers aligned to seat rows
 * - Dynamically fills the vertical space (calculates visible rows)
 */
export default function AirplaneSeats({
  scenicSide,
  recommendedSeats,
  rows: minRows = 20,
  onSelect,
}: AirplaneSeatsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // visual constants — tweak to make seats denser / larger
  const ROW_HEIGHT_PX = 30; // each seat row height (px)
  const HEADER_HEIGHT_PX = 36; // header labels height
  const FOOTER_HEIGHT_PX = 52; // legend / aisle label height + padding

  const [visibleRows, setVisibleRows] = useState(minRows);

  // compute number of rows needed to fill viewport
  const recomputeVisibleRows = useCallback(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;
    const rect = viewportEl.getBoundingClientRect();
    const innerHeight = Math.max(0, rect.height - HEADER_HEIGHT_PX - FOOTER_HEIGHT_PX);
    const rowsFit = Math.max(minRows, Math.floor(innerHeight / ROW_HEIGHT_PX));
    setVisibleRows(rowsFit);
  }, [minRows]);

  // observe resize
  useEffect(() => {
    recomputeVisibleRows();
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(() => recomputeVisibleRows());
    ro.observe(viewportRef.current);
    window.addEventListener('resize', recomputeVisibleRows);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recomputeVisibleRows);
    };
  }, [recomputeVisibleRows]);

  // Build seats list according to visibleRows
  const seats = useMemo<Seat[]>(
    () => {
      const out: Seat[] = [];
      for (let r = 1; r <= visibleRows; r++) {
        out.push({ id: `${r}A`, row: r, letter: 'A', type: 'window', side: 'left' });
        out.push({ id: `${r}B`, row: r, letter: 'B', type: 'middle', side: 'left' });
        out.push({ id: `${r}C`, row: r, letter: 'C', type: 'aisle', side: 'left' });
        out.push({ id: `${r}D`, row: r, letter: 'D', type: 'aisle', side: 'right' });
        out.push({ id: `${r}E`, row: r, letter: 'E', type: 'middle', side: 'right' });
        out.push({ id: `${r}F`, row: r, letter: 'F', type: 'window', side: 'right' });
      }
      return out;
    },
    [visibleRows]
  );

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const isRecommended = (s: Seat) =>
    recommendedSeats.includes(s.id) || recommendedSeats.includes(s.letter);

  const handleSelect = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
    onSelect?.(id);
  };

   // seat visual class helper - matching original recommendation design with dark mode
   const seatClass = (s: Seat, recWindow: boolean) => {
     const base = 'rounded-lg border-2 flex items-center justify-center select-none font-semibold cursor-pointer transition-all duration-200';
     const size = 'w-6 h-6 text-[10px]';
     
     // Scenic window seat (recommended) - yellow for sun
     if (recWindow && s.type === 'window') {
       return `${base} ${size} glow-seat bg-yellow-400 dark:bg-yellow-500 border-yellow-500 dark:border-yellow-400 text-yellow-900 dark:text-yellow-950 shadow-sm`;
     }
     
     // Regular window seat - blue
     if (s.type === 'window') {
       return `${base} ${size} bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300`;
     }
     
     // Aisle seat - white
     if (s.type === 'aisle') {
       return `${base} ${size} bg-white dark:bg-slate-100 border-slate-300 dark:border-slate-400 text-slate-700 dark:text-slate-800`;
     }
     
     // Middle seat - light and dark mode
     return `${base} ${size} bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400`;
   };

   // column header labels - centered layout
   const columnHeaders = ['LW', 'C', 'LA', 'RA', 'C', 'RW'];
   const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div ref={containerRef} className="card-elevated p-3 h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg dark:shadow-xl">
      {/* Title */}
      <div className="mb-2">
        <h3 className="text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Aircraft Seating</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">Top-view cabin layout (compact)</p>
      </div>

       {/* Fuselage container */}
       <div className="flex-1 min-h-0">
         <div
           className="relative w-full h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/30 p-2 shadow-inner dark:shadow-inner"
           style={{ minHeight: 340 }}
         >
           {/* Header row (column labels) — aligned with seat columns, centered */}
           <div
             className="grid justify-center"
             style={{
               gridTemplateColumns: `48px repeat(6, minmax(40px, 40px)) 48px`,
               gridAutoRows: `${ROW_HEIGHT_PX}px`,
               alignItems: 'center',
               height: HEADER_HEIGHT_PX,
               columnGap: 6,
               maxWidth: '100%',
               margin: '0 auto',
             }}
           >
             {/* left blank for row numbers */}
             <div />
             {/* six headers - each in its own column to match seats, centered */}
             {columnHeaders.map((h, idx) => (
               <div 
                 key={`header-${idx}-${h}`} 
                 className="text-[11px] text-slate-600 dark:text-slate-400 text-center font-medium flex items-center justify-center"
                 style={{ gridColumn: idx + 2 }}
               >
                 {h}
               </div>
             ))}
             {/* right blank */}
             <div style={{ gridColumn: 8 }} />
           </div>

           {/* Seats viewport */}
           <div
             ref={viewportRef}
             className="mt-1 overflow-hidden"
             style={{
               // keep viewport height flexible; ResizeObserver will recalc visibleRows
               maxHeight: `calc(100% - ${HEADER_HEIGHT_PX + FOOTER_HEIGHT_PX}px)`,
             }}
           >
             {/* grid of row numbers + seats + row numbers — properly arranged */}
             <div
               className="grid"
               style={{
                 gridTemplateColumns: `48px repeat(6, minmax(40px, 40px)) 48px`,
                 gridAutoRows: `${ROW_HEIGHT_PX}px`,
                 rowGap: 4,
                 columnGap: 6,
                 justifyContent: 'center',
                 alignItems: 'center',
               }}
             >
               {/* Render each row properly */}
               {Array.from({ length: visibleRows }, (_, rowIdx) => {
                 const rowNum = rowIdx + 1;
                 const rowSeats = seats.filter(s => s.row === rowNum);

                  return (
                   <React.Fragment key={`row-${rowNum}`}>
                     {/* Left row number */}
                     <div
                       className="flex items-center justify-center text-[11px] text-slate-600 dark:text-slate-400"
                       style={{ 
                         gridColumn: 1, 
                         gridRow: rowNum,
                         height: ROW_HEIGHT_PX 
                       }}
                     >
                       {rowNum}
                     </div>
                     
                     {/* Seats in this row: A, B, C, D, E, F */}
                     {rowSeats.map((s) => {
                       const colMap: Record<string, number> = { 'A': 2, 'B': 3, 'C': 4, 'D': 5, 'E': 6, 'F': 7 };
                       return (
                         <motion.button
                           key={s.id}
                           onMouseEnter={() => setHovered(s.id)}
                           onMouseLeave={() => setHovered(null)}
                           onFocus={() => setHovered(s.id)}
                           onBlur={() => setHovered(null)}
                           onClick={() => handleSelect(s.id)}
                           className={seatClass(s, isRecommended(s) && s.type === 'window')}
                           aria-label={`${s.id} ${s.type} seat ${isRecommended(s) && s.type === 'window' ? 'scenic' : ''}`}
                           style={{
                             gridColumn: colMap[s.letter],
                             gridRow: rowNum,
                           }}
                           whileHover={{ scale: 1.15, zIndex: 10 }}
                           whileTap={{ scale: 0.95 }}
                         >
                           <span className="pointer-events-none">{s.letter}</span>
                         </motion.button>
                       );
                     })}
                     
                     {/* Right row number */}
                     <div
                       className="flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-500"
                       style={{ 
                         gridColumn: 8, 
                         gridRow: rowNum,
                         height: ROW_HEIGHT_PX 
                       }}
                     >
                       {rowNum}
                     </div>
                   </React.Fragment>
                  );
                })}
              </div>
            </div>

           {/* Footer: aisle label + legend */}
           <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4" style={{ height: FOOTER_HEIGHT_PX }}>
             <div className="flex items-center gap-3">
               <div className="text-[11px] text-slate-600 dark:text-slate-400">AISLE</div>
               <div className="w-32 h-1 rounded bg-slate-300 dark:bg-slate-700" />
          </div>

             <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm shadow-sm bg-yellow-400 dark:bg-yellow-500" aria-hidden />
                 <div className="text-[11px] text-slate-700 dark:text-slate-300">Scenic Window</div>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm shadow-sm bg-blue-100 dark:bg-blue-900/30" aria-hidden />
                 <div className="text-[11px] text-slate-700 dark:text-slate-300">Window Seat</div>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm shadow-sm bg-white dark:bg-slate-100 border border-slate-300 dark:border-slate-400" aria-hidden />
                 <div className="text-[11px] text-slate-700 dark:text-slate-300">Aisle Seat</div>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm shadow-sm bg-gray-50 dark:bg-gray-800/50" aria-hidden />
                 <div className="text-[11px] text-slate-700 dark:text-slate-300">Middle Seat</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

