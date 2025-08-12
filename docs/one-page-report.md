# MLB Real‑Time Voice + Betting Assistant — Technical One‑Pager

## 1. Challenge Tackled
**Problem:** Baseball fans need quick, intelligent analysis for betting decisions but face fragmented data across multiple apps and websites. Traditional sports platforms lack conversational AI that synthesizes schedule, stats, injuries, and analysis into actionable betting insights.

**User:** Baseball fans, casual bettors, and fantasy players who want data-driven betting guidance without manual research across multiple sources.

## 2. Tools / ML Models Used
- **ElevenLabs Agent (GPT-5)** – Real-time voice reasoning and tool orchestration
- **FastAPI** – Backend API framework with 5 specialized tool endpoints
- **MLB Stats API** – Live schedule data and team statistics
- **NewsAPI** – Injury updates and roster news
- **YouTube Data API v3** – Recent analysis and highlight content
- **Next.js + Tailwind** – Frontend UI and voice integration
- **Netlify Functions** – Secure tool proxy and WebSocket broker

## 3. What Worked Well
- **Sub-second voice responses** with full-duplex audio via ElevenLabs Agent platform
- **Intelligent tool chaining** – agent automatically calls schedule → compare_stats when analyzing matchups
- **Robust data integration** – 5 specialized endpoints delivering schedule, stats, news, YouTube, and team intelligence
- **Production-grade security** – token authentication, environment secrets, proxy architecture
- **Betting guidance system** – transparent "lean/pass" recommendations with confidence levels based on real metrics

## 4. What Was Challenging
- **Timezone handling** – MLB API returned naive datetimes causing comparison errors; fixed by normalizing all times to UTC-aware
- **YouTube API reliability** – Initial dependency conflicts with httpx versions; resolved by pinning httpx to >=0.24.1,<0.25
- **MLB stats data structure** – API responses varied by team/season; added robust scanning of splits with multiple fallback paths
- **Real-time voice latency** – Needed sub-second responses; optimized by minimizing tool calls and intelligent chaining logic
- **Security architecture** – Required hiding backend URLs while maintaining auth; solved with Netlify Function proxy layer

## 5. How You Spent Your Time
**Solo 24-hour build approach:**
- **0–4h:** Research ElevenLabs Agent platform, design voice + tool architecture
- **4–10h:** FastAPI backend development – 5 tool endpoints, MLB/News/YouTube integration
- **10–16h:** Netlify Functions proxy layer, authentication, CORS handling
- **16–20h:** Frontend voice UI, ElevenLabs React SDK integration, WebSocket broker
- **20–22h:** Production deployment (Netlify + Render), environment configuration
- **22–24h:** Bug fixes (timezone, dependencies), betting prompt refinement, video creation

## Architecture Overview
```
Browser <-> Netlify (site + functions)
  ├─ ElevenLabs WS broker -> ElevenLabs Agent (GPT-5)
  └─ Tool proxies -> FastAPI backend -> MLB/NewsAPI/YouTube
```

## Production Deployment
- **Live site:** `https://live-ai-demo.netlify.app/voice/`
- **Frontend:** Netlify (Next.js + Functions)
- **Backend:** Render (FastAPI with 5 tool endpoints)
- **Security:** Token-based auth, environment secrets, proxy isolation
