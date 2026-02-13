import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X, Play } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8" 
      style={{ background: 'var(--bg-primary)' }}>
      
      <div className="w-full max-w-2xl">
        
        {/* Floating Upload Zone - Minimal Idle State */}
        {!videoFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer group"
            style={{
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--r-lg)',
              transition: 'all var(--transition-base)'
            }}
          >
            {/* Dashed border appears only on hover/drag */}
            <div 
              className="absolute inset-0 rounded-lg transition-opacity"
              style={{
                opacity: isDragging ? 1 : 0,
                border: '2px dashed var(--accent)',
                background: 'rgba(0, 229, 255, 0.05)'
              }}
            />
            <div 
              className="absolute inset-0 rounded-lg transition-opacity"
              style={{
                opacity: !isDragging ? 0 : 0,
                border: '2px dashed var(--border-subtle)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            />

            {/* Content - Idle State */}
            <div className="relative text-center z-10">
              <div className="mb-6 transition-transform group-hover:scale-110"
                style={{ transition: 'all var(--transition-base)' }}>
                <UploadCloud className="w-16 h-16 mx-auto" 
                  style={{ color: 'var(--accent)', opacity: isDragging ? 1 : 0.6 }} />
              </div>
              
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>
                {isDragging ? "Drop it here" : "Drop a highlight here"}
              </h2>
              
              <p className="text-sm mb-6" style={{ color: 'var(--text-sub)' }}>
                or tap to upload
              </p>

              <div className="text-xs" style={{ color: 'var(--text-sub)', opacity: 0.6 }}>
                Max {MAX_FILE_SIZE_MB}MB · MP4, WebM, MOV
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              className="hidden"
            />
          </div>
        ) : (
          /* Video Selected - Metadata Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Video Preview */}
            <div className="relative rounded-lg overflow-hidden" style={{
              background: 'var(--bg-secondary)',
              aspectRatio: '16/9'
            }}>
              <video
                src={previewURL}
                className="w-full h-full object-cover"
                controls
              />
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setPreviewURL(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover-lift"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'var(--ice-white)'
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata - Clean Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Name this moment"
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid transparent',
                    color: 'var(--text-main)',
                    transition: 'all var(--transition-base)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid transparent',
                    color: 'var(--text-main)',
                    transition: 'all var(--transition-base)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                >
                  <option value="">Select category</option>
                  <option value="UNHEARD STORIES">Unheard Stories</option>
                  <option value="MATCH ANALYSIS">Match Analysis</option>
                  <option value="SPORTS AROUND THE GLOBE">Sports Around The Globe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add context..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg resize-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid transparent',
                    color: 'var(--text-main)',
                    lineHeight: 'var(--lh-relaxed)',
                    transition: 'all var(--transition-base)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                />
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                  <div 
                    className="h-full transition-all"
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'var(--turf-green)'
                    }}
                  />
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-sub)' }}>
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 hover-lift disabled:opacity-50"
                style={{
                  background: 'var(--turf-green)',
                  color: 'var(--bg-primary)',
                  borderRadius: 'var(--r-md)'
                }}
              >
                <UploadCloud className="w-5 h-5" />
                {isUploading ? "Uploading..." : "Upload Moment"}
              </button>
              
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="px-6 py-4 font-semibold hover-lift"
                style={{
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {fileError && (
          <p className="text-sm mt-4 text-center" style={{ color: 'var(--clay-red)' }}>
            {fileError}
          </p>
        )}
      </div>
    </div>
  );
};

export default Upload;
