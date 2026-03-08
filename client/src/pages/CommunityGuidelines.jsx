import React from "react";
import PageWrapper from "@/components/ui/PageWrapper";
import PageMeta from "@/components/PageMeta";
import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, AlertTriangle, FileText, Lock, Flag, UserCheck, HeartHandshake } from "lucide-react";

const guidelines = [
  {
    title: "Respect & Sportsmanship",
    icon: <HeartHandshake size={26} />,
    description:
      "Treat all members with respect. Healthy rivalries are encouraged, but personal attacks, hate speech, or harassment are strictly prohibited. Celebrate diversity and foster a welcoming environment for all sports enthusiasts.",
  },
  {
    title: "Content Sharing",
    icon: <MessageCircle size={26} />,
    description:
      "Share relevant and constructive content. Avoid spam, self-promotion, or off-topic posts. Ensure that videos, posts, and comments contribute positively to the community experience.",
  },
  {
    title: "No Toxicity",
    icon: <AlertTriangle size={26} />,
    description:
      "Toxic behavior, including trolling, bullying, or inciting arguments, will not be tolerated. Keep discussions friendly and focused on sports and community engagement.",
  },
  {
    title: "Intellectual Property",
    icon: <FileText size={26} />,
    description:
      "Only share content you own or have permission to use. Respect copyrights, trademarks, and intellectual property rights of others. Report any violations to the admin team.",
  },
  {
    title: "Privacy & Safety",
    icon: <Lock size={26} />,
    description:
      "Do not share personal information (yours or others) publicly. Protect your privacy and respect the privacy of fellow members. Report suspicious activity or safety concerns immediately.",
  },
  {
    title: "Reporting & Moderation",
    icon: <Flag size={26} />,
    description:
      "If you encounter inappropriate content or behavior, use the platform's reporting tools. Our moderation team will review reports and take appropriate action to maintain a safe environment.",
  },
  {
    title: "Account Responsibility",
    icon: <UserCheck size={26} />,
    description:
      "You are responsible for your account activity. Do not share your login credentials. Multiple accounts or impersonation are not allowed.",
  },
  {
    title: "Enjoy & Engage",
    icon: <ShieldCheck size={26} />,
    description:
      "Participate actively, share your passion for sports, and help build a vibrant, supportive community. Enjoy the platform and make meaningful connections!",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -12,
    scale: 1.03,
    boxShadow: "0 25px 50px -12px rgba(6, 78, 59, 0.4)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

const titleVariants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
};

const glowVariants = {
  hover: {
    opacity: 1,
    scale: 1.05,
    background: "radial-gradient(circle at 30% 30%, #10b98140 0%, transparent 50%), radial-gradient(circle at 70% 70%, #06b6d440 0%, transparent 50%)",
    transition: {
      duration: 0.3,
    },
  },
};

const CommunityGuidelines = () => (
  <PageWrapper>
    <PageMeta title="Community Guidelines" description="HuddleUp community guidelines. Respect, sportsmanship, and safe space for all." />
    <div className="min-h-screen px-6 md:px-12 py-20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold text-center mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          Community Guidelines
        </motion.h1>

        <p className="text-lg text-zinc-400 mb-14 text-center max-w-2xl mx-auto">
          Our mission is to create a safe, fun, and engaging space for sports fans. 
          Please follow these guidelines to keep HuddleUp welcoming for everyone.
        </p>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-8"
        >
          {guidelines.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl overflow-hidden"
              whileHover="hover"
            >
              {/* Enhanced Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-transparent to-cyan-400/20"
                variants={glowVariants}
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div 
                  className="flex items-center gap-4 mb-6"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  <motion.div
                    className="p-2 bg-emerald-400/10 rounded-xl backdrop-blur-sm border border-emerald-400/20 group-hover:bg-cyan-400/10 group-hover:border-cyan-400/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    {React.cloneElement(item.icon, { 
                      className: "group-hover:text-cyan-400 text-emerald-400 transition-colors duration-300 drop-shadow-lg" 
                    })}
                  </motion.div>
                  <motion.h2 
                    className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent"
                    variants={titleVariants}
                  >
                    {item.title}
                  </motion.h2>
                </motion.div>

                <p className="text-zinc-300 leading-relaxed text-base tracking-wide">
                  {item.description}
                </p>
              </div>

              {/* Subtle shimmer on hover */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: -100 }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-500">
          For questions or concerns, contact us at{" "}
          <a
            href="mailto:singlaanush18@gmail.com"
            className="text-emerald-400 hover:text-cyan-400 underline transition"
          >
            singlaanush18@gmail.com
          </a>
        </div>
      </div>
    </div>
  </PageWrapper>
);

export default CommunityGuidelines;
