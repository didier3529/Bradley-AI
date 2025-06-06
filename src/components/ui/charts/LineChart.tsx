'use client';

import React from 'react';
import MatrixCard from '@/components/ui/matrix-card';
import { Activity, TrendingUp } from 'lucide-react';

interface LineChartProps {
  data?: any[];
  className?: string;
  title?: string;
  height?: number;
}

export function LineChart({ 
  data = [], 
  className, 
  title,
  height = 200 
}: LineChartProps) {
  return (
    <MatrixCard className={className}>
      <div className="p-4">
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-mono font-bold text-cyan-400">
              {title}
            </h3>
          </div>
        )}
        <div 
          className="flex items-center justify-center bg-gray-900/50 rounded border border-cyan-400/20"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <Activity className="h-12 w-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
            <div className="text-cyan-400 font-mono text-sm mb-1">
              CHART VISUALIZATION
            </div>
            <div className="text-gray-400 text-xs">
              Real-time data rendering
            </div>
          </div>
        </div>
      </div>
    </MatrixCard>
  );
} 