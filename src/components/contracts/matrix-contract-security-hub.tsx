'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatrixEffects, useMatrixEffect } from '@/components/effects/matrix-effects-manager';
import { MatrixCard, MatrixButton, MatrixTransition } from '@/components/effects/matrix-transitions';
import MatrixSecurityScanner from '@/components/security/matrix-security-scanner';
import MatrixContractExplorer from '@/components/contracts/matrix-contract-explorer';
import MatrixSecurityAlerts from '@/components/security/matrix-security-alerts';
import { matrixDesignSystem } from '@/styles/design-tokens';

export interface MatrixContractSecurityHubProps {
  defaultContract?: string;
  showWelcomeTour?: boolean;
  enableAdvancedFeatures?: boolean;
  className?: string;
}

interface HubTab {
  id: string;
  title: string;
  icon: string;
  description: string;
  component: React.ComponentType<any>;
  badge?: number;
}

export default function MatrixContractSecurityHub({
  defaultContract = '',
  showWelcomeTour = false,
  enableAdvancedFeatures = true,
  className = ''
}: MatrixContractSecurityHubProps) {
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [contractAddress, setContractAddress] = useState(defaultContract);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [securityAlertCount, setSecurityAlertCount] = useState(3);
  const [showTour, setShowTour] = useState(showWelcomeTour);
  
  const { currentTheme, dataState } = useMatrixEffects();
  const triggerPulse = useMatrixEffect('pulse');
  const triggerGlow = useMatrixEffect('glow');

  // Hub navigation tabs
  const tabs: HubTab[] = [
    {
      id: 'scanner',
      title: 'Security Scanner',
      icon: '🛡️',
      description: 'Comprehensive smart contract security analysis',
      component: MatrixSecurityScanner
    },
    {
      id: 'explorer',
      title: 'Contract Explorer',
      icon: '🔍',
      description: 'Deep dive into contract code and functions',
      component: MatrixContractExplorer
    },
    {
      id: 'alerts',
      title: 'Security Alerts',
      icon: '⚠️',
      description: 'Real-time security notifications and threats',
      component: MatrixSecurityAlerts,
      badge: securityAlertCount
    }
  ];

  // Handle contract address input
  const handleContractInput = (address: string) => {
    setContractAddress(address);
    
    // Add to search history if valid
    if (address && address.length === 42 && address.startsWith('0x')) {
      setSearchHistory(prev => {
        const newHistory = [address, ...prev.filter(addr => addr !== address)].slice(0, 5);
        return newHistory;
      });
      
      triggerPulse({ intensity: 0.6, duration: 200 });
    }
  };

  // Tab switching with effects
  const switchTab = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      triggerGlow({ intensity: 0.8, duration: 300 });
    }
  };

  // Theme-based styling
  const getTabTheme = (isActive: boolean) => {
    const baseTheme = {
      'matrix-green': isActive ? 'bg-green-900/30 border-green-400/60 text-green-400' : 'border-green-400/20 text-green-400/70 hover:border-green-400/40',
      'cyber-blue': isActive ? 'bg-cyan-900/30 border-cyan-400/60 text-cyan-400' : 'border-cyan-400/20 text-cyan-400/70 hover:border-cyan-400/40',
      'mixed': isActive ? 'bg-blue-900/30 border-blue-400/60 text-blue-400' : 'border-blue-400/20 text-blue-400/70 hover:border-blue-400/40',
      'adaptive': isActive ? 'bg-gray-900/30 border-gray-400/60 text-gray-400' : 'border-gray-400/20 text-gray-400/70 hover:border-gray-400/40'
    };
    return baseTheme[currentTheme];
  };

  return (
    <div className={`matrix-contract-security-hub ${className}`}>
      {/* Welcome Tour Modal */}
      <AnimatePresence>
        {showTour && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black border border-cyan-400/30 rounded-lg p-8 max-w-2xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-mono font-bold text-cyan-400 mb-4">
                  Welcome to Matrix Security Hub
                </h2>
                <p className="text-gray-300 text-lg">
                  Your comprehensive platform for smart contract security analysis and monitoring
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {tabs.map(tab => (
                  <div key={tab.id} className="text-center p-4 bg-gray-900/50 rounded border border-gray-600">
                    <div className="text-2xl mb-2">{tab.icon}</div>
                    <h3 className="font-mono font-semibold text-white text-sm mb-2">{tab.title}</h3>
                    <p className="text-xs text-gray-400">{tab.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <MatrixButton onClick={() => setShowTour(false)}>
                  Enter the Matrix
                </MatrixButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <MatrixCard className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold text-cyan-400 mb-2">
              Matrix Security Hub
            </h1>
            <p className="text-gray-300">
              Advanced smart contract security analysis and monitoring platform
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm font-mono text-gray-400">
              Status: <span className={dataState.errorState ? 'text-red-400' : 'text-green-400'}>
                {dataState.errorState ? 'Error' : 'Online'}
              </span>
            </div>
            <MatrixButton 
              size="sm" 
              variant="secondary"
              onClick={() => setShowTour(true)}
            >
              Tour
            </MatrixButton>
          </div>
        </div>
      </MatrixCard>

      {/* Contract Address Input */}
      <MatrixCard className="p-6 mb-6">
        <div className="space-y-4">
          <h2 className="text-xl font-mono font-bold text-cyan-400">
            Contract Analysis Target
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-mono text-gray-400 mb-2">
                Contract Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => handleContractInput(e.target.value)}
                placeholder="0x... Enter contract address"
                className="w-full px-4 py-2 bg-black/50 border border-gray-600 rounded font-mono text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <MatrixButton 
                onClick={() => handleContractInput('0x1234567890123456789012345678901234567890')}
                variant="secondary"
                size="sm"
              >
                Demo Contract
              </MatrixButton>
            </div>
          </div>
          
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">
                Recent Searches
              </label>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => setContractAddress(address)}
                    className="px-3 py-1 text-xs font-mono bg-gray-800/50 border border-gray-600 rounded text-cyan-400 hover:border-cyan-400/60 transition-colors"
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </MatrixCard>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`relative px-6 py-3 rounded-lg border font-mono font-semibold transition-all duration-200 ${getTabTheme(activeTab === tab.id)}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.title}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'scanner' && (
              <MatrixSecurityScanner
                contractAddress={contractAddress}
                autoScan={false}
                showDetailedReport={true}
                onScanComplete={(analysis) => {
                  triggerGlow({ intensity: 1.0, duration: 500 });
                }}
              />
            )}
            
            {activeTab === 'explorer' && (
              <MatrixContractExplorer
                contractAddress={contractAddress}
                showSourceCode={enableAdvancedFeatures}
                showTransactionHistory={enableAdvancedFeatures}
                showEventLogs={enableAdvancedFeatures}
                onDataLoad={(data) => {
                  triggerPulse({ intensity: 0.8, duration: 300 });
                }}
              />
            )}
            
            {activeTab === 'alerts' && (
              <MatrixSecurityAlerts
                contractAddresses={contractAddress ? [contractAddress] : []}
                autoRefresh={true}
                refreshInterval={60000}
                showThreatLevel={true}
                maxAlertsDisplay={10}
                onAlertAction={(alert, action) => {
                  if (action === 'acknowledge') {
                    setSecurityAlertCount(prev => Math.max(0, prev - 1));
                  }
                  triggerPulse({ intensity: 0.5, duration: 200 });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <MatrixCard className="p-4 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-mono font-bold text-cyan-400">47</div>
            <div className="text-sm text-gray-400">Contracts Analyzed</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-green-400">12</div>
            <div className="text-sm text-gray-400">Vulnerabilities Found</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-yellow-400">5</div>
            <div className="text-sm text-gray-400">Active Alerts</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-blue-400">98%</div>
            <div className="text-sm text-gray-400">Security Score</div>
          </div>
        </div>
      </MatrixCard>
    </div>
  );
} 