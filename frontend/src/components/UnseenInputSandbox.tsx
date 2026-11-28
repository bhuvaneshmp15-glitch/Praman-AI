import React, { useState, useRef } from 'react';
import { Send, Sparkles, FileText, CheckCircle2, HelpCircle, Upload, Check, AlertCircle, ArrowUpRight, Search } from 'lucide-react';
import { API_BASE } from '../api/client';

interface UnseenInputSandboxProps {
  isInvestigating: boolean;
  onSubmit: (query: string, rawNarration?: string) => void;
}

interface StatementRow {
  row_index: number;
  narration: string;
  amount: number;
  direction: string;
  extracted_utr: string;
  matched_type?: string;
  reconciliation_status: string;
  reason?: string;
  upi_gateway?: any;
  bank_statement?: any;
  matched_invoice?: any;
}

interface StatementUploadResponse {
  filename: string;
  total_rows: number;
  reconciled_count: number;
  unreconciled_count: number;
  matched_records: StatementRow[];
  unmatched_records: StatementRow[];
  truncated_fuzzy_count?: number;
  summary: string;
  latency_ms: number;
}

export const UnseenInputSandbox: React.FC<UnseenInputSandboxProps> = ({
  isInvestigating,
  onSubmit,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [activeSampleIdx, setActiveSampleIdx] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<StatementUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samples = [
    {
      label: 'Sample 1: Real Ledger UTR',
      subtitle: 'UTR 432910485799 · Ganpati Trading Co',
      text: 'Verify settlement status and GSTR-2B compliance for UTR 432910485799 Ganpati Trading Co',
      narration: 'UPI/432910485799/041126123045/PAYTO GANPATI TRADING CO/HDFC/001928374829',
      color: 'border-emerald-700/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-950',
      activeColor: 'border-emerald-600 bg-emerald-100 ring-1 ring-emerald-600 text-emerald-950 font-semibold',
      icon: ArrowUpRight,
    },
    {
      label: 'Sample 2: Amount Mismatch SMS',
      subtitle: 'Claimed ₹18,400 vs Ledger Debit ₹88,452.76',
      text: 'Investigate payment for Sri Balaji Ent Rs 18,400',
      narration: 'Dear SBI User, your A/c XX4892 debited by Rs 18,400.00 on 18-Nov-26 transfer to SRI BALAJI ENT UPI Ref 632819045112',
      color: 'border-amber-700/30 bg-amber-50 hover:bg-amber-100 text-amber-950',
      activeColor: 'border-amber-600 bg-amber-100 ring-1 ring-amber-600 text-amber-950 font-semibold',
      icon: Sparkles,
    },
    {
      label: 'Sample 3: Unrecorded UTR',
      subtitle: 'UTR 999999999999 · Missing from Statement',
      text: 'Check if UTR 999999999999 is settled on our bank account',
      narration: 'NEFT-999999999999-ACME PVT LTD-CITI0000001',
      color: 'border-stone-700/30 bg-stone-100 hover:bg-stone-200 text-stone-900',
      activeColor: 'border-stone-600 bg-stone-200 ring-1 ring-stone-600 text-stone-950 font-semibold',
      icon: HelpCircle,
    },
  ];

  const handleApplySample = (sample: typeof samples[0], index: number) => {
    setActiveSampleIdx(index);
    setInputText(sample.narration);
    onSubmit(sample.text, sample.narration);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setActiveSampleIdx(null);
    onSubmit(inputText.trim(), inputText.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch(`${API_BASE}/api/tools/upload-statement`, {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        throw new Error(`Upload failed with HTTP ${resp.status}`);
      }

      const data: StatementUploadResponse = await resp.json();
      setUploadResult(data);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload statement');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInvestigateRow = (r: StatementRow) => {
    const query = `Investigate statement row #${r.row_index}: ${
      r.extracted_utr ? `UTR ${r.extracted_utr}` : 'payment'
    } ${r.direction} ₹${r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    setInputText(r.narration);
    onSubmit(query, r.narration);
  };

  // Compile rows that require attention
  const actionRequiredRows = uploadResult
    ? [
        ...uploadResult.matched_records.filter(
          (m) => m.reconciliation_status === 'ACTION_REQUIRED'
        ),
        ...uploadResult.unmatched_records,
      ]
    : [];

  const displayRows = showAllRows && uploadResult
    ? [...uploadResult.matched_records, ...uploadResult.unmatched_records]
    : actionRequiredRows;

  return (
    <div className="bg-paper-card border border-paper-border rounded-lg p-4 shadow-paper-sm mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border/60 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-paper-text" />
          <h3 className="font-serif text-sm font-bold text-paper-text">
            Test Unseen Input: Bank SMS / Narration / UTR Sandbox
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
            Unscripted input against the sample ledger + live CSV upload
          </span>
        </div>
        <span className="text-xs text-paper-muted font-sans">
          Unscripted intake: Paste unseen SMS / narrations or upload any bank statement CSV to audit against ledger
        </span>
      </div>

      {/* Quick Samples & CSV Upload Button */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-mono font-bold text-paper-muted uppercase tracking-wider">
          Quick Samples:
        </span>
        {samples.map((s, idx) => {
          const Icon = s.icon;
          const isActive = activeSampleIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              disabled={isInvestigating || isUploading}
              onClick={() => handleApplySample(s, idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-left transition-all text-xs font-sans disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? s.activeColor : s.color
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <div>
                <strong className="block text-[11px] font-bold leading-tight">{s.label}</strong>
                <span className="block text-[10px] font-mono opacity-75 leading-tight">{s.subtitle}</span>
              </div>
              {isActive && <span className="text-[10px] font-bold ml-0.5">✓</span>}
            </button>
          );
        })}

        {/* Upload Judge CSV Button */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          disabled={isInvestigating || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-all text-xs font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-auto shadow-sm"
          title="Upload arbitrary CSV statement (txn_date, narration, withdrawal, deposit) to reconcile in DuckDB"
        >
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-stone-600" />
          )}
          <span>{isUploading ? 'Reconciling...' : 'Upload Judge CSV'}</span>
        </button>
      </div>

      {/* Explicit Processing Indicator During Upload */}
      {isUploading && (
        <div className="mb-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 flex items-center gap-2.5 animate-pulse shadow-sm">
          <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <span className="font-bold">Reconciling statement rows against DuckDB...</span>
            <span className="block text-[11px] text-amber-700 opacity-90">
              Running vectorized UTR extraction, exact ledger joins, and capped Indic entity matching.
            </span>
          </div>
        </div>
      )}

      {/* CSV Upload Feedback & 1-Click Investigation Tray */}
      {uploadResult && (
        <div className="mb-3 rounded-md border border-paper-border overflow-hidden bg-white shadow-sm">
          <div className="p-3 bg-stone-50 border-b border-paper-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-mono text-stone-900 font-semibold">
                <strong>{uploadResult.filename}</strong>: {uploadResult.summary}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {uploadResult.truncated_fuzzy_count ? (
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  Fuzzy scan capped ({uploadResult.truncated_fuzzy_count} rows deferred)
                </span>
              ) : null}
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {uploadResult.latency_ms}ms · DuckDB Bulk
              </span>
            </div>
          </div>

          {/* Actionable / Discrepant Rows List */}
          {displayRows.length > 0 ? (
            <div className="divide-y divide-paper-border/60 max-h-64 overflow-y-auto">
              <div className="px-3 py-1.5 bg-paper-subtle flex items-center justify-between text-[11px] font-mono font-bold text-paper-muted uppercase tracking-wider">
                <span>
                  {showAllRows
                    ? `All Statement Rows (${displayRows.length})`
                    : `Discrepancies Requiring Investigation (${actionRequiredRows.length})`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllRows(!showAllRows)}
                  className="text-stone-600 hover:text-stone-900 underline lowercase font-normal"
                >
                  {showAllRows ? 'show discrepancies only' : 'show all rows'}
                </button>
              </div>

              {displayRows.map((r, i) => {
                const isActionRequired = r.reconciliation_status === 'ACTION_REQUIRED';
                const isUnmatched = r.reconciliation_status === 'UNMATCHED_IN_LEDGER';
                const isReconciled = r.reconciliation_status === 'RECONCILED';

                return (
                  <div
                    key={i}
                    className="p-2.5 flex items-center justify-between gap-3 text-xs font-mono hover:bg-stone-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          #{r.row_index}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            r.direction === 'CREDIT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.direction} ₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        {r.extracted_utr && (
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            UTR {r.extracted_utr}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isReconciled
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isActionRequired
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                              : 'bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          {r.reconciliation_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-paper-text truncate font-sans">{r.narration}</p>
                      {r.reason && (
                        <p className="text-[10px] text-amber-800 mt-0.5 font-sans italic">
                          ↳ {r.reason}
                        </p>
                      )}
                    </div>

                    {/* 1-Click Investigate Button for Discrepancies */}
                    {!isReconciled && (
                      <button
                        type="button"
                        disabled={isInvestigating}
                        onClick={() => handleInvestigateRow(r)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans font-bold bg-[#1C1917] hover:bg-stone-800 text-white rounded transition shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
                        title="Open full SSE investigation workspace with DuckDB SQL, live IFSC check, and EMI runway"
                      >
                        <Search className="w-3 h-3" />
                        <span>Investigate</span>
                        <ArrowUpRight className="w-3 h-3 opacity-70" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-xs font-mono text-emerald-800 bg-emerald-50/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All statement rows reconciled with zero variances.</span>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="mb-3 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs font-mono text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Error parsing CSV: {uploadError}</span>
        </div>
      )}

      {/* Input Box & Submit Button */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Unscripted input: Paste raw SMS/narration (e.g., 'A/c debited by Rs 15,000 UTR 432910485799...') or query"
          disabled={isInvestigating || isUploading}
          className="flex-1 px-3.5 py-2 text-xs font-mono bg-paper-subtle border border-paper-border rounded-md text-paper-text focus:outline-none focus:ring-1 focus:ring-stone-600 shadow-inner"
        />
        <button
          type="submit"
          disabled={isInvestigating || isUploading || !inputText.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1C1917] hover:bg-stone-800 text-white font-sans text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-98"
        >
          {isInvestigating ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Investigate Unseen Input</span>
        </button>
      </form>
    </div>
  );
};
