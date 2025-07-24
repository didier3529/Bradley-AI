"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// Import new v0-specific components that use the existing backend
import DirectPriceDisplay from "@/components/direct-price-display";
import { BradleyGemScanner } from "@/components/gem-scanner/bradley-gem-scanner";
import { SimpleLoading } from "@/components/ui/simple-loading";
import { MatrixBackground } from "./matrix-background";
import { NFTMarketAnalysis } from "./nft-market-analysis";
import { PortfolioHoldings } from "./portfolio-holdings";

// Hydration-safe time display component following repository patterns
interface TimeDisplayProps {
  className?: string;
}

function HydrationSafeTimeDisplay({ className }: TimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time function - stable reference
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Update time function with stable reference
  const updateTime = useCallback(() => {
    const now = new Date();
    setCurrentTime(formatTime(now));
  }, [formatTime]);

  // Hydration effect - only run once on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Timer effect - separate from hydration to prevent loops
  useEffect(() => {
    if (!isMounted) return;

    // Set initial time
    updateTime();

    // Set up timer
    timerRef.current = setInterval(updateTime, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isMounted, updateTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Render loading state during SSR and until client hydration
  if (!isMounted || !currentTime) {
    return (
      <div className={className}>
        <div className="text-center">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">
            MARKET TIME
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-400">
            --:--:--
          </div>
          <div className="text-xs font-mono text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const currentDate = new Date();

  return (
    <div className={className}>
      <div className="text-center">
        <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">
          MARKET TIME
        </div>
        <div className="text-2xl font-mono font-bold text-cyan-400">
          {currentTime}
        </div>
        <div className="text-xs font-mono text-gray-400">
          {formatDate(currentDate)}
        </div>
      </div>
    </div>
  );
}

export function BradleyAIDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Simple loading with shorter duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsReady(true);
    }, 2000); // 2 second loading time

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black text-slate-100 relative overflow-hidden">
      {/* Matrix Background */}
      <MatrixBackground />

      {/* Simple Clean Loading */}
      <SimpleLoading isVisible={isLoading} />

      {/* Main Dashboard Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto p-4 relative z-10 pb-16 max-w-7xl"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Market Intelligence - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bradley Gem Scanner Section - Priority position */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BradleyGemScanner />
            </motion.div>

            {/* Market Intelligence Section using new v0-styled component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <DirectPriceDisplay />
            </motion.div>

            {/* NFT Market Analysis Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <NFTMarketAnalysis />
            </motion.div>
          </div>

          {/* Right Column - 1/4 width */}
          <div className="space-y-6">
            {/* Time Display Card - Using hydration-safe component */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4"
            >
              <HydrationSafeTimeDisplay />
            </motion.div>

            {/* Portfolio Holdings using existing backend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PortfolioHoldings />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
