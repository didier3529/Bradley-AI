'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import { matrixDesignSystem } from '@/styles/design-tokens';
import MatrixCard from '@/components/ui/matrix-card';
import MatrixButton from '@/components/ui/matrix-button';

interface ContractData {
  address: string;
  name: string;
  symbol?: string;
  verified: boolean;
  securityScore: number; // 0-100
  deploymentDate?: string;
  creator?: string;
  network: string;
  standard?: string; // ERC-20, ERC-721, etc.
}

interface MatrixContractCardProps {
  contract: ContractData;
  className?: string;
  onAddressClick?: (address: string) => void;
  showQR?: boolean;
  compact?: boolean;
}

export default function MatrixContractCard({
  contract,
  className,
  onAddressClick,
  showQR = true,
  compact = false,
}: MatrixContractCardProps) {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Copy address to clipboard with Matrix glitch effect
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contract.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Generate QR code
  const generateQRCode = async () => {
    if (qrCode) {
      setShowQRModal(true);
      return;
    }

    setIsGeneratingQR(true);
    try {
      const qrDataURL = await QRCode.toDataURL(contract.address, {
        width: 256,
        margin: 2,
        color: {
          dark: matrixDesignSystem.colors.cyberBlue,
          light: matrixDesignSystem.colors.matrixBlack,
        },
      });
      setQrCode(qrDataURL);
      setShowQRModal(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Get security status color and text
  const getSecurityStatus = () => {
    if (contract.securityScore >= 80) {
      return { color: 'text-matrix-green', glow: 'matrix-glow-green', text: 'HIGH' };
    } else if (contract.securityScore >= 60) {
      return { color: 'text-yellow-400', glow: 'matrix-glow-amber', text: 'MEDIUM' };
    } else {
      return { color: 'text-red-400', glow: 'matrix-glow-red', text: 'LOW' };
    }
  };

  const securityStatus = getSecurityStatus();

  // Format address for display
  const formatAddress = (address: string, short = true) => {
    if (!short) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <MatrixCard
        variant="cyber"
        className={cn(
          'group hover:scale-[1.02] transition-all duration-300',
          compact ? 'p-4' : 'p-6',
          className
        )}
        glow
        gridPattern
      >
        {/* Contract Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-matrix-cyber-blue matrix-text-cyber-glow">
              {contract.name}
            </h3>
            {contract.symbol && (
              <span className="text-sm text-matrix-green matrix-font-mono">
                ${contract.symbol}
              </span>
            )}
            {contract.standard && (
              <span className="text-xs text-gray-400 matrix-font-mono">
                {contract.standard}
              </span>
            )}
          </div>

          {/* Verification Badge */}
          <motion.div
            className={cn(
              'px-2 py-1 rounded text-xs font-mono border',
              contract.verified
                ? 'border-matrix-green text-matrix-green matrix-glow-green'
                : 'border-red-400 text-red-400 matrix-glow-red'
            )}
            animate={{
              boxShadow: contract.verified
                ? ['0 0 5px rgba(0,255,65,0.3)', '0 0 15px rgba(0,255,65,0.5)', '0 0 5px rgba(0,255,65,0.3)']
                : ['0 0 5px rgba(255,64,64,0.3)', '0 0 15px rgba(255,64,64,0.5)', '0 0 5px rgba(255,64,64,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {contract.verified ? 'VERIFIED' : 'UNVERIFIED'}
          </motion.div>
        </div>

        {/* Contract Address */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 matrix-font-mono mb-1 block">
            CONTRACT ADDRESS
          </label>
          <div className="flex items-center gap-2 p-3 bg-black/50 rounded border border-matrix-cyber-blue/30">
            <code className="flex-1 text-matrix-cyber-blue matrix-font-mono text-sm">
              {compact ? formatAddress(contract.address) : contract.address}
            </code>
            
            {/* Copy Button */}
            <MatrixButton
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className={cn(
                'px-2 py-1 transition-all duration-200',
                copied && 'matrix-glitch'
              )}
            >
              <motion.div
                animate={copied ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {copied ? (
                  <span className="text-matrix-green">✓</span>
                ) : (
                  <span className="text-matrix-cyber-blue">📋</span>
                )}
              </motion.div>
            </MatrixButton>

            {/* QR Code Button */}
            {showQR && (
              <MatrixButton
                variant="ghost"
                size="sm"
                onClick={generateQRCode}
                disabled={isGeneratingQR}
                className="px-2 py-1"
              >
                {isGeneratingQR ? (
                  <div className="w-4 h-4 border-2 border-matrix-cyber-blue border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-matrix-cyber-blue">📱</span>
                )}
              </MatrixButton>
            )}
          </div>
        </div>

        {/* Contract Details */}
        {!compact && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 matrix-font-mono">NETWORK</label>
              <p className="text-matrix-cyber-blue matrix-font-mono">{contract.network}</p>
            </div>
            {contract.deploymentDate && (
              <div>
                <label className="text-xs text-gray-400 matrix-font-mono">DEPLOYED</label>
                <p className="text-matrix-green matrix-font-mono text-sm">
                  {new Date(contract.deploymentDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Security Status */}
        <div className="flex items-center justify-between pt-4 border-t border-matrix-cyber-blue/20">
          <span className="text-xs text-gray-400 matrix-font-mono">SECURITY SCORE</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-black rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  contract.securityScore >= 80 ? 'bg-matrix-green' :
                  contract.securityScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${contract.securityScore}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <span className={cn(
              'text-xs font-mono font-bold',
              securityStatus.color,
              securityStatus.glow
            )}>
              {securityStatus.text}
            </span>
          </div>
        </div>

        {/* Copy feedback */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-2 right-2 bg-matrix-green/20 border border-matrix-green px-2 py-1 rounded text-xs text-matrix-green matrix-font-mono"
            >
              Address Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </MatrixCard>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && qrCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-matrix-bg-dark border-2 border-matrix-cyber-blue rounded-lg p-6 matrix-glow-blue"
            >
              <div className="text-center mb-4">
                <h3 className="text-matrix-cyber-blue matrix-font-mono text-lg mb-2">
                  Contract QR Code
                </h3>
                <p className="text-gray-400 text-sm matrix-font-mono">
                  {formatAddress(contract.address, false)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-4 border-matrix-cyber-blue">
                <img src={qrCode} alt="Contract QR Code" className="w-64 h-64" />
              </div>
              
              <div className="mt-4 flex gap-2">
                <MatrixButton
                  variant="secondary"
                  onClick={() => setShowQRModal(false)}
                  className="flex-1"
                >
                  Close
                </MatrixButton>
                <MatrixButton
                  variant="primary"
                  onClick={handleCopyAddress}
                  className="flex-1"
                >
                  Copy Address
                </MatrixButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 