import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileVideo, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { API } from "../api";

const MAX_FILE_SIZE_MB = 100;

const Upload = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("video/")) {
      setFileError("Please select a valid video file.");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);

    if (sizeMB > MAX_FILE_SIZE_MB) {
      setFileError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setFileError("");
    setVideoFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile || !title || !category) {
      toast.error("Please complete all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("video", videoFile);

    try {
      setIsUploading(true);

      await API.post("/video/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      toast.success("Video Uploaded Successfully 🚀");
      navigate("/explore");
    } catch (err) {
      console.error("Upload error:", err);
      const errMsg = err.response?.data?.message || err.message || "Upload failed";
      toast.error(`Upload failed: ${errMsg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-500 py-24 px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Share Your <span className="bg-gradient-to-r from-emerald-500 to-indigo-600 bg-clip-text text-transparent">Game Story</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Upload match analysis, unheard stories, or global sports moments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-indigo-500/5 space-y-10">

          {/* UPLOAD AREA */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-[24px] p-12 text-center cursor-pointer transition-all duration-300
            ${videoFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
              }`}
          >
            {previewURL ? (
              <div className="relative">
                <video
                  src={previewURL}
                  controls
                  className="w-full max-h-[300px] rounded-2xl shadow-2xl mx-auto"
                />
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  <FileVideo className="w-4 h-4" />
                  <span>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB Selected</span>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select Video File</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                  Drag & drop your sports video here or click to browse (Max {MAX_FILE_SIZE_MB}MB)
                </p>
              </div>
            )}

            <input
              type="file"
              accept="video/*"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* FILE ERROR */}
          {fileError && (
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{fileError}</span>
            </div>
          )}

          {/* UPLOAD PROGRESS */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                <span>Uploading to Arena...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TITLE */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-wider">
                Video Title *
              </label>
              <input
                type="text"
                placeholder="Epic match comeback..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
                bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400
                focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50
                transition-all duration-300 shadow-sm"
                required
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-wider">
                Select Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
                bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white
                focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50
                transition-all duration-300 shadow-sm appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Choose a category...</option>
                <option value="UNHEARD STORIES">UNHEARD STORIES</option>
                <option value="MATCH ANALYSIS">MATCH ANALYSIS</option>
                <option value="SPORTS AROUND THE GLOBE">SPORTS AROUND THE GLOBE</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-wider">
              Background Story
            </label>
            <Textarea
              placeholder="Tell us more about this moment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 
              bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400
              focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50
              transition-all duration-300 shadow-sm min-h-[120px]"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={isUploading}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-extrabold text-sm uppercase tracking-widest transition-all duration-300 border-none shadow-xl shadow-blue-600/20 disabled:opacity-50"
          >
            {isUploading ? "TRANSMITTING DATA..." : "PUBLISH TO ARENA"}
          </Button>

        </form>
      </div>
    </div>
  );
};

export default Upload;
