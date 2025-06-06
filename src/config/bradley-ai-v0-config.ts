/**
 * Bradley AI v0 Integration Configuration
 * Defines seamless integration between v0 frontend and Bradley AI backend
 * Context: Cursor Settings.json + Bradley AI Architecture
 */

export const bradleyAIV0Config = {
    // Backend Integration Settings (PRESERVE EXISTING)
    backend: {
        api: {
            baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
            endpoints: {
                crypto: '/market/trends',
                portfolio: '/portfolio/summary',
                nft: '/nft/collections',
                aiAnalysis: '/ai/analyze'
            },
            authentication: {
                type: 'jwt',
                walletConnection: true,
                sessionTimeout: 3600
            }
        },

        stateManagement: {
            zustand: {
                stores: ['useStore', 'useErrorStore'],
                selectors: {
                    crypto: '(state) => state.crypto',
                    portfolio: '(state) => state.portfolio',
                    nft: '(state) => state.nft'
                }
            },

            tanstackQuery: {
                hooks: ['useMarketTrends', 'usePortfolio', 'useNFTData'],
                cacheTime: 300000, // 5 minutes
                staleTime: 60000   // 1 minute
            }
        },

        realTime: {
            websocket: {
                url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
                channels: ['cryptoUpdates', 'portfolioUpdates', 'nftUpdates'],
                reconnectAttempts: 5
            }
        }
    },

    // v0 Integration Mapping
    v0Integration: {
        componentMapping: {
            // Map v0 components to Bradley AI data sources
            'v0-crypto-table': {
                dataSource: 'useMarketTrends()',
                stateSelector: 'useStore((state) => state.crypto)',
                websocketChannel: 'cryptoUpdates',
                features: ['realTimeUpdates', 'sorting', 'filtering', 'bullishBearish'],
                preserveFeatures: true
            },

            'v0-portfolio-card': {
                dataSource: 'usePortfolio()',
                stateSelector: 'useStore((state) => state.portfolio)',
                websocketChannel: 'portfolioUpdates',
                features: ['liveBalance', 'assetBreakdown', 'performance', 'aiInsights'],
                preserveFeatures: true
            },

            'v0-nft-grid': {
                dataSource: 'useNFTData()',
                stateSelector: 'useStore((state) => state.nft)',
                websocketChannel: 'nftUpdates',
                features: ['floorPrice', 'volume', 'collections', 'trending'],
                preserveFeatures: true
            },

            'v0-market-stats': {
                dataSource: 'useMarketTrends()',
                stateSelector: 'useStore((state) => state.globalStats)',
                websocketChannel: 'marketUpdates',
                features: ['marketCap', 'volume', 'sentiment', 'indicators'],
                preserveFeatures: true
            }
        },

        // Data transformation layer
        dataTransformers: {
            // Transform Bradley AI data format to v0 expected format
            bradleyToV0: {
                crypto: (bradleyData: any) => ({
                    // Transform crypto data while preserving all features
                    symbol: bradleyData.symbol,
                    price: bradleyData.price_usd,
                    change24h: bradleyData.delta_24h,
                    volume: bradleyData.volume,
                    marketCap: bradleyData.cap,
                    status: bradleyData.status, // BULLISH/BEARISH
                    // Preserve all additional Bradley AI fields
                    ...bradleyData
                }),

                portfolio: (bradleyData: any) => ({
                    // Transform portfolio data while preserving all features
                    totalValue: bradleyData.totalValue,
                    assets: bradleyData.holdings,
                    performance: bradleyData.performance,
                    aiInsights: bradleyData.aiAnalysis,
                    // Preserve all additional Bradley AI fields
                    ...bradleyData
                }),

                nft: (bradleyData: any) => ({
                    // Transform NFT data while preserving all features
                    collections: bradleyData.collections,
                    floorPrices: bradleyData.floorPrices,
                    volume24h: bradleyData.volume24h,
                    trending: bradleyData.trending,
                    // Preserve all additional Bradley AI fields
                    ...bradleyData
                })
            }
        }
    },

    // Matrix Theme Integration for v0
    theme: {
        matrixDesignSystem: {
            // Reference existing design tokens
            designTokensPath: 'src/styles/design-tokens.ts',

            // v0 theme overrides to match Matrix aesthetic
            v0Overrides: {
                colors: {
                    primary: 'var(--matrix-cyber-blue)',      // #00d4ff
                    secondary: 'var(--matrix-green)',         // #00ff41
                    background: 'var(--matrix-black)',        // #000000
                    surface: 'var(--matrix-bg-dark)',         // #1a1a1a
                    accent: 'var(--matrix-green-light)',      // #39ff74
                    text: {
                        primary: '#ffffff',
                        secondary: '#b3b3b3',
                        accent: 'var(--matrix-cyber-blue)'
                    }
                },

                effects: {
                    glow: {
                        small: '0 0 5px rgba(0, 212, 255, 0.5)',
                        medium: '0 0 15px rgba(0, 212, 255, 0.4)',
                        large: '0 0 25px rgba(0, 212, 255, 0.3)'
                    },

                    glassMorphism: {
                        background: 'rgba(0, 212, 255, 0.05)',
                        border: 'rgba(0, 212, 255, 0.2)',
                        backdropFilter: 'blur(10px) saturate(180%)'
                    },

                    animations: {
                        matrixRain: 'preserve existing WebGL implementation',
                        hover: 'smooth cyber glow transitions',
                        loading: 'Matrix-style digital effects'
                    }
                },

                typography: {
                    fontFamily: {
                        mono: '"Fira Code", "Consolas", "Monaco", monospace',
                        display: '"Orbitron", "Exo 2", sans-serif',
                        body: '"Inter", "Segoe UI", sans-serif'
                    },

                    glowText: {
                        textShadow: '0 0 10px var(--matrix-green)',
                        color: 'var(--matrix-green)'
                    }
                }
            }
        },

        // Preserve existing Matrix effects
        preserveEffects: {
            matrixRain: {
                component: 'src/components/effects/matrix-rain-webgl.tsx',
                preserve: true,
                performance: '60fps',
                integration: 'background layer behind v0 components'
            },

            glowEffects: {
                preserve: true,
                applyToV0: true,
                intensity: 'medium'
            },

            glassMorphism: {
                preserve: true,
                applyToV0Cards: true,
                blur: '10px'
            }
        }
    },

    // Performance Requirements
    performance: {
        targets: {
            fps: 60,
            bundleSize: 'maintain current size',
            memoryUsage: 'stable',
            loadTime: 'no degradation'
        },

        optimization: {
            matrixEffects: 'preserve WebGL performance',
            v0Components: 'optimize for Matrix theme integration',
            webSocket: 'maintain real-time responsiveness',
            animations: 'smooth 60fps transitions'
        }
    },

    // Quality Assurance
    qa: {
        integration: {
            backendPreservation: 'all existing APIs unchanged',
            stateManagement: 'Zustand and TanStack Query intact',
            realTimeData: 'WebSocket functionality preserved',
            features: 'crypto, NFT, portfolio features unchanged'
        },

        testing: {
            unit: 'test v0 component integration',
            integration: 'test backend data flow',
            e2e: 'test full user workflows',
            performance: 'benchmark Matrix effects + v0 components'
        },

        rollback: {
            strategy: 'component-level rollback capability',
            backupPoints: 'before each integration phase',
            validation: 'automated testing before deployment'
        }
    },

    // Development Workflow
    development: {
        // Use Cursor settings.json optimizations
        cursorOptimizations: {
            aiContext: 'maximum context awareness',
            fileAssociations: 'Bradley AI + v0 file types',
            todoTracking: 'v0 integration specific tags',
            codeAnalysis: 'TypeScript + Bradley AI stack validation'
        },

        fileStructure: {
            v0Components: 'src/components/v0-integration/',
            adapters: 'src/lib/v0-integration/',
            tests: 'src/__tests__/v0-integration/',
            config: 'src/config/v0-backend-integration-map.ts'
        },

        dependencies: {
            // Use exact Bradley AI versions for compatibility
            preserve: [
                'zustand@^5.0.7',
                '@tanstack/react-query@^5.62.7',
                'framer-motion@^12.15.0',
                '@react-three/fiber@^8.18.5',
                'three@^0.172.0'
            ],

            add: [
                // Only add v0-specific dependencies if absolutely necessary
                // Prefer using existing Bradley AI component library
            ]
        }
    }
} as const;

// Type definitions for v0 integration
export interface V0BradleyAdapter {
    v0ComponentName: string;
    bradleyDataSource: keyof typeof bradleyAIV0Config.v0Integration.componentMapping;
    preserveFeatures: boolean;
    applyMatrixTheme: boolean;
    maintainPerformance: boolean;
}

export interface BackendIntegrationGuard {
    validateDataFlow: (componentName: string) => boolean;
    preserveWebSockets: () => boolean;
    maintainStateIntegrity: () => boolean;
    ensureTypeCompatibility: (v0Props: any, bradleyData: any) => boolean;
}

export default bradleyAIV0Config; 