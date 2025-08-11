# MIT TPP Demo Website v2 — Real‑time Voice Agent + MLB/News/YouTube Tools

This project is a Next.js 15 site deployed on Netlify with:
- ElevenLabs real-time Agent (WebSocket) for full‑duplex voice chat at `/voice`
- Netlify Function broker for ElevenLabs signed WS URL: `/.netlify/functions/elevenSignedUrl`
- Netlify Function proxies for FastAPI tools: `toolsCheckSchedule`, `toolsNews`, `toolsYoutube`, `toolsCompareStats`, `toolsTeamIntelligence`
- FastAPI backend providing tool endpoints with token-based auth

Recent backend highlights:
- MLB stats now use `/api/v1/teams/stats` (filtered by `team.id`) with fallbacks to `/teams/{teamId}/stats` and hydrate; timezone handling fixed.
- News and YouTube tools stabilized (NEWS_API_KEY name, `youtube-search-python` + httpx pin; graceful fallbacks).

Quick links:
- Voice page: `/voice`
- Netlify Functions path (prod/dev): `/.netlify/functions/*`
- Example tool calls: `/.netlify/functions/toolsCompareStats`, `toolsNews`, `toolsYoutube`

Environment variables
- Frontend/Functions (Netlify):
  - `ELEVEN_API_KEY` — ElevenLabs API key
  - `ELEVEN_AGENT_ID` — ElevenLabs Agent ID
  - `TOOL_TOKEN` — shared secret added by functions to `x-tool-token`
  - `BACKEND_BASE_URL` — FastAPI base URL (e.g., `http://127.0.0.1:8001` for local dev, your deployed backend in production)
- Backend (`backend/.env`):
  - `TOOL_TOKEN` — must match the Netlify value
  - `NEWS_API_KEY`
  - `YOUTUBE_API_KEY`

Local development (Windows PowerShell)
1) Backend
```powershell
cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2\backend"
python -m venv .venv
 .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```
2) Frontend + Netlify Functions
```powershell
cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2"
npm install
netlify dev
# For remote testing via live tunnel:
#npx netlify-cli@latest dev --live
# netlify dev --live
```
Dev URLs
- Site: http://localhost:8888
- Voice agent: http://localhost:8888/voice
- Backend docs: http://127.0.0.1:8001/docs

Deployment (Netlify)
1) Make sure the repo is linked: `netlify link` (or `netlify init`)
2) In Netlify dashboard, set env vars: `ELEVEN_API_KEY`, `ELEVEN_AGENT_ID`, `TOOL_TOKEN`, `BACKEND_BASE_URL`
3) Push to `main` to trigger deploy. Netlify Functions will forward to `BACKEND_BASE_URL` and add `x-tool-token`.

API testing examples (PowerShell)
```powershell
$base = "https://<your-site>.netlify.app/.netlify/functions"
$headers = @{ "Content-Type" = "application/json" }

# Compare team stats
$body = @{ team1 = "Yankees"; team2 = "Red Sox"; season = 2024 } | ConvertTo-Json -Compress
Invoke-RestMethod -Method POST -Uri "$base/toolsCompareStats" -Headers $headers -Body $body

# News
$body = @{ team = "Yankees"; days_back = 7; max_results = 5 } | ConvertTo-Json -Compress
Invoke-RestMethod -Method POST -Uri "$base/toolsNews" -Headers $headers -Body $body

# YouTube
$body = @{ query = "Yankees highlights analysis"; max_results = 5 } | ConvertTo-Json -Compress
Invoke-RestMethod -Method POST -Uri "$base/toolsYoutube" -Headers $headers -Body $body
```

Troubleshooting notes
- If `/.netlify/functions/eleven-signed-url` 404s, use the alias `/.netlify/functions/elevenSignedUrl`.
- For PowerShell object tables that look empty, pipe to JSON to see nested values:
  `... | ConvertTo-Json -Depth 8`
- Ensure `NEWS_API_KEY` (not `NEWSAPI_KEY`) and `youtube-search-python` + compatible `httpx` are installed.
- For local dev live URL tool-calling, run `netlify dev --live` while the backend runs on 127.0.0.1:8001.

Project structure (high level)
- `src/app/voice/page.tsx` — ElevenLabs voice chat UI (push-to-talk, playback, theme-aligned)
- `netlify/functions/` — `elevenSignedUrl.ts`, tools proxies (`toolsCheckSchedule.ts`, etc.)
- `backend/` — FastAPI app (`main.py`), services (`mlb_service.py`, `news_service.py`, `youtube_service.py`, `config.py`)

---
## 🚀 Quick Start (AI Hackathon Template)

These instructions run the Next.js site with Netlify Functions and the ElevenLabs real-time voice agent locally, and (optionally) start the FastAPI backend scaffold.

### Prerequisites
- Node.js 18+
- Python 3.10+ (for the optional FastAPI backend)
- Netlify CLI (recommended): `npm i -g netlify-cli`

### Environment
Create a `.env` file in the project root:
```
ELEVEN_API_KEY=your_elevenlabs_api_key
ELEVEN_AGENT_ID=your_elevenlabs_agent_id
# Optional (client-side convenience): used by /voice page in dev
NEXT_PUBLIC_ELEVEN_AGENT_ID=your_elevenlabs_agent_id
```

### Running Locally (Windows PowerShell)

#### Terminal 1 — Optional: FastAPI Backend
```powershell
cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

#### Terminal 2 — Frontend + Netlify Functions
```powershell
cd "C:\Users\k_pow\OneDrive\Documents\MIT\MIT TPP\demo_website_v2\demo_website_v2"
npm install
npx netlify-cli@latest dev
#npx netlify-cli@latest dev --live
# If npx has cache/permission issues, install globally once:
# npm i -g netlify-cli && netlify dev
```

### Access Points
- Site: http://localhost:8888
- Voice coach (real-time): http://localhost:8888/voice
- Backend health (optional): http://127.0.0.1:8001/health

### Troubleshooting
- Socket error (WinError 10013): bind to `--host 127.0.0.1` and use a different port (`--port 8001`).
- npx EPERM/ECONNRESET: clear `"$env:LOCALAPPDATA\npm-cache\_npx"` or install `netlify-cli` globally.

**Last Updated**: August 2025  
**Version**: 1.0.0  
**Compatibility**: Python 3.8+, Node.js 18+
