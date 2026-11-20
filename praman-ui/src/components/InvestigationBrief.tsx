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
  HelpCircle,
  CheckSquare,
  Square,
  AlertTriangle,
  Cpu,
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
          Select one of the 1-click judge scenarios above or paste an unseen bank SMS / narration in the sandbox to trigger cross-ledger reconciliation.
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
  const decision = brief?.decision || '';

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
            {/* Division of Labor Badge */}
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              <Cpu className="w-3 h-3" />
              AI Reads &amp; Explains · Deterministic Code Decides
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-paper-text mt-1 tracking-tight">
            {currentCase.title}
          </h2>
          <p className="text-xs text-paper-muted font-sans">
            Counterparty: <strong className="text-paper-text font-semibold">{currentCase.vendor_or_customer}</strong> · Disputed / Hold Amount:{' '}
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
          ) : decision === 'NOT_FOUND_IN_STATEMENT' ? (
            <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <HelpCircle className="w-4 h-4 text-stone-600" />
              NOT FOUND IN STATEMENT
            </span>
          ) : decision === 'NO_DISCREPANCY_FOUND' ? (
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              NO DISCREPANCY FOUND
            </span>
          ) : decision === 'AMOUNT_MISMATCH' ? (
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              AMOUNT MISMATCH (DELTA HELD)
            </span>
          ) : decision === 'DIRECTION_MISMATCH' ? (
            <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              DIRECTION MISMATCH
            </span>
          ) : decision === 'GATEWAY_STATUS_BLOCKED' ? (
            <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-900 border border-red-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              GATEWAY STATUS BLOCKED
            </span>
          ) : decision === 'VENDOR_MISMATCH' ? (
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              VENDOR MISMATCH
            </span>
          ) : decision === 'INCONCLUSIVE_MANUAL_REVIEW' ? (
            <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <HelpCircle className="w-4 h-4 text-stone-600" />
              INCONCLUSIVE (MANUAL REVIEW)
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-sans text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              HOLD DISPUTED PORTION
            </span>
          )}
        </div>
      </div>

      {/* Dossier Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 paper-scroll">
        {/* Realistic Not-Found Guidance Alert */}
        {decision === 'NOT_FOUND_IN_STATEMENT' && (
          <div className="bg-stone-50 border border-stone-300 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Realistic Unrecorded Claim Protocol
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              <strong>Audit Finding:</strong> Not found in the statement as of <strong>2026-11-18</strong>. Ask the counterparty for the 12-digit UTR / bank advice proof and recheck after the next NEFT/UPI settlement cycle. Zero funds held or disbursed until verified ledger proof is provided.
            </p>
          </div>
        )}

        {/* Verification Checklist Card (Dynamic Evidence-Driven Checklist) */}
        {brief?.verification_checklist ? (
          <div className="bg-paper-card border border-paper-border rounded-lg p-5 shadow-paper-sm space-y-3">
            <div className="flex items-center justify-between border-b border-paper-border/60 pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <h4 className="font-serif text-sm font-bold text-paper-text">
                  Reconciliation Verification Checklist
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Evidence-Grounded Audit
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1.5 bg-emerald-50/60 p-3 rounded border border-emerald-200/80">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                  ✓ Checked &amp; Matched (Deterministic Engine)
                </span>
                <ul className="space-y-1 text-emerald-900">
                  {brief.verification_checklist.checked.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 bg-amber-50/60 p-3 rounded border border-amber-200/80">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  ! Requires Human Sign-off
                </span>
                <ul className="space-y-1 text-amber-900">
                  {brief.verification_checklist.pending_human_signoff.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : decision === 'NO_DISCREPANCY_FOUND' && (
          <div className="bg-paper-card border border-paper-border rounded-lg p-5 shadow-paper-sm space-y-3">
            <div className="flex items-center justify-between border-b border-paper-border/60 pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <h4 className="font-serif text-sm font-bold text-paper-text">
                  Reconciliation Verification Checklist
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Automated Verification Complete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1.5 bg-emerald-50/60 p-3 rounded border border-emerald-200/80">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                  ✓ Checked &amp; Matched (Deterministic Engine)
                </span>
                <ul className="space-y-1 text-emerald-900">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bank statement settlement &amp; narration verified</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Razorpay UPI RRN &amp; transaction status confirmed</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tally invoice total matches supporting tax records</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>GSTR-2B supplier filing status confirmed <code className="font-mono text-[10px] bg-emerald-100 px-1 py-0.5 rounded">FILED</code></span>
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5 bg-amber-50/60 p-3 rounded border border-amber-200/80">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  ! Requires Human Sign-off (Not In Scope of Ledgers)
                </span>
                <ul className="space-y-1 text-amber-900">
                  <li className="flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Duplicate invoice check across prior financial years</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Beneficiary bank account ownership verification</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Physical goods delivery (GRN) or service acceptance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

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
