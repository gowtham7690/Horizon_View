'use client';

import FlightInputForm from '@/components/FlightInputForm';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-14 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl"
            animate={{
              boxShadow: [
                '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
                '0 20px 25px -5px rgba(251, 191, 36, 0.4)',
                '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
            HorizonView
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Flight Scenic Seat Advisor
          </p>
          <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed font-light">
            Find the perfect window seat for breathtaking sunrise and sunset views. 
            Our intelligent system calculates optimal seating based on real-time sun position and great-circle flight paths.
          </p>
        </motion.div>
      </div>

      {/* Flight Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <FlightInputForm />
      </motion.div>
    </div>
  );
}
