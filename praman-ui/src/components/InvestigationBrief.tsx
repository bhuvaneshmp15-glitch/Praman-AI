import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  Building,
} from 'lucide-react';
import { DiscrepancyCase, RunwayImpact } from '../types';
import { CitationChip } from './CitationChip';
import { RunwayWidget } from './RunwayWidget';

interface InvestigationBriefProps {
  currentCase: DiscrepancyCase | null;
  runwayData: RunwayImpact | null;
  isInvestigating: boolean;
  onOpenCitation: (citationKey: string) => void;
  onOpenApproval: () => void;
}

export const InvestigationBrief: React.FC<InvestigationBriefProps> = ({
  currentCase,
  runwayData,
  isInvestigating,
  onOpenCitation,
  onOpenApproval,
}) => {
  if (!currentCase) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-paper border border-paper-border rounded-lg shadow-paper-sm">
        <div className="w-12 h-12 rounded-full bg-paper-subtle border border-paper-border flex items-center justify-center text-paper-muted mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-paper-text">
          No Discrepancy Investigation Loaded
        </h3>
        <p className="text-xs text-paper-muted font-sans max-w-sm mt-1">
          Select one of the 1-click judge scenarios above to trigger autonomous cross-ledger reconciliation.
        </p>
      </div>
    );
  }

  // Parse markdown brief text to inject interactive CitationChips
  const renderBriefWithCitations = (content: string) => {
    // Regex matches [CIT-...] or [something#...]
    const citationRegex = /(\[[a-zA-Z0-9_\-#]+\])/g;
    const parts = content.split(citationRegex);

    return parts.map((part, index) => {
      if (part.match(citationRegex)) {
        const cleanKey = part.replace(/[\[\]]/g, '');
        return (
          <CitationChip
            key={index}
            citationKey={cleanKey}
            onClick={onOpenCitation}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const brief = currentCase.brief;
  const isApproved = currentCase.status === 'APPROVED';

  return (
    <div className="h-full flex flex-col bg-paper border border-paper-border rounded-lg overflow-hidden shadow-paper-sm">
      {/* Dossier Header */}
      <div className="px-6 py-4 bg-paper-card border-b border-paper-border flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1C1917] text-white">
              {currentCase.scenario_id}
            </span>
            <span className="text-xs font-mono text-paper-muted">
              Reference: {currentCase.invoice_or_ref_id || currentCase.case_id}
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-paper-text mt-1 tracking-tight">
            {currentCase.title}
          </h2>
          <p className="text-xs text-paper-muted font-sans">
            Counterparty: <strong className="text-paper-text font-semibold">{currentCase.vendor_or_customer}</strong> · Disputed Amount:{' '}
            <strong className="font-mono text-paper-text font-bold">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(currentCase.amount_at_risk)}
            </strong>
          </p>
        </div>

        {/* Case Status Badge */}
        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              APPROVED &amp; DISPATCHED
            </span>
          ) : isInvestigating ? (
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-sans text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              INVESTIGATING EVIDENCE...
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              BRIEF READY FOR DECISION
            </span>
          )}
        </div>
      </div>

      {/* Dossier Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 paper-scroll">
        {/* Editorial Executive Decision Memo */}
        <div className="bg-paper-card border border-paper-border rounded-lg p-6 shadow-paper-sm space-y-4">
          <div className="flex items-center justify-between border-b border-paper-border/60 pb-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-paper-muted">
              Executive Decision Brief &amp; Audit Memorandum
            </span>
            <span className="text-[11px] font-mono text-paper-muted">
              Deterministic Verification: 100% Provenance
            </span>
          </div>

          {/* Formatted Memo Prose with Clickable Citations */}
          <div className="font-sans text-sm text-paper-text leading-relaxed space-y-4">
            {brief ? (
              <div className="space-y-4 whitespace-pre-line leading-relaxed">
                {renderBriefWithCitations(brief.markdown_brief)}
              </div>
            ) : isInvestigating ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-serif text-sm text-paper-muted italic">
                  Synthesizing multi-table ledger facts, verifying live bank nodal IFSC, and computing mathematical runway impact...
                </p>
              </div>
            ) : (
              <p className="font-serif text-sm text-paper-muted italic">
                Awaiting investigation synthesis.
              </p>
            )}
          </div>
        </div>

        {/* 30-Day Liquidity & EMI Coverage Recharts Widget */}
        <RunwayWidget runwayData={runwayData} />

        {/* Prescribed Resolution Actions & Human Sign-off Section */}
        {brief && brief.actions && brief.actions.length > 0 && (
          <div className="bg-paper-card border border-paper-border rounded-lg p-6 shadow-paper-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-paper-text">
                  Prescribed Downstream Resolution Actions
                </h4>
                <p className="text-xs text-paper-muted font-sans">
                  Deterministic remediation steps pending Human Finance Controller approval
                </p>
              </div>

              {!isApproved && (
                <button
                  onClick={onOpenApproval}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Approve &amp; Execute Resolution</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {brief.actions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-paper-border bg-paper-subtle/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                      Step {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      {act.action}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-paper-text">
                    {act.amount
                      ? `Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(act.amount)}`
                      : act.reason || act.new_status || 'Automated downstream execution'}
                  </p>
                  {act.target && (
                    <span className="inline-block text-[10px] font-mono text-paper-muted">
                      Target: {act.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
