import React from 'react';
import { ArrowRight, Github } from 'lucide-react';

interface FooterProps {
  onOpenWorkspace: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWorkspace }) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#070709] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          {/* Concentric radar arc mark */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 transform -rotate-45"
            >
              <path
                d="M 6 16 A 10 10 0 0 1 26 16"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 10 16 A 6 6 0 0 1 22 16"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 13 16 A 3 3 0 0 1 19 16"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="2.2" fill="#10B981" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white tracking-tight">
                Praman (प्रमाण)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-stone-300 border border-white/[0.08]">
                Arthaton 2026
              </span>
            </div>
            <p className="text-xs text-stone-400 font-sans mt-0.5">
              Autonomous B2B Financial Reconciliation &amp; Cash-Flow Protection Engine
            </p>
          </div>
        </div>

        {/* Center Editorial Mention */}
        <p className="text-xs font-mono text-stone-400 text-center md:text-left">
          Built with precision for <strong>Arthaton 2026</strong> · Indian SME Financial Operations
        </p>

        {/* Right Links & CTA */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Bhuvanesh-MP/Praman-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-sans text-stone-400 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>

          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-sans text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
