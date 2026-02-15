import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Ghost, Home, ArrowLeft } from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  const MotionDiv = motion.div;

  return (
    <PageWrapper>
      <main className="min-h-[80vh] sm:min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10 w-full max-w-2xl text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <MotionDiv
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <Ghost className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-zinc-700 dark:text-zinc-600 fill-zinc-900/50" />
              </MotionDiv>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/20 blur-xl rounded-full" />
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative inline-block">
              <div className="absolute -top-1/4 -left-3/4 md:w-100 md:h-70 w-40 h-20 blur-3xl inset-0 -z-10 bg-gradient-to-r from-sky-400/60 via-blue-400/50 to-indigo-500/20 rounded-full" />
              {/* Added fallback text color for accessibility */}
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 tracking-tighter drop-shadow-sm dark:text-zinc-300">
                404
              </h1>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Page Not Found
            </h2>
            <p className="mt-4 text-zinc-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Oops! It seems you've ventured into the void. The page you're
              looking for has vanished or never existed.
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full"
          >
            <Button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto sm:min-w-[160px] px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-2 group border border-zinc-700/50 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>

            <Button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto sm:min-w-[160px] flex items-center justify-center gap-2 group"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </MotionDiv>
        </div>
      </main>
    </PageWrapper>
  );
}