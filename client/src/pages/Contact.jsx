import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Send, Mail, MapPin, Clock } from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ 
      firstName: "", 
      lastName: "", 
      email: "", 
      phone: "",
      message: ""
    });
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PageWrapper>
      <PageMeta title="Contact" description="Get in touch with the HuddleUp team. We'd love to hear from you." />
    <div className="min-h-screen py-16 px-6" 
      style={{ background: 'var(--bg-primary)' }}>
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Get in{' '}
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Touch
            </span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-sub)' }}>
            Have a question or feedback? We'd love to hear from you. Our team typically responds within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Email Card */}
            <div className="p-6 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
              <p className="text-sm text-white/80 mb-3">Send us an email anytime</p>
              <a href="mailto:support@huddleup.com" 
                className="text-sm font-semibold text-white hover:underline">
                support@huddleup.com
              </a>
            </div>

            {/* Phone Card */}
            <div className="p-6 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Call Us</h3>
              <p className="text-sm text-white/80 mb-3">Mon-Fri, 9am to 6pm EST</p>
              <a href="tel:+18001234567" 
                className="text-sm font-semibold text-white hover:underline">
                +1 (800) 123-4567
              </a>
            </div>

            {/* Live Chat Card */}
            <div className="p-6 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)'
              }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
              <p className="text-sm text-white/80 mb-3">Available 24/7 for support</p>
              <button 
                className="text-sm font-semibold text-white hover:underline"
                onClick={() => toast.info("Live chat coming soon!")}>
                Start chatting →
              </button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="p-8 rounded-2xl"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" 
                      style={{ color: 'var(--text-main)' }}>
                      First Name *
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
                    <label className="block text-sm font-medium mb-2" 
                      style={{ color: 'var(--text-main)' }}>
                      Last Name *
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
                    <label className="block text-sm font-medium mb-2" 
                      style={{ color: 'var(--text-main)' }}>
                      Email Address *
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
                    <label className="block text-sm font-medium mb-2" 
                      style={{ color: 'var(--text-main)' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (000) 000-0000"
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
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'var(--text-main)' }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us how we can help you..."
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
                  <Send className="w-5 h-5" />
                  Send Message
                </motion.button>
              </form>
            </div>
          </motion.div>

        </div>

        {/* Additional Info Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center p-6 rounded-xl" 
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
            <h4 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
              Quick Response
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              We respond within 24 hours
            </p>
          </div>

          <div className="text-center p-6 rounded-xl" 
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--turf-green)' }} />
            <h4 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
              Global Reach
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              Supporting sports fans worldwide
            </p>
          </div>

          <div className="text-center p-6 rounded-xl" 
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: '#8b5cf6' }} />
            <h4 className="font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
              Community First
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              Your feedback shapes HuddleUp
            </p>
          </div>
        </motion.div>

      </div>

    </div>
    </PageWrapper>
  );
}
