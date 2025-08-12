# Project Summary

**The Problem:** Baseball fans struggle to quickly analyze matchups, track injuries, and make informed betting decisions. Traditional sports apps require navigating multiple screens and lack real-time conversational intelligence that synthesizes schedule, stats, news, and analysis into actionable insights.

**What I Built:** A real-time MLB voice assistant that speaks, analyzes, and provides clear betting info in seconds. Users simply talk to the agent at `/voice` and receive spoken responses with concise scouting reports and transparent betting guidance (lean + confidence level). The system combines ElevenLabs' GPT-5 Agent platform with a secure FastAPI backend delivering five specialized tools: schedule checking, team stats comparison, injury/news updates, YouTube analysis search, and comprehensive team intelligence.

**Who Benefits:** Baseball fans, casual bettors, and fantasy players who want fast, data-driven insights without manual research. The voice interface makes it accessible while driving or multitasking, while the betting leans provide educational guidance for smarter decisions.

**What Works Today:** The production system delivers sub-second voice responses, real-time schedule data, team stat comparisons, recent news integration, and YouTube content discovery. The betting layer provides transparent "lean/pass" recommendations with confidence indicators based on hitting metrics (AVG/OBP/SLG), pitching stats (ERA/WHIP/K), injuries, and recent form. Security is production-grade with token authentication, environment-based secrets, and a robust proxy architecture.

**Impact:** Transforms hours of manual research into seconds of conversational intelligence, enabling fans to make informed decisions.
