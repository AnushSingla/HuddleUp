import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Users,
  Trophy,
  Play,
  MessageCircle,
  ArrowRight
} from "lucide-react";

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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      
      {/* LIVE MOMENT HERO - Edge to Edge */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        {/* Background Video/Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${featuredMoment.thumbnail})`,
            filter: 'blur(8px)',
            transform: 'scale(1.1)'
          }}
        />
        
        {/* Gradient Overlay - Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Content - Bottom Left */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl"
        >
          <p className="text-xs font-mono mb-4 tracking-wider" 
            style={{ color: 'var(--ice-white)', opacity: 0.8 }}>
            LIVE MOMENT · UPLOADED {featuredMoment.timeAgo.toUpperCase()} BY {featuredMoment.uploader.toUpperCase()}
          </p>
          
          <h1 className="font-black mb-6"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              lineHeight: '1.1',
              color: 'var(--ice-white)',
              letterSpacing: '-0.02em'
            }}>
            {featuredMoment.title}
          </h1>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/explore")}
              className="px-8 py-4 font-semibold flex items-center gap-2 hover-lift"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg-primary)',
                borderRadius: 'var(--r-md)'
              }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Watch Moment
            </button>
            <button
              onClick={() => navigate("/posts")}
              className="px-8 py-4 font-semibold flex items-center gap-2"
              style={{
                background: 'transparent',
                color: 'var(--ice-white)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--r-md)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <MessageCircle className="w-5 h-5" />
              Join Discussion
            </button>
          </div>
        </motion.div>
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
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 whitespace-nowrap group"
                style={{
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 500
                }}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" 
                  style={{ color: 'var(--accent)' }} />
                {action.label}
                <ArrowRight className="w-4 h-4 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" 
                  style={{ color: 'var(--accent)' }} />
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
            style={{ color: 'var(--accent)' }}
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
  );
}
