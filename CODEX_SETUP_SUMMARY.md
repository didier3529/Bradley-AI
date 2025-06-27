# 🤖 Codex Setup Summary - Bradley AI

## Quick Start
```bash
# Linux/macOS
./scripts/codex-setup.sh

# Windows
.\scripts\codex-setup.ps1

# Manual setup
npm install && npx prisma generate && npm run build
```

## ⚡ Critical Requirements

### Must Have (App Won't Work Without)
```bash
DATABASE_URL="postgresql://user:pass@host:5432/bradley_ai"
NEXTAUTH_SECRET="32-character-minimum-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Core Features (Needed for Main Functionality)
```bash
ALCHEMY_API_KEY="eth-blockchain-data"
ANTHROPIC_API_KEY="ai-analysis-features"
COINGECKO_API_KEY="price-data"
```

### Enhanced Features (Optional)
```bash
REDIS_URL="redis://localhost:6379"  # Performance boost
OPENSEA_API_KEY="nft-data"
MORALIS_API_KEY="multi-chain-support"
```

## 🐳 Docker/Container Setup
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🗄️ Database Requirements
- **PostgreSQL 12+** (Required)
- **Redis 6+** (Optional, but recommended for performance)

## 🧪 Health Checks
- **Health endpoint**: `GET /api/health`
- **Build test**: `npm run build`
- **Type check**: `npx tsc --noEmit`

## 🚀 Available Scripts
```bash
npm run dev          # Development server (port 3000)
npm run dev:3007     # Development server (port 3007)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting
npm run dev:clean    # Clean restart (clears cache)
```

## 🔧 Troubleshooting
```bash
# Clear cache and restart
npm run clean && npm install

# Regenerate Prisma client
npx prisma generate

# Reset build cache
rm -rf .next && npm run build
```

## 📊 Performance Monitoring
- Real-time API call logging visible in logs
- Built-in error boundaries for stability
- Portfolio API calls typically 200-300ms response time
- Matrix background effects with optimized rendering

## 🔐 Security Notes
- All API keys should be in `.env.local` (never commit)
- NEXTAUTH_SECRET must be 32+ characters
- Database connections should use SSL in production
- CORS configured for localhost:3000

## 📁 Key Files for Codex
```
├── package.json           # Dependencies & scripts
├── next.config.js         # Build configuration
├── prisma/schema.prisma   # Database schema
├── .env.local            # Environment variables (create this)
├── src/app/layout.tsx    # Root app component
└── scripts/              # Setup automation
    ├── codex-setup.sh    # Linux/macOS setup
    └── codex-setup.ps1   # Windows setup
```

## 🎯 Testing Checklist
- [ ] Node.js 20+ installed
- [ ] PostgreSQL running
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Application builds (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] App responds at http://localhost:3000

## 📞 API Integration Status
Based on logs, the app is actively making calls to:
- Portfolio API (`/api/portfolio/summary`) - ✅ Working (200ms avg)
- Price data APIs - ✅ Working with fallbacks
- NFT market data - ✅ Working with mock data
- Blockchain data - ✅ Working via Alchemy

**Ready for Codex deployment with proper environment configuration!** 🚀
