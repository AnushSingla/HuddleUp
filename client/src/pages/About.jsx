import React from "react";
import { motion } from "framer-motion";
import { Users, Zap, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      
      {/* Magazine-Style Hero - Asymmetric Layout */}
      <section className="relative px-6 md:px-12 pt-32 pb-20 max-w-[1400px] mx-auto">
        
        {/* Kinetic accent mark - hand-drawn feel */}
        <div className="absolute top-20 left-0 w-1 h-32 opacity-40" 
          style={{ background: 'var(--accent)' }}></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-12 gap-12 items-start"
        >
          
          {/* Left: Big Statement */}
          <div className="md:col-span-7">
            <p className="text-sm font-mono mb-6 tracking-wide" 
              style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
              ABOUT HUDDLEUP
            </p>
            
            <h1 className="font-black mb-8"
              style={{
                fontSize: 'clamp(40px, 7vw, 80px)',
                lineHeight: '1.1',
                letterSpacing: '-0.03em'
              }}>
              Built by fans,
              <br />
              <span style={{ color: 'var(--accent)' }}>for the culture</span>
            </h1>

            <div className="space-y-6" style={{ 
              fontSize: 'var(--text-lg)', 
              lineHeight: 'var(--lh-relaxed)',
              color: 'var(--text-sub)' 
            }}>
              <p>
                HuddleUp isn't another social media clone with a sports sticker slapped on it. 
                We're what happens when real fans get tired of yelling into the void on platforms 
                that don't get it.
              </p>
              
              <p>
                Every feature here exists because someone said "I wish there was a place where..." 
                and we actually listened. Upload your garage league highlights. Start heated debates 
                about the GOAT. Find your crew who actually watches the same obscure sport you do.
              </p>

              <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                This is your stadium. We just keep the lights on.
              </p>
            </div>
          </div>

          {/* Right: Quick Stats - Not Centered, Organic Placement */}
          <div className="md:col-span-5 space-y-8 md:mt-16">
            
            {/* Stat 1 */}
            <div className="pl-6" style={{ borderLeft: `3px solid var(--turf-green)` }}>
              <div className="font-black text-5xl mb-1" style={{ color: 'var(--turf-green)' }}>
                10K+
              </div>
              <div className="text-sm font-mono" style={{ color: 'var(--text-sub)' }}>
                Active creators sharing daily
              </div>
            </div>

            {/* Stat 2 */}
            <div className="pl-6 md:ml-12" style={{ borderLeft: `3px solid var(--accent)` }}>
              <div className="font-black text-5xl mb-1" style={{ color: 'var(--accent)' }}>
                25+
              </div>
              <div className="text-sm font-mono" style={{ color: 'var(--text-sub)' }}>
                Sports from cricket to curling
              </div>
            </div>

            {/* Stat 3 */}
            <div className="pl-6" style={{ borderLeft: `3px solid var(--sun-yellow)` }}>
              <div className="font-black text-5xl mb-1" style={{ color: 'var(--sun-yellow)' }}>
                50+
              </div>
              <div className="text-sm font-mono" style={{ color: 'var(--text-sub)' }}>
                Countries represented
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* What Makes Us Different - Editorial Columns */}
      <section className="px-6 md:px-12 py-24 max-w-[1400px] mx-auto">
        
        <h2 className="text-sm font-mono mb-16 tracking-wide" 
          style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
          WHAT MAKES US DIFFERENT
        </h2>

        {/* Three Column Layout - Magazine Style */}
        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Column 1: Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
              <Users className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              Community First, Always
            </h3>
            
            <p style={{ color: 'var(--text-sub)', lineHeight: 'var(--lh-relaxed)' }}>
              No algorithm deciding what you see. No ads interrupting your flow. 
              Just pure, unfiltered sports passion from people who actually care.
            </p>
          </motion.div>

          {/* Column 2: Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{ background: 'var(--turf-green)', color: 'var(--bg-primary)' }}>
              <Zap className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              Built for Speed
            </h3>
            
            <p style={{ color: 'var(--text-sub)', lineHeight: 'var(--lh-relaxed)' }}>
              Upload highlights in seconds. Stream without buffering. React in real-time. 
              Because when the game is on, every second counts.
            </p>
          </motion.div>

          {/* Column 3: Safety */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{ background: 'var(--clay-red)', color: 'var(--bg-primary)' }}>
              <Shield className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              Safe Space, Real Talk
            </h3>
            
            <p style={{ color: 'var(--text-sub)', lineHeight: 'var(--lh-relaxed)' }}>
              Rivalries are fun. Toxicity isn't. We keep it competitive but respectful, 
              so everyone can bring their A-game without the BS.
            </p>
          </motion.div>

        </div>
      </section>

    </div>
  );
};

export default About;
