import React from 'react';
import { FileText, Cpu, CheckCircle2, ShieldCheck, ArrowRight, UploadCloud, AlertTriangle, Scale } from 'lucide-react';

interface HowItWorksScenesProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const HowItWorksScenes: React.FC<HowItWorksScenesProps> = ({ onOpenWorkspace }) => {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Headline */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2 block">
          End-to-End Financial Pipeline
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
          How Praman Reconciles Indian SME Cash-Flow
        </h2>
        <p className="font-sans text-base text-stone-400">
          A three-stage Neuro-Symbolic architecture designed to eliminate mental arithmetic, prevent Cartesian explosions, and protect bank loan EMIs.
        </p>
      </div>

      {/* 3 Editorial Narrative Cards */}
      <div className="space-y-10">
        {/* Card 01 */}
        <div id="intake" className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-8 shadow-2xl transition-all hover:border-white/[0.14]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-stone-200 border border-white/[0.08]">
                  STAGE 01
                </span>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  AI Reads &amp; Redacts
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                Unstructured Bank Intake with Local PII Protection
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed mb-4">
                Finance managers paste raw bank SMS alerts, WhatsApp payment screenshot text, or upload full bank statement CSVs. Praman runs local regex sanitization, redacting sensitive account numbers before extracting intent, amounts, and 12-digit UTR references.
              </p>
              <ul className="space-y-2 font-mono text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sub-50ms vectorized UTR &amp; RRN extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Local PII tokenization (&lt;ACCOUNT_NUM&gt;, &lt;VPA&gt;)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Arbitrary CSV statement ingestion into DuckDB</span>
                </li>
              </ul>
            </div>

            {/* Visual Artifact */}
            <div className="lg:col-span-7 bg-[#161B22]/70 border border-white/[0.08] rounded-lg p-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08] text-[11px] text-stone-400">
                <span>RAW SMS INTAKE ➔ LOCAL TOKENIZER</span>
                <span className="text-blue-400 font-semibold">PII REDACTED</span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded border border-white/[0.06] text-stone-300 mb-3 text-[11px] leading-relaxed">
                &ldquo;Dear Customer, your A/c XX4892 debited by Rs 18,400.00 on 18-Nov-26 transfer to SRI BALAJI ENT UPI Ref 632819045112&rdquo;
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                  <span className="text-stone-500 block">Intent</span>
                  <span className="font-bold text-white">RECONCILIATION</span>
                </div>
                <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                  <span className="text-stone-500 block">Claimed UTR</span>
                  <span className="font-bold text-blue-400">632819045112</span>
                </div>
                <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                  <span className="text-stone-500 block">Amount</span>
                  <span className="font-bold text-white">₹18,400.00</span>
                </div>
                <div className="p-2 rounded bg-[#0D1117] border border-white/[0.06]">
                  <span className="text-stone-500 block">Vendor</span>
                  <span className="font-bold text-white">SRI BALAJI ENT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 02 */}
        <div id="guardrails" className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-8 shadow-2xl transition-all hover:border-white/[0.14]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-last lg:order-first bg-[#161B22]/70 border border-[#30363D] rounded-lg p-5 font-mono text-xs text-[#C9D1D9]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#30363D] text-[11px]">
                <span className="text-[#58A6FF] font-bold">SQL INTERCEPTION &amp; SELF-HEALING</span>
                <span className="text-[#3FB950] bg-[#161B22] px-2 py-0.5 rounded border border-[#30363D]">
                  GUARDRAILS ACTIVE
                </span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded bg-[#0D1117] border border-[#F85149]/40 text-[#F85149]">
                  <span className="font-bold block">INTERCEPTED:</span>
                  <span>SUM(running_balance) on bank_statement</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    ↳ Prohibited: Running balances are non-additive point-in-time snapshots.
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#0D1117] border border-[#3FB950]/40 text-[#3FB950]">
                  <span className="font-bold block">SELF-HEALED:</span>
                  <span>LATEST_BALANCE via txn_date DESC LIMIT 1</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    ↳ Extracted true verified liquidity: ₹1,28,450.00
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                  STAGE 02
                </span>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">
                  Deterministic Code Decides
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                DuckDB Semantic OLAP &amp; Financial Guardrails
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed mb-4">
                100% of analytical execution and verdict classification is governed by deterministic DuckDB SQL and pure Python UDFs. Praman intercepts mathematical anti-patterns, validates cash-flow direction (inbound credits vs outgoing debits), and prevents Cartesian explosions across look-alike vendor entities.
              </p>
              <ul className="space-y-2 font-mono text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Jaro-Winkler Indic entity normalization (M/S, ENT, PVT LTD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>QUALIFY ROW_NUMBER() window ranking caps join fanouts &le; 25</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Strict direction verification: incoming UPI settlements must be credits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card 03 */}
        <div id="architecture" className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-8 shadow-2xl transition-all hover:border-white/[0.14]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  STAGE 03
                </span>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Human Approves
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                Cited Executive Brief &amp; 30-Day EMI Survival
              </h3>
              <p className="font-sans text-sm text-stone-400 leading-relaxed mb-4">
                Before any rupee leaves the firm&apos;s account, Praman cross-references statutory GSTR-2B compliance (CGST Section 16(2)(aa) &amp; 16(4)), live RBI master IFSC routing, and upcoming bank debt commitments. The result is a cited legal brief with 1-click human execution.
              </p>
              <ul className="space-y-2 font-mono text-xs text-stone-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deterministic cashflow math: exact EMI coverage ratios (1.17x ➔ 1.42x)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time Razorpay IFSC API query (Karur Vysya Bank / KVBL0001245)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Statutory split-payout notice generation with Section 16 legal citations</span>
                </li>
              </ul>

              <button
                onClick={() => onOpenWorkspace('CASE-GST-104')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-sans text-xs font-bold shadow-sm transition active:scale-98 cursor-pointer"
              >
                <span>Test Live Scenario 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Artifact: Cited Brief Preview */}
            <div className="lg:col-span-7 bg-[#161B22]/70 border border-white/[0.08] rounded-lg p-5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.08] text-[11px]">
                <span className="text-white font-bold">EXECUTIVE DOSSIER MEMO</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30">
                  VERIFIED CITATIONS
                </span>
              </div>
              <div className="p-3 bg-[#0D1117] rounded border border-white/[0.06] text-stone-300 mb-3 space-y-2">
                <p className="font-serif text-sm font-semibold text-white">
                  Recommended Action: Split Payment Release
                </p>
                <p className="text-[11px] font-sans text-stone-400 leading-normal">
                  - Release net taxable amount <strong>₹1,56,517.80</strong> to Sri Balaji Enterprises via Karur Vysya Bank.
                </p>
                <p className="text-[11px] font-sans text-stone-400 leading-normal">
                  - Withhold GST component <strong>₹28,067.80</strong> under Section 16(2)(aa) until invoice is reported on GST portal.
                </p>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-[#0D1117] border border-white/[0.06] text-[11px]">
                <span className="text-stone-400">Upcoming Debt Commitment:</span>
                <span className="font-bold text-white">₹1,10,000 HDFC Debt EMI (25-Nov-2026)</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  1.42x SAFE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
