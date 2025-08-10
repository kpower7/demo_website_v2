# Tech Demo Script (60s) — Implementation Walkthrough

Duration: 60 seconds
Format: screen capture + voiceover. Show repo, live site `/voice`, and API docs.

0–6s — Title + live URL
- On-screen: Project title and `live-ai-demo.netlify.app/voice`
- VO: “This is an MLB real‑time voice assistant with tool‑calling and a FastAPI backend.”

6–15s — Frontend + WS broker
- On-screen: `src/app/voice/page.tsx` and `netlify/functions/elevenSignedUrl.ts`
- VO: “The voice UI is Next.js with the ElevenLabs React SDK. A Netlify Function brokers a signed WebSocket URL using `ELEVEN_API_KEY`, so the client never sees secrets. Audio streams both ways with sub‑second latency.”

15–28s — Tool bridge via Netlify Functions
- On-screen: `netlify/functions/toolsCheckSchedule.ts` and `_lib/toolsProxy.ts`
- VO: “All tools are called through Netlify Functions. We inject `x-tool-token`, forward POST JSON to the backend, and return clean JSON. This isolates the backend, adds CORS/headers, and centralizes auth.”

28–44s — FastAPI backend
- On-screen: `backend/main.py` and `/docs`
- VO: “The backend exposes `/tools/*`: `check_schedule`, `compare_stats`, `news`, `youtube`, and `team_intelligence`. Services include `mlb_service.py`, `news_service.py`, `youtube_service.py`, and `sports_data_service.py`. Settings come from `config.py` with `.env` loading.”

44–54s — Reliability + security
- On-screen: commits showing fixes
- VO: “We normalized datetimes to UTC to fix schedule edge cases, pinned dependencies for YouTube/httpx, and added safe fallbacks. Secrets stay in environment variables: `TOOL_TOKEN`, `ELEVEN_API_KEY`, `NEWS_API_KEY`, optional `YOUTUBE_API_KEY`.”

54–60s — Deployment
- On-screen: Netlify dashboard and Render service
- VO: “Netlify serves the site and Functions; FastAPI runs on Render. Netlify uses `BACKEND_BASE_URL` to reach the backend. The result is a fast, secure, production‑ready voice agent with concise scouting and betting leans.”
