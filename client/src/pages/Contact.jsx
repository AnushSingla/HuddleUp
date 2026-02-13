import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

export default function Contact() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" 
      style={{ background: 'var(--bg-primary)' }}>
      
      <div className="max-w-2xl w-full text-center">
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-black mb-12"
          style={{
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: '1',
            color: 'var(--text-main)',
            letterSpacing: '-0.02em'
          }}>
          Talk to us<span style={{ color: 'var(--accent)' }}>.</span>
        </motion.h1>

        {/* Link-based Contact Options */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
          style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}
        >
          
          <button
            onClick={() => setShowModal(true)}
            className="group flex items-center justify-center gap-3 w-full py-4 transition-all"
            style={{ color: 'var(--text-main)' }}
          >
            <span className="group-hover:pr-4 transition-all">Start a conversation</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: 'var(--accent)' }}>→</span>
          </button>

          <a
            href="https://discord.gg/huddleup"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 w-full py-4 transition-all"
            style={{ color: 'var(--text-main)' }}
          >
            <span className="group-hover:pr-4 transition-all">Join our Discord</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: 'var(--accent)' }}>→</span>
          </a>

          <a
            href="mailto:support@huddleup.com"
            className="group flex items-center justify-center gap-3 w-full py-4 transition-all"
            style={{ color: 'var(--text-main)' }}
          >
            <span className="group-hover:pr-4 transition-all">support@huddleup.com</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: 'var(--accent)' }}>→</span>
          </a>

          <button
            onClick={() => setShowModal(true)}
            className="group flex items-center justify-center gap-3 w-full py-4 transition-all"
            style={{ color: 'var(--text-sub)' }}
          >
            <span className="group-hover:pr-4 transition-all">Report a bug</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: 'var(--accent)' }}>→</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="group flex items-center justify-center gap-3 w-full py-4 transition-all"
            style={{ color: 'var(--text-sub)' }}
          >
            <span className="group-hover:pr-4 transition-all">Request a feature</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: 'var(--accent)' }}>→</span>
          </button>

        </motion.div>

        {/* Response Time Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-sm"
          style={{ color: 'var(--text-sub)' }}
        >
          Average response time: <span style={{ color: 'var(--turf-green)', fontWeight: 600 }}>12 hours</span>
        </motion.p>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg p-8 rounded-lg relative"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover-lift"
                style={{
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)'
                }}
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '2px solid transparent',
                      color: 'var(--text-main)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </div>

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
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '2px solid transparent',
                      color: 'var(--text-main)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                    What's on your mind?
                  </label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us everything..."
                    className="w-full px-4 py-3 rounded-lg resize-none"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '2px solid transparent',
                      color: 'var(--text-main)',
                      lineHeight: 'var(--lh-relaxed)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 font-semibold flex items-center justify-center gap-2 hover-lift"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--bg-primary)',
                    borderRadius: 'var(--r-md)'
                  }}
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
