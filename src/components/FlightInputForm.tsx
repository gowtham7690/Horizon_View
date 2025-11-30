'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAirports, getPopularAirports, Airport } from '@/lib/cities';
import { useRouter } from 'next/navigation';

interface FormData {
  from: string;
  to: string;
  date: string;
  time: string;
}

export default function FlightInputForm() {
  const router = useRouter();
  // Initialize with today's date and current time + 2 hours
  const getInitialFormData = (): FormData => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
    return {
      from: '',
      to: '',
      date: futureTime.toISOString().split('T')[0],
      time: futureTime.toTimeString().slice(0, 5),
    };
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData);

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromResults, setFromResults] = useState<Airport[]>([]);
  const [toResults, setToResults] = useState<Airport[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  // Show popular airports initially
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setFromResults(getPopularAirports());
    setToResults(getPopularAirports());
  }, []);

  // Handle airport search
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (fromSearch.trim()) {
      const results = searchAirports(fromSearch);
      setFromResults(results.slice(0, 8)); // Limit to 8 results
      setShowFromDropdown(true);
    } else {
      setFromResults(getPopularAirports());
      setShowFromDropdown(false);
    }
  }, [fromSearch]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (toSearch.trim()) {
      const results = searchAirports(toSearch);
      setToResults(results.slice(0, 8));
      setShowToDropdown(true);
    } else {
      setToResults(getPopularAirports());
      setShowToDropdown(false);
    }
  }, [toSearch]);

  const selectAirport = (airport: Airport, field: 'from' | 'to') => {
    setFormData(prev => ({ ...prev, [field]: airport.code }));
    if (field === 'from') {
      setFromSearch(`${airport.city} (${airport.code})`);
      setShowFromDropdown(false);
    } else {
      setToSearch(`${airport.city} (${airport.code})`);
      setShowToDropdown(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.from || !formData.to) {
      setError('Please select both departure and arrival airports');
      setIsSubmitting(false);
      return;
    }

    if (formData.from === formData.to) {
      setError('Departure and arrival airports cannot be the same');
      setIsSubmitting(false);
      return;
    }

    if (!formData.date || !formData.time) {
      setError('Please select a departure date and time');
      setIsSubmitting(false);
      return;
    }

    try {
      // Combine date and time
      const departureDateTime = new Date(`${formData.date}T${formData.time}`);

      if (departureDateTime <= new Date()) {
        setError('Departure time must be in the future');
        setIsSubmitting(false);
        return;
      }

      // Navigate to visualization page with query parameters
      const params = new URLSearchParams({
        from: formData.from,
        to: formData.to,
        dt: departureDateTime.toISOString(),
      });

      router.push(`/visualize?${params.toString()}`);
    } catch {
      setError('Invalid date or time format');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="card-elevated p-8 md:p-10 lg:p-12 max-w-3xl mx-auto w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="space-y-6">
        <div className="mb-6 pb-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Flight Details</h2>
          <p className="text-sm text-foreground/60">Enter your departure and arrival information</p>
        </div>
        
        {/* From Airport */}
        <div className="relative">
          <label className="block text-sm font-semibold mb-2.5 text-foreground">Departure Airport</label>
          <div className="relative">
            <input
              ref={fromRef}
              type="text"
              placeholder="Search departure airport..."
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              onFocus={() => setShowFromDropdown(true)}
              onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-card-bg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm hover:border-primary/50"
              suppressHydrationWarning
            />
            <div className="absolute right-3 top-3 text-primary">✈️</div>
          </div>

          <AnimatePresence>
            {showFromDropdown && (
              <motion.div
                className="absolute z-10 w-full mt-2 bg-card-bg border-2 border-border rounded-xl shadow-2xl max-h-64 overflow-y-auto backdrop-blur-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {fromResults.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectAirport(airport, 'from')}
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-border/50 last:border-b-0"
                  >
                    <div className="font-medium">{airport.city} ({airport.code})</div>
                    <div className="text-sm text-foreground/70">{airport.name}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* To Airport */}
        <div className="relative">
          <label className="block text-sm font-semibold mb-2.5 text-foreground">Arrival Airport</label>
          <div className="relative">
            <input
              ref={toRef}
              type="text"
              placeholder="Search arrival airport..."
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
              onFocus={() => setShowToDropdown(true)}
              onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-card-bg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm hover:border-primary/50"
              suppressHydrationWarning
            />
            <div className="absolute right-3 top-3 text-primary">🏁</div>
          </div>

          <AnimatePresence>
            {showToDropdown && (
              <motion.div
                className="absolute z-10 w-full mt-2 bg-card-bg border-2 border-border rounded-xl shadow-2xl max-h-64 overflow-y-auto backdrop-blur-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {toResults.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectAirport(airport, 'to')}
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-border/50 last:border-b-0"
                  >
                    <div className="font-medium">{airport.city} ({airport.code})</div>
                    <div className="text-sm text-foreground/70">{airport.name}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">Departure Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm hover:border-primary/50"
              min={new Date().toISOString().split('T')[0]}
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2.5 text-foreground">Departure Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-card-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm hover:border-primary/50"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none text-lg"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          suppressHydrationWarning
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Finding Scenic Seats...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Scenic Seats
            </span>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
