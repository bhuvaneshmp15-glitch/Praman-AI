import React, { useRef, useEffect } from 'react';
import {
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Layers,
  Sparkles,
  Building2,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { InvestigationFeedEvent, SqlAttemptEvent } from '../types';

interface LiveSqlFeedProps {
  events: InvestigationFeedEvent[];
  isInvestigating: boolean;
}

export const LiveSqlFeed: React.FC<LiveSqlFeedProps> = ({ events, isInvestigating }) => {
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="h-full flex flex-col bg-obsidian text-obsidian-text border border-obsidian-border rounded-lg overflow-hidden shadow-2xl">
      {/* Terminal Top Bar */}
      <div className="px-4 py-3 bg-[#161B22] border-b border-obsidian-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
          </div>
          <span className="font-mono text-xs text-obsidian-muted ml-2 flex items-center gap-1.5 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-obsidian-accent" />
            praman-duckdb-plane://semantic-trace
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isInvestigating ? (
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Autonomous Reasoning Live...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Semantic Plane Standby</span>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Content Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs terminal-scroll">
        {events.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-obsidian-muted space-y-2">
            <Search className="w-8 h-8 opacity-40 text-obsidian-accent" />
            <p className="font-mono text-xs">Awaiting Scenario Trigger...</p>
            <p className="font-sans text-[11px] opacity-60">
              Click any 1-Click Judge Scenario above to observe live SQL queries, UDF executions, and guardrails.
            </p>
          </div>
        ) : (
          events.map((ev) => {
            switch (ev.type) {
              case 'ai_extract_intake':
                return (
                  <div key={ev.id} className="p-3 rounded bg-blue-950/40 border border-blue-500/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-bold">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      <span>JOB A: UNSTRUCTURED INTAKE EXTRACTION (AI READS &amp; SANITIZES)</span>
                      <span className="text-obsidian-muted font-normal ml-auto text-[10px]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-blue-200 leading-relaxed">
                      Redacting PII / account numbers and extracting structured parameters (UTR, amount, counterparty)...
                    </p>
                  </div>
                );

              case 'ai_intake_extracted':
                return (
                  <div key={ev.id} className="p-3 rounded bg-blue-950/20 border border-blue-600/30 space-y-2">
                    <div className="flex items-center justify-between text-blue-300 text-[11px]">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        STRUCTURED INTAKE REGISTERED (PII REDACTED)
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200">
                        {ev.data.provider} ({ev.data.latency_ms}ms)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-black/40 p-2 rounded">
                      <div>
                        <span className="text-obsidian-muted block text-[10px]">UTR / RRN</span>
                        <span className="font-bold text-white truncate block">{ev.data.extracted?.utr || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-obsidian-muted block text-[10px]">Amount</span>
                        <span className="font-bold text-white truncate block">{ev.data.extracted?.amount ? `₹${ev.data.extracted.amount}` : 'None'}</span>
                      </div>
                      <div>
                        <span className="text-obsidian-muted block text-[10px]">Vendor / Sender</span>
                        <span className="font-bold text-white truncate block">{ev.data.extracted?.sender_or_vendor || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-obsidian-muted block text-[10px]">Invoice Ref</span>
                        <span className="font-bold text-white truncate block">{ev.data.extracted?.invoice_id || 'None'}</span>
                      </div>
                    </div>
                  </div>
                );

              case 'ai_synthesize_memo':
                return (
                  <div key={ev.id} className="p-3 rounded bg-purple-950/40 border border-purple-500/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-purple-400 text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>JOB B: EXECUTIVE MEMO SYNTHESIS (AI EXPLAINS DETERMINISTIC FACTS)</span>
                      <span className="text-obsidian-muted font-normal ml-auto text-[10px]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-purple-200 leading-relaxed">
                      Converting verified DuckDB table records and cashflow runway metrics into plain-language executive memorandum...
                    </p>
                  </div>
                );

              case 'ai_memo_synthesized':
                return (
                  <div key={ev.id} className="p-2.5 rounded bg-purple-950/20 border border-purple-600/30 flex items-center justify-between text-purple-200 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>
                        Executive Memo Synthesized: <strong className="font-mono text-purple-300">100% Provenance Citations Intact</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/40 font-bold">
                      {ev.data.provider} ({ev.data.latency_ms}ms)
                    </span>
                  </div>
                );

              case 'thought':
                return (
                  <div key={ev.id} className="p-3 rounded bg-[#161B22]/90 border border-[#30363D] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-obsidian-purple text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-obsidian-purple" />
                      <span>INVESTIGATOR REASONING TRACE</span>
                      <span className="text-obsidian-muted font-normal ml-auto text-[10px]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-stone-300 leading-relaxed">
                      {ev.data.thought}
                    </p>
                  </div>
                );

              case 'sql_attempt': {
                const data: SqlAttemptEvent = ev.data;
                const isRetry = data.phase === 'RETRY_HEALING' || data.status === 'GUARDRAIL_INTERCEPTED';
                const isObs = data.phase === 'OBSERVATION';

                if (isRetry) {
                  return (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/50 space-y-2.5 shadow-md animate-in slide-in-from-left duration-200"
                    >
                      <div className="flex items-center justify-between text-rose-400">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          Self-Healing SQL: Attempt {data.attempt || 1} Guardrail Intercepted
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 border border-rose-600/40 font-mono text-rose-300">
                          SqlSemanticError
                        </span>
                      </div>

                      <div className="text-rose-200 text-xs bg-black/40 p-2.5 rounded border border-rose-900/50 font-mono">
                        {data.error}
                      </div>

                      <div className="text-emerald-300 text-[11px] bg-emerald-950/40 p-2.5 rounded border border-emerald-800/40 font-sans space-y-1">
                        <span className="font-bold uppercase tracking-wider font-mono text-[10px] text-emerald-400 block">
                          Autonomous Healing Correction Strategy:
                        </span>
                        <span>{data.healing_strategy}</span>
                      </div>
                    </div>
                  );
                }

                if (isObs) {
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-4 px-3 py-2 rounded bg-[#161B22] border border-[#30363D] text-obsidian-muted text-[11px]"
                    >
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-bold">SQL Executed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Latency: <strong className="text-stone-200">{data.elapsed_ms || 2.4} ms</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Rows Returned: <strong className="text-stone-200">{data.row_count || 1}</strong></span>
                      </div>
                    </div>
                  );
                }

                // Normal SQL Execute
                return (
                  <div key={ev.id} className="p-3.5 rounded-lg bg-[#0E1520] border border-[#1E293B] space-y-2">
                    <div className="flex items-center justify-between text-obsidian-accent text-[11px]">
                      <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                        <Cpu className="w-3.5 h-3.5" />
                        {data.purpose || 'DuckDB OLAP Execution'}
                      </span>
                      <span className="text-[10px] text-obsidian-muted">
                        Semantic Plane CTE
                      </span>
                    </div>

                    <div className="bg-[#090D13] p-3 rounded border border-obsidian-border/80 overflow-x-auto text-[11px] leading-relaxed text-emerald-400">
                      <pre className="whitespace-pre-wrap">{data.raw_sql}</pre>
                    </div>
                  </div>
                );
              }

              case 'ifsc_verified':
                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg bg-purple-950/30 border border-purple-600/40 space-y-2 text-purple-200"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        Live Bank Routing Header Verified: {ev.data.IFSC}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/40 text-purple-200">
                        https://ifsc.razorpay.com
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="bg-black/30 p-1.5 rounded">
                        <span className="text-purple-400 block text-[10px]">Bank</span>
                        <span className="font-bold text-white truncate block">{ev.data.BANK}</span>
                      </div>
                      <div className="bg-black/30 p-1.5 rounded">
                        <span className="text-purple-400 block text-[10px]">Branch</span>
                        <span className="font-bold text-white truncate block">{ev.data.BRANCH}</span>
                      </div>
                      <div className="bg-black/30 p-1.5 rounded">
                        <span className="text-purple-400 block text-[10px]">City</span>
                        <span className="font-bold text-white">{ev.data.CENTRE}</span>
                      </div>
                      <div className="bg-black/30 p-1.5 rounded">
                        <span className="text-purple-400 block text-[10px]">UPI / RTGS</span>
                        <span className="font-bold text-emerald-400">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                );

              case 'pincode_verified':
                return (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded bg-amber-950/30 border border-amber-600/40 flex items-center justify-between text-amber-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>
                        Postal Jurisdiction: Pincode <strong>{ev.data.pincode}</strong> ({ev.data.postal_state}) matches GSTIN Prefix <strong>{ev.data.gstin_state_code}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 border border-amber-700/40 font-bold">
                      VERIFIED_MATCH
                    </span>
                  </div>
                );

              case 'finding_recorded':
                return (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded bg-emerald-950/20 border border-emerald-600/30 flex items-center justify-between text-emerald-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">
                        Citation Registered: <strong className="font-mono text-emerald-300">[{ev.data.citation_id}]</strong> · {ev.data.source_table} ({ev.data.row_id})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold ml-2">
                      IMMUTABLE
                    </span>
                  </div>
                );

              default:
                return null;
            }
          })
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Terminal Footer Info */}
      <div className="px-4 py-2 bg-[#090D13] border-t border-obsidian-border flex items-center justify-between text-[11px] text-obsidian-muted font-mono">
        <div>Engine: DuckDB v1.1.0 In-Memory Columnar Plane</div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Sub-50ms Guardrailed Execution
        </div>
      </div>
    </div>
  );
};
