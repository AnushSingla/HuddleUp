import React, { useState } from 'react';
import { Eye, ThumbsUp, MessageCircle, Share2, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import StatCard from './StatCard';
import { ViewTrendChart, EngagementBreakdownChart, TrafficSourcesChart } from './TrendChart';
import { useAnalyticsVideoList, useVideoAnalytics } from '@/hooks/useAnalytics';

// ─── Video List ───────────────────────────────────────────────────────────────
function VideoList({ videos, onSelect }) {
  if (!videos.length) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>No videos found. Upload your first video to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((v) => (
        <button
          key={v._id}
          onClick={() => onSelect(v._id)}
          className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors flex items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{v.title}</p>
            <p className="text-zinc-500 text-xs mt-1">
              {new Date(v.createdAt).toLocaleDateString()} · {v.category}
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm shrink-0">
            <span className="flex items-center gap-1 text-zinc-400">
              <Eye size={13} /> {(v.totalViews || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <ThumbsUp size={13} /> {(v.totalLikes || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <MessageCircle size={13} /> {(v.totalComments || 0).toLocaleString()}
            </span>
            <span className="text-violet-400 text-xs font-medium">{v.engagementRate}%</span>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Single Video Detail ──────────────────────────────────────────────────────
function VideoDetail({ videoId, onBack }) {
  const { data, loading, error } = useVideoAnalytics(videoId);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-zinc-800 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-24" />)}
        </div>
        <div className="bg-zinc-900 rounded-xl h-64" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!data) return null;

  const engagementData = [
    { name: 'Likes', value: data.totalLikes || 0 },
    { name: 'Comments', value: data.totalComments || 0 },
    { name: 'Shares', value: data.totalShares || 0 },
  ];

  const totalViews = data.totalViews || 0;
  const engagementRate =
    totalViews > 0
      ? (((data.totalLikes + data.totalComments + data.totalShares) / totalViews) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={15} /> All Videos
        </button>
        <span className="text-zinc-600">·</span>
        <h2 className="text-white font-semibold truncate">{data.video?.title}</h2>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={<Eye size={16} />} />
        <StatCard label="Total Likes" value={(data.totalLikes || 0).toLocaleString()} icon={<ThumbsUp size={16} />} />
        <StatCard label="Comments" value={(data.totalComments || 0).toLocaleString()} icon={<MessageCircle size={16} />} />
        <StatCard
          label="Engagement Rate"
          value={`${engagementRate}%`}
          icon={<Share2 size={16} />}
        />
        <StatCard
          label="Total Watch Time"
          value={`${Math.round((data.watchTime?.total || 0) / 60)} min`}
          icon={<Clock size={16} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View trend */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Views (Last 30 Days)</h3>
          <ViewTrendChart data={data.viewTrend || []} height={240} />
        </div>

        {/* Engagement breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Engagement Breakdown</h3>
          <EngagementBreakdownChart data={engagementData} height={240} />
        </div>

        {/* Traffic sources */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Traffic Sources</h3>
          <TrafficSourcesChart data={data.traffic} />
        </div>

        {/* Device breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Device Breakdown</h3>
          <div className="space-y-3 mt-2">
            {data.demographics?.byDevice &&
              Object.entries(data.demographics.byDevice).map(([device, count]) => {
                const total =
                  Object.values(data.demographics.byDevice).reduce((s, c) => s + c, 0) || 1;
                const pct = ((count / total) * 100).toFixed(1);
                const colors = { mobile: 'bg-violet-500', desktop: 'bg-emerald-500', tablet: 'bg-blue-400' };
                return (
                  <div key={device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300 capitalize">{device}</span>
                      <span className="text-zinc-400">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[device] || 'bg-zinc-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main VideoAnalytics Component ───────────────────────────────────────────
export default function VideoAnalytics() {
  const { data: videos, loading, error } = useAnalyticsVideoList();
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-20" />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (selectedVideoId) {
    return (
      <VideoDetail videoId={selectedVideoId} onBack={() => setSelectedVideoId(null)} />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">
        Select a video below to view its detailed analytics.
      </p>
      <VideoList videos={videos} onSelect={setSelectedVideoId} />
    </div>
  );
}
