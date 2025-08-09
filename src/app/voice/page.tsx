"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";

// Optional: read agentId from public env; if absent, server function must have ELEVEN_AGENT_ID configured
const PUBLIC_AGENT_ID = process.env.NEXT_PUBLIC_ELEVEN_AGENT_ID;

// Safe helpers without using `any`
function extractText(msg: unknown): string | null {
  if (typeof msg === "string") return msg;
  if (msg && typeof msg === "object") {
    const o = msg as Record<string, unknown>;
    if (typeof o.text === "string") return o.text;
    if (typeof o.message === "string") return o.message;
    if (typeof o.content === "string") return o.content;
  }
  return null;
}

function toDisplayString(msg: unknown): string {
  const t = extractText(msg);
  if (t) return t;
  try {
    return JSON.stringify(msg);
  } catch {
    return "[unserializable message]";
  }
}

export default function VoicePage() {
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [micMuted, setMicMuted] = useState(true);
  const pttDownRef = useRef(false);

  const onMessage = useCallback((msg: unknown) => {
    setLog((prev) => [toDisplayString(msg), ...prev].slice(0, 200));
  }, []);

  const onError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
    setError(msg);
  }, []);

  const onConnect = useCallback(() => {
    setError(null);
  }, []);

  const onDisconnect = useCallback(() => {
    // ensure PTT state resets
    pttDownRef.current = false;
  }, []);

  const conversation = useConversation({
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    micMuted,
    // Small UX improvements
    preferHeadphonesForIosDevices: true,
  });

  const { status, isSpeaking, canSendFeedback } = conversation;

  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      setError(null);
      // Prompt mic permission early per SDK guidance
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        throw new Error("Microphone permission denied or unavailable");
      }

      const qs = PUBLIC_AGENT_ID ? `?agent_id=${encodeURIComponent(PUBLIC_AGENT_ID)}` : "";
      const resp = await fetch(`/.netlify/functions/eleven-signed-url${qs}`);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to obtain signed URL");
      }
      const data = (await resp.json()) as { signedUrl?: string };
      if (!data.signedUrl) throw new Error("Missing signedUrl in response");

      // Start session via WebSocket using the signed URL
      await conversation.startSession({
        signedUrl: data.signedUrl,
        connectionType: "websocket",
      });

      // Default to muted until PTT is pressed
      setMicMuted(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      setError(msg);
    } finally {
      setConnecting(false);
    }
  }, [conversation]);

  const disconnect = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      setError(msg);
    }
  }, [conversation]);

  // Push-to-talk: space key hold
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && conversation && status === "connected") {
        if (!pttDownRef.current) {
          pttDownRef.current = true;
          setMicMuted(false);
        }
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && conversation && status === "connected") {
        pttDownRef.current = false;
        setMicMuted(true);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [conversation, status]);

  // Touch/mouse PTT button handlers
  const handlePttStart = useCallback(() => {
    if (status === "connected") {
      pttDownRef.current = true;
      setMicMuted(false);
    }
  }, [conversation, status]);

  const handlePttEnd = useCallback(() => {
    if (status === "connected") {
      pttDownRef.current = false;
      setMicMuted(true);
    }
  }, [conversation, status]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">Voice Coach (Real-time)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Hold the Push-to-Talk button or press Space to speak. The agent will respond in real-time.
      </p>

      <div className="flex items-center gap-3 mb-4">
        {status !== "connected" ? (
          <button
            onClick={connect}
            disabled={connecting}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
          >
            {connecting ? "Connecting…" : "Connect"}
          </button>
        ) : (
          <button onClick={disconnect} className="px-4 py-2 rounded bg-red-600 text-white">
            Disconnect
          </button>
        )}

        <div className="text-sm">
          <span className="font-medium">Status:</span> {status}
        </div>
        <div className="text-sm">
          <span className="font-medium">Agent speaking:</span> {isSpeaking ? "Yes" : "No"}
        </div>
      </div>

      <div className="mb-6">
        <button
          onMouseDown={handlePttStart}
          onMouseUp={handlePttEnd}
          onMouseLeave={handlePttEnd}
          onTouchStart={handlePttStart}
          onTouchEnd={handlePttEnd}
          className={`px-6 py-4 rounded-full border text-lg ${
            status === "connected" ? "bg-emerald-600 text-white" : "bg-gray-300 text-gray-600"
          }`}
          disabled={status !== "connected"}
        >
          Push to Talk
        </button>
        <p className="text-xs text-gray-500 mt-2">Tip: Hold Space bar to talk</p>
      </div>

      {status === "connected" && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => conversation.sendFeedback(true)}
            disabled={!canSendFeedback}
            className="px-3 py-1 rounded bg-emerald-500 text-white disabled:opacity-60"
            title="Send positive feedback for the last agent response"
          >
            👍 Feedback
          </button>
          <button
            onClick={() => conversation.sendFeedback(false)}
            disabled={!canSendFeedback}
            className="px-3 py-1 rounded bg-rose-500 text-white disabled:opacity-60"
            title="Send negative feedback for the last agent response"
          >
            👎 Feedback
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded bg-rose-50 text-rose-700 border border-rose-200">
          <div className="font-medium">Error</div>
          <div className="text-sm break-words">{error}</div>
        </div>
      )}

      <div className="border rounded p-3">
        <div className="font-medium mb-2">Live messages</div>
        <ul className="space-y-2">
          {log.map((line, idx) => (
            <li key={idx} className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
