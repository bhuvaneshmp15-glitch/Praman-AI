import React from 'react';
import { Database, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const metrics = [
    {
      label: '10,040 Indexed Ledger Rows',
      sublabel: 'DuckDB In-Memory Columnar OLAP',
      detail: 'Bank statements, Razorpay UPI, Tally ERP, GSTR-2B',
      icon: Database,
    },
    {
      label: '4 Indic Financial UDFs',
      sublabel: 'Vectorized Deterministic Matching',
      detail: 'extract_utr, norm_indic_vendor, jw_sim, validate_gstin',
      icon: ShieldCheck,
    },
    {
      label: '57 / 57 Tests Passing (100%)',
      sublabel: 'Pytest End-to-End Verification',
      detail: 'Zero fanout across all 153 vendors, exact rupee math',
      icon: CheckCircle2,
    },
    {
      label: 'Offline-First + Optional LLM Key',
      sublabel: 'Neuro-Symbolic Architecture',
      detail: 'Zero PII leak: code decides, optional LLM explains',
      icon: Lock,
    },
  ];

  return (
    <section id="metrics" className="py-14 border-y border-white/[0.08] bg-[#0A0D12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-lg border border-white/[0.06] bg-[#0D1117]/80 hover:bg-[#161B22] transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-md bg-white/[0.05] flex items-center justify-center text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-white tracking-tight">
                    {m.label}
                  </span>
                </div>
                <p className="font-mono text-[11px] font-semibold text-stone-300 mb-1">
                  {m.sublabel}
                </p>
                <p className="font-sans text-xs text-stone-400 leading-normal">
                  {m.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
