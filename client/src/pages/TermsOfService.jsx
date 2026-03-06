import React from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import {
  FileText,
  UserCheck,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Ban,
  Gavel,
  Globe,
  Mail,
  Clock,
} from "lucide-react";

const EFFECTIVE_DATE = "February 17, 2026";

const sections = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    color: "var(--accent)",
    content: [
      "By accessing or using HuddleUp, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
      'If you do not agree with any part of these terms, you must **not** use the platform.',
      "We may update these terms from time to time. Continued use of HuddleUp after changes constitutes acceptance of the revised terms.",
      "It is your responsibility to review this page periodically for updates.",
    ],
  },
  {
    icon: UserCheck,
    title: "User Responsibilities & Acceptable Use",
    color: "var(--turf-green)",
    content: [
      "You agree to use HuddleUp only for lawful purposes and in accordance with these Terms.",
      "You must **not** upload, post, or share content that is illegal, hateful, harassing, threatening, defamatory, or sexually explicit.",
      "You must **not** impersonate other users, celebrities, or organizations.",
      "You must **not** spam, flood, or engage in any activity that disrupts the experience of other users.",
      "You are responsible for all activity that occurs under your account.",
      "You agree to treat other users with respect — rivalries are fun, toxicity is not.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Account Rules",
    color: "var(--sun-yellow)",
    content: [
      "You must provide a valid **email address** and a unique **username** when registering.",
      "You are responsible for maintaining the confidentiality of your password. Never share your login credentials.",
      'You must be at least **13 years old** to create an account on HuddleUp.',
      "One person may not maintain more than one active account.",
      "We reserve the right to suspend or terminate accounts that violate these terms without prior notice.",
    ],
  },
  {
    icon: Scale,
    title: "Intellectual Property Rights",
    color: "var(--clay-red)",
    content: [
      "All content you upload to HuddleUp (videos, posts, comments) remains **your intellectual property**.",
      "By posting content, you grant HuddleUp a non-exclusive, royalty-free license to display, distribute, and store your content on the platform.",
      "You must **not** upload content that infringes on the copyrights, trademarks, or intellectual property rights of others.",
      'The HuddleUp name, logo, and branding are the property of the project maintainers and may not be used without permission.',
      "If you believe your intellectual property has been infringed, please contact us immediately.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    color: "var(--accent)",
    content: [
      'HuddleUp is provided on an **"as is"** and **"as available"** basis without warranties of any kind, express or implied.',
      "We do **not** guarantee that the platform will be uninterrupted, error-free, or free of harmful components.",
      "HuddleUp and its maintainers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.",
      "We are not responsible for any content posted by users. Views expressed by users do not represent HuddleUp.",
      "Your use of the platform is at your own risk.",
    ],
  },
  {
    icon: Ban,
    title: "Termination Conditions",
    color: "var(--clay-red)",
    content: [
      "We may suspend or permanently terminate your account if you violate these Terms of Service.",
      "Grounds for termination include but are not limited to: posting prohibited content, harassment, spamming, impersonation, or any illegal activity.",
      "Upon termination, your right to access HuddleUp ceases immediately.",
      "We may, at our discretion, remove any content associated with a terminated account.",
      "You may request account deletion at any time by contacting us — we will remove your data from our systems.",
    ],
  },
  {
    icon: Globe,
    title: "Governing Law",
    color: "var(--turf-green)",
    content: [
      "These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.",
      "Any disputes arising from these Terms or your use of HuddleUp shall be resolved through good-faith negotiation first.",
      "If a dispute cannot be resolved informally, it shall be submitted to the competent courts of the jurisdiction where the project maintainer resides.",
      "If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full effect.",
    ],
  },
  {
    icon: Mail,
    title: "Contact Information",
    color: "var(--sun-yellow)",
    content: [
      "If you have any questions or concerns about these Terms of Service, please reach out to us:",
      "**Email:** singlaanush18@gmail.com",
      "**GitHub:** github.com/AnushSingla/HuddleUp (open an issue)",
      "We aim to respond to all inquiries within 7 business days.",
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

const TermsOfService = () => {
  return (
    <PageWrapper>
      <PageMeta title="Terms of Service" description="Terms of use for HuddleUp. By using the platform you agree to these terms." />
      <div
        className="min-h-screen"
        style={{ background: "var(--bg-primary)" }}
      >
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
                  <Gavel
                    className="w-7 h-7"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #06b6d4, #3b82f6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Terms of Service
                  </span>
                </h1>
              </div>
              <p
                className="text-xl md:text-2xl max-w-3xl"
                style={{ color: "var(--text-sub)", lineHeight: "1.6" }}
              >
                The rules of the game. Please read these terms carefully before
                using HuddleUp — they define what you can expect from us and
                what we expect from you.
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
                In Short
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "🤝",
                    text: "By using HuddleUp, you agree to these terms. Be respectful, play fair, and keep it fun for everyone.",
                  },
                  {
                    icon: "📝",
                    text: "Your content is yours. We just need permission to display it on the platform for other fans to enjoy.",
                  },
                  {
                    icon: "⚖️",
                    text: 'We provide HuddleUp "as is." We\'re not liable for user content, and we reserve the right to remove accounts that break the rules.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--text-sub)",
                        lineHeight: "1.7",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Terms Sections */}
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
                Fair play on the field.
              </p>
              <p
                className="text-3xl md:text-5xl font-black leading-tight mt-2"
                style={{
                  background:
                    "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Fair play on the platform.
              </p>
              <p
                className="text-base mt-6"
                style={{ color: "var(--text-muted)" }}
              >
                Questions? Reach out at{" "}
                <a
                  href="mailto:singlaanush18@gmail.com"
                  style={{
                    color: "var(--accent)",
                    textDecoration: "underline",
                  }}
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

export default TermsOfService;
