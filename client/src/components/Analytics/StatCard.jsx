import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * A single metric summary card used on the analytics dashboard.
 * @param {{ label: string, value: string|number, trend?: number, icon?: React.ReactNode, subtitle?: string }} props
 */
export default function StatCard({ label, value, trend, icon, subtitle }) {
  const trendSign = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-sm font-medium">{label}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>

      <div className="text-2xl font-bold text-white tracking-tight">
        {value !== undefined && value !== null ? value : '—'}
      </div>

      <div className="flex items-center gap-2">
        {trend !== undefined && trend !== null ? (
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              trendSign === 'up'
                ? 'text-emerald-400'
                : trendSign === 'down'
                ? 'text-red-400'
                : 'text-zinc-500'
            }`}
          >
            {trendSign === 'up' && <TrendingUp size={12} />}
            {trendSign === 'down' && <TrendingDown size={12} />}
            {trendSign === 'flat' && <Minus size={12} />}
            {trendSign === 'flat' ? 'No change' : `${Math.abs(trend)}% this week`}
          </span>
        ) : null}
        {subtitle && <span className="text-zinc-500 text-xs">{subtitle}</span>}
      </div>
    </div>
  );
}
