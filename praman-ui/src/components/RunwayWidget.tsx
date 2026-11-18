import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { TrendingUp, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { RunwayImpact } from '../types';

interface RunwayWidgetProps {
  runwayData: RunwayImpact | null;
}

export const RunwayWidget: React.FC<RunwayWidgetProps> = ({ runwayData }) => {
  // Default values based on CASE-GST-104 canonical values
  const currentBalance = runwayData?.current_bank_balance || 310000;
  const criticalEmi = runwayData?.upcoming_30d_critical_emi || 110000;
  const cashWithoutPraman = runwayData?.cash_after_full_payout || 126000;
  const cashWithPraman = runwayData?.cash_after_praman_action || 154067.8;
  const freeCashWithout = runwayData?.post_emi_free_cash_without_praman || 16000;
  const freeCashWith = runwayData?.post_emi_free_cash_with_praman || 44067.8;
  const coverageWithout = runwayData?.formatted?.coverage_without_praman || '1.15x';
  const coverageWith = runwayData?.formatted?.coverage_with_praman || '1.40x';

  const chartData = [
    {
      name: 'Unprotected Payout (Risk)',
      cash: cashWithoutPraman,
      freeCash: freeCashWithout,
      coverage: coverageWithout,
      riskLevel: 'HIGH_DEFAULT_RISK',
      fill: '#F87171', // Red/Rose
    },
    {
      name: 'Praman Recommended (Protected)',
      cash: cashWithPraman,
      freeCash: freeCashWith,
      coverage: coverageWith,
      riskLevel: 'SAFE_BUFFER',
      fill: '#34D399', // Emerald
    },
  ];

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1C1917] text-white p-3 rounded-lg shadow-lg border border-stone-700 font-mono text-xs space-y-1">
          <div className="font-bold font-sans text-stone-200">{data.name}</div>
          <div className="text-emerald-400">
            Cash Remaining: <span className="font-bold">{formatINR(data.cash)}</span>
          </div>
          <div className="text-stone-300">
            Post-EMI Free Cash: <span className="font-bold">{formatINR(data.freeCash)}</span>
          </div>
          <div className="text-amber-300">
            EMI Coverage: <span className="font-bold">{data.coverage}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-paper-border rounded-lg bg-paper-card p-5 shadow-paper-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-red-100 text-red-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-paper-text">
              30-Day Liquidity &amp; Critical Loan EMI Runway
            </h4>
            <p className="text-xs text-paper-muted font-sans">
              Mathematical cash-flow protection against HDFC Business Loan default
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-stone-100 border border-stone-200 text-stone-700">
            Current Bank Balance: <strong className="text-stone-900">{formatINR(currentBalance)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-800 font-semibold">
            Upcoming EMI (7d): {formatINR(criticalEmi)}
          </span>
        </div>
      </div>

      {/* Main Chart + Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Recharts Bar Comparison */}
        <div className="lg:col-span-7 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#78716C' }}
                axisLine={{ stroke: '#E5E0D8' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 220000]}
                tickFormatter={(val) => `₹${val / 1000}k`}
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#78716C' }}
                axisLine={{ stroke: '#E5E0D8' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Critical Loan EMI Threshold Line */}
              <ReferenceLine
                y={criticalEmi}
                stroke="#DC2626"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'CRITICAL EMI: ₹1,10,000',
                  position: 'insideTopRight',
                  fill: '#DC2626',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="cash" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Side-by-Side Mathematical Impact Cards */}
        <div className="lg:col-span-5 space-y-3">
          {/* Unprotected */}
          <div className="p-3 rounded-md border border-rose-200 bg-rose-50/50 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Unprotected Full Payout
              </span>
              <span className="font-mono text-rose-700 font-bold">{coverageWithout} Coverage</span>
            </div>
            <div className="text-[11px] text-rose-800 font-sans leading-relaxed">
              Disbursing full ₹1,84,000 leaves only{' '}
              <strong className="font-mono font-bold text-rose-950">{formatINR(freeCashWithout)}</strong> post-EMI free buffer, dangerously violating debt service liquidity policy.
            </div>
          </div>

          {/* Praman Action */}
          <div className="p-3 rounded-md border border-emerald-300 bg-emerald-50/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Praman Protected Action
              </span>
              <span className="font-mono text-emerald-700 font-bold">{coverageWith} Coverage</span>
            </div>
            <div className="text-[11px] text-emerald-900 font-sans leading-relaxed">
              Withholding unfiled GST (₹28,067.80) preserves{' '}
              <strong className="font-mono font-bold text-emerald-950">{formatINR(freeCashWith)}</strong> post-EMI cushion, keeping the SME debt safe.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
