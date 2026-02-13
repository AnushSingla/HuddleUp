import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, MessageSquare, Twitter, Github } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen px-6 md:px-12 py-24" 
      style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      
      <div className="max-w-[1200px] mx-auto">
        
        {/* Direct, Conversational Intro */}
        <div className="mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-black mb-6"
            style={{
              fontSize: 'clamp(40px, 7vw, 80px)',
              lineHeight: '1.1',
              letterSpacing: '-0.03em'
            }}>
            Let's talk<span style={{ color: 'var(--accent)' }}>.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl max-w-2xl"
            style={{ color: 'var(--text-sub)', lineHeight: 'var(--lh-relaxed)' }}>
            Got questions? Ideas? Bug reports? Just want to say hi? 
            We're real people who actually read these. Pick your method below.
          </motion.p>
        </div>

        {/* Two Column Layout - Quick Contact + Form */}
        <div className="grid md:grid-cols-5 gap-16">
          
          {/* Left: Quick Contact Methods */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 space-y-8">
            
            <div>
              <p className="text-sm font-mono mb-8 tracking-wide" 
                style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
                FASTEST WAYS TO REACH US
              </p>

              {/* Email */}
              <div className="mb-8 p-6 rounded-lg interactive-card group"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg"
                    style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Email</h3>
                </div>
                <a href="mailto:support@huddleup.com" 
                  className="block hover-lift"
                  style={{ color: 'var(--accent)', fontSize: 'var(--text-lg)' }}>
                  support@huddleup.com
                </a>
                <p className="text-sm mt-2" style={{ color: 'var(--text-sub)' }}>
                  Response within 24 hours
                </p>
              </div>

              {/* Discord */}
              <div className="mb-8 p-6 rounded-lg interactive-card group"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg"
                    style={{ background: 'var(--turf-green)', color: 'var(--bg-primary)' }}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Discord Community</h3>
                </div>
                <a href="#" 
                  className="block hover-lift"
                  style={{ color: 'var(--turf-green)', fontSize: 'var(--text-lg)' }}>
                  discord.gg/huddleup
                </a>
                <p className="text-sm mt-2" style={{ color: 'var(--text-sub)' }}>
                  Live chat with the team
                </p>
              </div>

              {/* Social */}
              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-sub)' }}>
                  Or find us on social:
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 flex items-center justify-center rounded-lg hover-lift"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <Twitter className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </a>
                  <a href="#" className="w-12 h-12 flex items-center justify-center rounded-lg hover-lift"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <Github className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </a>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right: Simple Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-3">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <p className="text-sm font-mono mb-6 tracking-wide" 
                style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
                OR SEND A MESSAGE
              </p>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Your name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="What should we call you?"
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-base)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-base)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  What's on your mind?
                </label>
                <textarea
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us everything..."
                  className="w-full px-4 py-3 rounded-lg transition-all resize-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 'var(--lh-relaxed)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="px-8 py-4 font-semibold flex items-center gap-2 hover-lift group"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--text-lg)',
                  transition: 'all var(--transition-base)'
                }}
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>

              <p className="text-sm mt-4" style={{ color: 'var(--text-sub)' }}>
                Average response time: <span style={{ color: 'var(--turf-green)', fontWeight: 600 }}>12 hours</span>
              </p>

            </form>

          </motion.div>

        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-32 p-8 rounded-lg"
          style={{ 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)',
            borderLeft: `4px solid var(--sun-yellow)`
          }}>
          <p className="text-sm" style={{ color: 'var(--text-sub)', lineHeight: 'var(--lh-relaxed)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-main)' }}>Heads up:</span>{" "}
            We're a small team building something big. Response times might vary during major 
            sporting events (we're watching too 👀), but we read every message. Promise.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
