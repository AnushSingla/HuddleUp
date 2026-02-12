import React from "react";
import { Users, Target, Shield, Globe, Trophy, Heart } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Sports Covered", value: "25+", icon: Trophy },
    { label: "Countries", value: "50+", icon: Globe },
    { label: "Daily Stories", value: "500+", icon: Heart },
  ];

  const values = [
    {
      title: "Community First",
      description:
        "We believe sports are better when shared. Our platform fosters meaningful connections between fans worldwide.",
      icon: Users,
    },
    {
      title: "Authentic Analysis",
      description:
        "From unheard stories to deep match analysis, we provide space for powerful sports journalism.",
      icon: Target,
    },
    {
      title: "Safe Environment",
      description:
        "We maintain a respectful and secure platform through strong moderation and clear guidelines.",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative py-28 text-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),transparent_70%)]"></div>

        <h1 className="group text-5xl md:text-7xl font-black mb-6 tracking-tight text-center cursor-pointer transition-all duration-500">

  <span className="inline-block transition-all duration-500 group-hover:scale-105 group-hover:tracking-wider">
    Elevating the{" "}
  </span>

  <span
    className="
    relative inline-block
    bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500
    bg-[length:200%_200%]
    bg-clip-text text-transparent
    transition-all duration-700
    group-hover:animate-gradient
    group-hover:drop-shadow-[0_0_25px_rgba(99,102,241,0.8)]
    "
  >
    Fan Experience

    {/* Animated underline */}
    <span className="
      absolute left-0 -bottom-2 h-1 w-0
      bg-gradient-to-r from-cyan-400 to-purple-500
      transition-all duration-500
      group-hover:w-full
    "></span>
  </span>

</h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          HuddleUp is a digital stadium where stories come alive, analysis runs deep,
          and every fan has a voice.
        </p>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 
                transition-all duration-500 hover:-translate-y-4 hover:scale-105 
                hover:border-indigo-400 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
              >
                <div className="flex justify-center mb-4">
                  <Icon className="w-8 h-8 text-indigo-400 group-hover:text-cyan-400 transition duration-500 group-hover:rotate-12" />
                </div>

                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </h3>

                <p className="text-sm uppercase tracking-wider text-slate-400 mt-2">
                  {stat.label}
                </p>

                {/* Glow Layer */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 blur-xl"></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= MISSION + VALUES ================= */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-4xl font-extrabold mb-6 relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Our Mission
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              Our mission is to unite sports fans across the globe through meaningful
              conversations, in-depth analysis, and powerful storytelling.
            </p>

            <p className="text-lg text-slate-400 leading-relaxed">
              We empower the community to share, engage, and celebrate sports together.
            </p>
          </div>

          {/* RIGHT CARDS */}
          <div className="grid gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group relative p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10
                  transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02]
                  hover:border-purple-400 hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]"
                >
                  <Icon className="w-12 h-12 text-purple-400 mb-6 
                    transition-all duration-500 group-hover:text-cyan-400 group-hover:rotate-6" />

                  <h3 className="text-xl font-bold mb-3 text-white">
                    {value.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed">
                    {value.description}
                  </p>

                  {/* Background Glow */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-2xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
