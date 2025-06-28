# Bradley AI – Free‑Tier “Gem Scanner + Social Sentiment” PRD  
**Author:** Senior Dev  
**Revision:** v1.0 (2025-06-28)  

---

## 1. Vision  

Ship an **MVP** that surfaces newly‑launched tokens (“gems”) and real‑time social buzz **without spending a cent on external APIs**.  
Focus on *speed to usable insights*; add depth later.

---

## 2. Guiding Principles  

1. **Keep it simple first** – only two widgets, one aggregated score.  
2. **Cache > Call** – hit free APIs sparingly, rely on Redis.  
3. **Growth‑ready** – every endpoint & schema extensible for new chains / paid tiers.

---

## 3. Scope & Phases  

| Phase | Timeline | Deliverables | Complexity |
|-------|----------|--------------|------------|
| **0 (MVP)** | 7 days | • Top‑10 fresh tokens table<br>• Overall market mood dial<br>• 30‑sec auto‑refresh | 🟢 Low |
| **1 (Plus)** | +7 days | • GemScore calc job<br>• Risk flags (GoPlus)<br>• Trending social tab | 🟡 Medium |
| **2 (Pro)** | later | • Watch‑list push alerts<br>• AI prompt summaries<br>• Historical charts | 🔵 High |

We are implementing **Phase 0** in this PRD.

---

## 4. Functional Requirements (Phase 0)  

### 4.1 Data Inputs  

| Metric | Free API | Endpoint | Freq |
|--------|----------|----------|------|
| New token pairs (EVM) | DexScreener | `/latest/dex/pairs/{chain}?new=1&limit=50` | 30 s |
| Volume / price / liq | DexScreener WS | `wss://streams.dexscreener.com` | real‑time |
| Market Fear & Greed | Alternative.me | `/fng/?limit=1` | 4 h |
| Token social volume | LunarCrush | `/v4?data=assets&symbol=BTC...` | 60 s (cache) |

*(All quotas stay inside free tiers.)*

### 4.2 Backend Flow  

```mermaid
graph LR
Scheduler -->|REST + WS| PairFetcher
PairFetcher --> Redis[(Redis 5 min)]
NextAPI[/api/gems/top] --> Redis
NextAPI --> CursorFrontend
```

* Scheduler = Vercel Cron every 30 s.  
* PairFetcher adds `inserted_at` timestamp → keeps only last 4 h in Redis.

### 4.3 API Design  

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| **GET** | `/api/gems/top` | `limit` (default 10) | Returns newest tokens sorted by `inserted_at` |
| **GET** | `/api/market/mood` | — | Returns `{{ "score": 58, "classification": "Bullish" }}` |

### 4.4 Front‑End Behaviour  

* **Table**: shows *Name, Chain, Price, 24 h %*, updates via SWR every 15 s.  
* **Mood Dial**: radial gauge; transitions when score changes ≥ 5.  
* Skeleton loaders for first paint (<500 ms).  

---

## 5. Non‑Functional Requirements  

| Area | Goal |
|------|------|
| Performance | p95 Next route ≤120 ms |
| Availability | 99 % (re‑serve cached data if API down) |
| Cost | < $5/mo (Redis 30 MB + Vercel Hobby) |
| Security | Server‑side env keys, no client exposure |
| DX | End‑to‑end TypeScript types; ESLint clean |

---

## 6. Tech Stack  

* **Next.js 15 / React 19** – SSR & API routes.  
* **Zustand** – client state.  
* **Redis v7 (Upstash free)** – 30 MB, 10k req/day.  
* **Vercel Cron** – 1 min jobs.  
* **Tailwind CSS** – existing design system.  

---

## 7. Step‑by‑Step Implementation Plan  

### Day 0  
1. Fork `bradley-ai` repo; create `feature/gem-scanner-mvp` branch.  
2. Install Redis client: `npm i ioredis @upstash/redis`.

### Day 1 – Backend Skeleton  
1. Add `/lib/redis.ts` (singleton).  
2. Scaffold `scripts/fetchNewPairs.ts` – pulls DexScreener, stores in Redis list `new_pairs`.  
3. Register job in `vercel.json` Cron: `*/0.5 * * * *`.

### Day 2 – API Routes  
1. `pages/api/gems/top.ts`:  
   ```ts
   const pairs = await redis.lrange('new_pairs', 0, limit - 1);
   res.json(JSON.parse('[' + pairs.join() + ']'));
   ```  
2. `pages/api/market/mood.ts`: fetch from Alternative.me, cache 4 h.

### Day 3 – Front‑End Components  
1. Create `<GemTable />` with SWR:  
   ```ts
   const { data } = useSWR('/api/gems/top', fetcher, { refreshInterval: 15000 });
   ```  
2. Create `<MoodDial />` using `@visx/visx`.  
3. Wire into existing dashboard layout.

### Day 4 – QA & Perf  
1. Run Lighthouse, fix any CLS / LCP hits.  
2. Add unit test `__tests__/gemApi.test.ts` with mocked Redis.

### Day 5 – Docs & Merge  
1. Update README (feature flag `NEXT_PUBLIC_ENABLE_GEM_SCANNER`).  
2. Create PR → review → squash.

---

## 8. Acceptance Criteria  

- **Data freshness**: table row appears ≤ 30 s after token launch (manual verify against DexScreener).  
- **No paid keys** in `.env`.  
- Build passes `pnpm lint && pnpm test && pnpm typecheck`.  
- Dashboard renders without runtime warnings.

---

## 9. Future Growth Path (Phase 1 + 2)  

| Upgrade | Unlocks | Effort |
|---------|---------|--------|
| Add GoPlus risk flags | Honeypot alerts | 2 pts |
| Compute GemScore | Better ranking | 3 pts |
| Sentiment trending tab | Cross‑asset hype | 3 pts |
| Web‑push alerts | Sticky users | 4 pts |
| Historical charts (TimescaleDB) | Strategy back‑test | 5 pts |

---

## 10. Glossary  

* **Gem:** token <30 days old & mcap < $5 M.  
* **FCP:** First Contentful Paint.  
* **Z‑Score:** Standard score vs peer set.  

---

> **Ready for implementation.**  
> Keep it lightweight now—grow once you’ve proven traction.
