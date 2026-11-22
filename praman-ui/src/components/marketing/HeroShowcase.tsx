import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { BotanicalBackdrop } from './BotanicalBackdrop';

interface HeroShowcaseProps {
  onLaunchWorkspace: (scenarioId?: string) => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ onLaunchWorkspace }) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'ledger' | 'guardrails'>('workspace');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('UPI-209');
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Tab 02 interactive action execution state
  const [isExecutingActions, setIsExecutingActions] = useState<boolean>(false);
  const [actionProgress, setActionProgress] = useState<Record<number, 'pending' | 'loading' | 'done'>>({
    1: 'pending',
    2: 'pending',
    3: 'pending',
  });

  // Tab 03 guardrail sequential highlight state
  const [activeGuardrailIndex, setActiveGuardrailIndex] = useState<number>(0);

  // Auto-cycle tabs every 6 seconds with smooth progress bar, pauses on hover
  useEffect(() => {
    if (isPaused) return;
    const intervalTime = 50; // update every 50ms
    const totalDuration = 6000; // 6 seconds
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((current) => {
            if (current === 'workspace') return 'ledger';
            if (current === 'ledger') return 'guardrails';
            return 'workspace';
          });
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, activeTab]);

  // Tab 03 sequential rule highlight animation
  useEffect(() => {
    if (activeTab !== 'guardrails') return;
    const ruleInterval = setInterval(() => {
      setActiveGuardrailIndex((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(ruleInterval);
  }, [activeTab]);

  const handleTabClick = (tab: 'workspace' | 'ledger' | 'guardrails') => {
    setActiveTab(tab);
    setProgress(0);
  };

  // Run 3-action sequence for Tab 02
  const handleApproveAllSequence = () => {
    setIsExecutingActions(true);
    setActionProgress({ 1: 'loading', 2: 'pending', 3: 'pending' });

    setTimeout(() => {
      setActionProgress({ 1: 'done', 2: 'loading', 3: 'pending' });
    }, 700);

    setTimeout(() => {
      setActionProgress({ 1: 'done', 2: 'done', 3: 'loading' });
    }, 1400);

    setTimeout(() => {
      setActionProgress({ 1: 'done', 2: 'done', 3: 'done' });
      setIsExecutingActions(false);
    }, 2100);
  };

  return (
    <section className="relative pt-6 sm:pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      {/* Hero Header & Headline */}
      <div className="relative z-20 text-center max-w-3xl mx-auto mb-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 text-xs font-mono mb-4 backdrop-blur-md shadow-sm">
          <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold font-sans tracking-wide uppercase">
            Beta
          </span>
          <span>Praman v1 · Arthaton 2026</span>
        </div>

        {/* Large Headline */}
        <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-3">
          The reconciliation layer for<br />
          <span className="font-serif italic font-normal text-white">Indian SME finance.</span>
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto mb-5">
          AI reads and explains. Deterministic code decides. Reconciles messy bank narrations, Razorpay UPI logs, Tally invoices, and GSTR-2B filings in seconds. <strong className="text-white font-medium">Cites every claim.</strong>
        </p>

        {/* Pastel Iridescent Gradient Pill CTA Button */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onLaunchWorkspace('CASE-UPI-209')}
            className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F0D5E2] via-[#E1E5F2] to-[#D5EDE2] hover:opacity-95 text-black font-sans font-semibold text-xs sm:text-sm shadow-[0_0_25px_rgba(240,213,226,0.3)] transition-all duration-200 active:scale-98 cursor-pointer"
          >
            <span>Launch Live Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Center Window Stage: Fixed-Frame Enchanted Forest Photo Backdrop + Moving Flowers + macOS Window */}
      <div className="relative w-full max-w-[1040px] mx-auto mt-2 mb-4 flex flex-col items-center">
        {/* 1. Centered Enchanted Forest Photo Backdrop (/hero-bg.jpg) with Ken Burns Drift */}
        <div className="absolute -inset-x-8 sm:-inset-x-12 -top-10 -bottom-10 pointer-events-none select-none overflow-hidden rounded-[24px] z-0">
          <div
            className="absolute -inset-[4%] w-[108%] h-[108%] bg-cover bg-center filter contrast-110 saturate-120 animate-ken-burns opacity-90"
            style={{ backgroundImage: `url('/hero-bg.jpg')` }}
          />
          {/* Subtle vignette blending the photo naturally into #000000 on outer borders */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.6)_75%,_#000000_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-transparent to-[#000000]" />
        </div>

        {/* 2. Animated Moving Botanical Flower Layer (Swaying Golden Daisies, White Umbels, Pollen, Petals) */}
        <BotanicalBackdrop />

        {/* 3. Centered Fake App Window: Fixed In One Frame (~1.45:1 aspect, h-[475px], max-w-[980px]) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="animate-window-enter relative z-20 w-full max-w-[980px] h-[475px] mx-auto rounded-[12px] bg-[#090705] border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.95),0_6px_24px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col transition-all"
        >
          {/* Title Bar (#0e0c0a, red/yellow/green dots, centered URL, right ● live) */}
          <div className="h-[36px] shrink-0 px-4 bg-[#0e0c0a] border-b border-[#1b1917] flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-[10px] h-[10px] rounded-full bg-[#dd4755]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#e1a851]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#39ac58]" />
            </div>

            <div className="px-3 py-0.5 rounded bg-[#090705] border border-white/[0.06] text-[11px] text-zinc-400 font-mono">
              praman.app / inbox / case UPI-209
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#36ad55] animate-pulse-live" />
              <span className="text-[#36ad55] font-mono font-medium">live</span>
            </div>
          </div>

          {/* Tab 1: Case Workspace (Three columns: left 220px, center flex, right 230px, h-full overflow-hidden) */}
          {activeTab === 'workspace' && (
            <div key="tab-workspace" className="animate-tab-switch flex-1 h-[439px] flex flex-col md:flex-row text-xs font-sans bg-[#090705] overflow-hidden">
              {/* LEFT COLUMN: 220px, case list */}
              <div className="w-full md:w-[220px] shrink-0 border-r border-[#1b1917] bg-[#090705] p-2.5 flex flex-col justify-between h-full overflow-hidden">
                <div>
                  {/* Search "Find case…" with ⌘K hint */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
                    <input
                      type="text"
                      readOnly
                      value="Find case…"
                      className="w-full bg-[#0e0c0a] border border-[#1b1917] rounded-md py-1 pl-8 pr-8 text-[11px] text-zinc-400 outline-none"
                    />
                    <span className="absolute right-2 top-1.5 text-[9px] font-mono text-zinc-500 bg-white/[0.04] px-1 py-0.2 rounded border border-white/[0.06]">
                      ⌘K
                    </span>
                  </div>

                  {/* Filters All / Mine / Watching with counts */}
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#1b1917] text-[10px] font-mono text-zinc-400">
                    <span className="text-[#36ad55] font-semibold border-b border-[#36ad55] pb-0.5">All 8</span>
                    <span className="hover:text-white cursor-pointer pb-0.5">Mine 4</span>
                    <span className="hover:text-white cursor-pointer pb-0.5">Watching 4</span>
                  </div>

                  {/* Case Rows (Selected has 2px green left border) */}
                  <div className="space-y-1">
                    {/* Row 1: Selected Case UPI-209 */}
                    <div
                      onClick={() => setSelectedCaseId('UPI-209')}
                      className="p-2 rounded-r-lg border-l-2 border-l-[#36ad55] bg-[#120f0d] border-t border-r border-b border-white/[0.06] cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-[#36ad55] font-mono font-bold">UPI-209</span>
                        <span className="text-zinc-500 font-mono text-[9px]">2m</span>
                      </div>
                      <div className="font-semibold text-white text-[11px] truncate">Radhe Shyam Traders</div>
                      <div className="flex items-center justify-between text-zinc-400 mt-0.5 text-[10px]">
                        <span>Double Debit</span>
                        <span className="text-white font-mono font-medium">₹19,900</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[#e1a851] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e1a851] animate-pulse" />
                        <span>AWAITING</span>
                      </div>
                    </div>

                    {/* Row 2: GST-104 */}
                    <div
                      onClick={() => setSelectedCaseId('GST-104')}
                      className="p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-all border border-transparent"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-zinc-500 font-mono">GST-104</span>
                        <span className="text-zinc-500 font-mono text-[9px]">11m</span>
                      </div>
                      <div className="font-medium text-zinc-300 text-[11px] truncate">Sri Balaji Enterprises</div>
                      <div className="flex items-center justify-between text-zinc-400 mt-0.5 text-[10px]">
                        <span>ITC Hold</span>
                        <span className="text-zinc-300 font-mono">₹1,84,000</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[9px] text-blue-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>DRAFTED</span>
                      </div>
                    </div>

                    {/* Row 3: UTR-881 */}
                    <div
                      onClick={() => setSelectedCaseId('UTR-881')}
                      className="p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer transition-all border border-transparent"
                    >
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-zinc-500 font-mono">UTR-881</span>
                        <span className="text-zinc-500 font-mono text-[9px]">24m</span>
                      </div>
                      <div className="font-medium text-zinc-300 text-[11px] truncate">Kaveri Plastics</div>
                      <div className="flex items-center justify-between text-zinc-400 mt-0.5 text-[10px]">
                        <span>Amount Mismatch</span>
                        <span className="text-amber-400 font-mono">₹70,052</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[9px] text-amber-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>INVESTIGATING</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="pt-2 border-t border-[#1b1917] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>3 actions</span>
                  <span className="text-[#36ad55]">Ready to approve</span>
                </div>
              </div>

              {/* CENTER COLUMN: flex, brief (fixed height, flex-col justify-between) */}
              <div className="flex-1 bg-[#090705] p-3.5 flex flex-col justify-between border-r border-[#1b1917] overflow-hidden">
                <div className="overflow-hidden">
                  {/* Eyebrow & Status */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                      CASE № UPI-209 · DOUBLE DEBIT
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/40 border border-[#e1a851]/40 text-[#e1a851] text-[9px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e1a851]" />
                      <span>AWAITING NOD</span>
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-white tracking-tight leading-tight">
                        Radhe Shyam Traders
                      </h3>
                      <span className="font-serif italic text-xs text-zinc-400">
                        vs ₹19,900 customer double debit
                      </span>
                    </div>
                  </div>

                  {/* Mono chip "policy.yaml@main" */}
                  <div className="inline-flex items-center gap-1 text-[9px] font-mono text-zinc-400 px-1.5 py-0.2 rounded bg-white/[0.04] border border-[#1b1917] mb-2">
                    <span className="text-[#36ad55] font-bold">•</span>
                    <span>policy.yaml@main</span>
                  </div>

                  {/* "TL;DR" label + Body */}
                  <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    TL;DR
                  </div>
                  <p className="text-[12px] leading-relaxed text-zinc-300 mb-3 font-sans">
                    Customer filed dispute on Razorpay UPI payment <strong className="text-white font-semibold">₹19,900</strong>
                    <sup
                      onMouseEnter={() => setHoveredCitation(1)}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className={`font-mono font-bold ml-0.5 cursor-pointer text-[10px] px-1 py-0.2 rounded transition-all ${
                        hoveredCitation === 1 ? 'bg-[#36ad55] text-black scale-110' : 'text-[#36ad55] bg-emerald-950/50'
                      }`}
                    >
                      [1]
                    </sup>
                    . Bank statement confirms double debit on 18 May
                    <sup
                      onMouseEnter={() => setHoveredCitation(2)}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className={`font-mono font-bold ml-0.5 cursor-pointer text-[10px] px-1 py-0.2 rounded transition-all ${
                        hoveredCitation === 2 ? 'bg-[#36ad55] text-black scale-110' : 'text-[#36ad55] bg-emerald-950/50'
                      }`}
                    >
                      [2]
                    </sup>
                    ; merchant nodal reflects settlement delay
                    <sup
                      onMouseEnter={() => setHoveredCitation(3)}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className={`font-mono font-bold ml-0.5 cursor-pointer text-[10px] px-1 py-0.2 rounded transition-all ${
                        hoveredCitation === 3 ? 'bg-[#36ad55] text-black scale-110' : 'text-[#36ad55] bg-emerald-950/50'
                      }`}
                    >
                      [3]
                    </sup>
                    . <em className="italic text-zinc-200">Auto-refund duplicate ₹19,900 debit, notify customer via WhatsApp, release net batch payout.</em> Zero-MDR mandate preserved
                    <sup
                      onMouseEnter={() => setHoveredCitation(4)}
                      onMouseLeave={() => setHoveredCitation(null)}
                      className={`font-mono font-bold ml-0.5 cursor-pointer text-[10px] px-1 py-0.2 rounded transition-all ${
                        hoveredCitation === 4 ? 'bg-[#36ad55] text-black scale-110' : 'text-[#36ad55] bg-emerald-950/50'
                      }`}
                    >
                      [4]
                    </sup>
                    .
                  </p>

                  {/* "DRAFTED ACTIONS" list of 3 items */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1.5">
                      <span className="font-semibold text-zinc-300 uppercase tracking-wider">DRAFTED ACTIONS</span>
                      <span className="text-zinc-500">3 awaiting approval</span>
                    </div>

                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="p-1.5 px-2 rounded-md bg-[#0e0c0a] border border-[#1b1917] flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">01 Razorpay UPI refund ₹19,900</span>
                          <span className="text-zinc-500 text-[9px] ml-2 font-sans">Ref: RRN 632819045112</span>
                        </div>
                        <span className="text-[#36ad55] font-bold text-[9px]">DRAFTED</span>
                      </div>

                      <div className="p-1.5 px-2 rounded-md bg-[#0e0c0a] border border-[#1b1917] flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">02 Tally ERP credit voucher</span>
                          <span className="text-zinc-500 text-[9px] ml-2 font-sans">Voucher #VCH-209</span>
                        </div>
                        <span className="text-[#36ad55] font-bold text-[9px]">DRAFTED</span>
                      </div>

                      <div className="p-1.5 px-2 rounded-md bg-[#0e0c0a] border border-[#1b1917] flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">03 WhatsApp settlement alert</span>
                          <span className="text-zinc-500 text-[9px] ml-2 font-sans">Customer notification</span>
                        </div>
                        <span className="text-[#36ad55] font-bold text-[9px]">DRAFTED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER BAR: "3 actions ready to fire", green "Approve all" (#37af52), outlined "Hold" (#484644) */}
                <div className="pt-2 border-t border-[#1b1917] flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    <strong className="text-white font-semibold">3 actions</strong> ready to fire
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLaunchWorkspace('CASE-UPI-209')}
                      className="px-3.5 py-1 rounded bg-[#37af52] hover:bg-[#2f9947] text-black font-sans font-semibold text-[11px] shadow transition cursor-pointer"
                    >
                      Approve all
                    </button>
                    <button
                      onClick={() => onLaunchWorkspace('CASE-UPI-209')}
                      className="px-3 py-1 rounded border border-[#484644] hover:bg-white/[0.04] text-zinc-300 font-sans text-[11px] transition cursor-pointer"
                    >
                      Hold
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: 230px (ACCOUNT key/values, EVIDENCE list with icons, POLICY block) */}
              <div className="w-full md:w-[230px] shrink-0 bg-[#090705] p-2.5 flex flex-col justify-between text-xs font-sans h-full overflow-hidden">
                <div className="space-y-2.5 overflow-hidden">
                  {/* ACCOUNT */}
                  <div>
                    <div className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      ACCOUNT
                    </div>
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Merchant</span>
                        <span className="text-white font-medium truncate max-w-[120px]">Radhe Shyam Traders</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">GSTIN</span>
                        <span className="text-zinc-300 font-mono text-[9px]">27AAACR1234F1Z1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Volume</span>
                        <span className="text-white font-semibold font-mono">₹8,40,000</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Bank</span>
                        <span className="text-zinc-300 font-mono text-[9px]">HDFC CA #8841</span>
                      </div>
                    </div>
                  </div>

                  {/* EVIDENCE with numbered green refs and source icons */}
                  <div className="pt-2 border-t border-[#1b1917]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                        EVIDENCE
                      </span>
                      <span className="text-[9px] font-mono text-[#36ad55] font-semibold">4 cited</span>
                    </div>

                    <div className="space-y-1 text-[10px]">
                      {/* [1] Razorpay UPI */}
                      <div
                        onMouseEnter={() => setHoveredCitation(1)}
                        onMouseLeave={() => setHoveredCitation(null)}
                        className={`p-1.5 rounded border transition-all cursor-pointer ${
                          hoveredCitation === 1
                            ? 'border-[#36ad55] bg-emerald-950/40 shadow-sm'
                            : 'border-[#1b1917] bg-[#0e0c0a]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[#36ad55] font-mono font-bold">[1]</span>
                          <span className="font-semibold text-white">Razorpay UPI</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 pl-3.5 font-mono truncate">
                          RRN 632819045112 · ₹19,900
                        </div>
                      </div>

                      {/* [2] Bank statement */}
                      <div
                        onMouseEnter={() => setHoveredCitation(2)}
                        onMouseLeave={() => setHoveredCitation(null)}
                        className={`p-1.5 rounded border transition-all cursor-pointer ${
                          hoveredCitation === 2
                            ? 'border-[#36ad55] bg-emerald-950/40 shadow-sm'
                            : 'border-[#1b1917] bg-[#0e0c0a]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[#36ad55] font-mono font-bold">[2]</span>
                          <span className="font-semibold text-white">Bank statement</span>
                        </div>
                        <div className="text-[9px] text-amber-400 pl-3.5 font-mono truncate">
                          HDFC CA #8841 · 2 debits
                        </div>
                      </div>

                      {/* [3] Tally ERP */}
                      <div
                        onMouseEnter={() => setHoveredCitation(3)}
                        onMouseLeave={() => setHoveredCitation(null)}
                        className={`p-1.5 rounded border transition-all cursor-pointer ${
                          hoveredCitation === 3
                            ? 'border-[#36ad55] bg-emerald-950/40 shadow-sm'
                            : 'border-[#1b1917] bg-[#0e0c0a]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[#36ad55] font-mono font-bold">[3]</span>
                          <span className="font-semibold text-white">Tally ERP</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 pl-3.5 font-mono truncate">
                          Voucher #VCH-209
                        </div>
                      </div>

                      {/* [4] GSTR-2B */}
                      <div
                        onMouseEnter={() => setHoveredCitation(4)}
                        onMouseLeave={() => setHoveredCitation(null)}
                        className={`p-1.5 rounded border transition-all cursor-pointer ${
                          hoveredCitation === 4
                            ? 'border-[#36ad55] bg-emerald-950/40 shadow-sm'
                            : 'border-[#1b1917] bg-[#0e0c0a]'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[#36ad55] font-mono font-bold">[4]</span>
                          <span className="font-semibold text-white">GSTR-2B portal</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 pl-3.5 font-mono truncate">
                          ITC verified
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* POLICY block */}
                  <div className="pt-2 border-t border-[#1b1917]">
                    <div className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      POLICY
                    </div>
                    <div className="p-1.5 rounded bg-[#0e0c0a] border border-[#1b1917] font-mono text-[9px] text-zinc-400 leading-tight">
                      <span className="text-[#36ad55]">rule:</span> upi_double_debit<br />
                      <span className="text-zinc-500">max_auto:</span> ₹25,000<br />
                      <span className="text-zinc-500">zero_mdr:</span> true
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Approval ledger (Fixed in frame: compact table + runway bar) */}
          {activeTab === 'ledger' && (
            <div key="tab-ledger" className="animate-tab-switch p-4 bg-[#090705] flex-1 h-[439px] font-sans text-xs flex flex-col justify-between overflow-hidden">
              <div className="overflow-hidden">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1b1917]">
                  <div>
                    <h4 className="font-sans font-bold text-white text-xs sm:text-sm">Deterministic Approval Ledger</h4>
                    <p className="text-zinc-400 text-[11px]">10,040 rows indexed across Bank Statements, Tally ERP, and Razorpay</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isExecutingActions}
                      onClick={handleApproveAllSequence}
                      className="px-3.5 py-1 rounded-md bg-[#37af52] hover:bg-[#2f9947] disabled:opacity-50 text-black font-sans font-semibold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      {isExecutingActions ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      <span>Execute 3 Actions</span>
                    </button>
                  </div>
                </div>

                {/* Action Execution Tracker (if executing) */}
                {isExecutingActions || actionProgress[1] === 'done' ? (
                  <div className="mb-2.5 p-2 rounded-lg bg-[#0e0c0a] border border-emerald-500/30 font-mono text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">01 Razorpay UPI refund ₹19,900</span>
                      {actionProgress[1] === 'loading' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                      {actionProgress[1] === 'done' && (
                        <span className="text-[#36ad55] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>#PRM-RRN-632819 · EXECUTED</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">02 Tally ERP credit voucher adjustment</span>
                      {actionProgress[2] === 'loading' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                      {actionProgress[2] === 'done' && (
                        <span className="text-[#36ad55] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>#PRM-VCH-209 · POSTED</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">03 WhatsApp customer settlement receipt</span>
                      {actionProgress[3] === 'loading' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                      {actionProgress[3] === 'done' && (
                        <span className="text-[#36ad55] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>#PRM-WA-MSG · SENT</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Compact Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead>
                      <tr className="border-b border-[#1b1917] text-zinc-400 text-[10px]">
                        <th className="py-1.5 px-2.5">RECORD ID</th>
                        <th className="py-1.5 px-2.5">ENTITY</th>
                        <th className="py-1.5 px-2.5">AMOUNT</th>
                        <th className="py-1.5 px-2.5">VERDICT</th>
                        <th className="py-1.5 px-2.5">DETERMINISTIC ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2 px-2.5 text-[#36ad55] font-semibold">CASE-UPI-209</td>
                        <td className="py-2 px-2.5 font-sans text-white text-[11px]">Radhe Shyam Traders</td>
                        <td className="py-2 px-2.5 font-semibold text-white">₹19,900.00</td>
                        <td className="py-2 px-2.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[9px]">
                            DOUBLE DEBIT
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-zinc-300 text-[10px]">Auto-refund ₹19,900 · Release net batch settlement</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2 px-2.5 text-[#36ad55] font-semibold">INV-2026-104</td>
                        <td className="py-2 px-2.5 font-sans text-white text-[11px]">Sri Balaji Enterprises</td>
                        <td className="py-2 px-2.5 font-semibold text-white">₹1,84,000.00</td>
                        <td className="py-2 px-2.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[9px]">
                            HOLD GST
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-zinc-300 text-[10px]">Hold ₹28,067.80 GST · Release base ₹1,55,932.20</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2 px-2.5 text-[#36ad55] font-semibold">UTR 987654321012</td>
                        <td className="py-2 px-2.5 font-sans text-white text-[11px]">Kaveri Plastics</td>
                        <td className="py-2 px-2.5 font-semibold text-white">₹18,400.00</td>
                        <td className="py-2 px-2.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[9px]">
                            AMOUNT MISMATCH
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-zinc-300 text-[10px]">Ledger shows ₹88,452.76 · Disputed delta ₹70,052.76</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2 px-2.5 text-[#36ad55] font-semibold">CASE-SLA-302</td>
                        <td className="py-2 px-2.5 font-sans text-white text-[11px]">Venkateshwara Ent.</td>
                        <td className="py-2 px-2.5 font-semibold text-white">₹1,10,000.00</td>
                        <td className="py-2 px-2.5">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-[#36ad55] border border-emerald-500/30 text-[9px]">
                            NO DISCREPANCY
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-[#36ad55] font-semibold text-[10px]">Verified safe to pay · 1-click batch executed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 30-Day EMI Runway Bar (Fixed at bottom of frame) */}
              <div className="mt-2 p-2.5 rounded-lg bg-[#0e0c0a] border border-[#1b1917]">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-zinc-400">HDFC Bank Critical Loan EMI: <strong className="text-white font-mono">₹1,10,000</strong></span>
                  <span className="text-[#36ad55] font-mono font-semibold">Protected Buffer: 1.40x (₹1,54,000)</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="bg-red-500 h-full w-[40%]" />
                  <div className="bg-[#36ad55] h-full w-[35%]" />
                  <div className="bg-zinc-700 h-full w-[25%]" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Policy guardrails (Fixed in frame: clean 2x2 grid) */}
          {activeTab === 'guardrails' && (
            <div key="tab-guardrails" className="animate-tab-switch p-4 bg-[#090705] flex-1 h-[439px] font-sans text-xs flex flex-col justify-between overflow-hidden">
              <div>
                <div className="mb-3 pb-2 border-b border-[#1b1917]">
                  <h4 className="font-sans font-bold text-white text-xs sm:text-sm">Deterministic Policy &amp; SQL Guardrails</h4>
                  <p className="text-zinc-400 text-[11px]">Engine hardcoded gates that no LLM generation can override (rule active: {activeGuardrailIndex + 1}/4)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      activeGuardrailIndex === 0
                        ? 'border-[#36ad55] bg-emerald-950/30 shadow-[0_0_15px_rgba(54,173,85,0.15)]'
                        : 'border-[#1b1917] bg-[#0e0c0a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${activeGuardrailIndex === 0 ? 'bg-[#36ad55] animate-pulse' : 'bg-zinc-600'}`} />
                      <span className="font-bold text-white font-mono text-[11px]">CGST Section 16(2)(aa)</span>
                    </div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      Blocks input tax credit disbursement until invoice appears in buyer's GSTR-2B; auto-holds disputed GST component.
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      activeGuardrailIndex === 1
                        ? 'border-[#36ad55] bg-emerald-950/30 shadow-[0_0_15px_rgba(54,173,85,0.15)]'
                        : 'border-[#1b1917] bg-[#0e0c0a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${activeGuardrailIndex === 1 ? 'bg-[#36ad55] animate-pulse' : 'bg-zinc-600'}`} />
                      <span className="font-bold text-white font-mono text-[11px]">30-Day EMI Runway Threshold</span>
                    </div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      Maintains minimum 1.25x liquid cash coverage for forthcoming debt service; gates large discretionary payouts.
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      activeGuardrailIndex === 2
                        ? 'border-[#36ad55] bg-emerald-950/30 shadow-[0_0_15px_rgba(54,173,85,0.15)]'
                        : 'border-[#1b1917] bg-[#0e0c0a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${activeGuardrailIndex === 2 ? 'bg-[#36ad55] animate-pulse' : 'bg-zinc-600'}`} />
                      <span className="font-bold text-white font-mono text-[11px]">Vendor Fuzzy-Match &gt; 92%</span>
                    </div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      Normalizes honorifics (M/s, Shri, Pvt Ltd) and evaluates Jaro-Winkler distance to eliminate vendor mismatch before payment approval.
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      activeGuardrailIndex === 3
                        ? 'border-[#36ad55] bg-emerald-950/30 shadow-[0_0_15px_rgba(54,173,85,0.15)]'
                        : 'border-[#1b1917] bg-[#0e0c0a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full ${activeGuardrailIndex === 3 ? 'bg-[#36ad55] animate-pulse' : 'bg-zinc-600'}`} />
                      <span className="font-bold text-white font-mono text-[11px]">Zero-MDR &amp; Direction Gate</span>
                    </div>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      Enforces zero merchant fee on RuPay/UPI settlements, matching claimed direction against exact bank credits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1b1917] text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Deterministic SQL Guardrails</span>
                <span className="text-[#36ad55]">4 of 4 active</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Below the window: Three pill tabs (Active = #b4b4b1 fill with dark text; inactive = dark with 1px border. Numbers in mono. Progress line) */}
        <div className="relative z-20 flex items-center justify-center mt-5">
          <div className="inline-flex items-center p-1 rounded-full bg-[#0e0c0a]/90 backdrop-blur-md border border-white/[0.08] text-xs font-sans shadow-lg">
            {/* Tab 1 */}
            <button
              onClick={() => handleTabClick('workspace')}
              className={`relative overflow-hidden px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-[#b4b4b1] text-[#090705] font-semibold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeTab === 'workspace' && (
                <span
                  className="absolute bottom-0 left-0 h-[2px] bg-black/40 transition-all duration-50"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="font-mono mr-1.5">01</span> Case workspace
            </button>

            {/* Tab 2 */}
            <button
              onClick={() => handleTabClick('ledger')}
              className={`relative overflow-hidden px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-[#b4b4b1] text-[#090705] font-semibold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeTab === 'ledger' && (
                <span
                  className="absolute bottom-0 left-0 h-[2px] bg-black/40 transition-all duration-50"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="font-mono mr-1.5">02</span> Approval ledger
            </button>

            {/* Tab 3 */}
            <button
              onClick={() => handleTabClick('guardrails')}
              className={`relative overflow-hidden px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'guardrails'
                  ? 'bg-[#b4b4b1] text-[#090705] font-semibold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeTab === 'guardrails' && (
                <span
                  className="absolute bottom-0 left-0 h-[2px] bg-black/40 transition-all duration-50"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="font-mono mr-1.5">03</span> Policy guardrail
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
