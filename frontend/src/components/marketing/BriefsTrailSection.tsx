import React, { useState } from 'react';

interface BriefsTrailSectionProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const BriefsTrailSection: React.FC<BriefsTrailSectionProps> = ({ onOpenWorkspace }) => {
  const [hoveredCitation, setHoveredCitation] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white mb-2 leading-tight">
          Every brief shows its work.<br />
          <span className="font-serif italic font-normal text-white">
            Every action keeps a trail.
          </span>
        </h2>
      </div>

      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Cross-source by default (Sri Balaji Enterprises INV-2026-104) */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#090B0E] border border-white/[0.08] p-5 hover:border-white/20 transition-all group">
          {/* Mock UI Frame: Fixed height, overflow-hidden, flex-col justify-between */}
          <div className="rounded-xl bg-[#0E1217] border border-white/[0.08] p-4 font-mono text-xs mb-6 shadow-inner h-[210px] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-2">
                <span>BRIEF · CASE-GST-104</span>
                <span className="text-zinc-600">Hover [n] to trace</span>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs mb-2">
                <span className="font-bold text-white font-sans text-xs sm:text-sm truncate">
                  Sri Balaji Enterprises
                </span>
                <span className="text-zinc-400 font-mono text-[10px] shrink-0">
                  INV-104 · ₹1,84,000
                </span>
              </div>

              <p className="font-sans text-[11px] text-zinc-300 leading-relaxed">
                Sri Balaji Enterprises invoice matches Tally ERP
                <span
                  onMouseEnter={() => setHoveredCitation(1)}
                  onMouseLeave={() => setHoveredCitation(null)}
                  className="text-emerald-400 font-bold ml-0.5 cursor-pointer bg-emerald-950/40 px-1 py-0.2 rounded"
                >
                  [1]
                </span>
                , but GSTR-2B shows NOT FILED
                <span
                  onMouseEnter={() => setHoveredCitation(2)}
                  onMouseLeave={() => setHoveredCitation(null)}
                  className="text-emerald-400 font-bold ml-0.5 cursor-pointer bg-emerald-950/40 px-1 py-0.2 rounded"
                >
                  [2]
                </span>
                . Paying full ₹1,84,000 drops cash buffer to ₹16,000 ahead of your ₹1,10,000 HDFC loan EMI
                <span
                  onMouseEnter={() => setHoveredCitation(3)}
                  onMouseLeave={() => setHoveredCitation(null)}
                  className="text-emerald-400 font-bold ml-0.5 cursor-pointer bg-emerald-950/40 px-1 py-0.2 rounded"
                >
                  [3]
                </span>
                .
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] text-zinc-400 truncate">
              <span className="text-emerald-400 font-bold">→</span>
              <span className="truncate">hold ₹28,067.80 GST · release net · protect EMI</span>
            </div>
          </div>

          {/* Copy Underneath */}
          <div>
            <h3 className="font-sans font-bold text-lg text-white mb-2">Cross-source by default</h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              Bank statements hold messy narrations. Razorpay holds UPI RRNs. Tally holds vendor invoices. GSTR-2B holds tax credit status. Praman joins all four inside DuckDB in one investigation, and every claim cites the exact row it came from.
            </p>
          </div>
        </div>

        {/* Card 2: HITL gates you control (PAYOUT & DISPUTE GATES) */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#090B0E] border border-white/[0.08] p-5 hover:border-white/20 transition-all group">
          {/* Mock UI Frame: Fixed height, perfectly centered diagram with zero overflow */}
          <div className="rounded-xl bg-[#0E1217] border border-white/[0.08] p-4 font-mono text-xs mb-6 shadow-inner h-[210px] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span>DISPUTE GATES · 10,040 ROWS</span>
              <span className="text-emerald-400 font-medium font-mono text-[9px]">3 bands</span>
            </div>

            {/* Visual Node Branching Tree */}
            <div className="w-full flex items-center justify-between gap-1 my-auto">
              {/* Left Parent Node */}
              <div className="px-2 py-2 rounded-lg bg-[#07090C] border border-white/10 text-center shrink-0 w-[84px]">
                <div className="text-[10px] text-zinc-300 font-bold tracking-wider uppercase">PAYOUT</div>
                <div className="text-[9px] text-zinc-500 font-sans">request</div>
                <div className="text-[10px] font-bold text-emerald-400 font-mono mt-0.5">10,040 rows</div>
              </div>

              {/* Connecting Curving SVG Lines */}
              <div className="w-9 h-20 shrink-0 relative flex items-center justify-center">
                <svg viewBox="0 0 36 80" fill="none" className="w-full h-full">
                  <path d="M 0 40 C 18 40, 18 14, 36 14" stroke="#4B5563" strokeWidth="1.5" />
                  <path d="M 0 40 L 36 40" stroke="#4B5563" strokeWidth="1.5" />
                  <path d="M 0 40 C 18 40, 18 66, 36 66" stroke="#4B5563" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Right Output Branches */}
              <div className="space-y-1.5 flex-1 min-w-0 max-w-[155px]">
                <div className="px-2 py-1 rounded bg-[#07090C] border border-white/10 flex items-center justify-between gap-1 text-[9px]">
                  <span className="text-zinc-400 truncate">&lt; ₹10,000</span>
                  <span className="font-bold text-emerald-400 shrink-0 font-mono">AUTO-PASS</span>
                </div>
                <div className="px-2 py-1 rounded bg-[#07090C] border border-white/10 flex items-center justify-between gap-1 text-[9px]">
                  <span className="text-zinc-400 truncate">GST Mismatch</span>
                  <span className="font-bold text-amber-400 shrink-0 font-mono">HOLD DELTA</span>
                </div>
                <div className="px-2 py-1 rounded bg-[#07090C] border border-white/10 flex items-center justify-between gap-1 text-[9px]">
                  <span className="text-zinc-400 truncate">EMI at Risk</span>
                  <span className="font-bold text-red-400 shrink-0 font-mono">CFO NOD</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] text-zinc-400 truncate">
              <span className="text-emerald-400 font-bold">→</span>
              <span className="truncate">deterministic Python &amp; DuckDB rule gates</span>
            </div>
          </div>

          {/* Copy Underneath */}
          <div>
            <h3 className="font-sans font-bold text-lg text-white mb-2">HITL gates you control</h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              AI parses messy bank SMS alerts and drafts plain-English memos; deterministic Python and DuckDB decide the math and pause for human sign-off before any rupee moves.
            </p>
          </div>
        </div>

        {/* Card 3: Briefs your CFO will sign (CASE BRIEF · GST-104) */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#090B0E] border border-white/[0.08] p-5 hover:border-white/20 transition-all group">
          {/* Mock UI Frame: Fixed height, overflow-hidden, flex-col justify-between */}
          <div className="rounded-xl bg-[#0E1217] border border-white/[0.08] p-4 font-mono text-xs mb-6 shadow-inner h-[210px] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1.5">
                <span>CASE BRIEF · GST-104</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                  AWAITING APPROVAL
                </span>
              </div>

              <div className="font-bold font-sans text-white text-xs mb-2 truncate">
                Sri Balaji Enterprises · <span className="text-zinc-400 font-normal">Section 16(2)(aa)</span>
              </div>

              <div className="space-y-1 text-[10px] pb-2 border-b border-white/[0.06]">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="truncate">01 Hold ₹28,067.80 GST</span>
                  <span className="text-emerald-400 font-semibold shrink-0 ml-2">DRAFTED</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="truncate">02 Release ₹1,55,932.20 Base</span>
                  <span className="text-emerald-400 font-semibold shrink-0 ml-2">DRAFTED</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="truncate">03 Notify Vendor for GSTR-1</span>
                  <span className="text-emerald-400 font-semibold shrink-0 ml-2">DRAFTED</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-white/[0.06]">
              <span className="font-mono text-zinc-400">#PRM-104-VERIFIED</span>
              <span className="text-emerald-400 font-medium">✓ verified by DuckDB</span>
            </div>
          </div>

          {/* Copy Underneath */}
          <div>
            <h3 className="font-sans font-bold text-lg text-white mb-2">Briefs your CFO will sign</h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              Every case lands as a plain-English memo, not a model dump. The TL;DR, the drafted actions, and the footnotes are all on one page. Each claim ends in a numbered citation linking straight to the source record. The kind of brief you forward without a second meeting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
