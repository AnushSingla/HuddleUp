import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import {
  Upload,
  Users,
  Trophy,
  Play,
  MessageCircle,
  ArrowRight
} from "lucide-react";

const featureCardsData = [
  {
    icon: Upload,
    title: "For Creators",
    desc: "Upload game-changing moments. Build your sports creator identity.",
    color: "#22c55e",       // emerald
    colorLight: "rgba(34, 197, 94, 0.15)",
    colorGlow: "rgba(34, 197, 94, 0.35)",
  },
  {
    icon: MessageCircle,
    title: "For Debaters",
    desc: "Dissect plays. Argue calls. Defend your take in real threads.",
    color: "#00E5FF",       // cyan accent
    colorLight: "rgba(0, 229, 255, 0.15)",
    colorGlow: "rgba(0, 229, 255, 0.35)",
  },
  {
    icon: Users,
    title: "For Communities",
    desc: "Find your fanbase. Join watch parties. Live the sport together.",
    color: "#a78bfa",       // violet
    colorLight: "rgba(167, 139, 250, 0.15)",
    colorGlow: "rgba(167, 139, 250, 0.35)",
  }
];

function FeatureCards() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid md:grid-cols-3 gap-6 mt-20"
    >
      {featureCardsData.map((item, idx) => {
        const Icon = item.icon;
        const isHovered = hoveredIdx === idx;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="relative p-6 rounded-xl border overflow-hidden cursor-pointer"
            style={{
              background: isHovered
                ? `linear-gradient(135deg, ${item.colorLight} 0%, var(--tier-1-bg) 60%)`
                : 'var(--tier-1-bg)',
              borderColor: isHovered ? item.color : 'var(--border-subtle)',
              boxShadow: isHovered
                ? `0 0 20px ${item.colorGlow}, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${item.colorLight}`
                : 'inset 0 0 0 1px rgba(255,255,255,0.03)',
              transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Shimmer sweep on hover */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(105deg, transparent 40%, ${item.colorLight} 50%, transparent 60%)`,
                backgroundSize: '200% 100%',
                backgroundPosition: isHovered ? '100% 0' : '-100% 0',
                transition: 'background-position 0.8s ease',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: isHovered ? 1 : 0,
              }}
            />

            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.4s ease, left 0.4s ease, right 0.4s ease',
                ...(isHovered ? { left: '5%', right: '5%' } : {}),
              }}
            />

            {/* Icon container */}
            <div
              className="relative mb-4 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: isHovered ? item.colorLight : 'var(--accent-glow)',
                transform: isHovered ? 'scale(1.1) rotate(-6deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                boxShadow: isHovered ? `0 0 16px ${item.colorGlow}` : 'none',
                zIndex: 1,
              }}
            >
              <Icon
                className="w-6 h-6"
                style={{
                  color: isHovered ? item.color : 'var(--accent)',
                  transition: 'color 0.3s ease',
                  filter: isHovered ? `drop-shadow(0 0 6px ${item.colorGlow})` : 'none',
                }}
              />
            </div>

            {/* Title */}
            <h3
              className="relative text-lg font-bold mb-2"
              style={{
                color: isHovered ? item.color : 'var(--text-main)',
                transition: 'color 0.3s ease',
                zIndex: 1,
              }}
            >
              {item.title}
            </h3>

            {/* Description */}
            <p
              className="relative text-sm"
              style={{
                color: isHovered ? 'var(--ice-white-soft)' : 'var(--text-sub)',
                transition: 'color 0.3s ease',
                zIndex: 1,
              }}
            >
              {item.desc}
            </p>

            {/* Bottom glow bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '20%',
                right: '20%',
                height: '1px',
                background: `radial-gradient(ellipse at center, ${item.color} 0%, transparent 70%)`,
                opacity: isHovered ? 0.6 : 0,
                transition: 'opacity 0.4s ease',
              }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}


export default function Home() {
  const navigate = useNavigate();

  // Mock featured moment - would come from API
  const featuredMoment = {
    title: "Last Ball Six - IPL Final",
    uploader: "@cricketfan23",
    timeAgo: "2m ago",
    thumbnail: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920"
  };

  const actions = [
    { icon: Upload, label: "Upload a Moment", path: "/upload" },
    { icon: MessageCircle, label: "Join Live Discussion", path: "/posts" },
    { icon: Play, label: "Start a Watch Party", path: "/explore" },
    { icon: Trophy, label: "Debate This Match", path: "/posts" },
    { icon: Users, label: "Find Your Fanbase", path: "/friends" }
  ];

  // Mock live threads - would come from API
  const liveThreads = [
    { author: "SportsNerd", topic: "Is this the greatest final ever?", replies: 234, timeAgo: "2h ago" },
    { author: "BasketballFan", topic: "Trade deadline predictions", replies: 156, timeAgo: "4h ago" },
    { author: "TennisAce", topic: "Underrated players discussion", replies: 89, timeAgo: "6h ago" },
    { author: "F1Fanatic", topic: "Monaco GP overtake analysis", replies: 203, timeAgo: "1h ago" }
  ];

  return (
    <PageWrapper>
      <PageMeta
        title="Sports Moments & Debate"
        description="Share game-changing sports moments, join live discussions, and connect with fans. Upload highlights and debate the play."
      />
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

        {/* HERO - PRODUCT NARRATIVE FIRST */}
        <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
          {/* Ambient Background Pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%), 
                             radial-gradient(circle at 80% 20%, var(--turf-green) 0%, transparent 40%)`,
            }}
          />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}
          />

          {/* Content Container */}
          <div className="relative z-10 w-full px-6 md:px-12 py-20">
            <div className="max-w-6xl mx-auto">

              {/* Platform Identity */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12 text-center"
              >
                <div className="inline-block mb-6 px-4 py-2 rounded-full border"
                  style={{
                    background: 'var(--surface-info-bg)',
                    border: 'var(--surface-info-border)',
                    color: 'var(--accent)'
                  }}>
                  <span className="text-sm font-mono tracking-wide">THE SPORTS MOMENT PLATFORM</span>
                </div>

                <h1 className="font-black mb-8"
                  style={{
                    fontSize: 'clamp(40px, 8vw, 96px)',
                    lineHeight: '1',
                    color: 'var(--text-main)',
                    letterSpacing: '-0.03em',
                    marginBottom: 'var(--space-6)'
                  }}>
                  Upload Moments.<br />
                  <span style={{ color: 'var(--turf-green)' }}>Debate the Game.</span><br />
                  <span style={{ color: 'var(--accent)' }}>Find Your Crowd.</span>
                </h1>

                <p className="text-xl max-w-2xl mx-auto mb-12"
                  style={{
                    color: 'var(--text-sub)',
                    lineHeight: '1.6'
                  }}>
                  For creators who live and breathe sports. For fans who need to debate.
                  For communities built around moments that matter.
                </p>

                {/* CTA Duo */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {/* Primary CTA - Upload */}
                  <motion.button
                    onClick={() => navigate("/upload")}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{
                      scale: 1.03,
                      y: -2,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                    className="relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-semibold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    style={{
                      background:
                        "linear-gradient(135deg, #22c55e, #06b6d4)",
                      boxShadow:
                        "0 18px 45px rgba(16, 185, 129, 0.45)",
                      color: "var(--bg-primary)",
                    }}
                  >
                    {/* Glow ring */}
                    <span
                      className="pointer-events-none absolute inset-0 rounded-full opacity-60 blur-xl"
                      style={{
                        background:
                          "radial-gradient(circle at 0% 0%, rgba(45, 212, 191, 0.7), transparent 55%)",
                      }}
                    />
                    <span className="relative flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15">
                        <Upload className="w-5 h-5" />
                      </span>
                      <span>Upload Your Moment</span>
                    </span>
                  </motion.button>

                  {/* Secondary CTA - Explore */}
                  <motion.button
                    onClick={() => navigate("/explore")}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{
                      scale: 1.03,
                      y: -2,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                    className="relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-semibold text-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    style={{
                      background: "var(--bg-overlay)",
                      borderColor: "rgba(56,189,248,0.6)",
                      boxShadow:
                        "0 8px 24px rgba(15, 23, 42, 0.15)",
                      color: "var(--text-main)",
                    }}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-400/60">
                      <Play className="w-5 h-5 text-cyan-300" />
                    </span>
                    <span>Explore</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Who This Is For - 3 Columns */}
              <FeatureCards />
            </div>
          </div>
        </section>

        {/* FEATURED MOMENT - Content AFTER Platform Explanation */}
        <section className="relative px-6 md:px-12 py-16 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                Trending Now
              </h2>
              <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                LIVE
              </span>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => navigate("/explore")}
              style={{ height: '400px' }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105"
                style={{
                  backgroundImage: `url(${featuredMoment.thumbnail})`,
                }}
              />
              <div style={{ background: 'var(--surface-hero-overlay)' }} className="absolute inset-0" />

              <div className="absolute bottom-0 left-0 p-8">
                <p className="text-xs font-mono mb-3 tracking-wider"
                  style={{ color: 'var(--text-sub)', opacity: 0.9 }}>
                  {featuredMoment.timeAgo.toUpperCase()} BY {featuredMoment.uploader.toUpperCase()}
                </p>
                <h3 className="text-4xl font-black mb-4" style={{ color: 'var(--text-main)' }}>
                  {featuredMoment.title}
                </h3>
                <button
                  className="px-6 py-3 font-semibold flex items-center gap-2"
                  style={{
                    background: 'white',
                    color: 'var(--bg-primary)',
                    borderRadius: 'var(--r-md)'
                  }}
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Watch Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ACTION RAIL - Horizontal Scroll */}
        <section className="px-6 md:px-12 py-12 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex gap-8 overflow-x-auto pb-4" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -4,
                  }}
                  onClick={() => navigate(action.path)}
                  className="relative flex items-center gap-3 whitespace-nowrap group px-6 py-4 rounded-xl transition-all"
                  style={{
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 500,
                    background: 'transparent',
                    border: '2px solid var(--border-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--turf-green)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.2)';
                    e.currentTarget.style.color = 'var(--turf-green)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                    <Icon className="w-5 h-5"
                      style={{ color: 'var(--turf-green)' }} />
                  </div>
                  <span className="relative">
                    {action.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:w-full transition-all duration-300"></span>
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0 group-hover:translate-x-1"
                    style={{ color: 'var(--turf-green)' }} />
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* LIVE DISCUSSIONS - Thread List */}
        <section className="px-6 md:px-12 py-16 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              Live Discussions
            </h2>
            <button
              onClick={() => navigate("/posts")}
              className="text-sm font-medium flex items-center gap-1 hover-lift"
              style={{ color: 'var(--text-energy)' }}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0">
            {liveThreads.map((thread, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate("/posts")}
                className="group py-6 border-b cursor-pointer relative"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {/* Left accent bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--accent)' }} />

                <div className="pl-0 group-hover:pl-4 transition-all">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors"
                    style={{ color: 'var(--text-main)' }}>
                    {thread.topic}
                  </h3>
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-sub)' }}>
                    <span>by @{thread.author}</span>
                    <span>·</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {thread.replies} replies
                    </span>
                    <span>·</span>
                    <span>{thread.timeAgo}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}
