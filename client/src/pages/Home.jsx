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

      {/* Feature Grid */}
      <div className="container mx-auto px-6 z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              onClick={() => navigate(feature.path)}
              className={`group cursor-pointer bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border ${feature.border} 
                hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900 
                transition-all duration-200`}
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 
                group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}