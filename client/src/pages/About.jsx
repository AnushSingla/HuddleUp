import React, { useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import { Users, Zap, Shield, Globe, TrendingUp, Heart } from "lucide-react";

const About = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const stats = [
    { value: "10K+", label: "moments shared daily", color: "var(--accent)", icon: TrendingUp },
    { value: "25+", label: "sports from cricket to curling", color: "var(--turf-green)", icon: Globe },
    { value: "50+", label: "countries watching together", color: "var(--sun-yellow)", icon: Users },
    { value: "5K+", label: "active users online", color: "#f472b6", icon: Heart },
    { value: "99.99%", label: "uptime this year", color: "#a3e635", icon: Shield },
    { value: "100+", label: "live matches streamed", color: "#fbbf24", icon: Zap },
  ];

  const principles = [
    {
      icon: Heart,
      title: "Community First, Always",
      desc: "No algorithm deciding what you see. No ads interrupting your flow. Just pure, unfiltered sports passion from people who actually care.",
      color: "#22c55e",
      colorLight: "rgba(34, 197, 94, 0.15)",
      colorGlow: "rgba(34, 197, 94, 0.35)",
    },
    {
      icon: Zap,
      title: "Built for Speed",
      desc: "Upload highlights in seconds. Stream without buffering. React in real-time. Because when the game is on, every second counts.",
      color: "#00E5FF",
      colorLight: "rgba(0, 229, 255, 0.15)",
      colorGlow: "rgba(0, 229, 255, 0.35)",
    },
    {
      icon: Shield,
      title: "Safe Space, Real Talk",
      desc: "Rivalries are fun. Toxicity isn't. We keep it competitive but respectful, so everyone can bring their A-game without the BS.",
      color: "#a78bfa",
      colorLight: "rgba(167, 139, 250, 0.15)",
      colorGlow: "rgba(167, 139, 250, 0.35)",
    },
    {
      icon: Users,
      title: "Collaborative Growth",
      desc: "Open-source spirit: built by fans, for fans. Contributions and feedback shape our roadmap.",
      color: "#f97316",
      colorLight: "rgba(249, 115, 22, 0.15)",
      colorGlow: "rgba(249, 115, 22, 0.35)",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      desc: "Accessible from anywhere, on any device. Multilingual support and inclusive design.",
      color: "#38bdf8",
      colorLight: "rgba(56, 189, 248, 0.15)",
      colorGlow: "rgba(56, 189, 248, 0.35)",
    },
    {
      icon: TrendingUp,
      title: "Continuous Innovation",
      desc: "We ship new features and improvements every month, driven by community needs.",
      color: "#facc15",
      colorLight: "rgba(250, 204, 21, 0.15)",
      colorGlow: "rgba(250, 204, 21, 0.35)",
    },
  ];

  return (
    <PageWrapper>
      <PageMeta title="About" description="HuddleUp is where sports fans share moments, debate the play, and connect. Community-first, built for speed." />
      <div
        className="min-h-screen relative"
        style={{
          background: 'linear-gradient(120deg, var(--bg-primary) 70%, #e0f2fe 100%)',
        }}
      >
        {/* Hero Section */}
        <section className="px-6 md:px-12 pt-24 pb-20 relative">
          <div className="absolute inset-0 pointer-events-none select-none opacity-30" aria-hidden="true">
            <div style={{
              background: 'radial-gradient(circle at 60% 40%, #38bdf8 0%, transparent 70%)',
              width: '100%', height: '100%'
            }} />
          </div>
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
                We built{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.01em',
                }}>
                  HuddleUp
                </span>
                <br />
                for the fans
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mb-4" style={{ color: 'var(--text-sub)', lineHeight: '1.6' }}>
                Because fans were yelling into the void after moments that deserved a crowd.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-cyan-400/30 via-blue-400/10 to-transparent mb-8" />

        {/* Story Section */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-lg md:text-xl font-medium" style={{ color: 'var(--text-main)', lineHeight: '1.8' }}>
                Every platform promised community. Most delivered isolation.
              </p>
              <p className="text-lg md:text-xl" style={{ color: 'var(--text-sub)', lineHeight: '1.8' }}>
                You'd upload the greatest play you've ever seen, and it would vanish in 60 seconds. 
                You'd start a debate about the GOAT, and the algorithm would bury it for engagement-bait.
              </p>
              <div className="py-12">
                <p className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
                  So we built something different.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(56,189,248,0.10)" }}
                    className="relative p-8 group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200"
                    style={{
                      background: 'linear-gradient(120deg, var(--bg-surface) 80%, #f0f9ff 100%)',
                      borderLeft: `4px solid ${stat.color}`,
                      borderRadius: '12px',
                    }}
                  >
                    <IconComponent 
                      className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-200" 
                      style={{ color: stat.color }} 
                      strokeWidth={1.5}
                    />
                    <div className="text-5xl md:text-6xl font-black mb-3" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <p className="text-base font-medium" style={{ color: 'var(--text-sub)' }}>
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400/10 to-cyan-400/30 mb-8" />

        {/* Philosophy Section */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl mb-12 font-medium" style={{ color: 'var(--text-sub)', lineHeight: '1.8' }}>
              We're not trying to replace Twitter for hot takes or YouTube for polished content. 
              We're the place you go when something just happened and you need to talk about it <em>right now</em>.
            </p>
            <div className="space-y-6 mb-16">
              <p className="text-lg" style={{ color: 'var(--text-sub)', lineHeight: '1.8' }}>
                We don't use recommendation algorithms.
              </p>
              <p className="text-lg" style={{ color: 'var(--text-sub)', lineHeight: '1.8' }}>
                We don't sell your attention to advertisers.
              </p>
              <p className="text-lg" style={{ color: 'var(--text-sub)', lineHeight: '1.8' }}>
                We don't optimize for "engagement" — we optimize for actual conversation between actual fans.
              </p>
            </div>
          </div>
        </section>

        {/* Principles Cards */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-12" 
              style={{ color: 'var(--text-sub)', letterSpacing: '0.2em' }}>
              What Makes Us Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {principles.map((principle, index) => {
                const IconComponent = principle.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.12, duration: 0.35, ease: 'easeOut' }}
                    whileHover={{
                      y: -8,
                      scale: 1.03,
                      transition: { type: 'spring', stiffness: 260, damping: 20 },
                    }}
                    className="group relative overflow-hidden p-[1px] rounded-2xl"
                  >
                    {/* colorful border that lights up on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          'conic-gradient(from 160deg at 50% 50%, #4f46e5, #ec4899, #f97316, #22c55e, #0ea5e9, #4f46e5)',
                        filter: 'blur(3px)',
                      }}
                    />

                    {/* card surface */}
                    <div
                      className="relative h-full w-full rounded-[1rem] p-6"
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: '1rem',
                        border: '1px solid var(--border-subtle)',
                        backdropFilter: 'blur(12px)',
                        transition: 'background 0.25s ease-out, border-color 0.25s ease-out',
                      }}
                    >
                      {/* inner subtle tint on hover */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[1rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            'radial-gradient(circle at 0% 0%, rgba(79,70,229,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.18), transparent 55%)',
                        }}
                      />

                      {/* content */}
                      <div className="relative">
                        <IconComponent
                          className="w-10 h-10 mb-4"
                          style={{ color: 'var(--accent)' }}
                          strokeWidth={1.5}
                        />
                        <h3
                          className="text-xl font-bold mb-3"
                          style={{ color: 'var(--text-main)' }}
                        >
                          {principle.title}
                        </h3>
                        <p style={{ color: 'var(--text-sub)', lineHeight: '1.7' }}>
                          {principle.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                );
              })}
            </div>
          </div>
        </section>

        {/* Features & Technologies Section */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-center" style={{ color: 'var(--text-main)', letterSpacing: '0.1em' }}>
              Key Features & Technologies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <ul className="list-disc pl-6 space-y-2 text-base md:text-lg" style={{ color: 'var(--text-sub)' }}>
                  <li>Real-time chat and live match rooms</li>
                  <li>Instant video highlight uploads</li>
                  <li>Interactive comment sections and reactions</li>
                  <li>Personalized notification feed</li>
                  <li>Advanced moderation and reporting tools</li>
                  <li>Mobile-first responsive design</li>
                  <li>Accessibility and dark mode support</li>
                </ul>
              </div>
              <div>
                <ul className="list-disc pl-6 space-y-2 text-base md:text-lg" style={{ color: 'var(--text-sub)' }}>
                  <li>Frontend: React, Vite, Tailwind CSS, Framer Motion</li>
                  <li>Backend: Node.js, Express.js, MongoDB</li>
                  <li>WebSockets for live updates</li>
                  <li>Cloud deployment (Vercel)</li>
                  <li>Open-source and community-driven</li>
                  <li>Continuous integration & delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-cyan-400/30 via-blue-400/10 to-transparent mb-8" />

        {/* Closing Statement & CTA */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <p className="text-3xl md:text-5xl font-black leading-tight" style={{ color: 'var(--text-main)' }}>
                This is your stadium.
              </p>
              <p className="text-3xl md:text-5xl font-black leading-tight mt-2" style={{ 
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                We just keep the lights on.
              </p>
              <div className="mt-10 flex justify-center">
                <a
                  href="/register"
                  className="inline-block px-8 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
                >
                  Join the Community
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default About;
