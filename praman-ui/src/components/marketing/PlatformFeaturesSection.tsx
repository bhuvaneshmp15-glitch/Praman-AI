import React, { useState } from 'react';

export const PlatformFeaturesSection: React.FC = () => {
  const [blockUnfiledGst, setBlockUnfiledGst] = useState<boolean>(true);
  const [criticalEmi, setCriticalEmi] = useState<number>(110000);
  const [zeroMdrCheck, setZeroMdrCheck] = useState<boolean>(true);
  const [activeActivityTab, setActiveActivityTab] = useState<'all' | 'operator' | 'praman'>('all');

  return (
    <section id="architecture" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Rules you can read (GST & EMI POLICY) */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#090B0E] border border-white/[0.08] p-5 hover:border-white/20 transition-all group">
          {/* Mock UI Frame: Visual Policy Editor with fixed height 210px */}
          <div className="rounded-xl bg-[#0E1217] border border-white/[0.08] p-4 font-mono text-xs mb-6 shadow-inner h-[210px] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span className="font-bold text-zinc-400">GST &amp; EMI POLICY</span>
              <span>edited 4m ago</span>
            </div>

            {/* Toggle: Block unfiled GSTR-2B ITC */}
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
              <div>
                <div className="font-sans text-[11px] text-zinc-300">Block unfiled GSTR-2B ITC</div>
                <div className="text-[9px] text-zinc-500 font-mono">CGST Sec 16(2)(aa)</div>
              </div>
              <button
                type="button"
                onClick={() => setBlockUnfiledGst(!blockUnfiledGst)}
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  blockUnfiledGst ? 'bg-[#10B981]' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`bg-black w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                    blockUnfiledGst ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Slider: Protect 7-day critical EMI */}
            <div className="py-1.5 border-b border-white/[0.05]">
              <div className="flex items-center justify-between text-[11px] font-sans text-zinc-300 mb-1">
                <span>Protect critical EMI</span>
                <span className="font-mono text-white font-bold text-xs">₹{(criticalEmi).toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="250000"
                step="10000"
                value={criticalEmi}
                onChange={(e) => setCriticalEmi(Number(e.target.value))}
                className="w-full accent-[#10B981] h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Checkbox: Zero-MDR UPI amount & direction check */}
            <div className="flex items-center justify-between py-1.5">
              <div>
                <div className="font-sans text-[11px] text-zinc-300">Zero-MDR UPI integrity</div>
                <div className="text-[9px] text-zinc-500 font-mono">Direction &amp; amount match</div>
              </div>
              <button
                type="button"
                onClick={() => setZeroMdrCheck(!zeroMdrCheck)}
                className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  zeroMdrCheck ? 'bg-[#10B981] text-black' : 'border border-zinc-600 bg-transparent'
                }`}
              >
                {zeroMdrCheck && (
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Impact Metric Strip */}
            <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-500">Impact · last 30d</span>
              <span className="text-emerald-400 font-bold">21 / 47 auto-approve</span>
            </div>
          </div>

          {/* Copy Underneath */}
          <div>
            <h3 className="font-sans font-bold text-lg text-white mb-2">Rules you can read</h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              Thresholds, escalation paths, retention plays. Every policy is a visual rule. Flip a switch, drag a slider, watch the projected impact on the next 30 days. No YAML to learn, no commit to review. A senior operator can shape the engine themselves.
            </p>
          </div>
        </div>

        {/* Card 2: Compounds with your team */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#090B0E] border border-white/[0.08] p-5 hover:border-white/20 transition-all group">
          {/* Mock UI Frame: Glowing Line Chart with fixed height 210px */}
          <div className="rounded-xl bg-[#0E1217] border border-white/[0.08] p-4 font-mono text-xs mb-6 shadow-inner h-[210px] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                <span className="font-bold text-zinc-400">HOURS SAVED · WEEKLY</span>
                <span className="text-emerald-400 font-semibold text-[9px]">wk 12 of 12 • still climbing</span>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-sans text-3xl font-bold text-white tracking-tight">184</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  +247% vs week 1
                </span>
              </div>
            </div>

            {/* Glowing SVG Curve */}
            <div className="relative w-full h-16 my-auto">
              <svg viewBox="0 0 280 70" fill="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGreen2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 60 C 90 58, 170 38, 270 10 L 270 65 L 10 65 Z"
                  fill="url(#areaGreen2)"
                />
                <path
                  d="M 10 60 C 90 58, 170 38, 270 10"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="270" cy="10" r="4" fill="#10B981" className="animate-pulse" />
                <circle cx="270" cy="10" r="7" fill="#10B981" opacity="0.3" />
              </svg>
            </div>

            {/* Chart X-Axis Labels */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/[0.05]">
              <span>wk 1 · 53h</span>
              <span>wk 12 · 184h</span>
            </div>
          </div>

          {/* Copy Underneath */}
          <div>
            <h3 className="font-sans font-bold text-lg text-white mb-2">Compounds with your team</h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              Every approval, every edit, every override sharpens your reconciliation rules. The policy graph learns which vendor patterns you trust and which you hold. You hire Praman once. It compounds.
            </p>
          </div>
        </div>

        {/* Card 3: Audit log on every action */}
        <div className="flex flex-col justify-between rounded-2xl bg-[#090B0E] border border-white/[0.08] p-5 hover:border-white/20 transition-all group">
          {/* Mock UI Frame: Activity Feed with fixed height 210px */}
          <div className="rounded-xl bg-[#0E1217] border border-white/[0.08] p-4 font-mono text-xs mb-6 shadow-inner h-[210px] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/[0.06] text-[9px]">
              <span className="font-bold text-zinc-400 uppercase tracking-wider">ACTIVITY</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveActivityTab('all')}
                  className={`px-1.5 py-0.5 rounded ${
                    activeActivityTab === 'all' ? 'text-emerald-400 font-bold bg-white/[0.06]' : 'text-zinc-500'
                  }`}
                >
                  ALL 5
                </button>
                <button
                  onClick={() => setActiveActivityTab('operator')}
                  className={`px-1.5 py-0.5 rounded ${
                    activeActivityTab === 'operator' ? 'text-emerald-400 font-bold bg-white/[0.06]' : 'text-zinc-500'
                  }`}
                >
                  OPERATOR 2
                </button>
                <button
                  onClick={() => setActiveActivityTab('praman')}
                  className={`px-1.5 py-0.5 rounded ${
                    activeActivityTab === 'praman' ? 'text-emerald-400 font-bold bg-white/[0.06]' : 'text-zinc-500'
                  }`}
                >
                  PRAMAN 3
                </button>
              </div>
            </div>

            {/* Activity Stream matching Indian SME context */}
            <div className="space-y-1.5 text-[9px] overflow-hidden my-auto">
              <div className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div className="text-zinc-300 truncate">
                  <strong className="text-white">Praman</strong> held ₹28,067.80 GST on INV-104
                  <span className="text-zinc-500 block text-[8px]">14 min ago via DuckDB</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div className="text-zinc-300 truncate">
                  <strong className="text-white">Operator</strong> approved CASE-GST-104 split
                  <span className="text-zinc-500 block text-[8px]">14 min ago via workspace</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div className="text-zinc-300 truncate">
                  <strong className="text-white">Praman</strong> matched UTR 432910485799
                  <span className="text-zinc-500 block text-[8px]">8 min ago via SQL</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[8px] text-zinc-500">
              <span className="truncate">every action signed &amp; exportable</span>
              <span className="text-emerald-400 font-semibold shrink-0 ml-1">• live</span>
            </div>
          </div>

          {/* Copy Underneath */}
          <div>
            <h3 className="font-sans font-bold text-lg text-white mb-2">Audit log on every action</h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              Every model call, every drafted action, every human approver: timestamped, signed, and streamed to your SIEM in real time. The activity feed reads like prose, not a terminal log. Statutory audit evidence stops being a separate project.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
