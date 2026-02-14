import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Send } from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";

export default function Contact() {
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    message: "",
    helpOptions: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We'll get back to you soon.");
    setForm({ 
      firstName: "", 
      lastName: "", 
      email: "", 
      phone: "",
      message: "",
      helpOptions: []
    });
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (option) => {
    setForm(prev => ({
      ...prev,
      helpOptions: prev.helpOptions.includes(option)
        ? prev.helpOptions.filter(o => o !== option)
        : [...prev.helpOptions, option]
    }));
  };

  return (
    <PageWrapper>
    <div className="min-h-screen py-12 px-6" 
      style={{ background: 'var(--bg-primary)' }}>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left - Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-8 md:p-10"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <h1 className="text-3xl md:text-4xl font-black mb-4">
                Contact{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  HuddleUp Team
                </span>
              </h1>
              
              <p className="mb-8" style={{ color: 'var(--text-sub)' }}>
                Have questions about HuddleUp, need support, or want to give feedback? 
                Our team is here to help you 24/7. Reach out and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="John"
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
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
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

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                      Email
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

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 000 000 0000"
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

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Write your message..."
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

                {/* Help Categories */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-main)' }}>
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: '🛠️', label: 'Technical support' },
                      { icon: '👤', label: 'Account & login help' },
                      { icon: '📋', label: 'Community guidelines' },
                      { icon: '🐛', label: 'Report a bug' },
                      { icon: '✨', label: 'Feature request' },
                      { icon: '💬', label: 'General feedback' }
                    ].map((option) => (
                      <label
                        key={option.label}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                        style={{
                          background: form.helpOptions.includes(option.label) 
                            ? 'var(--accent-glow)' 
                            : 'transparent',
                          border: `2px solid ${form.helpOptions.includes(option.label) 
                            ? 'var(--accent)' 
                            : 'var(--border-subtle)'}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.helpOptions.includes(option.label)}
                          onChange={() => handleCheckboxChange(option.label)}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  className="w-full px-6 py-4 font-bold text-base flex items-center justify-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                    color: 'white',
                    borderRadius: 'var(--r-md)',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  Send Message <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </div>

          {/* Right - Contact Info Cards */}
          <div className="space-y-6">
            
            {/* Chat with us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a, #3730a3)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6" />
                <h3 className="text-xl font-bold">Chat with us</h3>
              </div>
              <p className="text-sm mb-2 opacity-90">Start live chat</p>
              <p className="text-sm font-medium">support@huddleup.com</p>
            </motion.div>

            {/* Call us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, #581c87, #6b21a8)',
                color: 'white'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6" />
                <h3 className="text-xl font-bold">Call us</h3>
              </div>
              <p className="text-sm mb-2 opacity-90">Call our team Mon-Fri from 8am to 5pm</p>
              <p className="text-sm font-medium">+1 (800) 123-4567</p>
            </motion.div>

          </div>

        </div>
      </div>

    </div>
    </PageWrapper>
  );
}
