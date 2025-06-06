'use client';

import React from 'react';
import { MatrixContainer } from '@/components/effects/matrix-effects-manager';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  showEffects?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle,
  className = '',
  showEffects = true 
}: PageLayoutProps) {
  return (
    <MatrixContainer 
      showBackground={showEffects}
      effectConfig={{
        enabled: showEffects,
        intensity: 'low',
        theme: 'cyber-blue',
        interactive: false,
        adaptToData: true,
        backgroundOnly: true,
      }}
      className={`min-h-screen ${className}`}
    >
      <div className="container mx-auto px-4 py-6">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-4xl font-mono font-bold text-cyan-400 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg text-gray-300 font-mono">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </MatrixContainer>
  );
} 