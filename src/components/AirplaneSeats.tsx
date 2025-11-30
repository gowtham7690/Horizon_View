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

  // seat visual class helper
  const seatClass = (s: Seat, recWindow: boolean) => {
    const base = 'rounded-sm border flex items-center justify-center select-none font-medium';
    const size = 'w-6 h-6 text-[10px]'; // tight seat size
    const typeClass = 'bg-slate-800 text-foreground/80 border-slate-700';
    const scenic = recWindow
      ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-black border-amber-300 shadow-[0_8px_30px_rgba(251,191,36,0.14)]'
      : '';
    const sel = selected === s.id ? 'ring-1 ring-offset-1 ring-sky-500' : '';
    return `${base} ${size} ${typeClass} ${scenic} ${sel}`;
  };

   // column header labels - centered layout
   const columnHeaders = ['LW', 'C', 'LA', 'RA', 'C', 'RW'];
   const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div ref={containerRef} className="card-elevated p-3 h-full flex flex-col">
      {/* Title */}
      <div className="mb-2">
        <h3 className="text-sm md:text-base font-semibold text-foreground">Aircraft Seating</h3>
        <p className="text-xs text-foreground/60">Top-view cabin layout (compact)</p>
      </div>

      {/* Fuselage container */}
      <div className="flex-1 min-h-0">
        <div
          className="relative w-full h-full rounded-2xl border border-border bg-gradient-to-b from-slate-900/30 to-slate-900/18 p-2"
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
                 className="text-[11px] text-foreground/60 text-center font-medium flex items-center justify-center"
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
             className="mt-1 overflow-auto"
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
                       className="flex items-center justify-center text-[11px] text-foreground/40"
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
                           whileHover={{ scale: 1.06 }}
                           whileTap={{ scale: 0.96 }}
                         >
                           <span className="pointer-events-none">{s.letter}</span>
                         </motion.button>
                       );
                     })}
                     
                     {/* Right row number */}
                     <div
                       className="flex items-center justify-center text-[11px] text-foreground/30"
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
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-4" style={{ height: FOOTER_HEIGHT_PX }}>
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-foreground/60">AISLE</div>
              <div className="w-32 h-1 rounded bg-slate-700/30" />
            </div>

            <div className="flex items-center gap-3">
              <LegendDot color="linear-gradient(90deg,#fbbf24,#fb923c)" label="Scenic Window" />
              <LegendDot color="#64748b" label="Window Seat" />
              <LegendDot color="#475569" label="Aisle/Middle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Legend helper */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm shadow-sm" style={{ background: color }} aria-hidden />
      <div className="text-[11px] text-foreground/70">{label}</div>
    </div>
  );
}
  