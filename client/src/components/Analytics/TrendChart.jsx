import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: '8px',
  color: '#fff',
};

// ─── View Trend Line Chart ────────────────────────────────────────────────────
/**
 * @param {{ data: Array<{date: string, views: number}>, height?: number }} props
 */
export function ViewTrendChart({ data = [], height = 260 }) {
  if (!data.length) return <EmptyChart label="No view data yet" height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#71717a', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#a1a1aa' }}
          itemStyle={{ color: '#a78bfa' }}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#a78bfa' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Engagement Breakdown Bar Chart ──────────────────────────────────────────
/**
 * @param {{ data: Array<{name: string, value: number}>, height?: number }} props
 */
export function EngagementBreakdownChart({ data = [], height = 240 }) {
  if (!data.length) return <EmptyChart label="No engagement data yet" height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#34d399' }} />
        <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Device Pie Chart ─────────────────────────────────────────────────────────
const DEVICE_COLORS = { mobile: '#a78bfa', desktop: '#34d399', tablet: '#38bdf8', unknown: '#71717a' };
/**
 * @param {{ data: {mobile: number, tablet: number, desktop: number, unknown?: number} }} props
 */
export function DevicePieChart({ data }) {
  if (!data) return <EmptyChart label="No device data" height={220} />;
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
  if (!chartData.length) return <EmptyChart label="No device data" height={220} />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {chartData.map(({ name }) => (
            <Cell key={name} fill={DEVICE_COLORS[name] || '#71717a'} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Peak Hours Bar Chart ─────────────────────────────────────────────────────
/**
 * @param {{ data: Array<{hour: number, viewers: number}>, height?: number }} props
 */
export function PeakHoursChart({ data = [], height = 240 }) {
  if (!data.length) return <EmptyChart label="No activity data yet" height={height} />;
  const labeled = data.map((d) => ({
    ...d,
    label: `${d.hour.toString().padStart(2, '0')}:00`,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={labeled} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f59e0b' }} />
        <Bar dataKey="viewers" fill="#f59e0b" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Traffic Sources Pie Chart ────────────────────────────────────────────────
const TRAFFIC_COLORS = {
  search: '#38bdf8',
  recommendations: '#a78bfa',
  direct: '#34d399',
  external: '#f87171',
};
/**
 * @param {{ data: {search: number, recommendations: number, direct: number, external: number} }} props
 */
export function TrafficSourcesChart({ data }) {
  if (!data) return <EmptyChart label="No traffic data" height={220} />;
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
  if (!chartData.length) return <EmptyChart label="No traffic data" height={220} />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
          {chartData.map(({ name }) => (
            <Cell key={name} fill={TRAFFIC_COLORS[name] || '#71717a'} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Empty placeholder ────────────────────────────────────────────────────────
function EmptyChart({ label, height = 200 }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-500 text-sm"
      style={{ height }}
    >
      {label}
    </div>
  );
}
