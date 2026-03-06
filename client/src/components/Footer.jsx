import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="dark:bg-zinc-950 bg-slate-50 border-t dark:border-zinc-800 border-slate-200 py-12 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <h2 className="text-2xl font-bold dark:text-white text-slate-900">HuddleUp</h2>
            </div>
            <p className="text-sm dark:text-zinc-400 text-slate-500 leading-relaxed mb-4">
              Bringing sports enthusiasts together.<br />
              Your ultimate platform for community,<br />
              engagement and competition.
            </p>
            <a 
              href="mailto:singlaanush18@gmail.com" 
              className="inline-flex items-center gap-2 text-sm dark:text-zinc-400 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              <span>📧</span>
              <span className="hover:underline">singlaanush18@gmail.com</span>
            </a>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/explore", label: "Explore" },
                { href: "/upload", label: "Upload" },
                { href: "/posts", label: "Discussion" },
                { href: "/about", label: "About" }
              ].map((link) => (
                <li key={link.label} className="group">
                  <Link
                    to={link.href}
                    className="text-sm dark:text-zinc-400 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 inline-flex items-center gap-2 transition-all duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              {[
                { href: "/contact", label: "Contact", id: "contact" },
                { href: "/feedback", label: "Feedback", id: "feedback" },
                { href: "/privacy-policy", label: "Privacy Policy", id: "privacy-main" },
                { href: "/terms", label: "Terms of Service", id: "terms-main" },
                { href: "/contributors", label: "Contributors", id: "contributors" },
                { href: "/community-guidelines", label: "Community Guidelines", id: "community-guidelines" }
              ].map((link) => (
                <li key={link.id} className="group">
                  <Link
                    to={link.href}
                    className="text-sm dark:text-zinc-400 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 inline-flex items-center gap-2 transition-all duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-4">Follow Us</h3>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mb-4">
              Stay connected for updates and community news
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/anush_singla18/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a
                href="https://x.com/dev_anush18"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <FaTwitter className="text-lg" />
              </a>
              <a
                href="https://github.com/AnushSingla"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <FaGithub className="text-lg" />
              </a>
              <a
                href="https://www.linkedin.com/in/anush-singla-1b0899311/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <FaLinkedin className="text-lg" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t dark:border-zinc-800 border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs dark:text-zinc-500 text-slate-400">
            <p>© {new Date().getFullYear()} HuddleUp. All rights reserved.</p>
            <p>Made with ❤️ for sports</p>
            <p>Designed & Developed by <span className="text-emerald-400">poseidon</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
