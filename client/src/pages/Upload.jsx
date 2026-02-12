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
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl bg-gray-800 shadow-2xl rounded-2xl border border-gray-700 p-10">

        {/* HEADER */}
        {/* HEADER */}
<div className="mb-12 text-center group">
  <div className="inline-block relative">
    
    <h1 className="
      text-4xl md:text-5xl font-extrabold 
      bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500
      bg-[length:200%_200%] bg-clip-text text-transparent
      transition-all duration-700
      group-hover:animate-gradient
      group-hover:scale-105
    ">
      Share Your Game Story
    </h1>

    {/* Glow Effect */}
    <div className="
      absolute inset-0 blur-2xl opacity-0 
      group-hover:opacity-40
      transition duration-700
      bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500
    "></div>

  </div>

  <p className="text-gray-400 mt-4 text-lg transition duration-500 group-hover:text-gray-200">
    Upload match analysis, unheard stories, or global sports moments.
  </p>
</div>


        <form onSubmit={handleSubmit} className="space-y-8">

          {/* UPLOAD AREA */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition"
          >
            {previewURL ? (
              <>
                <video
                  src={previewURL}
                  controls
                  className="w-full max-h-64 rounded-lg mb-4"
                />
                <p className="text-sm text-gray-400">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <UploadCloud className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-300 font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="text-gray-500 text-sm">
                  Max file size: {MAX_FILE_SIZE_MB}MB
                </p>
              </>
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
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 border border-red-700 p-3 rounded-lg">
              <AlertTriangle size={16} />
              {fileError}
            </div>
          )}

          {/* UPLOAD PROGRESS */}
          {isUploading && (
            <div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Video Title *
            </label>
            <input
              type="text"
              placeholder="Epic comeback match analysis..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              placeholder:text-gray-500 text-white"
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">
              Select Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["UNHEARD STORIES", "MATCH ANALYSIS", "SPORTS AROUND THE GLOBE"].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-3 rounded-lg border transition text-sm font-medium
                  ${category === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Description
            </label>
            <Textarea
              placeholder="Share highlights or background story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              placeholder:text-gray-500 text-white min-h-[120px]"
            />
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg font-semibold rounded-lg transition transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload & Share"}
          </Button>

        </form>
      </div>
    </div>
  );
};

export default Upload;
