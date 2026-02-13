import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      
      {/* Narrative Layout - No Cards, Inline Stats */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-32">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
          style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            lineHeight: '1.7',
            color: 'var(--text-main)'
          }}
        >
          <p>
            We built HuddleUp because fans were yelling into the void after moments that deserved a crowd.
          </p>

          <p style={{ color: 'var(--text-sub)' }}>
            Every platform promised community. Most delivered isolation. 
            You'd upload the greatest play you've ever seen, and it would vanish in 60 seconds. 
            You'd start a debate about the GOAT, and the algorithm would bury it for engagement-bait.
          </p>

          <p>
            So we built something different.
          </p>

          <div className="py-8 border-l-4 pl-8" style={{ borderColor: 'var(--accent)' }}>
            <p className="font-bold mb-6" style={{ color: 'var(--accent)', fontSize: 'clamp(18px, 2.5vw, 24px)' }}>
              <span className="text-6xl font-black mr-3">10K+</span>
              moments shared daily
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: 'var(--text-lg)' }}>
              From garage league highlights to World Cup analysis. 
              If it matters to you, it has a home here.
            </p>
          </div>

          <p style={{ color: 'var(--text-sub)' }}>
            We're not trying to replace Twitter for hot takes or YouTube for polished content. 
            We're the place you go when something just happened and you need to talk about it <em>right now</em>.
          </p>

          <div className="py-8 border-l-4 pl-8" style={{ borderColor: 'var(--turf-green)' }}>
            <p className="font-bold mb-6" style={{ color: 'var(--turf-green)', fontSize: 'clamp(18px, 2.5vw, 24px)' }}>
              <span className="text-6xl font-black mr-3">25+</span>
              sports from cricket to curling
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: 'var(--text-lg)' }}>
              No sport is too big or too niche. 
              Your passion is valid here.
            </p>
          </div>

          <p style={{ color: 'var(--text-sub)' }}>
            We don't use recommendation algorithms. 
            We don't sell your attention to advertisers. 
            We don't optimize for "engagement" — we optimize for actual conversation between actual fans.
          </p>

          <div className="py-8 border-l-4 pl-8" style={{ borderColor: 'var(--sun-yellow)' }}>
            <p className="font-bold mb-6" style={{ color: 'var(--sun-yellow)', fontSize: 'clamp(18px, 2.5vw, 24px)' }}>
              <span className="text-6xl font-black mr-3">50+</span>
              countries watching together
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: 'var(--text-lg)' }}>
              Time zones don't matter when the game is on. 
              Find your people, anywhere.
            </p>
          </div>

          <p className="font-semibold" style={{ fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: '1.3' }}>
            This is your stadium.
            <br />
            <span style={{ color: 'var(--accent)' }}>We just keep the lights on.</span>
          </p>

        </motion.div>
      </section>

      {/* What Makes Us Different - No Cards, Just Text */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 pb-32">
        <h2 className="text-sm font-mono mb-12 tracking-wider" 
          style={{ color: 'var(--text-sub)', letterSpacing: '0.2em' }}>
          WHAT MAKES US DIFFERENT
        </h2>

        <div className="space-y-16">
          {/* Community First */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Community First, Always
            </h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 'var(--text-lg)', lineHeight: 'var(--lh-relaxed)' }}>
              No algorithm deciding what you see. No ads interrupting your flow. 
              Just pure, unfiltered sports passion from people who actually care.
            </p>
          </div>

          {/* Built for Speed */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Built for Speed
            </h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 'var(--text-lg)', lineHeight: 'var(--lh-relaxed)' }}>
              Upload highlights in seconds. Stream without buffering. React in real-time. 
              Because when the game is on, every second counts.
            </p>
          </div>

          {/* Safe Space */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Safe Space, Real Talk
            </h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 'var(--text-lg)', lineHeight: 'var(--lh-relaxed)' }}>
              Rivalries are fun. Toxicity isn't. We keep it competitive but respectful, 
              so everyone can bring their A-game without the BS.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
