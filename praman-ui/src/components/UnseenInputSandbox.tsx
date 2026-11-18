import React, { useState } from 'react';
import { Send, Sparkles, FileText, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';

interface UnseenInputSandboxProps {
  isInvestigating: boolean;
  onSubmit: (query: string, rawNarration?: string) => void;
}

export const UnseenInputSandbox: React.FC<UnseenInputSandboxProps> = ({
  isInvestigating,
  onSubmit,
}) => {
  const [inputText, setInputText] = useState<string>('');

  const samples = [
    {
      label: 'Sample 1: Real Ledger UTR',
      subtitle: 'UTR 432910485799 · Ganpati Trading Co',
      text: 'Verify settlement status and GSTR-2B compliance for UTR 432910485799 Ganpati Trading Co',
      narration: 'UPI/432910485799/041126123045/PAYTO GANPATI TRADING CO/HDFC/001928374829',
      color: 'border-emerald-700/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-950',
      icon: CheckCircle2,
    },
    {
      label: 'Sample 2: Unseen Messy SMS',
      subtitle: '₹18,400 · Sri Balaji Ent UPI Debit',
      text: 'Investigate payment for Sri Balaji Ent Rs 18,400',
      narration: 'Dear SBI User, your A/c XX4892 debited by Rs 18,400.00 on 18-Nov-26 transfer to SRI BALAJI ENT UPI Ref 632819045112',
      color: 'border-amber-700/30 bg-amber-50 hover:bg-amber-100 text-amber-950',
      icon: Sparkles,
    },
    {
      label: 'Sample 3: Unrecorded UTR',
      subtitle: 'UTR 999999999999 · Missing from Statement',
      text: 'Check if UTR 999999999999 is settled on our bank account',
      narration: 'NEFT-999999999999-ACME PVT LTD-CITI0000001',
      color: 'border-stone-700/30 bg-stone-100 hover:bg-stone-200 text-stone-900',
      icon: HelpCircle,
    },
  ];

  const handleApplySample = (sample: typeof samples[0]) => {
    setInputText(sample.narration);
    onSubmit(sample.text, sample.narration);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText.trim(), inputText.trim());
  };

  return (
    <div className="bg-paper-card border border-paper-border rounded-lg p-4 shadow-paper-sm mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border/60 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-paper-text" />
          <h3 className="font-serif text-sm font-bold text-paper-text">
            Test Unseen Input: Bank SMS / Narration / UTR Sandbox
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
            Zero Hardcoded Scenarios · Pure Deterministic + AI Pipeline
          </span>
        </div>
        <span className="text-xs text-paper-muted font-sans">
          Paste any raw SMS or transaction narration to test intake extraction and ledger audit
        </span>
      </div>

      {/* 3 1-Click Sample Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-mono font-bold text-paper-muted uppercase tracking-wider">
          Quick Samples:
        </span>
        {samples.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              disabled={isInvestigating}
              onClick={() => handleApplySample(s)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-left transition-all text-xs font-sans disabled:opacity-50 disabled:cursor-not-allowed ${s.color}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <div>
                <strong className="block text-[11px] font-bold leading-tight">{s.label}</strong>
                <span className="block text-[10px] font-mono opacity-75 leading-tight">{s.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Input Box & Submit Button */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste unseen SMS (e.g., 'Dear Customer, your A/c XX1234 debited by Rs 15,000 UTR 432910485799...') or type any query"
          disabled={isInvestigating}
          className="flex-1 px-3.5 py-2 text-xs font-mono bg-paper-subtle border border-paper-border rounded-md text-paper-text focus:outline-none focus:ring-1 focus:ring-stone-600 shadow-inner"
        />
        <button
          type="submit"
          disabled={isInvestigating || !inputText.trim()}
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
