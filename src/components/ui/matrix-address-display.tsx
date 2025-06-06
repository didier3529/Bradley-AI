'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import { matrixDesignSystem } from '@/styles/design-tokens';
import MatrixButton from '@/components/ui/matrix-button';

interface AddressLabel {
  id: string;
  name: string;
  color: string;
}

interface MatrixAddressDisplayProps {
  address: string;
  label?: string;
  showQR?: boolean;
  showCopy?: boolean;
  showFavorite?: boolean;
  truncate?: boolean;
  expandOnHover?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  onCopy?: (address: string) => void;
  onFavorite?: (address: string, isFavorite: boolean) => void;
  onLabelChange?: (address: string, label: string) => void;
  isFavorite?: boolean;
  labels?: AddressLabel[];
}

export default function MatrixAddressDisplay({
  address,
  label,
  showQR = true,
  showCopy = true,
  showFavorite = false,
  truncate = true,
  expandOnHover = true,
  variant = 'default',
  className,
  onCopy,
  onFavorite,
  onLabelChange,
  isFavorite = false,
  labels = [],
}: MatrixAddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!truncate);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [editedLabel, setEditedLabel] = useState(label || '');
  const [favorite, setFavorite] = useState(isFavorite);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Format address for display
  const formatAddress = (addr: string, shouldTruncate = true) => {
    if (!shouldTruncate || isExpanded) return addr;
    return variant === 'compact' 
      ? `${addr.slice(0, 4)}...${addr.slice(-2)}`
      : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard with Matrix glitch effect
  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.(address);
      
      // Trigger glitch effect
      if (containerRef.current) {
        containerRef.current.classList.add('matrix-glitch');
        setTimeout(() => {
          containerRef.current?.classList.remove('matrix-glitch');
        }, 300);
      }
      
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
      const qrDataURL = await QRCode.toDataURL(address, {
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

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorite = !favorite;
    setFavorite(newFavorite);
    onFavorite?.(address, newFavorite);
  };

  // Handle label save
  const handleLabelSave = () => {
    onLabelChange?.(address, editedLabel);
    setShowLabelEditor(false);
  };

  // Handle address click
  const handleAddressClick = () => {
    if (expandOnHover && truncate) {
      setIsExpanded(!isExpanded);
    }
  };

  // Component variants
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'text-xs px-2 py-1';
      case 'inline':
        return 'text-sm px-1';
      default:
        return 'text-sm px-3 py-2';
    }
  };

  const baseClasses = [
    'matrix-font-mono',
    'bg-black/30',
    'border',
    'border-matrix-cyber-blue/40',
    'rounded',
    'transition-all',
    'duration-300',
    'hover:border-matrix-cyber-blue',
    'hover:bg-black/50',
    'relative',
    'group',
    'backdrop-blur-sm',
  ];

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          baseClasses,
          getVariantClasses(),
          'flex items-center gap-2',
          className
        )}
      >
        {/* Address Label */}
        {(label || editedLabel) && variant !== 'inline' && (
          <motion.span
            className="text-xs text-matrix-green bg-matrix-green/10 px-2 py-0.5 rounded border border-matrix-green/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {editedLabel || label}
          </motion.span>
        )}

        {/* Main Address Display */}
        <motion.code
          className={cn(
            'flex-1 text-matrix-cyber-blue cursor-pointer select-all',
            expandOnHover && 'hover:text-matrix-blue-light',
            isExpanded && 'text-matrix-blue-light'
          )}
          onClick={handleAddressClick}
          onMouseEnter={() => expandOnHover && setIsExpanded(true)}
          onMouseLeave={() => expandOnHover && setIsExpanded(false)}
          layout
          transition={{ duration: 0.2 }}
        >
          {formatAddress(address, truncate)}
        </motion.code>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Favorite Button */}
          {showFavorite && (
            <motion.button
              onClick={handleFavoriteToggle}
              className={cn(
                'w-6 h-6 flex items-center justify-center rounded hover:bg-matrix-cyber-blue/20 transition-colors',
                favorite ? 'text-matrix-cyber-blue' : 'text-gray-400'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {favorite ? '★' : '☆'}
            </motion.button>
          )}

          {/* Copy Button */}
          {showCopy && (
            <motion.button
              onClick={handleCopyAddress}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-matrix-cyber-blue/20 transition-colors text-matrix-cyber-blue"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={copied ? { scale: [1, 1.2, 1] } : {}}
            >
              {copied ? '✓' : '📋'}
            </motion.button>
          )}

          {/* QR Code Button */}
          {showQR && (
            <motion.button
              onClick={generateQRCode}
              disabled={isGeneratingQR}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-matrix-cyber-blue/20 transition-colors text-matrix-cyber-blue"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isGeneratingQR ? (
                <div className="w-3 h-3 border border-matrix-cyber-blue border-t-transparent rounded-full animate-spin" />
              ) : (
                '📱'
              )}
            </motion.button>
          )}

          {/* Label Edit Button */}
          {onLabelChange && variant !== 'inline' && (
            <motion.button
              onClick={() => setShowLabelEditor(!showLabelEditor)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-matrix-cyber-blue/20 transition-colors text-matrix-cyber-blue"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              🏷️
            </motion.button>
          )}
        </div>

        {/* Copy Feedback */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute top-0 right-0 transform -translate-y-full bg-matrix-green/20 border border-matrix-green px-2 py-1 rounded text-xs text-matrix-green whitespace-nowrap"
            >
              Copied!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label Editor */}
      <AnimatePresence>
        {showLabelEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-black/50 border border-matrix-cyber-blue/30 rounded"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                placeholder="Enter label..."
                className="flex-1 bg-black/50 border border-matrix-cyber-blue/40 rounded px-2 py-1 text-sm text-matrix-cyber-blue matrix-font-mono focus:outline-none focus:border-matrix-cyber-blue"
                autoFocus
              />
              <MatrixButton variant="primary" size="sm" onClick={handleLabelSave}>
                Save
              </MatrixButton>
              <MatrixButton variant="ghost" size="sm" onClick={() => setShowLabelEditor(false)}>
                Cancel
              </MatrixButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* Digital Rain Background */}
            <div className="absolute inset-0 matrix-rain-container opacity-30" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-matrix-bg-dark border-2 border-matrix-cyber-blue rounded-lg p-6 matrix-glow-blue max-w-sm w-full mx-4"
            >
              <div className="text-center mb-4">
                <h3 className="text-matrix-cyber-blue matrix-font-mono text-lg mb-2 matrix-text-cyber-glow">
                  Address QR Code
                </h3>
                {(editedLabel || label) && (
                  <p className="text-matrix-green text-sm matrix-font-mono mb-2">
                    {editedLabel || label}
                  </p>
                )}
                <p className="text-gray-400 text-xs matrix-font-mono break-all">
                  {address}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-4 border-matrix-cyber-blue mx-auto w-fit">
                <img src={qrCode} alt="Address QR Code" className="w-48 h-48" />
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

// Specialized variants
export function CompactAddressDisplay(props: Omit<MatrixAddressDisplayProps, 'variant'>) {
  return <MatrixAddressDisplay {...props} variant="compact" />;
}

export function InlineAddressDisplay(props: Omit<MatrixAddressDisplayProps, 'variant'>) {
  return <MatrixAddressDisplay {...props} variant="inline" />;
} 