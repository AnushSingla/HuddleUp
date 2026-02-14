import React from 'react';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/explore", label: "Explore" }
  ];

  const resourceLinks = [
    { href: "/", label: "Privacy Policy" },
    { href: "/", label: "Terms of Service" },
    { href: "/feedback", label: "Feedback" }
  ];

  const socialLinks = [
    { 
      Icon: FaInstagram, 
      href: "https://www.instagram.com/anush_singla18/", 
      label: "Instagram",
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      Icon: FaTwitter, 
      href: "https://x.com/dev_anush18", 
      label: "Twitter",
      gradient: "from-blue-400 to-blue-600"
    },
    { 
      Icon: FaGithub, 
      href: "https://github.com/AnushSingla", 
      label: "GitHub",
      gradient: "from-gray-600 to-gray-800"
    },
    { 
      Icon: FaLinkedin, 
      href: "https://www.linkedin.com/in/anush-singla-1b0899311/", 
      label: "LinkedIn",
      gradient: "from-blue-600 to-blue-800"
    }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-gray-950 to-black border-t border-slate-700/50 overflow-hidden z-10">
      {/* Premium animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-5 lg:pt-10 lg:pb-5">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-6">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center text-3xl shadow-xl hover:scale-110 transition-transform group">
                🏆
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                HuddleUp
              </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Bringing sports enthusiasts together. Your ultimate platform for community, engagement, and competition.
            </p>
            <a 
              href="mailto:singlaanush18@gmail.com" 
              className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-all group hover:gap-3"
            >
              <span className="text-base"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.625" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></span>
              <span className="group-hover:underline underline-offset-4">singlaanush18@gmail.com</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-6 text-white relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label} className="group">
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-all inline-flex items-center gap-2 hover:gap-3"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-6 text-white relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-22 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-cyan-500">
              Resources
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label} className="group">
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-emerald-400 text-sm transition-all inline-flex items-center gap-2 hover:gap-3"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-0 group-hover:scale-100"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-6 text-white relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-20 after:h-0.5 after:bg-gradient-to-r after:from-pink-500 after:to-rose-500">
              Follow Us
            </h3>
            <div className="flex gap-4 mb-6">
              {socialLinks.map(({ Icon, href, label, gradient }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-125 hover:-translate-y-1 border border-white/10 hover:border-white/30 group`}
                  title={label}
                >
                  <Icon className="text-lg group-hover:rotate-12 transition-transform" />
                </a>
              ))}
            </div>
            <p className="text-gray-500 text-xs">
              Stay connected for updates and community news
            </p>
          </div>
        </div>

        {/* Divider with style */}
        <div className="relative mb-4">
          <div className="border-t border-gray-700/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
            <span className="text-gray-600 text-xs">•</span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} <span className="text-white font-semibold">HuddleUp</span>. All rights reserved.
            </p>
            <div className="flex justify-center items-center gap-1 text-sm text-gray-400">
              <span>Made with</span>
              <span className="text-red-500 text-base animate-pulse">❤️</span>
              <span>for sports</span>
            </div>
            <div className="text-xs text-gray-600 md:text-right">
              Designed & Developed with <span className="font-semibold text-yellow-400 italic hover:animate-caret-blink cursor-pointer"> passion</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}