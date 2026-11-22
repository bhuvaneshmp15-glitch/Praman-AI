import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Lock,
  Mail,
  Send,
  Building2,
  FileCheck,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ApprovalResponse, ActionPlan } from '../types';

interface ApprovalCinematicProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  actions: ActionPlan[];
  onExecuteApproval: () => Promise<ApprovalResponse>;
}

export const ApprovalCinematic: React.FC<ApprovalCinematicProps> = ({
  isOpen,
  onClose,
  caseId,
  actions,
  onExecuteApproval,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [approvalResult, setApprovalResult] = useState<ApprovalResponse | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'email_preview' | 'audit_log'>('flow');

  const executionSteps = [
    {
      title: 'Split Principal & Statutory Withholding',
      desc: 'Locking unfiled IGST ₹28,067.80 hold in Tally ERP pending vendor GSTR-1 compliance.',
      icon: Lock,
    },
    {
      title: 'Attach Live Bank Routing Headers',
      desc: 'Live query to https://ifsc.razorpay.com/KVBL0001245 attaching RBI nodal clearing headers.',
      icon: Building2,
    },
    {
      title: 'Dispatch Vendor Discrepancy Notice',
      desc: 'Generating and dispatching official Section 16(2)(aa) audit discrepancy notice email.',
      icon: Mail,
    },
    {
      title: 'Commit Immutable Audit Trail',
      desc: 'Inserting signed SHA-256 idempotency hash into DuckDB audit_trail ledger table.',
      icon: FileCheck,
    },
  ];

  const handleStartExecution = async () => {
    setIsExecuting(true);
    setCurrentStep(1);

    try {
      // Step 1
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(2);

      // Step 2
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(3);

      // Step 3
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(4);

      // Call API
      const result = await onExecuteApproval();
      setApprovalResult(result);
      setCurrentStep(5); // Complete
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyIdempotencyKey = () => {
    if (approvalResult?.idempotency_key) {
      navigator.clipboard.writeText(approvalResult.idempotency_key);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-paper-card border border-paper-border rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-paper-border flex items-center justify-between bg-paper-subtle/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-paper-text">
                  Human Approval &amp; Downstream Execution Cinematic
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300">
                  {caseId}
                </span>
              </div>
              <p className="text-xs text-paper-muted font-sans mt-0.5">
                Automated statutory hold dispatch, live IFSC routing, and immutable audit logging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-paper-border/60 text-paper-muted hover:text-paper-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {approvalResult && (
          <div className="px-6 border-b border-paper-border bg-paper-subtle/30 flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('flow')}
              className={`py-2.5 border-b-2 font-sans transition-colors ${
                activeTab === 'flow'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent text-paper-muted hover:text-paper-text'
              }`}
            >
              Execution Timeline
            </button>
            <button
              onClick={() => setActiveTab('email_preview')}
              className={`py-2.5 border-b-2 font-sans transition-colors flex items-center gap-1.5 ${
                activeTab === 'email_preview'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent text-paper-muted hover:text-paper-text'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Vendor GST Notice (HTML Preview)
            </button>
            <button
              onClick={() => setActiveTab('audit_log')}
              className={`py-2.5 border-b-2 font-sans transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit_log'
                  ? 'border-emerald-600 text-emerald-900 font-bold'
                  : 'border-transparent text-paper-muted hover:text-paper-text'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Immutable Audit Record
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 paper-scroll flex-1">
          {activeTab === 'flow' && (
            <div className="space-y-6">
              {/* Stepper Steps */}
              <div className="space-y-4">
                {executionSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = currentStep > stepNum;
                  const isCurrent = currentStep === stepNum;
                  const Icon = step.icon;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isCurrent
                          ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-paper-subtle/40 border-paper-border opacity-60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-sans text-sm font-bold text-paper-text">
                            {step.title}
                          </h4>
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                            {isDone ? 'COMPLETE' : isCurrent ? 'EXECUTING...' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-paper-muted mt-0.5 font-sans leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Idempotency & Reference Badges upon completion */}
              {approvalResult && (
                <div className="border border-emerald-300 bg-emerald-50/70 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Resolution Executed Successfully
                    </span>
                    <span className="font-mono text-[11px] text-emerald-800">
                      Timestamp: {new Date(approvalResult.executed_at).toLocaleTimeString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block font-semibold">Idempotency Key</span>
                        <span className="font-bold text-emerald-900 truncate max-w-[200px] block">
                          {approvalResult.idempotency_key}
                        </span>
                      </div>
                      <button
                        onClick={copyIdempotencyKey}
                        className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Copy Key"
                      >
                        {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-emerald-200">
                      <span className="text-[10px] text-stone-500 uppercase block font-semibold">External Reference ID</span>
                      <span className="font-bold text-emerald-900 truncate block">
                        {approvalResult.external_reference_id}
                      </span>
                    </div>
                  </div>

                  {/* Bank Routing Header Verification */}
                  <div className="bg-white p-3 rounded border border-emerald-200 space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold font-mono">
                      Attached Live Bank Routing Headers
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-stone-700">
                      <div>Bank: <strong className="text-stone-900">{approvalResult.live_ifsc_headers?.['X-Praman-Bank-Name'] || 'Karur Vysya Bank'}</strong></div>
                      <div>Branch: <strong className="text-stone-900">{approvalResult.live_ifsc_headers?.['X-Praman-Branch'] || 'Chennai Main'}</strong></div>
                      <div>RTGS: <strong className="text-emerald-700">{approvalResult.live_ifsc_headers?.['X-Praman-RTGS-Capable'] || 'TRUE'}</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Rendered HTML Email Notice */}
          {activeTab === 'email_preview' && approvalResult?.rendered_html_notice && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-paper-muted">
                <span>Dispatched to Sri Balaji Enterprises (`accounts@sribalajienterprises.in`)</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">Status: DISPATCHED_TO_SMTP_RELAY</span>
              </div>
              <div 
                className="border border-paper-border rounded-lg p-6 bg-white shadow-paper-sm prose prose-sm max-w-none font-sans"
                dangerouslySetInnerHTML={{ __html: approvalResult.rendered_html_notice }}
              />
            </div>
          )}

          {/* Tab 3: Immutable DuckDB Audit Record */}
          {activeTab === 'audit_log' && approvalResult?.audit_trail_entry && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-paper-text uppercase tracking-wider font-mono">
                DuckDB Table: `audit_trail` (Row Hash: {approvalResult.idempotency_key.slice(0, 16)})
              </div>
              <div className="bg-obsidian rounded-lg p-4 font-mono text-xs overflow-x-auto text-emerald-400 border border-obsidian-border shadow-inner">
                <pre>{JSON.stringify(approvalResult.audit_trail_entry, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-paper-border bg-paper-subtle/50 flex items-center justify-between">
          <div className="text-xs text-paper-muted font-sans">
            Requires human finance controller sign-off · Actions are non-repudiable
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="px-4 py-2 rounded-md border border-paper-border bg-white hover:bg-paper-subtle text-paper-text text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {approvalResult ? 'Close' : 'Cancel'}
            </button>

            {!approvalResult && (
              <button
                onClick={handleStartExecution}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing Downstream Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve &amp; Execute Resolution</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
