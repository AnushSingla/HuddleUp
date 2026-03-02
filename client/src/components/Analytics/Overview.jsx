import React, { useState } from 'react';
import { Eye, ThumbsUp, MessageCircle, Share2, Clock, Users, TrendingUp, Trophy } from 'lucide-react';
import StatCard from './StatCard';
import { ViewTrendChart, EngagementBreakdownChart } from './TrendChart';
import { useAnalyticsOverview, useAnalyticsTrends } from '@/hooks/useAnalytics';

const PERIODS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

export default function AnalyticsOverview() {
  const { data: overview, loading: overviewLoading, error: overviewError } = useAnalyticsOverview();
  const [period, setPeriod] = useState('30d');
  const { data: trends, loading: trendsLoading } = useAnalyticsTrends(period);

  if (overviewLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-28" />
          ))}
        </div>
        <div className="bg-zinc-900 rounded-xl h-64" />
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Failed to load analytics: {overviewError}</p>
      </div>
    );
  }

  const stats = overview || {};
  const engagementData = [
    { name: 'Likes', value: stats.totalLikes || 0 },
    { name: 'Comments', value: stats.totalComments || 0 },
    { name: 'Shares', value: stats.totalShares || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value={(stats.totalViews || 0).toLocaleString()}
          icon={<Eye size={16} />}
          subtitle={`${stats.videoCount || 0} videos`}
        />
        <StatCard
          label="Total Likes"
          value={(stats.totalLikes || 0).toLocaleString()}
          icon={<ThumbsUp size={16} />}
        />
        <StatCard
          label="Engagement Rate"
          value={`${stats.avgEngagementRate?.toFixed(2) ?? '0.00'}%`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Watch Time"
          value={`${(stats.watchTimeMinutes || 0).toLocaleString()} min`}
          icon={<Clock size={16} />}
        />
        <StatCard
          label="Total Comments"
          value={(stats.totalComments || 0).toLocaleString()}
          icon={<MessageCircle size={16} />}
        />
        <StatCard
          label="Total Shares"
          value={(stats.totalShares || 0).toLocaleString()}
          icon={<Share2 size={16} />}
        />
        <StatCard
          label="Connections"
          value={(stats.newFollowers || 0).toLocaleString()}
          icon={<Users size={16} />}
        />
        {stats.topVideo && (
          <StatCard
            label="Top Video"
            value={(stats.topVideo.views || 0).toLocaleString() + ' views'}
            icon={<Trophy size={16} />}
            subtitle={stats.topVideo.title ? stats.topVideo.title.slice(0, 20) + '…' : ''}
          />
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View Trends */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">View Trends</h3>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    period === p.value
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {trendsLoading ? (
            <div className="h-64 animate-pulse bg-zinc-800 rounded-lg" />
          ) : (
            <ViewTrendChart data={trends?.views || []} height={250} />
          )}
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Engagement Breakdown</h3>
          <EngagementBreakdownChart data={engagementData} height={250} />
        </div>
      </div>
    </div>
  );
}
