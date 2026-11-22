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
      name: 'Unprotected Payout',
      cash: cashWithoutPraman,
      freeCash: freeCashWithout,
      coverage: coverageWithout,
      riskLevel: 'HIGH_DEFAULT_RISK',
      fill: '#F87171', // Red/Rose
    },
    {
      name: 'Praman Protected',
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

  // Custom pill label rendered on top of the reference line
  const renderEmiLabel = (props: any) => {
    const { viewBox } = props;
    const x = (viewBox?.x ?? 40) + 12;
    const y = (viewBox?.y ?? 100) - 10;
    return (
      <g>
        <rect
          x={x}
          y={y - 10}
          width={160}
          height={18}
          rx={4}
          fill="#FAF8F5"
          stroke="#DC2626"
          strokeWidth={1}
          strokeOpacity={0.8}
        />
        <text
          x={x + 6}
          y={y + 3}
          fill="#DC2626"
          fontSize={10}
          fontFamily="JetBrains Mono"
          fontWeight="bold"
        >
          CRITICAL EMI: ₹1,10,000
        </text>
      </g>
    );
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
                interval={0}
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
                isFront={true}
                stroke="#DC2626"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={renderEmiLabel}
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
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Card A: Unprotected Risk Scenario */}
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/60 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-red-900 font-bold font-sans">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                Unprotected Full Release
              </span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-200 text-red-800">
                Default Threat
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-stone-600">Disbursed:</span>
              <span className="font-bold text-stone-900 line-through">
                {formatINR(runwayData?.disputed_or_payout_amount || 184000)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-stone-600">Remaining Balance:</span>
              <span className="font-bold text-red-700">{formatINR(cashWithoutPraman)}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-red-200/80 pt-1 text-[11px]">
              <span className="text-stone-500">EMI Coverage Ratio:</span>
              <span className="font-bold text-red-700">{coverageWithout} (Below Safety Buffer)</span>
            </div>
          </div>

          {/* Card B: Praman Recommended Protection */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/60 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-900 font-bold font-sans">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Praman Recommended Action
              </span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                Safe Buffer
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-stone-600">Statutory Tax Hold:</span>
              <span className="font-bold text-emerald-800">
                {formatINR(runwayData?.recommended_hold_or_recovery || 28067.8)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-stone-600">Protected Cash Remaining:</span>
              <span className="font-bold text-emerald-700">{formatINR(cashWithPraman)}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-emerald-200/80 pt-1 text-[11px]">
              <span className="text-stone-500">EMI Coverage Ratio:</span>
              <span className="font-bold text-emerald-800">{coverageWith} (Debt Protected)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
