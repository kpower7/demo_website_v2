// Netlify Function: ElevenLabs Text-to-Speech
// POST { text: string, voiceId?: string, modelId?: string }
// Returns: audio/mpeg (binary; base64-encoded response)

export async function handler(event: unknown) {
  const evt = event as { httpMethod?: string; body?: string | null };
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as const;

  if (evt.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (evt.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const API_KEY = process.env.ELEVEN_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "ELEVEN_API_KEY not configured in environment" }),
    };
  }

  try {
    const body = JSON.parse(evt.body || "{}");
    const text: unknown = body.text;
    if (typeof text !== "string" || !text.trim()) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Missing 'text'" }) };
    }

    const voiceId: string = typeof body.voiceId === "string" && body.voiceId.trim()
      ? body.voiceId
      : "JBFqnCBsd6RMkjVDRZzb"; // default voice
    const modelId: string = typeof body.modelId === "string" && body.modelId.trim()
      ? body.modelId
      : "eleven_multilingual_v2";

    const elResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}` ,{
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({ text, model_id: modelId }),
    });

    if (!elResp.ok) {
      const detail = await elResp.text();
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: "Upstream error", detail }) };
    }

    const arrayBuffer = await elResp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err: unknown) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
    };
  }
}
