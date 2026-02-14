import React from 'react';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Branding */}
          <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:-translate-y-1 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-all duration-200">
                🏆
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">HuddleUp</h2>
                <p className="text-sm text-zinc-400">
                  © {new Date().getFullYear()} All rights reserved.
                </p>
                <a 
                  href="mailto:singlaanush18@gmail.com" 
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-blue-400 mt-3 transition-colors duration-200"
                >
                  <span>📧</span>
                  <span className="hover:underline">singlaanush18@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Links */}
          <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:-translate-y-1 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-all duration-200">
                🔗
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { href: "/about", label: "About" },
                    { href: "/contact", label: "Contact" },
                    { href: "/feedback", label: "Feedback" },
                    { href: "/", label: "Home" }
                  ].map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-zinc-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Social */}
          <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:-translate-y-1 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-all duration-200">
                🌐
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { Icon: FaInstagram, href: "https://www.instagram.com/anush_singla18/", color: "hover:text-pink-500" },
                    { Icon: FaTwitter, href: "https://x.com/dev_anush18", color: "hover:text-blue-400" },
                    { Icon: FaGithub, href: "https://github.com/AnushSingla", color: "hover:text-white" },
                    { Icon: FaLinkedin, href: "https://www.linkedin.com/in/anush-singla-1b0899311/", color: "hover:text-blue-600" }
                  ].map(({ Icon, href, color }, idx) => (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 ${color} hover:bg-zinc-700 hover:scale-110 transition-all duration-200`}
                    >
                      <Icon className="text-lg" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Built with 💙 for the sports community
          </p>
        </div>
      </div>
    </footer>
  );
}
