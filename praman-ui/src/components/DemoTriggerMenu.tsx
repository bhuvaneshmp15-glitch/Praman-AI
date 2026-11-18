import React from 'react';
import { Database, ShieldAlert, RefreshCw, Cpu, CheckCircle2, Zap } from 'lucide-react';
import { HealthResponse } from '../types';

interface DemoTriggerMenuProps {
  health: HealthResponse | null;
  activeScenarioId: string;
  isInvestigating: boolean;
  onTriggerScenario: (scenarioId: string) => void;
}

export const DemoTriggerMenu: React.FC<DemoTriggerMenuProps> = ({
  health,
  activeScenarioId,
  isInvestigating,
  onTriggerScenario,
}) => {
  const scenarios = [
    {
      id: 'CASE-GST-104',
      badge: 'Scenario 1',
      title: 'Missing GSTR-2B ITC Hold',
      detail: '₹1,84,000 · Sri Balaji Ent',
      color: 'border-amber-700/30 bg-amber-50 hover:bg-amber-100 text-amber-900',
      activeColor: 'border-amber-600 bg-amber-100 text-amber-950 ring-1 ring-amber-600',
      icon: ShieldAlert,
    },
    {
      id: 'CASE-UPI-209',
      badge: 'Scenario 2',
      title: 'UPI Switch Double-Debit Dispute',
      detail: '₹14,500 · RRN Proof',
      color: 'border-blue-700/30 bg-blue-50 hover:bg-blue-100 text-blue-900',
      activeColor: 'border-blue-600 bg-blue-100 text-blue-950 ring-1 ring-blue-600',
      icon: RefreshCw,
    },
    {
      id: 'CASE-SLA-302',
      badge: 'Scenario 3',
      title: 'B2B SLA Downtime Pro-Rata Credit',
      detail: '₹84,000 -> ₹5,600',
      color: 'border-emerald-700/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-900',
      activeColor: 'border-emerald-600 bg-emerald-100 text-emerald-950 ring-1 ring-emerald-600',
      icon: Zap,
    },
  ];

  const rowCountFormatted = health?.total_rows
    ? health.total_rows.toLocaleString('en-IN')
    : '10,040';

  return (
    <header className="border-b border-paper-border bg-paper shadow-paper-sm sticky top-0 z-30">
      {/* Top Banner: Brand + DuckDB Engine Stats */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#1C1917] text-white flex items-center justify-center font-serif text-xl font-bold tracking-tight shadow-sm">
            प्र
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-paper-text tracking-tight">
                Praman
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded border border-[#1C1917]/20 bg-[#1C1917]/5 text-paper-text font-semibold">
                Autonomous Copilot
              </span>
            </div>
            <p className="text-xs text-paper-muted font-sans">
              Autonomous B2B Financial Reconciliation &amp; Cash-Flow Protection Engine
            </p>
          </div>
        </div>

        {/* Live DuckDB Semantic Engine Status Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-600/30 bg-blue-50 text-blue-900 text-xs font-mono shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-blue-700" />
            <span className="font-semibold text-blue-950">AI Reads &amp; Explains</span>
            <span className="text-blue-400">·</span>
            <span>Deterministic Code Decides</span>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-emerald-600/30 bg-emerald-50 text-emerald-900 text-xs font-mono shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold text-emerald-950">
              DuckDB Semantic Engine:
            </span>
            <span>{rowCountFormatted} Rows</span>
            <span className="text-emerald-400">|</span>
            <span>4 Indic UDFs</span>
          </div>
        </div>
      </div>

      {/* 1-Click Judge Scenario Bar */}
      <div className="border-t border-paper-border/60 bg-paper-subtle/40 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-paper-muted">
            <span className="uppercase tracking-wider font-mono text-[11px] font-semibold text-paper-text">
              1-Click Judge Scenarios:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {scenarios.map((sc) => {
              const Icon = sc.icon;
              const isActive = activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onTriggerScenario(sc.id)}
                  disabled={isInvestigating}
                  className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-md border text-left transition-all shadow-paper-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                    isActive ? sc.activeColor : sc.color
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1 rounded bg-black/10">
                        {sc.badge}
                      </span>
                      <span className="font-sans text-xs font-bold leading-none">
                        {sc.title}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-paper-muted mt-0.5 leading-none">
                      {sc.detail}
                    </div>
                  </div>
                  {isActive && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
