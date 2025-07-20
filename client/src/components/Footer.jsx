// src/components/Footer.jsx
import React from 'react';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-500 via-blue-500 to-indigo-400 text-white py-8 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        {/* Left: Branding and Email */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold tracking-wide">HuddleUp</h2>
          <p className="text-sm text-white/90 mt-1">
            © {new Date().getFullYear()} HuddleUp. All rights reserved.
          </p>
          <p className="text-sm mt-1">
            📧 <a href="mailto:singlaanush18@gmail.com" className="underline hover:text-white/80">singlaanush18@gmail.com</a>
          </p>
        </div>

        {/* Middle: Links */}
        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <a
              href="https://www.linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white/90 transition"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/91xxxxxxxxxx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white/90 transition"
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="/privacy"
              className="hover:underline hover:text-white/90 transition"
            >
              Privacy
            </a>
          </li>
        </ul>

        {/* Right: Social Icons */}
        <div className="flex gap-4 text-white text-xl">
          <a href="https://instagram.com/anush_singla18" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FaInstagram />
          </a>
          <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FaTwitter />
          </a>
          <a href="https://github.com/AnushSingla" target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
}
