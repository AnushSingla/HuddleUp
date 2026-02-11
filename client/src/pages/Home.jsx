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
  ArrowRight
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden">
      {/* HERO */}
      <section className="pt-32 pb-28 px-6 text-center relative">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold"
        >
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            HuddleUp
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto"
        >
          The ultimate sports community to share, watch, compete and connect.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex justify-center gap-4"
        >
          <button
            onClick={() => navigate("/friends")}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:scale-105 transition"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/explore")}
            className="px-8 py-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            Explore
          </button>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(item.path)}
                className="cursor-pointer rounded-2xl p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:shadow-2xl transition"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Icon className="text-white w-7 h-7" />
                </div>

                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">{item.desc}</p>

                <div className="mt-6 flex items-center text-sm font-semibold">
                  Learn more <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
