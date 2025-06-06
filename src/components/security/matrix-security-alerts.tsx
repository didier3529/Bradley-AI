'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatrixEffects, useMatrixEffect } from '@/components/effects/matrix-effects-manager';
import { MatrixCard, MatrixButton, MatrixTransition } from '@/components/effects/matrix-transitions';
import { matrixDesignSystem } from '@/styles/design-tokens';

// Security alert interfaces
export interface SecurityAlert {
  id: string;
  type: 'vulnerability' | 'exploit' | 'phishing' | 'scam' | 'rugpull' | 'governance' | 'audit' | 'warning';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  details: string;
  affectedContracts: string[];
  impact: string;
  recommendation: string;
  source: 'automated' | 'community' | 'official' | 'audit_firm';
  timestamp: Date;
  expiresAt?: Date;
  isActive: boolean;
  acknowledgmentRequired: boolean;
  links: Array<{ label: string; url: string }>;
  tags: string[];
}

export interface ThreatLevel {
  level: 'green' | 'yellow' | 'orange' | 'red' | 'critical';
  description: string;
  activeThreats: number;
  recommendedActions: string[];
}

export interface AlertFilters {
  severity: SecurityAlert['severity'][];
  type: SecurityAlert['type'][];
  source: SecurityAlert['source'][];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  acknowledged: boolean | null;
}

export interface MatrixSecurityAlertsProps {
  contractAddresses?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  showThreatLevel?: boolean;
  maxAlertsDisplay?: number;
  onAlertAction?: (alert: SecurityAlert, action: 'acknowledge' | 'dismiss' | 'report') => void;
  className?: string;
}

// Mock alert generation for demo
const generateMockAlerts = (): SecurityAlert[] => {
  const alertTypes: SecurityAlert['type'][] = ['vulnerability', 'exploit', 'phishing', 'scam', 'rugpull', 'governance', 'audit', 'warning'];
  const severities: SecurityAlert['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
  const sources: SecurityAlert['source'][] = ['automated', 'community', 'official', 'audit_firm'];

  const mockAlerts: SecurityAlert[] = [
    {
      id: '1',
      type: 'exploit',
      severity: 'critical',
      title: 'Flash Loan Attack Detected',
      description: 'Suspicious flash loan activity targeting DEX liquidity pools',
      details: 'Multiple transactions detected attempting to manipulate price oracles through flash loan arbitrage. Estimated potential loss: $2.3M across affected protocols.',
      affectedContracts: ['0x1234...5678', '0x8765...4321'],
      impact: 'Potential drainage of liquidity pools and price manipulation',
      recommendation: 'Pause affected pools immediately and implement additional oracle safeguards',
      source: 'automated',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      isActive: true,
      acknowledgmentRequired: true,
      links: [
        { label: 'Transaction Details', url: '#' },
        { label: 'Incident Report', url: '#' }
      ],
      tags: ['flash-loan', 'arbitrage', 'oracle-manipulation']
    },
    {
      id: '2',
      type: 'vulnerability',
      severity: 'high',
      title: 'Reentrancy Vulnerability in DeFi Protocol',
      description: 'Critical reentrancy vulnerability discovered in popular lending protocol',
      details: 'Security researchers have identified a reentrancy vulnerability in the withdraw function that could allow attackers to drain funds.',
      affectedContracts: ['0xabcd...efgh'],
      impact: 'Potential loss of all deposited funds in affected protocol',
      recommendation: 'Avoid interacting with affected protocol until patch is deployed',
      source: 'audit_firm',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isActive: true,
      acknowledgmentRequired: true,
      links: [
        { label: 'Security Advisory', url: '#' },
        { label: 'Patch Status', url: '#' }
      ],
      tags: ['reentrancy', 'lending', 'defi']
    },
    {
      id: '3',
      type: 'phishing',
      severity: 'medium',
      title: 'Fake Token Airdrop Campaign',
      description: 'Malicious actors distributing fake tokens to harvest wallet permissions',
      details: 'Users are receiving fake tokens that request unlimited spending approval when attempting to sell or transfer.',
      affectedContracts: ['0x9999...fake'],
      impact: 'Wallet drainage through unlimited token approvals',
      recommendation: 'Do not interact with unknown tokens, revoke suspicious approvals',
      source: 'community',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isActive: true,
      acknowledgmentRequired: false,
      links: [
        { label: 'Revoke Approvals', url: '#' },
        { label: 'Report Scam', url: '#' }
      ],
      tags: ['phishing', 'airdrop', 'approval']
    }
  ];

  return mockAlerts;
};

// Calculate threat level based on active alerts
const calculateThreatLevel = (alerts: SecurityAlert[]): ThreatLevel => {
  const activeAlerts = alerts.filter(alert => alert.isActive);
  const criticalCount = activeAlerts.filter(alert => alert.severity === 'critical').length;
  const highCount = activeAlerts.filter(alert => alert.severity === 'high').length;
  const mediumCount = activeAlerts.filter(alert => alert.severity === 'medium').length;

  if (criticalCount > 0) {
    return {
      level: 'critical',
      description: 'Critical threats detected requiring immediate action',
      activeThreats: activeAlerts.length,
      recommendedActions: [
        'Review all critical alerts immediately',
        'Pause interactions with affected protocols',
        'Monitor portfolio for suspicious activity',
        'Consider emergency asset withdrawal'
      ]
    };
  } else if (highCount > 1) {
    return {
      level: 'red',
      description: 'Multiple high-severity threats require attention',
      activeThreats: activeAlerts.length,
      recommendedActions: [
        'Review high-priority alerts',
        'Verify all recent transactions',
        'Update security configurations'
      ]
    };
  } else if (highCount > 0 || mediumCount > 2) {
    return {
      level: 'orange',
      description: 'Moderate threat level - monitor situation closely',
      activeThreats: activeAlerts.length,
      recommendedActions: [
        'Review pending alerts',
        'Monitor affected protocols',
        'Stay informed of developments'
      ]
    };
  } else if (mediumCount > 0) {
    return {
      level: 'yellow',
      description: 'Low threat level with minor concerns',
      activeThreats: activeAlerts.length,
      recommendedActions: [
        'Stay informed of security updates',
        'Review alerts when convenient'
      ]
    };
  } else {
    return {
      level: 'green',
      description: 'No active security threats detected',
      activeThreats: 0,
      recommendedActions: [
        'Continue normal operations',
        'Maintain security best practices'
      ]
    };
  }
};

export default function MatrixSecurityAlerts({
  contractAddresses = [],
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
  showThreatLevel = true,
  maxAlertsDisplay = 10,
  onAlertAction,
  className = ''
}: MatrixSecurityAlertsProps) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AlertFilters>({
    severity: [],
    type: [],
    source: [],
    dateRange: {},
    acknowledged: null
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { currentTheme } = useMatrixEffects();
  const triggerGlitch = useMatrixEffect('glitch');
  const triggerPulse = useMatrixEffect('pulse');

  // Load alerts function
  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockAlerts = generateMockAlerts();
      
      setAlerts(mockAlerts);
      const threat = calculateThreatLevel(mockAlerts);
      setThreatLevel(threat);
      
      // Trigger effects based on threat level
      if (threat.level === 'critical') {
        triggerGlitch({ intensity: 1.0, duration: 500 });
      } else if (threat.level === 'red') {
        triggerPulse({ intensity: 0.8, duration: 300 });
      }
      
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [triggerGlitch, triggerPulse]);

  // Auto-refresh functionality
  useEffect(() => {
    loadAlerts();
    
    if (autoRefresh) {
      refreshTimer.current = setInterval(loadAlerts, refreshInterval);
    }
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [loadAlerts, autoRefresh, refreshInterval]);

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) return false;
    if (filters.type.length > 0 && !filters.type.includes(alert.type)) return false;
    if (filters.source.length > 0 && !filters.source.includes(alert.source)) return false;
    if (filters.acknowledged === true && !acknowledgedAlerts.has(alert.id)) return false;
    if (filters.acknowledged === false && acknowledgedAlerts.has(alert.id)) return false;
    
    return true;
  }).slice(0, maxAlertsDisplay);

  // Theme functions
  const getThreatLevelTheme = (level: ThreatLevel['level']) => {
    const themes = {
      green: {
        color: 'text-green-400',
        bg: 'bg-green-900/20',
        border: 'border-green-400/40',
        glow: 'shadow-green-400/30'
      },
      yellow: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-400/40',
        glow: 'shadow-yellow-400/30'
      },
      orange: {
        color: 'text-orange-400',
        bg: 'bg-orange-900/20',
        border: 'border-orange-400/40',
        glow: 'shadow-orange-400/30'
      },
      red: {
        color: 'text-red-400',
        bg: 'bg-red-900/20',
        border: 'border-red-400/40',
        glow: 'shadow-red-400/30'
      },
      critical: {
        color: 'text-red-400',
        bg: 'bg-red-900/40',
        border: 'border-red-400/60',
        glow: 'shadow-red-400/50'
      }
    };
    return themes[level];
  };

  const getAlertSeverityTheme = (severity: SecurityAlert['severity']) => {
    const themes = {
      critical: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-400/40' },
      high: { color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-400/40' },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-400/40' },
      low: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-400/40' },
      info: { color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-400/40' }
    };
    return themes[severity];
  };

  const getAlertTypeIcon = (type: SecurityAlert['type']) => {
    const icons = {
      vulnerability: '🔓',
      exploit: '⚠️',
      phishing: '🎣',
      scam: '🚨',
      rugpull: '💸',
      governance: '🏛️',
      audit: '🔍',
      warning: '⚡'
    };
    return icons[type] || '⚠️';
  };

  const handleAlertAction = (alert: SecurityAlert, action: 'acknowledge' | 'dismiss' | 'report') => {
    if (action === 'acknowledge') {
      setAcknowledgedAlerts(prev => new Set(prev).add(alert.id));
    }
    
    onAlertAction?.(alert, action);
    triggerPulse({ intensity: 0.5, duration: 200 });
  };

  return (
    <div className={`matrix-security-alerts ${className}`}>
      {/* Threat Level Display */}
      {showThreatLevel && threatLevel && (
        <MatrixCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-mono font-bold text-cyan-400">
              Matrix Threat Monitor
            </h2>
            <MatrixButton 
              onClick={loadAlerts}
              disabled={isLoading}
              loading={isLoading}
              size="sm"
            >
              Refresh
            </MatrixButton>
          </div>
          
          <div className={`p-4 rounded-lg border ${getThreatLevelTheme(threatLevel.level).border} ${getThreatLevelTheme(threatLevel.level).bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getThreatLevelTheme(threatLevel.level).color.replace('text-', 'bg-')}`} />
                <span className={`text-lg font-mono font-bold uppercase ${getThreatLevelTheme(threatLevel.level).color}`}>
                  {threatLevel.level} Alert Level
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {threatLevel.activeThreats} Active Threats
              </span>
            </div>
            
            <p className="text-gray-300 mb-3">{threatLevel.description}</p>
            
            {threatLevel.recommendedActions.length > 0 && (
              <div>
                <h4 className="font-mono font-semibold text-white mb-2">Recommended Actions:</h4>
                <ul className="space-y-1">
                  {threatLevel.recommendedActions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center">
                      <span className="text-cyan-400 mr-2">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </MatrixCard>
      )}

      {/* Alerts List */}
      <MatrixCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-mono font-bold text-cyan-400">
            Security Alerts ({filteredAlerts.length})
          </h3>
          
          {/* Filter controls would go here */}
          <div className="text-sm text-gray-400 font-mono">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-cyan-400 font-mono">Loading security alerts...</div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 font-mono">No active security alerts</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => {
              const severityTheme = getAlertSeverityTheme(alert.severity);
              const isAcknowledged = acknowledgedAlerts.has(alert.id);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isAcknowledged ? 'opacity-60' : ''
                    } ${severityTheme.border} hover:${severityTheme.bg.replace('/20', '/30')}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getAlertTypeIcon(alert.type)}</span>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${severityTheme.color} ${severityTheme.bg} border ${severityTheme.border}`}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-gray-400 font-mono uppercase">
                              {alert.type}
                            </span>
                          </div>
                          <h4 className="font-mono font-semibold text-white">{alert.title}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                        {isAcknowledged && (
                          <div className="text-xs text-green-400 mt-1">✓ Acknowledged</div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Source: {alert.source}</span>
                        <span>Contracts: {alert.affectedContracts.length}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.acknowledgmentRequired && !isAcknowledged && (
                          <MatrixButton
                            size="sm"
                            onClick={() => {
                              handleAlertAction(alert, 'acknowledge');
                            }}
                          >
                            Acknowledge
                          </MatrixButton>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </MatrixCard>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              className="bg-black border border-cyan-400/30 rounded-lg p-6 max-w-4xl w-full max-h-96 overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getAlertTypeIcon(selectedAlert.type)}</span>
                  <div>
                    <h3 className="text-xl font-mono font-bold text-cyan-400">
                      {selectedAlert.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${getAlertSeverityTheme(selectedAlert.severity).color} ${getAlertSeverityTheme(selectedAlert.severity).bg} border ${getAlertSeverityTheme(selectedAlert.severity).border}`}>
                        {selectedAlert.severity}
                      </span>
                      <span className="text-xs text-gray-400">{selectedAlert.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Description</h4>
                    <p className="text-gray-300">{selectedAlert.details}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Impact</h4>
                    <p className="text-gray-300">{selectedAlert.impact}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Recommendation</h4>
                    <p className="text-gray-300">{selectedAlert.recommendation}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Affected Contracts</h4>
                    <div className="space-y-1">
                      {selectedAlert.affectedContracts.map((contract, index) => (
                        <code key={index} className="block text-cyan-400 bg-black/50 px-2 py-1 rounded text-sm">
                          {contract}
                        </code>
                      ))}
                    </div>
                  </div>
                  
                  {selectedAlert.links.length > 0 && (
                    <div>
                      <h4 className="font-mono font-semibold text-white mb-2">Resources</h4>
                      <div className="space-y-2">
                        {selectedAlert.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            className="block text-cyan-400 hover:text-cyan-300 underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {selectedAlert.acknowledgmentRequired && !acknowledgedAlerts.has(selectedAlert.id) && (
                      <MatrixButton
                        onClick={() => handleAlertAction(selectedAlert, 'acknowledge')}
                      >
                        Acknowledge
                      </MatrixButton>
                    )}
                    <MatrixButton
                      variant="secondary"
                      onClick={() => handleAlertAction(selectedAlert, 'report')}
                    >
                      Report Issue
                    </MatrixButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 