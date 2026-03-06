import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Star } from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";

export default function Feedback() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    subject: "",
    feedback: "",
    rating: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your feedback! We'll review it carefully.");
    setForm({ 
      name: "", 
      email: "", 
      subject: "",
      feedback: "",
      rating: 0
    });
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PageWrapper>
      <PageMeta title="Feedback" description="Send feedback to the HuddleUp team. We value your input." />
    <div className="min-h-screen py-16 px-6" 
      style={{ background: 'var(--bg-primary)' }}>
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-4"
          >
            Share Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Feedback
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg" 
            style={{ color: 'var(--text-sub)' }}
          >
            Your thoughts help us build a better HuddleUp. We read every single message.
          </motion.p>
        </div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 md:p-10"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-main)' }}>
                How would you rate your experience?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                    className="transition-all hover:scale-110"
                  >
                    <Star
                      className="w-8 h-8"
                      fill={star <= form.rating ? 'var(--sun-yellow)' : 'transparent'}
                      stroke={star <= form.rating ? 'var(--sun-yellow)' : 'var(--border-medium)'}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-subtle)',
                    color: 'var(--text-main)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Your Feedback
              </label>
              <textarea
                name="feedback"
                required
                value={form.feedback}
                onChange={handleChange}
                rows={6}
                placeholder="Tell us what you think... What do you love? What could be better? Any features you'd like to see?"
                className="w-full px-4 py-3 rounded-lg resize-none outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  lineHeight: '1.6'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className="w-full px-6 py-4 font-bold text-base flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                borderRadius: 'var(--r-md)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
              }}
            >
              Send Feedback <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm"
          style={{ color: 'var(--text-sub)' }}
        >
          We typically respond within 24-48 hours. Your privacy matters — we'll never share your information.
        </motion.p>
      </div>

    </div>
    </PageWrapper>
  );
}