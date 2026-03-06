import React from 'react';
import { Smartphone, Monitor, Tablet, Globe, Clock } from 'lucide-react';
import { DevicePieChart, PeakHoursChart } from './TrendChart';
import { useAudienceAnalytics } from '@/hooks/useAnalytics';

// ─── Geography Table ──────────────────────────────────────────────────────────
function GeographyTable({ data }) {
  if (!data.length) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No geographic data available yet.
      </div>
    );
  }

  const total = data.reduce((s, r) => s + r.viewers, 0) || 1;

  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((row, idx) => {
        const pct = ((row.viewers / total) * 100).toFixed(1);
        return (
          <div key={row.country || idx} className="flex items-center gap-3">
            <span className="text-zinc-400 text-xs w-5 text-right">{idx + 1}</span>
            <span className="text-white text-sm flex-1 truncate">{row.country || 'Unknown'}</span>
            <span className="text-zinc-500 text-xs w-12 text-right">{row.viewers.toLocaleString()}</span>
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-zinc-500 text-xs w-10 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Device Icon helper ───────────────────────────────────────────────────────
function DeviceStat({ label, count, total, icon }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-violet-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-zinc-300">{label}</span>
          <span className="text-zinc-400">{count.toLocaleString()} ({pct}%)</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main AudienceAnalytics Component ────────────────────────────────────────
export default function AudienceAnalytics() {
  const { devices, peakHours, geography, loading, error } = useAudienceAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  const totalDevices = devices
    ? Object.values(devices).reduce((s, c) => s + c, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Device breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-zinc-400" />
            <h3 className="text-white font-semibold">Device Breakdown</h3>
          </div>
          <DevicePieChart data={devices} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone size={16} className="text-zinc-400" />
            <h3 className="text-white font-semibold">Device Details</h3>
          </div>
          <div className="space-y-4 mt-2">
            {devices ? (
              <>
                <DeviceStat
                  label="Mobile"
                  count={devices.mobile || 0}
                  total={totalDevices}
                  icon={<Smartphone size={14} />}
                />
                <DeviceStat
                  label="Desktop"
                  count={devices.desktop || 0}
                  total={totalDevices}
                  icon={<Monitor size={14} />}
                />
                <DeviceStat
                  label="Tablet"
                  count={devices.tablet || 0}
                  total={totalDevices}
                  icon={<Tablet size={14} />}
                />
              </>
            ) : (
              <p className="text-zinc-500 text-sm">No device data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Peak hours */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-zinc-400" />
          <h3 className="text-white font-semibold">Peak Activity Hours</h3>
          <span className="text-zinc-500 text-xs ml-auto">UTC · 24-hour format</span>
        </div>
        <PeakHoursChart data={peakHours} height={220} />
      </div>

      {/* Geography */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-zinc-400" />
          <h3 className="text-white font-semibold">Geographic Distribution</h3>
        </div>
        <GeographyTable data={geography} />
      </div>
    </div>
  );
}
