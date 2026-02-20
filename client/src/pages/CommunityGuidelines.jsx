import React from "react";
import PageWrapper from "@/components/ui/PageWrapper";
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

const CommunityGuidelines = () => (
  <PageWrapper>
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
        <div className="grid md:grid-cols-2 gap-8">
          {guidelines.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300"
            >
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-emerald-400 group-hover:text-cyan-400 transition duration-300">
                  {item.icon}
                  <h2 className="text-xl font-bold">
                    {item.title}
                  </h2>
                </div>

                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

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
