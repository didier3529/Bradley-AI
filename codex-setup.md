# Bradley AI - Codex Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```bash
# =============================================================================
# Bradley AI Environment Configuration for Codex
# =============================================================================

# -----------------
# Core Application
# -----------------
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_BUILD_TIME=

# -----------------
# Database Configuration (PostgreSQL Required)
# -----------------
DATABASE_URL="postgresql://username:password@localhost:5432/bradley_ai?schema=public"

# -----------------
# Authentication (NextAuth.js)
# -----------------
NEXTAUTH_SECRET="your-super-secret-jwt-secret-here-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# -----------------
# Redis Cache (Optional but recommended for performance)
# -----------------
REDIS_URL="redis://localhost:6379"

# -----------------
# Blockchain & Crypto APIs (Core Features)
# -----------------
# Alchemy (Ethereum data) - Required for blockchain features
ALCHEMY_API_KEY="your_alchemy_api_key"

# CoinGecko (Price data) - Required for market data
COINGECKO_API_KEY="your_coingecko_api_key"

# DeFiLlama (DeFi protocols data) - Required for DeFi analytics
DEFILLAMA_API_KEY="your_defillama_api_key"

# OpenSea (NFT data) - Required for NFT features
OPENSEA_API_KEY="your_opensea_api_key"

# NFTPort (NFT data alternative) - Optional backup
NFTPORT_API_KEY="your_nftport_api_key"

# Moralis (Multi-chain data) - Required for multi-chain support
MORALIS_API_KEY="your_moralis_api_key"

# -----------------
# AI Services (Core AI Features)
# -----------------
# Anthropic Claude - Required for AI analysis
ANTHROPIC_API_KEY="your_anthropic_api_key"

# -----------------
# External Services (Optional)
# -----------------
# Twitter API (for social sentiment analysis)
TWITTER_API_KEY="your_twitter_api_key"
TWITTER_API_SECRET="your_twitter_api_secret"
TWITTER_BEARER_TOKEN="your_twitter_bearer_token"

# -----------------
# Development/Testing
# -----------------
# Enable debug logging
DEBUG="bradley:*"

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

## Setup Scripts

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb bradley_ai

# Push schema to database
npx prisma db push

# Optional: Seed database with initial data
npx prisma db seed
```

### 3. Development Server

```bash
# Standard development server
npm run dev

# Development server on port 3007
npm run dev:3007

# Clean restart (clears cache)
npm run dev:clean
```

### 4. Build and Test

```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Clean build (removes cache first)
npm run build:clean
```

## Required Services

### 1. PostgreSQL Database
- Version: 12.x or higher
- Required for user data, settings, and application state
- Configure connection string in `DATABASE_URL`

### 2. Redis (Optional but Recommended)
- Version: 6.x or higher
- Used for caching API responses and session data
- Improves performance significantly
- Configure connection string in `REDIS_URL`

### 3. Node.js
- Version: 20.x or higher (as specified in package.json)
- Required for Next.js runtime

## API Keys Required

### Critical (App won't function without these):
1. **ALCHEMY_API_KEY** - Get from [Alchemy](https://www.alchemy.com/)
2. **ANTHROPIC_API_KEY** - Get from [Anthropic](https://console.anthropic.com/)
3. **DATABASE_URL** - PostgreSQL connection string

### Important (Core features require these):
1. **COINGECKO_API_KEY** - Get from [CoinGecko](https://www.coingecko.com/en/api)
2. **OPENSEA_API_KEY** - Get from [OpenSea](https://docs.opensea.io/)
3. **MORALIS_API_KEY** - Get from [Moralis](https://moralis.io/)

### Optional (Enhanced features):
1. **DEFILLAMA_API_KEY** - Get from [DeFiLlama](https://defillama.com/docs/api)
2. **NFTPORT_API_KEY** - Get from [NFTPort](https://nftport.xyz/)
3. **TWITTER_API_KEY** - Get from [Twitter Developer](https://developer.twitter.com/)

## Codex-Specific Setup

### Container Configuration

```dockerfile
# Add this to your Dockerfile or use in Codex container setup
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Health Check Endpoint

The app includes health monitoring at `/api/health` for Codex to verify deployment status.

### Environment Validation

The app will validate required environment variables on startup and log missing configurations.

## Common Issues & Solutions

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Verify database exists

2. **API Key Issues**
   - Test API keys individually
   - Check rate limits
   - Verify key permissions

3. **Build Issues**
   - Clear cache: `npm run clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **Performance Issues**
   - Enable Redis caching
   - Configure REDIS_URL
   - Monitor API rate limits

## Monitoring & Debugging

- Application logs available in console
- Error tracking via built-in error boundaries
- Performance monitoring through Next.js analytics
- API response times logged for debugging

## Security Considerations

- All API keys should be kept secure
- NEXTAUTH_SECRET must be 32+ characters
- Database should use SSL in production
- Redis should use authentication in production
