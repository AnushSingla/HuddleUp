import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Users, Trophy, Play, MessageCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload",
      desc: "Share your sports moments",
      color: "from-green-500 to-emerald-600",
      bgHover: "hover:bg-green-500/10",
      border: "border-green-500/20",
      path: "/upload"
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Explore",
      desc: "Discover amazing content",
      color: "from-blue-500 to-indigo-600",
      bgHover: "hover:bg-blue-500/10",
      border: "border-blue-500/20",
      path: "/explore"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Discuss",
      desc: "Join the conversation",
      color: "from-cyan-500 to-teal-600",
      bgHover: "hover:bg-cyan-500/10",
      border: "border-cyan-500/20",
      path: "/posts"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect",
      desc: "Find your team",
      color: "from-purple-500 to-pink-600",
      bgHover: "hover:bg-purple-500/10",
      border: "border-purple-500/20",
      path: "/friends"
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Watch",
      desc: "Stream highlights",
      color: "from-orange-500 to-red-600",
      bgHover: "hover:bg-orange-500/10",
      border: "border-orange-500/20",
      path: "/videos"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Compete",
      desc: "Challenge others",
      color: "from-yellow-500 to-amber-600",
      bgHover: "hover:bg-yellow-500/10",
      border: "border-yellow-500/20",
      path: "/leaderboard"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-zinc-700 text-8xl">🏏</div>
        <div className="absolute top-32 right-20 text-zinc-700 text-6xl">⚾</div>
        <div className="absolute bottom-40 left-20 text-zinc-700 text-7xl">🏆</div>
        <div className="absolute bottom-60 right-10 text-zinc-700 text-5xl">🎯</div>
        <div className="absolute top-1/2 left-1/4 text-zinc-800 text-9xl">⚽</div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-4xl mx-auto px-6 mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
          🏆 HuddleUp
        </h1>
        <p className="text-2xl md:text-3xl text-blue-400 mb-6 font-light">
          The Ultimate Sports Community Platform
        </p>
        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Connect with fellow sports enthusiasts, share your best moments, explore amazing content, and be part of the world's most passionate sports community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate('/friends')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-6 rounded-lg hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 text-lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate('/explore')}
            variant="outline"
            className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white font-bold px-10 py-6 rounded-lg transition-all duration-200 text-lg"
          >
            Explore Now
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6 opacity-90">
        {/* Upload */}
        <div onClick={() => navigate('/upload')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-green-600 text-center border border-green-100
            transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
        >
          <div className="text-3xl mb-3 group-hover:animate-bounce transition-all">📤</div>
          <div className="text-base font-bold group-hover:text-green-700">Upload</div>
        </div>

        {/* Explore */}
        <div
          onClick={() => navigate('/explore')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-blue-600 text-center border border-blue-100
            transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
        >
          <div className="text-3xl mb-3 group-hover:animate-pulse transition-all">🔍</div>
          <div className="text-base font-bold group-hover:text-blue-700">Explore</div>
        </div>

        {/* Post */}
        <div
          onClick={() => navigate('/posts')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-xl p-6 text-green-600 text-center border border-green-100
            transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:bg-white hover:-translate-y-2"
        >
          <div className="text-3xl mb-3 group-hover:animate-bounce transition-all">👥</div>
          <div className="text-base font-bold group-hover:text-green-700">Post</div>
        </div>

      </div>
    </div>
  );
}