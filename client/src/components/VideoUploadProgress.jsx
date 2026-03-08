import React from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const VideoUploadProgress = ({ status, progress, error }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "uploading":
        return {
          icon: Loader2,
          color: "var(--accent)",
          text: "Uploading video...",
          animate: true,
        };
      case "processing":
        return {
          icon: Loader2,
          color: "var(--turf-green)",
          text: "Processing video...",
          animate: true,
        };
      case "completed":
        return {
          icon: CheckCircle,
          color: "var(--turf-green)",
          text: "Video ready!",
          animate: false,
        };
      case "failed":
        return {
          icon: AlertCircle,
          color: "var(--clay-red)",
          text: error || "Processing failed",
          animate: false,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Icon
          className={`w-6 h-6 ${config.animate ? "animate-spin" : ""}`}
          style={{ color: config.color }}
        />
        <div className="flex-1">
          <p className="font-medium" style={{ color: "var(--text-main)" }}>
            {config.text}
          </p>
          {status !== "failed" && (
            <p className="text-sm mt-1" style={{ color: "var(--text-sub)" }}>
              {progress}% complete
            </p>
          )}
        </div>
      </div>

      {status !== "failed" && (
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--bg-primary)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${config.color}, var(--accent))`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default VideoUploadProgress;
