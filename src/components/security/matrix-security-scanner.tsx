'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatrixEffects, useMatrixEffect } from '@/components/effects/matrix-effects-manager';
import { MatrixCard, MatrixButton, MatrixTransition } from '@/components/effects/matrix-transitions';
import { matrixDesignSystem } from '@/styles/design-tokens';

// Security analysis interfaces
export interface SecurityVulnerability {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  cweId?: string;
  confidence: number; // 0-100
}

export interface SecurityAnalysis {
  contractAddress: string;
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: SecurityVulnerability[];
  auditHistory: AuditRecord[];
  lastAnalyzed: Date;
  analysisEngine: string;
  isVerified: boolean;
  sourceCodeAvailable: boolean;
}

export interface AuditRecord {
  auditor: string;
  date: Date;
  score: number;
  reportUrl?: string;
  findings: number;
}

export interface MatrixSecurityScannerProps {
  contractAddress: string;
  onScanComplete?: (analysis: SecurityAnalysis) => void;
  autoScan?: boolean;
  showDetailedReport?: boolean;
  className?: string;
}

// Mock security analysis function (replace with real API)
const performSecurityAnalysis = async (address: string): Promise<SecurityAnalysis> => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock vulnerabilities for demo
  const mockVulnerabilities: SecurityVulnerability[] = [
    {
      id: '1',
      type: 'high',
      title: 'Reentrancy Vulnerability',
      description: 'Contract may be vulnerable to reentrancy attacks in the withdraw function',
      impact: 'Potential fund drainage through recursive calls',
      recommendation: 'Implement checks-effects-interactions pattern and use ReentrancyGuard',
      cweId: 'CWE-841',
      confidence: 85
    },
    {
      id: '2',
      type: 'medium',
      title: 'Integer Overflow Risk',
      description: 'Arithmetic operations may overflow without proper checks',
      impact: 'Unexpected behavior in token calculations',
      recommendation: 'Use SafeMath library or Solidity 0.8+ built-in overflow protection',
      confidence: 72
    },
    {
      id: '3',
      type: 'low',
      title: 'Gas Optimization Opportunity',
      description: 'Loop operations could be optimized for gas efficiency',
      impact: 'Higher transaction costs for users',
      recommendation: 'Consider batch operations or state variable optimization',
      confidence: 60
    }
  ];
  
  const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
  
  return {
    contractAddress: address,
    overallScore: score,
    riskLevel: score >= 80 ? 'low' : score >= 60 ? 'medium' : score >= 40 ? 'high' : 'critical',
    vulnerabilities: mockVulnerabilities,
    auditHistory: [
      {
        auditor: 'CertiK',
        date: new Date('2024-01-15'),
        score: 85,
        reportUrl: '#',
        findings: 3
      },
      {
        auditor: 'Quantstamp',
        date: new Date('2023-12-10'),
        score: 82,
        reportUrl: '#',
        findings: 5
      }
    ],
    lastAnalyzed: new Date(),
    analysisEngine: 'Matrix Security Engine v2.1',
    isVerified: true,
    sourceCodeAvailable: true
  };
};

export default function MatrixSecurityScanner({
  contractAddress,
  onScanComplete,
  autoScan = false,
  showDetailedReport = true,
  className = ''
}: MatrixSecurityScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedVulnerability, setSelectedVulnerability] = useState<SecurityVulnerability | null>(null);
  
  const { currentTheme } = useMatrixEffects();
  const triggerGlitch = useMatrixEffect('glitch');
  const triggerPulse = useMatrixEffect('pulse');
  
  // Auto-scan on mount if enabled
  useEffect(() => {
    if (autoScan && contractAddress) {
      startScan();
    }
  }, [autoScan, contractAddress]);
  
  // Security scan function
  const startScan = useCallback(async () => {
    if (!contractAddress || isScanning) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setAnalysis(null);
    
    triggerGlitch({ intensity: 0.5, duration: 200 });
    
    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + Math.random() * 15;
        return next >= 95 ? 95 : next;
      });
    }, 200);
    
    try {
      const result = await performSecurityAnalysis(contractAddress);
      setScanProgress(100);
      
      setTimeout(() => {
        setAnalysis(result);
        setIsScanning(false);
        clearInterval(progressInterval);
        
        // Trigger effects based on risk level
        if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
          triggerGlitch({ intensity: 1.0, duration: 500 });
        } else {
          triggerPulse({ intensity: 0.8, duration: 300 });
        }
        
        onScanComplete?.(result);
      }, 500);
      
    } catch (error) {
      console.error('Security scan failed:', error);
      setIsScanning(false);
      clearInterval(progressInterval);
    }
  }, [contractAddress, isScanning, triggerGlitch, triggerPulse, onScanComplete]);
  
  // Get security score color and glow
  const getSecurityScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        color: 'text-green-400',
        glow: 'shadow-green-400/50',
        border: 'border-green-400/60',
        bg: 'bg-green-900/20'
      };
    } else if (score >= 60) {
      return {
        color: 'text-yellow-400',
        glow: 'shadow-yellow-400/50',
        border: 'border-yellow-400/60',
        bg: 'bg-yellow-900/20'
      };
    } else if (score >= 40) {
      return {
        color: 'text-orange-400',
        glow: 'shadow-orange-400/50',
        border: 'border-orange-400/60',
        bg: 'bg-orange-900/20'
      };
    } else {
      return {
        color: 'text-red-400',
        glow: 'shadow-red-400/50',
        border: 'border-red-400/60',
        bg: 'bg-red-900/20'
      };
    }
  };
  
  // Get vulnerability type styling
  const getVulnerabilityTheme = (type: SecurityVulnerability['type']) => {
    const themes = {
      critical: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-400/40' },
      high: { color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-400/40' },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-400/40' },
      low: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-400/40' },
      info: { color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-400/40' }
    };
    return themes[type];
  };
  
  return (
    <div className={`matrix-security-scanner ${className}`}>
      {/* Scanner Header */}
      <MatrixCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-mono font-bold text-cyan-400">
            Matrix Security Scanner
          </h2>
          <div className="flex items-center space-x-2">
            {analysis && (
              <div className="text-sm font-mono text-gray-400">
                Last scan: {analysis.lastAnalyzed.toLocaleTimeString()}
              </div>
            )}
            <MatrixButton 
              onClick={startScan}
              disabled={isScanning || !contractAddress}
              loading={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Start Scan'}
            </MatrixButton>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm font-mono">
          <span className="text-gray-400">Contract:</span>
          <code className="text-cyan-400 bg-black/50 px-2 py-1 rounded">
            {contractAddress || 'No contract specified'}
          </code>
        </div>
        
        {/* Scanning Progress */}
        {isScanning && (
          <MatrixTransition type="fade" className="mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-mono">
                <span className="text-cyan-400">Security Analysis Progress</span>
                <span className="text-white">{scanProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  style={{
                    boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Analyzing smart contract bytecode and patterns...
              </div>
            </div>
          </MatrixTransition>
        )}
      </MatrixCard>
      
      {/* Security Analysis Results */}
      {analysis && (
        <MatrixTransition type="slide" className="space-y-6">
          {/* Overall Security Score */}
          <MatrixCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Security Score */}
              <div className="text-center">
                <div className="text-sm font-mono text-gray-400 mb-2">Overall Security Score</div>
                <motion.div
                  className={`text-6xl font-mono font-bold ${getSecurityScoreTheme(analysis.overallScore).color}`}
                  style={{
                    textShadow: `0 0 20px ${getSecurityScoreTheme(analysis.overallScore).color.replace('text-', '').replace('-400', '')}`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {analysis.overallScore}
                </motion.div>
                <div className={`text-sm font-mono uppercase ${getSecurityScoreTheme(analysis.overallScore).color}`}>
                  {analysis.riskLevel} Risk
                </div>
              </div>
              
              {/* Contract Status */}
              <div className="space-y-3">
                <h3 className="font-mono font-semibold text-cyan-400">Contract Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verified:</span>
                    <span className={analysis.isVerified ? 'text-green-400' : 'text-red-400'}>
                      {analysis.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source Code:</span>
                    <span className={analysis.sourceCodeAvailable ? 'text-green-400' : 'text-red-400'}>
                      {analysis.sourceCodeAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vulnerabilities:</span>
                    <span className="text-white">{analysis.vulnerabilities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audits:</span>
                    <span className="text-white">{analysis.auditHistory.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Analysis Engine */}
              <div className="space-y-3">
                <h3 className="font-mono font-semibold text-cyan-400">Analysis Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-400">Engine:</div>
                  <div className="text-white font-mono">{analysis.analysisEngine}</div>
                  <div className="text-gray-400">Analyzed:</div>
                  <div className="text-white font-mono">{analysis.lastAnalyzed.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </MatrixCard>
          
          {/* Vulnerabilities List */}
          {analysis.vulnerabilities.length > 0 && (
            <MatrixCard className="p-6">
              <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
                Security Vulnerabilities ({analysis.vulnerabilities.length})
              </h3>
              
              <div className="space-y-3">
                {analysis.vulnerabilities.map((vuln, index) => {
                  const theme = getVulnerabilityTheme(vuln.type);
                  
                  return (
                    <motion.div
                      key={vuln.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${theme.border} ${theme.bg} hover:${theme.bg.replace('/20', '/30')}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedVulnerability(vuln)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${theme.color} ${theme.bg} ${theme.border} border`}>
                              {vuln.type}
                            </span>
                            <span className="font-mono font-semibold text-white">
                              {vuln.title}
                            </span>
                            {vuln.cweId && (
                              <span className="text-xs text-gray-400 font-mono">
                                {vuln.cweId}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{vuln.description}</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="text-gray-400">
                              Confidence: <span className="text-white">{vuln.confidence}%</span>
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </MatrixCard>
          )}
          
          {/* Audit History */}
          {analysis.auditHistory.length > 0 && (
            <MatrixCard className="p-6">
              <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
                Audit History
              </h3>
              
              <div className="space-y-3">
                {analysis.auditHistory.map((audit, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-600 rounded-lg p-4 bg-black/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono font-semibold text-white">{audit.auditor}</div>
                      <div className="text-sm text-gray-400">{audit.date.toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">
                        Score: <span className="text-cyan-400">{audit.score}/100</span>
                      </span>
                      <span className="text-gray-400">
                        Findings: <span className="text-white">{audit.findings}</span>
                      </span>
                      {audit.reportUrl && (
                        <a 
                          href={audit.reportUrl} 
                          className="text-cyan-400 hover:text-cyan-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Report
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </MatrixCard>
          )}
        </MatrixTransition>
      )}
      
      {/* Vulnerability Detail Modal */}
      <AnimatePresence>
        {selectedVulnerability && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVulnerability(null)}
          >
            <motion.div
              className="bg-black border border-cyan-400/30 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-mono font-bold text-cyan-400">
                  {selectedVulnerability.title}
                </h3>
                <button
                  onClick={() => setSelectedVulnerability(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono font-semibold text-white mb-2">Description</h4>
                  <p className="text-gray-300">{selectedVulnerability.description}</p>
                </div>
                
                <div>
                  <h4 className="font-mono font-semibold text-white mb-2">Potential Impact</h4>
                  <p className="text-gray-300">{selectedVulnerability.impact}</p>
                </div>
                
                <div>
                  <h4 className="font-mono font-semibold text-white mb-2">Recommendation</h4>
                  <p className="text-gray-300">{selectedVulnerability.recommendation}</p>
                </div>
                
                {selectedVulnerability.cweId && (
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">CWE Reference</h4>
                    <code className="text-cyan-400">{selectedVulnerability.cweId}</code>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 