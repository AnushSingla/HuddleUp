// src/components/Footer.jsx
import React from 'react';
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-500 via-blue-500 to-indigo-400 text-white py-8 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        
        {/* Left: Branding and Email - EXACTLY ORIGINAL */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold tracking-wide hover:scale-105 transition-all duration-300">HuddleUp</h2>
          <p className="text-sm text-white/90 mt-1">
            © {new Date().getFullYear()} HuddleUp. All rights reserved.
          </p>
          <p className="text-sm mt-1">
            📧 <a href="mailto:singlaanush18@gmail.com" className="underline hover:text-white/80 hover:scale-105 transition-all duration-300">singlaanush18@gmail.com</a>
          </p>
        </div>

        {/* Middle: Links - ORIGINAL + HOVER ONLY */}
        <ul className="flex gap-6 text-sm font-medium">
          <li>
            <a
              href="https://www.linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white/90 hover:scale-105 transition-all duration-300"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/91xxxxxxxxxx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white/90 hover:scale-105 transition-all duration-300"
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="/privacy"
              className="hover:underline hover:text-white/90 hover:scale-105 transition-all duration-300"
            >
              Privacy
            </a>
          </li>
        </ul>

        {/* Right: Social Icons - ORIGINAL + HOVER ONLY */}
        <div className="flex gap-4 text-white text-xl">
          <a href="" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 hover:scale-110 hover:rotate-12 transition-all duration-300">
            <FaInstagram />
          </a>
          <a href="" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 hover:scale-110 hover:rotate-12 transition-all duration-300">
            <FaTwitter />
          </a>
          <a href="" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 hover:scale-110 hover:rotate-12 transition-all duration-300">
            <FaGithub />
          </a>
          <a href="" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 hover:scale-110 hover:rotate-12 transition-all duration-300">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
}
