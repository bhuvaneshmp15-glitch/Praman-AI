import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { MarketingShell } from '../components/marketing/MarketingShell';
import { HeroShowcase } from '../components/marketing/HeroShowcase';
import { BriefsTrailSection } from '../components/marketing/BriefsTrailSection';
import { PlatformFeaturesSection } from '../components/marketing/PlatformFeaturesSection';
import { Footer } from '../components/marketing/Footer';

interface LandingProps {
  onLaunchWorkspace: (scenarioId?: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onLaunchWorkspace }) => {
  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-emerald-500/30 selection:text-white relative overflow-hidden">
      {/* Soft Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_transparent_40%,_rgba(7,7,9,0.85)_100%)] z-1" />

      {/* 1. Translucent Sticky Navigation Bar */}
      <div className="relative z-20">
        <MarketingShell onOpenWorkspace={onLaunchWorkspace} />
      </div>

      {/* 2. Hero Section with Swaying Dark Botanicals & 3-Column macOS Window */}
      <div className="relative z-10">
        <HeroShowcase onLaunchWorkspace={onLaunchWorkspace} />
      </div>

      {/* 3. Section 2: "Every brief shows its work. Every action keeps a trail." */}
      <div className="relative z-10">
        <BriefsTrailSection onOpenWorkspace={onLaunchWorkspace} />
      </div>

      {/* 4. Section 3: Rules you can read, Compounding graph & Audit log */}
      <div className="relative z-10">
        <PlatformFeaturesSection />
      </div>

      {/* 5. Clean Minimal Closing CTA Block (Replacing Pricing) */}
      <section id="prototype" className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Ambient subtle emerald glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-950/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-[11px] font-mono font-medium mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ARTHATON 2026 · WORKING PROTOTYPE</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight mb-6">
          Built to test deterministic AI on{' '}
          <span className="font-serif italic font-normal text-zinc-300">
            Indian SME finance.
          </span>
        </h2>

        {/* Subtext */}
        <p className="font-sans text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Explore the live 10,040-row DuckDB ledger, test unscripted bank SMS strings, or upload your own CSV statement directly in the workspace.
        </p>

        {/* Primary CTA button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => onLaunchWorkspace()}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-400 to-[#10B981] hover:from-emerald-300 hover:to-emerald-500 text-black font-sans font-bold text-sm shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-200 active:scale-98 cursor-pointer"
          >
            <span>Launch Live Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* 6. Minimalist Dark Footer */}
      <div className="relative z-10">
        <Footer onOpenWorkspace={() => onLaunchWorkspace()} />
      </div>
    </div>
  );
};
