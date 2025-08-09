from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import List, Optional

import requests

try:
    from youtube_transcript_api import (
        YouTubeTranscriptApi,
        TranscriptsDisabled,
        NoTranscriptFound,
        VideoUnavailable,
    )
except Exception:  # pragma: no cover
    YouTubeTranscriptApi = None  # type: ignore
    TranscriptsDisabled = NoTranscriptFound = VideoUnavailable = Exception  # type: ignore

try:
    from youtubesearchpython import VideosSearch  # fallback search without API key
except Exception:  # pragma: no cover
    VideosSearch = None

from config import settings

logger = logging.getLogger(__name__)


@dataclass
class VideoItem:
    video_id: str
    title: str
    url: str
    channel: Optional[str]
    view_count: Optional[int]


YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


def _parse_view_count(text: str | None) -> Optional[int]:
    if not text:
        return None
    text = text.lower().replace("views", "").strip()
    text = text.replace(",", "").strip()
    m = re.match(r"([0-9]*\.?[0-9]+)\s*([kmb])?", text)
    if m:
        num = float(m.group(1))
        suf = m.group(2)
        if suf == "k":
            num *= 1_000
        elif suf == "m":
            num *= 1_000_000
        elif suf == "b":
            num *= 1_000_000_000
        return int(num)
    digits = re.sub(r"[^0-9]", "", text)
    return int(digits) if digits else None


session = requests.Session()


def search_videos(query: str, max_results: int = 10, use_official_api: Optional[bool] = None) -> List[VideoItem]:
    """
    Search YouTube for videos related to `query` and return up to `max_results` items.
    Uses official API if YOUTUBE_API_KEY is present, else scraper fallback.
    """
    if use_official_api is None:
        use_official_api = bool(settings.youtube_api_key)

    items: List[VideoItem] = []

    if use_official_api and settings.youtube_api_key:
        params = {
            "part": "snippet",
            "type": "video",
            "maxResults": 25,
            "order": "viewCount",
            "q": query,
            "key": settings.youtube_api_key,
        }
        resp = session.get(YOUTUBE_SEARCH_URL, params=params, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        video_ids = [
            item.get("id", {}).get("videoId")
            for item in data.get("items", [])
            if item.get("id", {}).get("videoId")
        ]
        if not video_ids:
            return []
        # Fetch stats for reliable viewCount
        stats_items: List[VideoItem] = []
        for i in range(0, len(video_ids), 50):
            chunk = video_ids[i : i + 50]
            vparams = {
                "part": "snippet,statistics",
                "id": ",".join(chunk),
                "key": settings.youtube_api_key,
            }
            vresp = session.get(YOUTUBE_VIDEOS_URL, params=vparams, timeout=20)
            vresp.raise_for_status()
            vdata = vresp.json()
            for it in vdata.get("items", []):
                vid = it.get("id")
                snippet = it.get("snippet", {})
                stats = it.get("statistics", {})
                view_count = int(stats.get("viewCount")) if stats.get("viewCount") else None
                stats_items.append(
                    VideoItem(
                        video_id=vid,
                        title=snippet.get("title", "(untitled)"),
                        url=f"https://www.youtube.com/watch?v={vid}",
                        channel=snippet.get("channelTitle"),
                        view_count=view_count,
                    )
                )
        stats_items.sort(key=lambda x: (x.view_count or -1), reverse=True)
        return stats_items[:max_results]

    # Fallback scraper
    if VideosSearch is None:
        logger.warning("youtubesearchpython not installed; cannot fallback search")
        return []

    vs = VideosSearch(query, limit=max(20, max_results))
    res = vs.result() or {}
    for r in res.get("result", []):
        vid = r.get("id")
        title = r.get("title") or "(untitled)"
        channel = (r.get("channel") or {}).get("name")
        url = r.get("link") or (f"https://www.youtube.com/watch?v={vid}" if vid else None)
        views_text = (r.get("viewCount") or {}).get("text") or r.get("views")
        views = _parse_view_count(views_text) if views_text else None
        if vid and url:
            items.append(VideoItem(video_id=vid, title=title, url=url, channel=channel, view_count=views))
    items.sort(key=lambda x: (x.view_count or -1), reverse=True)
    return items[:max_results]


def fetch_transcript_text(video_id: str, prefer_langs: Optional[List[str]] = None) -> Optional[str]:
    if YouTubeTranscriptApi is None:
        return None
    prefer_langs = prefer_langs or ["en"]
    try:
        transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
        try:
            t = transcripts.find_transcript(prefer_langs)
            entries = t.fetch()
        except NoTranscriptFound:
            try:
                t = transcripts.find_generated_transcript(prefer_langs)
                entries = t.fetch()
            except NoTranscriptFound:
                first = next(iter(transcripts), None)
                if not first:
                    return None
                entries = first.fetch()
        text = " ".join((e.get("text") or "").strip() for e in entries if e.get("text"))
        text = re.sub(r"\s+", " ", text).strip()
        return text or None
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        return None
    except Exception:
        logger.exception("Transcript fetch failed for %s", video_id)
        return None
