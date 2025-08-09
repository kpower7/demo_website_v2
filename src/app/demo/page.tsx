'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type ChatMessage = { role: 'user' | 'assistant' | 'system' | 'tool'; content: string; };

export default function DemoPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'You are an AI assistant. Keep responses concise.' },
    { role: 'assistant', content: 'Hi! Ask me anything. This demo routes to Hugging Face Router running GPT-OSS-120B (Grok provider).' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMsgs: ChatMessage[] = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });

      if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(detail);
      }

      const data = await resp.json();
      const msg = data?.message as { role?: string; content?: string; tool_calls?: unknown };

      // Basic display. Tool-call support can be added tomorrow.
      const content = msg?.content ?? '[No content]';
      setMessages(m => [...m, { role: 'assistant', content }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">Hackathon<span className="text-cyan-400">AI</span></Link>
        <div className="text-gray-300 flex gap-6">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <a href="#" className="hover:text-cyan-400 transition-colors" onClick={(e)=>{e.preventDefault();window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});}}>Chat</a>
        </div>
      </div>

      <main className="container pb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Live Demo</h1>
        <p className="text-gray-300 mb-6">This chatbot uses a Netlify Function to call Hugging Face Router's OpenAI-compatible endpoint with GPT-OSS-120B (Grok). Tomorrow we can add tool-calling to your FastAPI backend.</p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Chat */}
          <div className="card p-4 h-[70vh] flex flex-col">
            <div ref={listRef} className="flex-1 overflow-y-auto pr-2 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`rounded-lg p-3 ${m.role === 'user' ? 'bg-blue-600/30 border border-blue-500/30 ml-auto max-w-[85%]' : 'bg-slate-800/60 border border-blue-500/20 mr-auto max-w-[90%]'}`}>
                  <div className="text-xs uppercase tracking-wide mb-1 text-gray-400">{m.role}</div>
                  <div className="whitespace-pre-wrap text-gray-100">{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="rounded-lg p-3 bg-slate-800/60 border border-blue-500/20 w-40 text-gray-300">Thinking…</div>
              )}
            </div>
            <form onSubmit={sendMessage} className="mt-4 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message"
                className="flex-1 rounded-lg bg-slate-900/60 border border-blue-500/30 px-4 py-3 text-gray-100 outline-none focus:border-cyan-400"
              />
              <button disabled={loading} className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-60">
                Send
              </button>
            </form>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Architecture Notes</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li><b>Frontend</b>: Next.js 15 + Tailwind v4.</li>
                <li><b>LLM Proxy</b>: Netlify Function <code>/.netlify/functions/chat</code> &rarr; Hugging Face Router.</li>
                <li><b>Model</b>: <code>openai/gpt-oss-120b:groq</code>.</li>
                <li><b>Backend</b>: FastAPI scaffold under <code>backend/</code> for tomorrow's tool-calling.</li>
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Next Steps</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>Add tool schemas and execute tool calls via FastAPI endpoints.</li>
                <li>Secure the Netlify Function and configure <code>HF_TOKEN</code> in environment.</li>
                <li>Swap the YouTube link on the Home page to your actual demo video.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
