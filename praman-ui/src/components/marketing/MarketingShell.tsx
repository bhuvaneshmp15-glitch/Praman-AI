import React from 'react';
import { ArrowRight, Github } from 'lucide-react';

interface MarketingShellProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const MarketingShell: React.FC<MarketingShellProps> = ({ onOpenWorkspace }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#070709]/80 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Mark: Concentric Emerald Arc Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {/* Concentric Radar Arc Mark */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 transform -rotate-45"
            >
              {/* Outer arc */}
              <path
                d="M 6 16 A 10 10 0 0 1 26 16"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Middle arc */}
              <path
                d="M 10 16 A 6 6 0 0 1 22 16"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Inner core arc */}
              <path
                d="M 13 16 A 3 3 0 0 1 19 16"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Center emerald dot */}
              <circle cx="16" cy="16" r="2.2" fill="#10B981" />
            </svg>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
              Praman
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-stone-300 border border-white/[0.08] font-semibold uppercase tracking-wider hidden sm:inline-block">
              Arthaton 2026
            </span>
          </div>
        </div>

        {/* Center Navigation Anchors */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-sans font-medium text-stone-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#guardrails" className="hover:text-white transition-colors">
            GST &amp; EMI Guardrails
          </a>
          <a href="#metrics" className="hover:text-white transition-colors">
            Engine Specs
          </a>
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>10,040 Rows Indexed</span>
          </div>

          <a
            href="https://github.com/Bhuvanesh-MP/Praman-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-stone-400 hover:text-white transition-colors"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Crisp White Pill Button (Direct to /workspace, no login gate) */}
          <button
            onClick={() => onOpenWorkspace()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-sans text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
