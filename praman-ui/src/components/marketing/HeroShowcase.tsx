import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldAlert, Sparkles, CheckCircle2, ShieldCheck, Database, Lock, Eye, AlertCircle, ArrowUpRight, Scale } from 'lucide-react';
import { BotanicalBackdrop } from './BotanicalBackdrop';

interface HeroShowcaseProps {
  onLaunchWorkspace: (scenarioId?: string) => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ onLaunchWorkspace }) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'ledger' | 'guardrails'>('workspace');
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);

  // Auto-cycle tabs every 5 seconds until user manually clicks
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'workspace') return 'ledger';
        if (prev === 'ledger') return 'guardrails';
        return 'workspace';
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const handleTabClick = (tab: 'workspace' | 'ledger' | 'guardrails') => {
    setIsAutoCycling(false);
    setActiveTab(tab);
  };

  return (
    <section className="relative pt-16 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Swaying Botanical Floral Silhouette Layer in the Background */}
      <BotanicalBackdrop />

      {/* Hero Typography & CTA Layer */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-16">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.12] bg-white/[0.04] text-stone-300 text-xs font-mono font-medium mb-8 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Arthaton 2026 · Neuro-Symbolic SME Finance Engine</span>
        </div>

        {/* Large Crisp White Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
          The reconciliation layer for{' '}
          <span className="italic font-normal text-stone-300 block sm:inline">
            Indian SME finance.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl mx-auto mb-10">
          AI reads and explains. Deterministic code decides. Reconcile messy bank narrations, Razorpay UPI logs, Tally invoices, and GSTR-2B filings in seconds. <strong className="text-white font-medium">Cites every claim.</strong>
        </p>

        {/* Glowing Pill CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onLaunchWorkspace()}
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-100 via-white to-emerald-200 text-stone-950 font-sans text-sm font-bold shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] transition-all duration-300 active:scale-98 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => onLaunchWorkspace('CASE-GST-104')}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.12] font-sans text-sm font-medium transition-all active:scale-98 cursor-pointer backdrop-blur-sm"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Run Scenario 1 (₹1,84,000 GST Hold)</span>
          </button>
        </div>
      </div>

      {/* Floating macOS-Style Interactive Showcase Window */}
      <div className="relative z-10 max-w-5xl mx-auto rounded-xl border border-white/[0.1] bg-[#0D1117]/95 shadow-[0_20px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden transition-all">
        {/* macOS Traffic Lights & URL Bar */}
        <div className="px-4 py-3 bg-[#161B22]/80 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
            <div className="ml-3 px-3 py-1 rounded bg-[#0D1117] border border-white/[0.06] text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>app.praman.ai / workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DuckDB 10,040 rows</span>
            </span>
          </div>
        </div>

        {/* Tab Preview Viewport */}
        <div className="p-4 sm:p-6 bg-[#0D1117] min-h-[420px]">
          {/* TAB 01: Case Workspace (Directly modeled on Manthan 3-column triage in video) */}
          {activeTab === 'workspace' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch text-xs font-mono">
              {/* Left Column: Case Queue */}
              <div className="md:col-span-3 rounded-lg border border-white/[0.08] bg-[#161B22]/60 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08] text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                    <span>CASES (3)</span>
                    <span className="text-emerald-400">SYNCED</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-stone-200">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-white">Sri Balaji Ent</span>
                        <span className="text-emerald-400 text-[10px]">₹1,84,000</span>
                      </div>
                      <span className="text-[10px] text-amber-300 block">MISSING GSTR-2B</span>
                      <span className="text-[9px] text-stone-400 mt-1 block">INV-2026-104 · 12m ago</span>
                    </div>

                    <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.04] text-stone-400">
                      <div className="flex justify-between items-baseline mb-1">
                        <span>Ganpati Trading</span>
                        <span className="text-stone-300 text-[10px]">₹14,500</span>
                      </div>
                      <span className="text-[10px] text-blue-400 block">UPI DOUBLE-DEBIT</span>
                      <span className="text-[9px] text-stone-500 mt-1 block">UTR 432910485799 · 24m</span>
                    </div>

                    <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.04] text-stone-400">
                      <div className="flex justify-between items-baseline mb-1">
                        <span>CloudTech Solutions</span>
                        <span className="text-stone-300 text-[10px]">₹84,000</span>
                      </div>
                      <span className="text-[10px] text-purple-400 block">SLA DOWNTIME CREDIT</span>
                      <span className="text-[9px] text-stone-500 mt-1 block">CR-SLA-302 · 45m</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.08] text-[10px] text-stone-400 flex items-center justify-between">
                  <span>3 cases queue</span>
                  <span className="text-emerald-400 font-bold">1-click audit</span>
                </div>
              </div>

              {/* Center Column: Cited Brief & Actions */}
              <div className="md:col-span-5 rounded-lg border border-white/[0.08] bg-[#161B22]/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08]">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider font-bold">
                      EXECUTIVE MEMO · INV-2026-104
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                      HOLD GST PORTION
                    </span>
                  </div>

                  <p className="text-xs font-sans text-stone-300 leading-relaxed mb-3">
                    Sri Balaji Enterprises billed <strong>₹1,84,000.00</strong> on 18-Nov-2026. GSTR-2B government portal shows <span className="text-rose-400 font-mono font-bold">NOT_FILED</span>. Releasing tax creates immediate 18% reversal risk under Section 16(2)(aa).
                  </p>

                  <div className="p-3 rounded bg-[#0D1117] border border-white/[0.06] space-y-1.5 mb-3 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Claimed Invoice Total:</span>
                      <span className="text-white font-bold">₹1,84,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Statutory Tax Hold [18%]:</span>
                      <span className="text-amber-400 font-bold">₹28,067.80 [HOLD]</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.06] pt-1.5">
                      <span className="text-stone-400">Safe Net Release:</span>
                      <span className="text-emerald-400 font-bold">₹1,56,517.80 [RELEASE]</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Execution Bar */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-stone-400">2 actions ready</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onLaunchWorkspace('CASE-GST-104')}
                      className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-sans font-bold text-xs transition cursor-pointer"
                    >
                      Approve Split
                    </button>
                    <button
                      onClick={() => onLaunchWorkspace('CASE-GST-104')}
                      className="px-3 py-1.5 rounded bg-white/[0.08] hover:bg-white/[0.12] text-stone-300 font-sans font-medium text-xs transition cursor-pointer"
                    >
                      Hold Full
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Evidence & EMI Policy */}
              <div className="md:col-span-4 rounded-lg border border-white/[0.08] bg-[#161B22]/60 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08] text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                    <span>EVIDENCE (4 CITED)</span>
                    <span className="text-emerald-400">VERIFIED</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                      <span className="text-blue-400 font-bold">[1] Tally ERP</span>
                      <p className="text-stone-300 text-[10px] mt-0.5">INV-2026-104 · ₹1,84,000</p>
                    </div>
                    <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                      <span className="text-rose-400 font-bold">[2] GSTR-2B Tax</span>
                      <p className="text-stone-300 text-[10px] mt-0.5">Status: NOT_FILED · ₹0 ITC</p>
                    </div>
                    <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                      <span className="text-emerald-400 font-bold">[3] RBI Master IFSC</span>
                      <p className="text-stone-300 text-[10px] mt-0.5">KVBL0001245 · Karur Vysya</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px]">
                  <span className="text-emerald-400 font-bold block mb-0.5">30-Day Loan EMI Safeguard:</span>
                  <div className="flex justify-between text-stone-300">
                    <span>HDFC Business EMI:</span>
                    <span className="font-bold text-white">₹1,10,000.00</span>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>Post-Split Coverage:</span>
                    <span className="text-emerald-300 font-bold">1.42x (Preserved)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 02: Multi-Row Reconciliation Ledger */}
          {activeTab === 'ledger' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">DuckDB Reconciliation Table</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    10,040 rows queryable
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">Sorted by exposure at risk</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-stone-400 text-[10px] uppercase">
                      <th className="pb-2">Case / Reference</th>
                      <th className="pb-2">Counterparty</th>
                      <th className="pb-2">Disputed Amount</th>
                      <th className="pb-2">Ledger Status</th>
                      <th className="pb-2 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr>
                      <td className="py-2.5 text-white font-bold">INV-2026-104</td>
                      <td className="py-2.5 text-stone-300">Sri Balaji Enterprises</td>
                      <td className="py-2.5 text-rose-400 font-bold">₹28,067.80</td>
                      <td className="py-2.5 text-amber-300">GSTR-2B Unfiled</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                          HOLD GST
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-white font-bold">UTR 432910485799</td>
                      <td className="py-2.5 text-stone-300">Ganpati Trading Co</td>
                      <td className="py-2.5 text-stone-400">₹0.00</td>
                      <td className="py-2.5 text-emerald-400">Ledger &amp; GSTR Reconciled</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                          SAFE TO PAY
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-white font-bold">CASE-UPI-209</td>
                      <td className="py-2.5 text-stone-300">Razorpay / NPCI Node</td>
                      <td className="py-2.5 text-rose-400 font-bold">₹14,500.00</td>
                      <td className="py-2.5 text-blue-300">Switch Double-Debit</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px]">
                          DISPUTE HOLD
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-white font-bold">CASE-SLA-302</td>
                      <td className="py-2.5 text-stone-300">CloudTech Solutions</td>
                      <td className="py-2.5 text-rose-400 font-bold">₹5,600.00</td>
                      <td className="py-2.5 text-purple-300">99.1% SLA Downtime (4h)</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                          PRO-RATA CREDIT
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.08] text-[11px]">
                <div className="p-2.5 rounded bg-[#161B22] border border-white/[0.06]">
                  <span className="text-stone-400 block text-[10px]">Total Exposure At Risk</span>
                  <span className="text-rose-400 font-bold text-sm">₹48,167.80</span>
                </div>
                <div className="p-2.5 rounded bg-[#161B22] border border-white/[0.06]">
                  <span className="text-stone-400 block text-[10px]">Retained Liquidity</span>
                  <span className="text-emerald-400 font-bold text-sm">₹1,56,517.80</span>
                </div>
                <div className="p-2.5 rounded bg-[#161B22] border border-white/[0.06]">
                  <span className="text-stone-400 block text-[10px]">HDFC Debt EMI Runway</span>
                  <span className="text-emerald-300 font-bold text-sm">1.42x Protected</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 03: Policy & SQL Guardrails */}
          {activeTab === 'guardrails' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">Deterministic Financial Guardrail Policies</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  4 Active Invariants
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded bg-[#161B22] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">CGST Section 16(2)(aa) Check</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      ENFORCED
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    Automatically holds disputed GST portion if supplier invoice is missing or unfiled in GSTR-2B.
                  </p>
                </div>

                <div className="p-3.5 rounded bg-[#161B22] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Block SUM(running_balance)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      BLOCKED
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    Halts queries summing bank balances; auto-heals to point-in-time latest balance via txn_date DESC.
                  </p>
                </div>

                <div className="p-3.5 rounded bg-[#161B22] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Indic Vendor Matching (jw_sim &ge; 0.90)</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      DEDUPLICATED
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    Strips M/S, ENT, PVT LTD; QUALIFY ROW_NUMBER() prevents Cartesian fanout across all 153 vendors.
                  </p>
                </div>

                <div className="p-3.5 rounded bg-[#161B22] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Zero-MDR &amp; Cashflow Direction Gate</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] font-sans">
                    Flags incoming UPI payments carrying outgoing debits or amount variances &gt; ₹0.01 as ACTION_REQUIRED.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-blue-950/30 border border-blue-500/30 text-[11px] text-stone-300 flex items-center justify-between">
                <span>All guardrails execute deterministically in DuckDB with zero mental arithmetic hallucinations.</span>
                <button
                  onClick={() => onLaunchWorkspace()}
                  className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer shrink-0 ml-2"
                >
                  Inspect in Workspace &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Centered 3-Pill Tab Switcher Underneath Showcase Frame (Manthan Aesthetic) */}
        <div className="px-6 py-4 bg-[#161B22]/90 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => handleTabClick('workspace')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-white text-stone-950 font-bold shadow-sm'
                : 'bg-white/[0.05] text-stone-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            01 Case workspace
          </button>
          <button
            onClick={() => handleTabClick('ledger')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-white text-stone-950 font-bold shadow-sm'
                : 'bg-white/[0.05] text-stone-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            02 Reconciliation ledger
          </button>
          <button
            onClick={() => handleTabClick('guardrails')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'guardrails'
                ? 'bg-white text-stone-950 font-bold shadow-sm'
                : 'bg-white/[0.05] text-stone-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            03 Policy &amp; SQL Guardrails
          </button>
        </div>
      </div>
    </section>
  );
};
