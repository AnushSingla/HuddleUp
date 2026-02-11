import React from "react";
import { Users, Target, Shield, Globe, Trophy, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";

const About = () => {
  const stats = [
    { label: "Active Users", value: "10K+", icon: <Users className="w-6 h-6 text-blue-500" /> },
    { label: "Sports Covered", value: "25+", icon: <Trophy className="w-6 h-6 text-yellow-500" /> },
    { label: "Countries", value: "50+", icon: <Globe className="w-6 h-6 text-green-500" /> },
    { label: "Daily Stories", value: "500+", icon: <Heart className="w-6 h-6 text-red-500" /> },
  ];

  const values = [
    {
      title: "Community First",
      description:
        "We believe sports are better when shared. Our platform is built to foster meaningful connections between fans.",
      icon: <Users className="w-12 h-12 text-blue-600" />,
    },
    {
      title: "Authentic Analysis",
      description:
        "From unheard stories to deep match analysis, we provide a space for high-quality sports journalism and fan insights.",
      icon: <Target className="w-12 h-12 text-purple-600" />,
    },
    {
      title: "Safe Environment",
      description:
        "We maintain a respectful community through robust moderation and clear guidelines for all sports enthusiasts.",
      icon: <Shield className="w-12 h-12 text-green-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      

      {/* Hero Section */}
      <div className="relative py-20 bg-gradient-to-br from-zinc-900 via-blue-900 to-zinc-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(https://www.transparenttextures.com/patterns/cubes.png)",
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Elevating the <span className="text-blue-400">Fan Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed">
            HuddleUp is more than just a platform — it's a digital stadium where
            stories come alive, analysis runs deep, and every fan has a voice.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-zinc-100"
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-zinc-900">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-zinc-900 mb-6">
              Our Mission
            </h2>

            <p className="text-lg text-zinc-600 leading-relaxed mb-6">
              At HuddleUp, our mission is to unite sports fans across the globe
              through meaningful conversations, in-depth analysis, and powerful
              storytelling.
            </p>

            <p className="text-lg text-zinc-600 leading-relaxed">
              We empower the community to share, engage, and celebrate sports
              together.
            </p>
          </div>

          <div className="grid gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-8 bg-zinc-50 rounded-2xl border border-zinc-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
