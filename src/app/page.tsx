'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/5 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container py-6 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-2xl">
          Hackathon<span className="text-cyan-400">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <a href="#demo" className="hover:text-cyan-400 transition-colors">Video</a>
          <Link href="/demo" className="hover:text-cyan-400 transition-colors">Live Demo</Link>
          <a href="mailto:kevpower@mit.edu" className="hover:text-cyan-400 transition-colors">Contact</a>
        </div>
        <button
          aria-label="Toggle mobile menu"
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(v => !v)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden relative z-10 border-t border-blue-500/20 bg-slate-900/95">
          <div className="container py-4 flex flex-col gap-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Home</Link>
            <a href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Video</a>
            <Link href="/demo" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Live Demo</Link>
            <a href="mailto:kevpower@mit.edu" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 hover:text-cyan-400">Contact</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="relative z-10 container pt-12 pb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Agentic AI Hackathon Template
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
          Next.js + Tailwind front-end, Netlify Functions proxy to Hugging Face Router (Grok GPT-OSS-120B), and FastAPI backend scaffold for tool-calling.
        </p>
        <p className="mt-3 text-cyan-300 font-semibold">Patent Pending • Built by Kevin Power</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/demo" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">Try Live Demo</Link>
          <a href="#demo" className="px-8 py-4 rounded-full border-2 border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-white transition-all">Watch Video</a>
        </div>
      </header>

      {/* Video Section */}
      <section id="demo" className="relative z-10 container py-14">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Overview</h3>
              <p className="text-gray-300">This template is optimized for fast iteration during hackathons. Swap the video link, customize copy, and ship to Netlify in minutes.</p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Contact</h3>
              <p className="text-gray-300">Email <a className="text-cyan-400 underline" href="mailto:kevpower@mit.edu">kevpower@mit.edu</a> for collaborations and enterprise demos.</p>
            </div>
          </div>
          <div className="lg:col-span-3 card p-4">
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/IkbkEtOOC1Y"
                title="Demo Video"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="text-center mt-6">
              <Link href="/demo" className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">Go to Live Demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-500/20">
        <div className="container py-8 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kevin Power • All Rights Reserved</p>
          <div className="flex gap-4">
            <a className="hover:text-cyan-300" href="/demo">Live Demo</a>
            <a className="hover:text-cyan-300" href="mailto:kevpower@mit.edu">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
