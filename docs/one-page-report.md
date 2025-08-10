# MLB Real‑Time Voice + Betting Assistant — Technical One‑Pager

## Overview
A production‑ready MLB assistant that speaks, analyzes matchups, and provides concise betting leans. The web UI (Next.js) connects to an ElevenLabs Agent over WebSocket via a Netlify Function broker. All baseball intelligence (schedule, stats comparisons, news, YouTube) is served by a FastAPI backend and accessed by the agent through Netlify Function proxies with token authentication. The system is optimized for short, actionable replies and minimal tool calls.

## Architecture
- Frontend: Next.js (app router) at `/voice` with the ElevenLabs React SDK.
- Real‑time voice: ElevenLabs Agent (GPT‑5) + signed WS URL from Netlify Function `netlify/functions/elevenSignedUrl.ts` using `ELEVEN_API_KEY`.
- Tool bridge: Netlify Functions proxy POST requests to the backend and inject `x-tool-token` for auth.
- Backend: FastAPI (`backend/`) exposes `/tools/*` endpoints and integrates MLB stats, NewsAPI, and YouTube search.
- Deployment: Netlify (site + functions), Render (or similar) for FastAPI.

```
Browser <-> Netlify (site)
  ├─ ElevenLabs WS broker -> ElevenLabs Agent (audio I/O)
  └─ Tools (Functions) -> FastAPI backend -> MLB/NewsAPI/YouTube
```

## Key Components (paths)
- Frontend page: `src/app/voice/page.tsx`
- WS broker: `netlify/functions/elevenSignedUrl.ts`
- Tool proxies: `netlify/functions/tools*.ts` → `_lib/toolsProxy.ts`
- Backend app: `backend/main.py`
- Services: `backend/mlb_service.py`, `backend/news_service.py`, `backend/youtube_service.py`, `backend/sports_data_service.py`

## Tool Endpoints (contracts)
- `check_schedule` → next game + schedule window. Inputs: `team`, `days`, optional `from_iso`.
- `compare_stats` → season team vs team (hitting: AVG/OBP/SLG, R, HR; pitching: ERA/WHIP/K).
- `news` → recent articles (NewsAPI). Inputs: `team`, `days_back`, `max_results`.
- `youtube` → recent analysis/highlights. Inputs: `query` or `team`, `max_results`.
- `team_intelligence` → compact scouting report from News + YouTube.
All endpoints require header `x-tool-token` and accept body `tool_token` for redundancy; POST JSON only.

## Security & Privacy
- Secrets in environment variables only: `TOOL_TOKEN`, `ELEVEN_API_KEY`, `NEWS_API_KEY`, `YOUTUBE_API_KEY`.
- Netlify Functions are the only public tool URLs; backend URL is private behind the proxy.
- CORS controlled at the proxy; tokens never rendered in user UI.

## Reliability & Quality
- Timezone‑aware scheduling (UTC) to avoid naive/aware datetime errors.
- YouTube: pinned dependencies and safe fallback search; sorts by recency.
- MLB stats: robust scanning of splits; fallback paths when an API variant changes.
- Graceful empty states with actionable guidance (e.g., increase `days_back`).

## Performance
- Minimize tool calls; chain only when it adds value (e.g., schedule → compare_stats).
- Functions are stateless and fast; backend endpoints are lightweight with selective fields.
- Audio is streamed by ElevenLabs for low latency.

## Betting Layer
- The agent provides “leans” (side/total or pass) with low/medium/high confidence.
- Grounds decisions in: schedule context, injuries/news, hitting/pitching metrics, and rest/home‑away splits.
- No odds scraping; if the user supplies a line/price, incorporate it. Always include a brief disclaimer.

## Deployment
- Netlify site URL (prod): `https://live-ai-demo.netlify.app/`
- Function base: `https://live-ai-demo.netlify.app/.netlify/functions/`
- Backend base: set via `BACKEND_BASE_URL` in Netlify; backend hosts `TOOL_TOKEN`, `NEWS_API_KEY`, `YOUTUBE_API_KEY`.
- Start commands: Netlify (auto); FastAPI `uvicorn main:app --host 0.0.0.0 --port ${PORT}`.

## Environment Variables
- Netlify: `BACKEND_BASE_URL`, `TOOL_TOKEN` (secret), `ELEVEN_API_KEY` (secret), optional `ELEVEN_AGENT_ID`.
- Backend host: `TOOL_TOKEN`, `NEWS_API_KEY`, optional `YOUTUBE_API_KEY`.

## Limitations & Future Work
- No live odds provider; integrate a lines API for price‑aware EV suggestions.
- Add player props tools, injury projections, and park/weather factors.
- Cache recent tool results to reduce latency and quota usage.

## Links
- Live: `https://live-ai-demo.netlify.app/voice/`
- GitHub: <repo URL>
- API docs: `<BACKEND_BASE_URL>/docs`
