'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatrixEffects, useMatrixEffect } from '@/components/effects/matrix-effects-manager';
import { MatrixCard, MatrixButton, MatrixTransition } from '@/components/effects/matrix-transitions';

// Contract exploration interfaces
export interface ContractFunction {
  name: string;
  signature: string;
  inputs: Array<{ name: string; type: string; indexed?: boolean }>;
  outputs: Array<{ name: string; type: string }>;
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  visibility: 'public' | 'external' | 'internal' | 'private';
  documentation?: string;
}

export interface ContractEvent {
  name: string;
  signature: string;
  inputs: Array<{ name: string; type: string; indexed?: boolean }>;
  documentation?: string;
}

export interface TransactionLog {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  from: string;
  to: string;
  functionName: string;
  parameters: Record<string, any>;
  gasUsed: number;
  gasPrice: string;
  value: string;
  status: 'success' | 'failed' | 'pending';
}

export interface EventLog {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  eventName: string;
  parameters: Record<string, any>;
  topics: string[];
  data: string;
}

export interface ContractSourceCode {
  sourceCode: string;
  language: 'solidity' | 'vyper';
  version: string;
  optimizationEnabled: boolean;
  optimizationRuns?: number;
  libraries?: Record<string, string>;
}

export interface ContractExplorationData {
  address: string;
  name: string;
  functions: ContractFunction[];
  events: ContractEvent[];
  sourceCode?: ContractSourceCode;
  abi: any[];
  creationTransaction?: string;
  creator?: string;
  totalTransactions: number;
  totalEvents: number;
}

export interface MatrixContractExplorerProps {
  contractAddress: string;
  onDataLoad?: (data: ContractExplorationData) => void;
  showSourceCode?: boolean;
  showTransactionHistory?: boolean;
  showEventLogs?: boolean;
  className?: string;
}

// Mock contract data generation
const generateMockContractData = async (address: string): Promise<ContractExplorationData> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    address,
    name: 'MockToken',
    functions: [
      {
        name: 'transfer',
        signature: 'transfer(address,uint256)',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable',
        visibility: 'public',
        documentation: 'Transfers tokens to the specified address'
      },
      {
        name: 'balanceOf',
        signature: 'balanceOf(address)',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }],
        stateMutability: 'view',
        visibility: 'public',
        documentation: 'Returns the token balance of an account'
      },
      {
        name: 'approve',
        signature: 'approve(address,uint256)',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }],
        stateMutability: 'nonpayable',
        visibility: 'public',
        documentation: 'Approves spender to transfer tokens on behalf of caller'
      }
    ],
    events: [
      {
        name: 'Transfer',
        signature: 'Transfer(address,address,uint256)',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ],
        documentation: 'Emitted when tokens are transferred'
      },
      {
        name: 'Approval',
        signature: 'Approval(address,address,uint256)',
        inputs: [
          { name: 'owner', type: 'address', indexed: true },
          { name: 'spender', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ],
        documentation: 'Emitted when allowance is set'
      }
    ],
    sourceCode: {
      sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract MockToken is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        _totalSupply = 1000000 * 10**decimals;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public override returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}`,
      language: 'solidity',
      version: '0.8.19',
      optimizationEnabled: true,
      optimizationRuns: 200
    },
    abi: [],
    creationTransaction: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    creator: '0xabcdef1234567890abcdef1234567890abcdef12',
    totalTransactions: 15432,
    totalEvents: 23891
  };
};

// Generate mock transaction logs
const generateMockTransactionLogs = (count: number = 10): TransactionLog[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `tx-${i}`,
    transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    blockNumber: 18500000 + i,
    timestamp: new Date(Date.now() - i * 300000),
    from: `0x${Math.random().toString(16).slice(2, 42)}`,
    to: `0x${Math.random().toString(16).slice(2, 42)}`,
    functionName: ['transfer', 'approve', 'transferFrom'][Math.floor(Math.random() * 3)],
    parameters: {
      to: `0x${Math.random().toString(16).slice(2, 42)}`,
      amount: (Math.random() * 1000).toFixed(2)
    },
    gasUsed: Math.floor(Math.random() * 50000) + 21000,
    gasPrice: (Math.random() * 50 + 10).toFixed(0),
    value: '0',
    status: Math.random() > 0.1 ? 'success' : 'failed'
  }));
};

// Generate mock event logs
const generateMockEventLogs = (count: number = 10): EventLog[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    blockNumber: 18500000 + i,
    timestamp: new Date(Date.now() - i * 300000),
    eventName: ['Transfer', 'Approval'][Math.floor(Math.random() * 2)],
    parameters: {
      from: `0x${Math.random().toString(16).slice(2, 42)}`,
      to: `0x${Math.random().toString(16).slice(2, 42)}`,
      value: (Math.random() * 1000).toFixed(2)
    },
    topics: [`0x${Math.random().toString(16).slice(2, 66)}`],
    data: `0x${Math.random().toString(16).slice(2, 128)}`
  }));
};

export default function MatrixContractExplorer({
  contractAddress,
  onDataLoad,
  showSourceCode = true,
  showTransactionHistory = true,
  showEventLogs = true,
  className = ''
}: MatrixContractExplorerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [contractData, setContractData] = useState<ContractExplorationData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'events' | 'source' | 'transactions' | 'logs'>('overview');
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(null);
  
  const { currentTheme } = useMatrixEffects();
  const triggerPulse = useMatrixEffect('pulse');
  const triggerGlow = useMatrixEffect('glow');
  
  // Load contract data
  const loadContractData = useCallback(async () => {
    if (!contractAddress || isLoading) return;
    
    setIsLoading(true);
    triggerPulse({ intensity: 0.6, duration: 200 });
    
    try {
      const data = await generateMockContractData(contractAddress);
      setContractData(data);
      
      if (showTransactionHistory) {
        setTransactionLogs(generateMockTransactionLogs(20));
      }
      
      if (showEventLogs) {
        setEventLogs(generateMockEventLogs(15));
      }
      
      triggerGlow({ intensity: 0.8, duration: 400 });
      onDataLoad?.(data);
      
    } catch (error) {
      console.error('Failed to load contract data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, isLoading, showTransactionHistory, showEventLogs, triggerPulse, triggerGlow, onDataLoad]);
  
  // Load data on mount
  useEffect(() => {
    if (contractAddress) {
      loadContractData();
    }
  }, [contractAddress, loadContractData]);
  
  // Get function mutability styling
  const getFunctionMutabilityTheme = (mutability: ContractFunction['stateMutability']) => {
    const themes = {
      pure: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-400/40' },
      view: { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-400/40' },
      nonpayable: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-400/40' },
      payable: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-400/40' }
    };
    return themes[mutability];
  };
  
  // Get transaction status styling
  const getTransactionStatusTheme = (status: TransactionLog['status']) => {
    const themes = {
      success: { color: 'text-green-400', bg: 'bg-green-900/20' },
      failed: { color: 'text-red-400', bg: 'bg-red-900/20' },
      pending: { color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
    };
    return themes[status];
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Format large numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Syntax highlighting for Solidity (basic)
  const highlightSolidity = (code: string) => {
    // Basic syntax highlighting - in a real implementation, use a proper syntax highlighter
    return code
      .replace(/(pragma|contract|interface|function|modifier|event|struct|enum|mapping|constructor|require|emit|return|if|else|for|while|address|uint256|uint8|bool|string|bytes|memory|storage|calldata|public|private|internal|external|view|pure|payable|nonpayable|indexed|override)\b/g, 
        '<span class="text-cyan-400">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>')
      .replace(/(".*?")/g, '<span class="text-green-400">$1</span>')
      .replace(/(\b\d+\b)/g, '<span class="text-orange-400">$1</span>');
  };
  
  if (isLoading) {
    return (
      <div className={`matrix-contract-explorer ${className}`}>
        <MatrixCard className="p-8">
          <div className="text-center">
            <div className="text-cyan-400 font-mono text-lg mb-4">Loading Contract Data...</div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          </div>
        </MatrixCard>
      </div>
    );
  }
  
  if (!contractData) {
    return (
      <div className={`matrix-contract-explorer ${className}`}>
        <MatrixCard className="p-8">
          <div className="text-center">
            <div className="text-gray-400 font-mono">No contract data available</div>
            <MatrixButton onClick={loadContractData} className="mt-4">
              Reload
            </MatrixButton>
          </div>
        </MatrixCard>
      </div>
    );
  }
  
  return (
    <div className={`matrix-contract-explorer ${className}`}>
      {/* Header */}
      <MatrixCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-mono font-bold text-cyan-400">
            Contract Explorer
          </h2>
          <MatrixButton onClick={loadContractData} size="sm">
            Refresh
          </MatrixButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Contract:</span>
            <div className="font-mono text-cyan-400">{contractData.name}</div>
          </div>
          <div>
            <span className="text-gray-400">Address:</span>
            <div className="font-mono text-white">{formatAddress(contractData.address)}</div>
          </div>
          <div>
            <span className="text-gray-400">Functions:</span>
            <div className="font-mono text-white">{contractData.functions.length}</div>
          </div>
        </div>
      </MatrixCard>
      
      {/* Navigation Tabs */}
      <MatrixCard className="p-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'overview', label: 'Overview' },
            { key: 'functions', label: 'Functions' },
            { key: 'events', label: 'Events' },
            ...(showSourceCode ? [{ key: 'source', label: 'Source Code' }] : []),
            ...(showTransactionHistory ? [{ key: 'transactions', label: 'Transactions' }] : []),
            ...(showEventLogs ? [{ key: 'logs', label: 'Event Logs' }] : [])
          ] as const).map((tab) => (
            <MatrixButton
              key={tab.key}
              size="sm"
              variant={activeTab === tab.key ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </MatrixButton>
          ))}
        </div>
      </MatrixCard>
      
      {/* Tab Content */}
      <MatrixTransition type="fade" key={activeTab}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <MatrixCard className="p-6">
              <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">Contract Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Name:</span>
                    <span className="text-white font-mono">{contractData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Functions:</span>
                    <span className="text-white">{contractData.functions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Events:</span>
                    <span className="text-white">{contractData.events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Transactions:</span>
                    <span className="text-white">{formatNumber(contractData.totalTransactions)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {contractData.creator && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <code className="text-cyan-400">{formatAddress(contractData.creator)}</code>
                    </div>
                  )}
                  {contractData.sourceCode && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Language:</span>
                        <span className="text-white capitalize">{contractData.sourceCode.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Version:</span>
                        <span className="text-white">{contractData.sourceCode.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Optimization:</span>
                        <span className={contractData.sourceCode.optimizationEnabled ? 'text-green-400' : 'text-red-400'}>
                          {contractData.sourceCode.optimizationEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </MatrixCard>
          </div>
        )}
        
        {/* Functions Tab */}
        {activeTab === 'functions' && (
          <MatrixCard className="p-6">
            <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
              Contract Functions ({contractData.functions.length})
            </h3>
            <div className="space-y-3">
              {contractData.functions.map((func, index) => {
                const theme = getFunctionMutabilityTheme(func.stateMutability);
                
                return (
                  <motion.div
                    key={func.signature}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${theme.border} ${theme.bg} hover:${theme.bg.replace('/20', '/30')}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedFunction(func)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono font-semibold text-white text-lg">
                            {func.name}
                          </span>
                          <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${theme.color} ${theme.bg} ${theme.border} border`}>
                            {func.stateMutability}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {func.visibility}
                          </span>
                        </div>
                        <div className="font-mono text-sm text-gray-300 mb-2">
                          {func.signature}
                        </div>
                        {func.documentation && (
                          <p className="text-sm text-gray-400">{func.documentation}</p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </MatrixCard>
        )}
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <MatrixCard className="p-6">
            <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
              Contract Events ({contractData.events.length})
            </h3>
            <div className="space-y-3">
              {contractData.events.map((event, index) => (
                <motion.div
                  key={event.signature}
                  className="border border-gray-600 rounded-lg p-4 bg-black/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono font-semibold text-white text-lg">
                      {event.name}
                    </span>
                    <span className="px-2 py-1 text-xs font-mono uppercase rounded text-purple-400 bg-purple-900/20 border border-purple-400/40">
                      EVENT
                    </span>
                  </div>
                  <div className="font-mono text-sm text-gray-300 mb-2">
                    {event.signature}
                  </div>
                  {event.documentation && (
                    <p className="text-sm text-gray-400">{event.documentation}</p>
                  )}
                  <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-1">Parameters:</div>
                    <div className="space-y-1">
                      {event.inputs.map((input, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs font-mono">
                          <span className="text-cyan-400">{input.type}</span>
                          <span className="text-white">{input.name}</span>
                          {input.indexed && (
                            <span className="text-yellow-400 bg-yellow-900/20 px-1 rounded">indexed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </MatrixCard>
        )}
        
        {/* Source Code Tab */}
        {activeTab === 'source' && contractData.sourceCode && (
          <MatrixCard className="p-6">
            <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">Source Code</h3>
            <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
              <pre 
                className="text-sm font-mono text-gray-300 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightSolidity(contractData.sourceCode.sourceCode)
                }}
              />
            </div>
          </MatrixCard>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && showTransactionHistory && (
          <MatrixCard className="p-6">
            <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
              Recent Transactions ({transactionLogs.length})
            </h3>
            <div className="space-y-3">
              {transactionLogs.slice(0, 10).map((tx, index) => {
                const statusTheme = getTransactionStatusTheme(tx.status);
                
                return (
                  <motion.div
                    key={tx.id}
                    className="border border-gray-600 rounded-lg p-4 bg-black/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-white">{tx.functionName}</span>
                        <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${statusTheme.color} ${statusTheme.bg}`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hash:</span>
                          <code className="text-cyan-400">{formatAddress(tx.transactionHash)}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Block:</span>
                          <span className="text-white">{tx.blockNumber.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Used:</span>
                          <span className="text-white">{tx.gasUsed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Price:</span>
                          <span className="text-white">{tx.gasPrice} Gwei</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </MatrixCard>
        )}
        
        {/* Event Logs Tab */}
        {activeTab === 'logs' && showEventLogs && (
          <MatrixCard className="p-6">
            <h3 className="text-xl font-mono font-bold text-cyan-400 mb-4">
              Event Logs ({eventLogs.length})
            </h3>
            <div className="space-y-3">
              {eventLogs.slice(0, 10).map((log, index) => (
                <motion.div
                  key={log.id}
                  className="border border-gray-600 rounded-lg p-4 bg-black/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-white">{log.eventName}</span>
                      <span className="px-2 py-1 text-xs font-mono uppercase rounded text-purple-400 bg-purple-900/20">
                        EVENT
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction:</span>
                      <code className="text-cyan-400">{formatAddress(log.transactionHash)}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block:</span>
                      <span className="text-white">{log.blockNumber.toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-400 mb-1">Parameters:</div>
                      <div className="space-y-1">
                        {Object.entries(log.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs font-mono">
                            <span className="text-cyan-400">{key}:</span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </MatrixCard>
        )}
      </MatrixTransition>
      
      {/* Function Detail Modal */}
      <AnimatePresence>
        {selectedFunction && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFunction(null)}
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
                  {selectedFunction.name}
                </h3>
                <button
                  onClick={() => setSelectedFunction(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono font-semibold text-white mb-2">Signature</h4>
                  <code className="text-cyan-400 bg-black/50 p-2 rounded block">{selectedFunction.signature}</code>
                </div>
                
                <div>
                  <h4 className="font-mono font-semibold text-white mb-2">Properties</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Mutability:</span>
                      <span className="text-white ml-2">{selectedFunction.stateMutability}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Visibility:</span>
                      <span className="text-white ml-2">{selectedFunction.visibility}</span>
                    </div>
                  </div>
                </div>
                
                {selectedFunction.inputs.length > 0 && (
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Input Parameters</h4>
                    <div className="space-y-2">
                      {selectedFunction.inputs.map((input, i) => (
                        <div key={i} className="flex items-center space-x-3 text-sm">
                          <span className="text-cyan-400 font-mono">{input.type}</span>
                          <span className="text-white font-mono">{input.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedFunction.outputs.length > 0 && (
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Return Values</h4>
                    <div className="space-y-2">
                      {selectedFunction.outputs.map((output, i) => (
                        <div key={i} className="flex items-center space-x-3 text-sm">
                          <span className="text-cyan-400 font-mono">{output.type}</span>
                          <span className="text-white font-mono">{output.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedFunction.documentation && (
                  <div>
                    <h4 className="font-mono font-semibold text-white mb-2">Documentation</h4>
                    <p className="text-gray-300">{selectedFunction.documentation}</p>
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