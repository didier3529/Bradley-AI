"use client";

import React, { useEffect, useRef } from "react";

interface TokenLogoProps {
  address: string;
  symbol: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackStyle?: "gradient" | "symbol" | "matrix";
  showQualityIndicator?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
  xl: "w-12 h-12",
};

// VERIFIED MEME TOKEN LOGOS - FILES CONFIRMED TO EXIST
const MEME_LOGO_FILES: Record<string, boolean> = {
  BOME: true,
  BONK: true,
  MEW: true,
  MICHI: true,
  MYRO: true,
  PNUT: true,
  POPCAT: true,
  WEN: true,
};

export const TokenLogo: React.FC<TokenLogoProps> = ({
  address,
  symbol,
  size = "md",
  className = "",
}) => {
  const sizeClass = sizeClasses[size];
  const logoPath = `/meme-logos/${symbol.toLowerCase()}.svg`;
  const containerRef = useRef<HTMLDivElement>(null);

  // ULTRA NUCLEAR TEST + DOM PROTECTION
  console.log(`🔥🔥🔥 [ULTRA NUCLEAR] TokenLogo for ${symbol}: ${logoPath}`);

  // Protect our DOM and load actual logos
  useEffect(() => {
    const interval = setInterval(() => {
      if (containerRef.current) {
        const logoUrl = `/meme-logos/${symbol.toLowerCase()}.svg`;

        // Create image element to test loading
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ Successfully loaded logo for ${symbol}`);
          // Logo loaded successfully, show it
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <img src="${logoUrl}"
                   alt="${symbol} logo"
                   style="
                     width: 100%;
                     height: 100%;
                     border-radius: 50%;
                     object-fit: cover;
                     z-index: 9999;
                     position: relative;
                   " />
            `;
          }
        };
        testImg.onerror = () => {
          console.log(`❌ Failed to load logo for ${symbol}, using fallback`);
          // Logo failed, use styled fallback
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div style="
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                border-radius: 50%;
                z-index: 9999;
                position: relative;
              ">
                ${symbol.charAt(0)}
              </div>
            `;
          }
        };
        testImg.src = logoUrl;

        console.log(
          `🛡️ [DOM PROTECTION] Loading logo for ${symbol}: ${logoUrl}`
        );
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [symbol]);

  // FORCE VISIBILITY WITH high z-index and strong positioning
  return (
    <div
      ref={containerRef}
      className={`${sizeClass} ${className} rounded-full`}
      style={{
        zIndex: 9999,
        position: "relative",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Initial loading state - will be replaced by useEffect */}
      <div
        style={{
          width: "100%",
          height: "100%",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: "bold",
          borderRadius: "50%",
          zIndex: 9999,
          position: "relative",
        }}
      >
        {symbol.charAt(0)}
      </div>
    </div>
  );
};

// Simplified exports
export const TokenLogoSkeleton = TokenLogo;
export const useTokenLogoBatch = () => ({
  isPreloading: false,
  stats: { loaded: 0, total: 0, enhanced: 0 },
});
export default TokenLogo;
