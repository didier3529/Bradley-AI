'use client';

import React, { useState, useEffect } from 'react';
import { 
  MatrixContainer, 
  MatrixPerformanceMonitor,
  useMatrixEffects,
  useMatrixDataEffects,
  useMatrixEffect 
} from './matrix-effects-manager';
import { 
  MatrixTransition, 
  MatrixLoading, 
  MatrixDataTransition, 
  MatrixCard, 
  MatrixButton 
} from './matrix-transitions';

// Demo data for testing transitions
const demoData = [
  { id: 1, name: 'Bitcoin', price: 45000, change: '+5.2%' },
  { id: 2, name: 'Ethereum', price: 3200, change: '+3.1%' },
  { id: 3, name: 'Solana', price: 180, change: '-1.4%' },
];

const emptyData: any[] = [];

function MatrixControlPanel() {
  const { 
    effectConfig, 
    updateEffectConfig, 
    currentTheme, 
    performanceMetrics,
    qualitySettings,
    setQualityLevel,
    pauseAllEffects,
    resumeAllEffects,
    isEffectsEnabled
  } = useMatrixEffects();
  
  const { 
    markLoading, 
    markLoaded, 
    markError, 
    clearError, 
    updateConnectionQuality,
    dataState 
  } = useMatrixDataEffects();
  
  const triggerGlitch = useMatrixEffect('glitch');
  const triggerPulse = useMatrixEffect('pulse');
  const triggerGlow = useMatrixEffect('glow');
  
  return (
    <MatrixCard className="p-6 mb-6">
      <h2 className="text-xl font-mono font-bold mb-4 text-center">
        Matrix Effects Control Panel
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Theme Controls */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold">Theme</h3>
          <div className="flex flex-col space-y-1">
            {(['matrix-green', 'cyber-blue', 'mixed', 'adaptive'] as const).map(theme => (
              <label key={theme} className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="theme"
                  checked={effectConfig.theme === theme}
                  onChange={() => updateEffectConfig({ theme })}
                  className="accent-cyan-400"
                />
                <span className="capitalize">{theme.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
          <div className="text-xs opacity-70">
            Current: <span className="font-mono">{currentTheme}</span>
          </div>
        </div>
        
        {/* Intensity Controls */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold">Intensity</h3>
          <div className="flex flex-col space-y-1">
            {(['low', 'medium', 'high', 'ultra', 'adaptive'] as const).map(intensity => (
              <label key={intensity} className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="intensity"
                  checked={effectConfig.intensity === intensity}
                  onChange={() => updateEffectConfig({ intensity })}
                  className="accent-cyan-400"
                />
                <span className="capitalize">{intensity}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Effect Triggers */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold">Effect Triggers</h3>
          <div className="flex flex-col space-y-1">
            <MatrixButton 
              size="sm" 
              onClick={() => triggerGlitch({ intensity: 0.8, duration: 300 })}
            >
              Trigger Glitch
            </MatrixButton>
            <MatrixButton 
              size="sm" 
              onClick={() => triggerPulse({ intensity: 1.0, duration: 200 })}
            >
              Trigger Pulse
            </MatrixButton>
            <MatrixButton 
              size="sm" 
              onClick={() => triggerGlow({ intensity: 1.2, duration: 500 })}
            >
              Trigger Glow
            </MatrixButton>
          </div>
        </div>
        
        {/* Data State Controls */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold">Data State</h3>
          <div className="flex flex-col space-y-1">
            <MatrixButton 
              size="sm" 
              onClick={markLoading}
              disabled={dataState.isLoading}
            >
              Mark Loading
            </MatrixButton>
            <MatrixButton 
              size="sm" 
              onClick={markLoaded}
              disabled={!dataState.isLoading}
            >
              Mark Loaded
            </MatrixButton>
            <MatrixButton 
              size="sm" 
              variant="danger"
              onClick={markError}
            >
              Trigger Error
            </MatrixButton>
            <MatrixButton 
              size="sm" 
              variant="secondary"
              onClick={clearError}
            >
              Clear Error
            </MatrixButton>
          </div>
        </div>
        
        {/* Connection Quality */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold">Connection</h3>
          <div className="flex flex-col space-y-1">
            {(['excellent', 'good', 'poor', 'disconnected'] as const).map(quality => (
              <label key={quality} className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="connection"
                  checked={dataState.connectionQuality === quality}
                  onChange={() => updateConnectionQuality(quality)}
                  className="accent-cyan-400"
                />
                <span className="capitalize">{quality}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Performance Controls */}
        <div className="space-y-2">
          <h3 className="font-mono text-sm font-semibold">Performance</h3>
          <div className="flex flex-col space-y-2">
            <div>
              <label className="text-xs">Quality Level</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={qualitySettings?.animationSmoothing || 1.0}
                onChange={(e) => setQualityLevel(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="text-xs opacity-70">
                {((qualitySettings?.animationSmoothing || 1.0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="flex space-x-2">
              <MatrixButton 
                size="sm" 
                variant="secondary"
                onClick={pauseAllEffects}
                disabled={!isEffectsEnabled}
              >
                Pause
              </MatrixButton>
              <MatrixButton 
                size="sm" 
                variant="secondary"
                onClick={resumeAllEffects}
                disabled={isEffectsEnabled}
              >
                Resume
              </MatrixButton>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="mt-6 p-4 bg-black/50 rounded border border-gray-600">
          <h3 className="font-mono text-sm font-semibold mb-2">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              FPS: <span className={performanceMetrics.fps >= 50 ? 'text-green-400' : 'text-yellow-400'}>
                {performanceMetrics.fps}
              </span>
            </div>
            <div>
              Memory: <span className="text-cyan-400">
                {performanceMetrics.memoryUsage.toFixed(1)}MB
              </span>
            </div>
            <div>
              Quality: <span className="text-blue-400">
                {(performanceMetrics.qualityLevel * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              Dropped: <span className="text-red-400">
                {performanceMetrics.dropped60fpsFrames}
              </span>
            </div>
          </div>
        </div>
      )}
    </MatrixCard>
  );
}

function MatrixComponentShowcase() {
  const [showCard, setShowCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(demoData);
  const [progress, setProgress] = useState(0);
  
  // Simulate loading with progress
  const simulateLoading = () => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return next;
      });
    }, 200);
  };
  
  return (
    <div className="space-y-6">
      {/* Transition Demo */}
      <MatrixCard className="p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Transition Effects</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <MatrixButton onClick={() => setShowCard(!showCard)}>
            Toggle Card
          </MatrixButton>
          <MatrixButton onClick={simulateLoading}>
            Simulate Loading
          </MatrixButton>
          <MatrixButton onClick={() => setData(data.length ? emptyData : demoData)}>
            Toggle Data
          </MatrixButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Transition */}
          <div>
            <h4 className="font-mono text-sm mb-2">Basic Transition</h4>
            <MatrixTransition isVisible={showCard} type="fade">
              <div className="p-4 bg-cyan-900/20 border border-cyan-400/30 rounded">
                <div className="font-mono text-cyan-400">Fade Transition</div>
                <div className="text-sm opacity-70">This card fades in and out</div>
              </div>
            </MatrixTransition>
          </div>
          
          {/* Glitch Transition */}
          <div>
            <h4 className="font-mono text-sm mb-2">Glitch Transition</h4>
            <MatrixTransition isVisible={showCard} type="glitch">
              <div className="p-4 bg-green-900/20 border border-green-400/30 rounded">
                <div className="font-mono text-green-400">Glitch Transition</div>
                <div className="text-sm opacity-70">Matrix-style glitch effect</div>
              </div>
            </MatrixTransition>
          </div>
        </div>
      </MatrixCard>
      
      {/* Loading Demo */}
      <MatrixCard className="p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Loading States</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-mono text-sm mb-2">Basic Loading</h4>
            <MatrixLoading 
              isLoading={loading} 
              loadingText="PROCESSING DATA"
            />
          </div>
          <div>
            <h4 className="font-mono text-sm mb-2">Loading with Progress</h4>
            <MatrixLoading 
              isLoading={loading} 
              loadingText="ANALYZING BLOCKCHAIN"
              showProgress={true}
              progress={progress}
            />
          </div>
        </div>
      </MatrixCard>
      
      {/* Data Transition Demo */}
      <MatrixCard className="p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Data Transitions</h3>
        <MatrixDataTransition
          data={data}
          className="min-h-48"
        >
          {(data) => (
            <div className="space-y-2">
              {data.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-3 bg-black/30 rounded border border-gray-600"
                >
                  <span className="font-mono">{item.name}</span>
                  <span className="text-cyan-400">${item.price.toLocaleString()}</span>
                  <span className={item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          )}
        </MatrixDataTransition>
      </MatrixCard>
      
      {/* Interactive Elements */}
      <MatrixCard className="p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Interactive Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-mono text-sm">Buttons</h4>
            <div className="space-y-2">
              <MatrixButton>Primary Button</MatrixButton>
              <MatrixButton variant="secondary">Secondary</MatrixButton>
              <MatrixButton variant="danger">Danger</MatrixButton>
              <MatrixButton loading={loading}>Loading</MatrixButton>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-mono text-sm">Hover Effects</h4>
            <MatrixCard interactive glow className="p-4 text-center">
              <div className="font-mono text-sm">Hover me!</div>
              <div className="text-xs opacity-70">Interactive card with glow</div>
            </MatrixCard>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-mono text-sm">Size Variants</h4>
            <div className="space-y-2">
              <MatrixButton size="sm">Small</MatrixButton>
              <MatrixButton size="md">Medium</MatrixButton>
              <MatrixButton size="lg">Large</MatrixButton>
            </div>
          </div>
        </div>
      </MatrixCard>
    </div>
  );
}

// Main Demo Component
export default function MatrixDemo() {
  return (
    <MatrixContainer 
      showBackground={true}
      effectConfig={{
        enabled: true,
        intensity: 'adaptive',
        theme: 'mixed',
        interactive: true,
        adaptToData: true,
        backgroundOnly: false,
      }}
      className="min-h-screen p-4"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <MatrixTransition type="cyber-glow">
            <h1 className="text-4xl font-mono font-bold mb-4">
              Matrix Effects Demo
            </h1>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              Interactive playground showcasing WebGL-powered Matrix digital rain effects, 
              cyberpunk transitions, and performance-optimized animations.
            </p>
          </MatrixTransition>
        </div>
        
        {/* Control Panel */}
        <MatrixControlPanel />
        
        {/* Component Showcase */}
        <MatrixComponentShowcase />
        
        {/* Performance Monitor */}
        <MatrixPerformanceMonitor />
      </div>
    </MatrixContainer>
  );
}