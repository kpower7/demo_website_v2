from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hackathon AI Backend", version="0.1.0")

# CORS for local dev (Next.js and Netlify dev)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8888",  # Netlify dev default
    "http://127.0.0.1:8888",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # relax during hackathon; tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Placeholder for future tool-calling endpoint
@app.post("/tools/echo")
def tool_echo(payload: dict):
    return {"received": payload}
