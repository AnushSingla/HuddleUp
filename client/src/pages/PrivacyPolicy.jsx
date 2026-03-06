import React from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import { Shield, Database, Share2, Mail, Clock, Eye, Lock, UserCheck } from "lucide-react";

const EFFECTIVE_DATE = "February 17, 2026";

const sections = [
  {
    icon: Database,
    title: "What Data We Collect",
    color: "var(--accent)",
    content: [
      "When you sign up, we collect your **username**, **email address**, and a **hashed password** (we never store your password in plain text).",
      "Your **profile bio** and **friend connections** are stored to power social features.",
      "When you upload videos or create posts, the associated content and metadata (titles, descriptions, timestamps) are stored.",
      "Comments you leave on videos and posts are stored alongside your username.",
      "We do **not** use cookies for tracking or advertising. Session data is handled via secure authentication tokens stored in your browser's local storage.",
    ],
  },
  {
    icon: Eye,
    title: "How We Use Your Data",
    color: "var(--turf-green)",
    content: [
      "**Account & Authentication** — Your email and password are used solely to log you in and secure your account.",
      "**Social Features** — Your username, bio, and friend list power the community experience: profiles, friend requests, and discussions.",
      "**Content Delivery** — Your posts, videos, and comments are displayed to other users on the platform.",
      "**Notifications** — We use your account data to send you in-app notifications about friend requests, comments, and interactions.",
      "We do **not** use your data for targeted advertising, profiling, or algorithmic content recommendations.",
    ],
  },
  {
    icon: Lock,
    title: "How We Store & Protect Your Data",
    color: "var(--sun-yellow)",
    content: [
      "All data is stored in a secure MongoDB database with access restricted to authorized services only.",
      "Passwords are hashed using industry-standard **bcrypt** before storage — we can never see your actual password.",
      "Authentication tokens (JWT) are used for session management and expire automatically.",
      "We use HTTPS for all data transmission between your browser and our servers.",
      "Video and media files are stored securely via Cloudinary with access-controlled URLs.",
    ],
  },
  {
    icon: Share2,
    title: "Third-Party Sharing",
    color: "var(--clay-red)",
    content: [
      "We do **not** sell, rent, or trade your personal information to any third party.",
      "We use **Cloudinary** for media hosting — uploaded videos and images are stored on their servers under our account.",
      "No analytics or tracking services (such as Google Analytics) are currently integrated.",
      "We may share data only if required by law or to protect the safety of our users and platform.",
    ],
  },
  {
    icon: UserCheck,
    title: "Your Rights & Choices",
    color: "var(--accent)",
    content: [
      "You can **edit your profile** information (username, bio) at any time from your profile page.",
      "You can **delete your posts, videos, and comments** at any time.",
      "You can **remove friends** and manage your friend requests freely.",
      "If you wish to delete your account entirely, please contact us and we will remove all your data from our systems.",
      "You have the right to request a copy of all personal data we hold about you.",
    ],
  },
  {
    icon: Mail,
    title: "Contact Us About Privacy",
    color: "var(--turf-green)",
    content: [
      "If you have questions, concerns, or requests regarding your privacy or this policy, reach out to us:",
      "**Email:** singlaanush18@gmail.com",
      "**GitHub:** github.com/AnushSingla/HuddleUp (open an issue)",
      "We aim to respond to all privacy-related inquiries within 7 business days.",
    ],
  },
];

function renderMarkdownBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text-main)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

const PrivacyPolicy = () => {
  return (
    <PageWrapper>
      <PageMeta title="Privacy Policy" description="How HuddleUp collects, uses, and protects your data. Read our privacy policy." />
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* Hero Section */}
        <section className="px-6 md:px-12 pt-20 pb-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(0, 229, 255, 0.1)",
                    border: "1px solid var(--border-medium)",
                  }}
                >
                  <Shield
                    className="w-7 h-7"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  <span
                    style={{
                      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Privacy Policy
                  </span>
                </h1>
              </div>
              <p
                className="text-xl md:text-2xl max-w-3xl"
                style={{ color: "var(--text-sub)", lineHeight: "1.6" }}
              >
                Your privacy matters to us. Here's exactly what we collect, why
                we collect it, and how we keep it safe — in plain language.
              </p>
              <div
                className="flex items-center gap-2 mt-6 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock className="w-4 h-4" />
                <span>Effective Date: {EFFECTIVE_DATE}</span>
                <span className="mx-2">•</span>
                <span>Last Updated: {EFFECTIVE_DATE}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Summary Banner */}
        <section className="px-6 md:px-12 py-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-6 md:p-8"
              style={{
                background: "var(--surface-info-bg)",
                border: "var(--surface-info-border)",
                borderRadius: "var(--surface-info-radius)",
                boxShadow: "var(--surface-info-shadow)",
              }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-widest mb-4"
                style={{
                  color: "var(--accent)",
                  letterSpacing: "0.2em",
                }}
              >
                TL;DR
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "🔒",
                    text: "We only collect what's needed to run HuddleUp — username, email, and your content.",
                  },
                  {
                    icon: "🚫",
                    text: "We never sell your data, run ads, or track you with cookies or analytics.",
                  },
                  {
                    icon: "✅",
                    text: "You can edit or delete your data anytime. Want your account gone? Just ask.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-sub)", lineHeight: "1.7" }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="px-6 md:px-12 py-10">
          <div className="max-w-5xl mx-auto space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="p-6 md:p-8"
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    borderLeft: `4px solid ${section.color}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: section.color }}
                      strokeWidth={1.5}
                    />
                    <h2
                      className="text-xl md:text-2xl font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-base"
                        style={{
                          color: "var(--text-sub)",
                          lineHeight: "1.7",
                        }}
                      >
                        <span
                          className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: section.color }}
                        />
                        <span>{renderMarkdownBold(item)}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Closing Section */}
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <p
                className="text-3xl md:text-5xl font-black leading-tight"
                style={{ color: "var(--text-main)" }}
              >
                Your data, your rules.
              </p>
              <p
                className="text-3xl md:text-5xl font-black leading-tight mt-2"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                We just keep the game fair.
              </p>
              <p
                className="text-base mt-6"
                style={{ color: "var(--text-muted)" }}
              >
                Questions? Reach out at{" "}
                <a
                  href="mailto:singlaanush18@gmail.com"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  singlaanush18@gmail.com
                </a>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default PrivacyPolicy;
