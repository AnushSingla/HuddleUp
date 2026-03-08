import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Video, Users, TrendingUp } from 'lucide-react';
import PageWrapper from '@/components/ui/PageWrapper';
import AnalyticsOverview from '@/components/Analytics/Overview';
import VideoAnalytics from '@/components/Analytics/VideoAnalytics';
import AudienceAnalytics from '@/components/Analytics/AudienceAnalytics';
import { isLoggedIn } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'audience', label: 'Audience', icon: Users },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-zinc-400 text-sm">Track your content performance and audience insights</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <AnalyticsOverview />}
          {activeTab === 'videos' && <VideoAnalytics />}
          {activeTab === 'audience' && <AudienceAnalytics />}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
