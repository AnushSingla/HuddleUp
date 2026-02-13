// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';
// import { Upload, Search, Users, Trophy, Play, MessageCircle } from 'lucide-react';

// export default function Home() {
//   const navigate = useNavigate();

//   const features = [
//     {
//       icon: <Upload className="w-8 h-8" />,
//       title: "Upload",
//       desc: "Share your sports moments",
//       color: "from-green-500 to-emerald-600",
//       bgHover: "hover:bg-green-500/10",
//       border: "border-green-500/20",
//       path: "/upload"
//     },
//     {
//       icon: <Search className="w-8 h-8" />,
//       title: "Explore",
//       desc: "Discover amazing content",
//       color: "from-blue-500 to-indigo-600",
//       bgHover: "hover:bg-blue-500/10",
//       border: "border-blue-500/20",
//       path: "/explore"
//     },
//     {
//       icon: <MessageCircle className="w-8 h-8" />,
//       title: "Discuss",
//       desc: "Join the conversation",
//       color: "from-cyan-500 to-teal-600",
//       bgHover: "hover:bg-cyan-500/10",
//       border: "border-cyan-500/20",
//       path: "/posts"
//     },
//     {
//       icon: <Users className="w-8 h-8" />,
//       title: "Connect",
//       desc: "Find your team",
//       color: "from-purple-500 to-pink-600",
//       bgHover: "hover:bg-purple-500/10",
//       border: "border-purple-500/20",
//       path: "/friends"
//     },
//     {
//       icon: <Play className="w-8 h-8" />,
//       title: "Watch",
//       desc: "Stream highlights",
//       color: "from-orange-500 to-red-600",
//       bgHover: "hover:bg-orange-500/10",
//       border: "border-orange-500/20",
//       path: "/videos"
//     },
//     {
//       icon: <Trophy className="w-8 h-8" />,
//       title: "Compete",
//       desc: "Challenge others",
//       color: "from-yellow-500 to-amber-600",
//       bgHover: "hover:bg-yellow-500/10",
//       border: "border-yellow-500/20",
//       path: "/leaderboard"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-12">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 opacity-5">
//         <div className="absolute top-10 left-10 text-zinc-700 text-8xl">🏏</div>
//         <div className="absolute top-32 right-20 text-zinc-700 text-6xl">⚾</div>
//         <div className="absolute bottom-40 left-20 text-zinc-700 text-7xl">🏆</div>
//         <div className="absolute bottom-60 right-10 text-zinc-700 text-5xl">🎯</div>
//         <div className="absolute top-1/2 left-1/4 text-zinc-800 text-9xl">⚽</div>
//       </div>

//       {/* Main Content */}
//       <div className="text-center z-10 max-w-4xl mx-auto px-6 mb-16">
//         <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
//           🏆 HuddleUp
//         </h1>
//         <p className="text-2xl md:text-3xl text-blue-400 mb-6 font-light">
//           The Ultimate Sports Community Platform
//         </p>
//         <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
//           Connect with fellow sports enthusiasts, share your best moments, explore amazing content, and be part of the world's most passionate sports community.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//           <Button
//             onClick={() => navigate('/friends')}
//             className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-6 rounded-lg hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 text-lg"
//           >
//             Get Started
//           </Button>
//           <Button
//             onClick={() => navigate('/explore')}
//             variant="outline"
//             className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white font-bold px-10 py-6 rounded-lg transition-all duration-200 text-lg"
//           >
//             Explore Now
//           </Button>
//         </div>
//       </div>

//       {/* Feature Cards */}
//       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6 opacity-90">
//         {/* Upload */}
//         <div onClick={() => navigate('/upload')}
//           className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-green-600 text-center border border-green-100
//             transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
//         >
//           <div className="text-3xl mb-3 group-hover:animate-bounce transition-all">📤</div>
//           <div className="text-base font-bold group-hover:text-green-700">Upload</div>
//         </div>

//         {/* Explore */}
//         <div
//           onClick={() => navigate('/explore')}
//           className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-blue-600 text-center border border-blue-100
//             transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
//         >
//           <div className="text-3xl mb-3 group-hover:animate-pulse transition-all">🔍</div>
//           <div className="text-base font-bold group-hover:text-blue-700">Explore</div>
//         </div>

//         {/* Post */}
//         <div
//           onClick={() => navigate('/posts')}
//           className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-green-600 text-center border border-green-100
//             transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
//         >
//           <div className="text-3xl mb-3 group-hover:animate-bounce transition-all">👥</div>
//           <div className="text-base font-bold group-hover:text-green-700">Post</div>
//         </div>

//       </div>
//     </div>
//   );
// }

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Upload,
  Search,
  Users,
  Trophy,
  Play,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Flame,
  Clock
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: Upload, title: "Upload", desc: "Share sports moments", path: "/upload", color: "from-emerald-400 to-green-600" },
    { icon: Search, title: "Explore", desc: "Discover trending content", path: "/explore", color: "from-blue-400 to-indigo-600" },
    { icon: MessageCircle, title: "Discuss", desc: "Join live discussions", path: "/posts", color: "from-cyan-400 to-teal-600" },
    { icon: Users, title: "Connect", desc: "Find your team", path: "/friends", color: "from-purple-400 to-pink-600" },
    { icon: Play, title: "Watch", desc: "Stream highlights", path: "/videos", color: "from-orange-400 to-red-600" },
    { icon: Trophy, title: "Compete", desc: "Climb the leaderboard", path: "/leaderboard", color: "from-yellow-400 to-amber-600" }
  ];

  // Mock trending content - would come from API
  const trending = [
    { title: "Champions League Final", category: "Football", views: "2.4M" },
    { title: "NBA Playoffs Recap", category: "Basketball", views: "1.8M" },
    { title: "Wimbledon Highlights", category: "Tennis", views: "1.2M" },
    { title: "F1 Monaco GP", category: "Racing", views: "980K" },
    { title: "Cricket World Cup", category: "Cricket", views: "3.1M" }
  ];

  const recentDiscussions = [
    { author: "SportsNerd", topic: "Is this the greatest final ever?", replies: 234, time: "2h ago" },
    { author: "BasketballFan", topic: "Trade deadline predictions", replies: 156, time: "4h ago" },
    { author: "TennisAce", topic: "Underrated players discussion", replies: 89, time: "6h ago" }
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Layered Background Depth */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10" 
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-5" 
          style={{ background: 'radial-gradient(circle, var(--accent-2) 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative">
        {/* Editorial Hero - Left Aligned Storytelling */}
        <section className="grid-editorial pt-24 pb-16 px-8 max-w-[1536px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-12 lg:col-span-7"
          >
            {/* Large Typography Contrast */}
            <div className="mb-4">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border-subtle)'
                }}>
                <Flame className="inline w-4 h-4 mr-2" />
                Live Sports Community
              </span>
            </div>

            <h1 
              className="font-extrabold leading-none mb-8"
              style={{
                fontSize: 'clamp(48px, 8vw, var(--text-7xl))',
                lineHeight: 'var(--lh-tight)',
                color: 'var(--text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              Where Every
              <br />
              <span className="text-gradient-accent">
                Game Moment
              </span>
              <br />
              Lives Forever
            </h1>

            <p 
              className="mb-10 max-w-xl"
              style={{
                fontSize: 'var(--text-xl)',
                lineHeight: 'var(--lh-relaxed)',
                color: 'var(--text-sub)'
              }}
            >
              Join the world's most passionate sports community. Share epic moments, 
              discover unbelievable plays, and connect with fans who live for the game.
            </p>

            {/* No gradients in CTA - hard accent colors */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/explore")}
                className="px-8 py-4 font-semibold hover-lift"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--text-on-accent)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-lg)',
                  transition: 'all var(--transition-base)'
                }}
              >
                Start Exploring
              </button>
              <button
                onClick={() => navigate("/upload")}
                className="px-8 py-4 font-semibold interactive-card"
                style={{
                  background: 'transparent',
                  color: 'var(--text-main)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-lg)'
                }}
              >
                <Upload className="inline w-5 h-5 mr-2" />
                Upload Content
              </button>
            </div>
          </motion.div>

          {/* Hero Visual Block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="col-span-12 lg:col-span-5 hidden lg:block"
          >
            <div 
              className="h-full min-h-[400px] rounded-2xl overflow-hidden cursor-pointer hover-lift"
              onClick={() => navigate("/explore")}
              style={{
                background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--elev-2)'
              }}
            >
              <div className="h-full flex items-center justify-center flex-col p-12 text-center">
                <Trophy className="w-24 h-24 mb-6" style={{ color: 'var(--accent-2)' }} />
                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>
                  Featured Today
                </h3>
                <p style={{ color: 'var(--text-sub)' }}>
                  3.2M active fans watching live
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Horizontal Trending Strip */}
        <section className="py-12 px-8 border-y" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div className="max-w-[1536px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--accent-2)' }} />
                Trending Now
              </h2>
              <button 
                onClick={() => navigate("/explore")}
                className="text-sm font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform"
                style={{ color: 'var(--accent)' }}
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-custom pb-4">
              {trending.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate("/explore")}
                  className="flex-shrink-0 w-[280px] p-6 cursor-pointer hover-lift"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(108, 92, 231, 0.2)',
                        color: 'var(--accent)'
                      }}>
                      {item.category}
                    </span>
                    <Flame className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--text-main)' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-sub)' }}>{item.views} views</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Masonry Story Grid - Content Driven Sections */}
        <section className="py-16 px-8">
          <div className="max-w-[1536px] mx-auto">
            <h2 className="text-3xl font-bold mb-10" style={{ color: 'var(--text-main)' }}>
              Discover Your Game
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(item.path)}
                    className="group cursor-pointer p-8 hover-lift"
                    style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: i % 3 === 0 ? 'var(--r-xl)' : i % 2 === 0 ? 'var(--r-sm)' : 'var(--r-lg)',
                      border: '1px solid var(--border-subtle)',
                      minHeight: i % 2 === 0 ? '280px' : '240px'
                    }}
                  >
                    <div 
                      className="w-12 h-12 flex items-center justify-center mb-6"
                      style={{
                        background: 'var(--accent)',
                        borderRadius: 'var(--r-md)'
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-gradient-accent transition-all" 
                      style={{ color: 'var(--text-main)' }}>
                      {item.title}
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--text-sub)', fontSize: 'var(--text-base)' }}>
                      {item.desc}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                      Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Discussion Timeline Preview */}
        <section className="py-16 px-8" style={{ background: 'var(--bg-surface)' }}>
          <div className="max-w-[1536px] mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
                Live Discussions
              </h2>
              <button 
                onClick={() => navigate("/posts")}
                className="px-6 py-3 font-semibold interactive-card"
                style={{
                  borderRadius: 'var(--r-md)'
                }}
              >
                Join Conversation
              </button>
            </div>

            <div className="space-y-4">
              {recentDiscussions.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate("/posts")}
                  className="p-6 cursor-pointer interactive-card"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-lg)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent)', color: 'white', fontWeight: 'var(--fw-bold)' }}>
                      {item.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{item.author}</span>
                        <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <Clock className="w-3 h-3" /> {item.time}
                        </span>
                      </div>
                      <p className="font-medium mb-2" style={{ color: 'var(--text-main)' }}>{item.topic}</p>
                      <span className="text-sm" style={{ color: 'var(--text-sub)' }}>
                        <MessageCircle className="inline w-4 h-4 mr-1" />
                        {item.replies} replies
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Creator Upload CTA Block */}
        <section className="py-20 px-8">
          <div className="max-w-[1536px] mx-auto">
            <div 
              className="grid md:grid-cols-2 gap-12 items-center p-12 md:p-16"
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--r-2xl)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--elev-3)'
              }}
            >
              <div>
                <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
                  Got an Epic Moment?
                </h2>
                <p className="text-lg mb-8" style={{ color: 'var(--text-sub)', lineHeight: 'var(--lh-relaxed)' }}>
                  Share your greatest sports moments with millions of fans. 
                  Upload highlights, analysis, or live reactions and become part of the story.
                </p>
                <button
                  onClick={() => navigate("/upload")}
                  className="px-10 py-5 font-bold text-lg flex items-center gap-3"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--text-on-accent)',
                    borderRadius: 'var(--r-lg)',
                    transition: 'all var(--transition-base)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Upload className="w-6 h-6" />
                  Start Creating
                </button>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-32 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', opacity: 0.2 }}></div>
                  <div className="h-40 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%)', opacity: 0.15 }}></div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-40 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', opacity: 0.15 }}></div>
                  <div className="h-32 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%)', opacity: 0.2 }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
