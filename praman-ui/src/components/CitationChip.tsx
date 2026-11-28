import React from 'react';
import { FileText, ShieldAlert, Building2, Landmark, CheckCircle, ExternalLink } from 'lucide-react';

interface CitationChipProps {
  citationKey: string;
  sourceTable?: string;
  onClick: (citationKey: string) => void;
}

export const CitationChip: React.FC<CitationChipProps> = ({
  citationKey,
  sourceTable,
  onClick,
}) => {
  const cleanKey = citationKey.replace(/[\[\]]/g, '');

  // Determine source table from key prefix or parameter
  let table = sourceTable || '';
  if (!table) {
    if (cleanKey.toLowerCase().includes('tally') || cleanKey.toLowerCase().includes('inv')) {
      table = 'tally_invoices';
    } else if (cleanKey.toLowerCase().includes('gstr') || cleanKey.toLowerCase().includes('tax')) {
      table = 'gstr2b_tax';
    } else if (cleanKey.toLowerCase().includes('bnk') || cleanKey.toLowerCase().includes('bank')) {
      table = 'bank_statement';
    } else if (cleanKey.toLowerCase().includes('upi') || cleanKey.toLowerCase().includes('pay')) {
      table = 'razorpay_upi';
    } else if (cleanKey.toLowerCase().includes('ifsc')) {
      table = 'razorpay_ifsc';
    } else if (cleanKey.toLowerCase().includes('pin') || cleanKey.toLowerCase().includes('post')) {
      table = 'postal_pincode';
    } else if (cleanKey.toLowerCase().includes('com') || cleanKey.toLowerCase().includes('emi')) {
      table = 'cashflow_commitments';
    } else if (cleanKey.toLowerCase().includes('pol') || cleanKey.toLowerCase().includes('sla')) {
      table = 'company_policies';
    } else if (cleanKey.startsWith('CIT-1')) {
      table = 'tally_invoices';
    } else if (cleanKey.startsWith('CIT-2')) {
      table = 'gstr2b_tax';
    } else if (cleanKey.startsWith('CIT-3')) {
      table = 'bank_statement';
    } else if (cleanKey.startsWith('CIT-4')) {
      table = 'cashflow_commitments';
    }
  }

  // Get brand styling and icon for source badge
  const getBadgeStyle = () => {
    switch (table) {
      case 'tally_invoices':
        return {
          label: 'Tally ERP',
          bg: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
          dot: 'bg-rose-500',
          icon: FileText,
        };
      case 'gstr2b_tax':
        return {
          label: 'GSTR-2B Portal',
          bg: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
          dot: 'bg-blue-500',
          icon: ShieldAlert,
        };
      case 'bank_statement':
        return {
          label: 'HDFC/KVB Bank Statement',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
          dot: 'bg-emerald-500',
          icon: Landmark,
        };
      case 'razorpay_upi':
        return {
          label: 'Razorpay UPI',
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100',
          dot: 'bg-indigo-500',
          icon: CheckCircle,
        };
      case 'razorpay_ifsc':
        return {
          label: 'Live IFSC API',
          bg: 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100',
          dot: 'bg-purple-500',
          icon: Building2,
        };
      case 'postal_pincode':
        return {
          label: 'India Post API',
          bg: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
          dot: 'bg-amber-500',
          icon: Landmark,
        };
      case 'cashflow_commitments':
        return {
          label: 'EMI Commitments',
          bg: 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100',
          dot: 'bg-red-600',
          icon: ShieldAlert,
        };
      case 'company_policies':
        return {
          label: 'Company Policy',
          bg: 'bg-teal-50 text-teal-900 border-teal-300 hover:bg-teal-100',
          dot: 'bg-teal-600',
          icon: FileText,
        };
      default:
        return {
          label: 'Audit Evidence',
          bg: 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200',
          dot: 'bg-stone-500',
          icon: FileText,
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <button
      onClick={() => onClick(cleanKey)}
      title={`Inspect verified ledger row: ${cleanKey}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 my-0.5 mx-1 rounded border font-mono text-[11px] font-medium transition-all shadow-xs cursor-pointer select-none group align-middle ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse-subtle`}></span>
      <Icon className="w-3 h-3 opacity-80" />
      <span className="font-semibold tracking-tight">[{cleanKey}]</span>
      <span className="text-[9px] uppercase tracking-wider opacity-75 font-sans font-semibold">
        {style.label}
      </span>
      <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
