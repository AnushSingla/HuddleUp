import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileVideo, AlertTriangle, Film, Type, AlignLeft, Tag, CheckCircle2, X } from "lucide-react";
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
    <div className="min-h-screen" style={{ background: 'var(--bg-surface)' }}>
      {/* Creator Studio Header */}
      <div className="border-b sticky top-16 z-10" style={{ 
        background: 'var(--bg-overlay)', 
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border-subtle)'
      }}>
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                <Film className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                Creator Studio
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-sub)' }}>
                Upload and share your sports content with the world
              </p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="px-4 py-2 rounded-lg flex items-center gap-2"
              style={{
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-sub)'
              }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout - YouTube Studio Style */}
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left Column - Upload Zone & Preview */}
            <div className="space-y-6">
              {/* Upload Area with Drag State */}
              <div 
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--elev-2)'
                }}
              >
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h2 className="font-bold flex items-center gap-2" style={{ 
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-lg)'
                  }}>
                    <UploadCloud className="w-5 h-5" />
                    Video Upload
                  </h2>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-12 cursor-pointer transition-all"
                  style={{
                    borderRadius: 'var(--r-lg)',
                    background: isDragging ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                    border: isDragging ? '2px dashed var(--accent)' : '2px dashed transparent'
                  }}
                >
                  {previewURL ? (
                    <div className="space-y-4">
                      {/* Video Preview */}
                      <div className="relative rounded-lg overflow-hidden" style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <video
                          src={previewURL}
                          controls
                          className="w-full max-h-[400px]"
                          style={{ display: 'block' }}
                        />
                      </div>

                      {/* File Info */}
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                            background: 'var(--accent)'
                          }}>
                            <FileVideo className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>
                              {videoFile?.name}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
                              {(videoFile?.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoFile(null);
                            setPreviewURL(null);
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/10"
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-center text-sm" style={{ color: 'var(--text-sub)' }}>
                        Click to replace video
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{
                        background: isDragging ? 'var(--accent)' : 'var(--bg-surface)',
                        border: '2px dashed var(--border-medium)',
                        transition: 'all var(--transition-base)'
                      }}>
                        <UploadCloud className="w-12 h-12" style={{ 
                          color: isDragging ? 'white' : 'var(--text-muted)' 
                        }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                        {isDragging ? 'Drop video here' : 'Upload your video'}
                      </h3>
                      <p className="mb-4" style={{ color: 'var(--text-sub)' }}>
                        Drag and drop or click to browse
                      </p>
                      <div className="inline-block px-4 py-2 rounded-lg text-sm" style={{
                        background: 'var(--bg-surface)',
                        color: 'var(--text-sub)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        Max file size: {MAX_FILE_SIZE_MB}MB
                      </div>
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

                {/* File Error */}
                {fileError && (
                  <div className="mx-6 mb-6 flex items-center gap-3 p-4 rounded-lg" style={{
                    background: 'rgba(255, 61, 0, 0.1)',
                    border: '1px solid var(--accent-danger)',
                    color: 'var(--accent-danger)'
                  }}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{fileError}</span>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mx-6 mb-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-main)' }}>Uploading your video...</span>
                      <span className="font-semibold" style={{ color: 'var(--accent)' }}>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${uploadProgress}%`,
                          background: 'var(--accent)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Metadata Sidebar */}
            <div className="space-y-6">
              {/* Details Panel */}
              <div 
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--elev-2)'
                }}
              >
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h2 className="font-bold flex items-center gap-2" style={{ 
                    color: 'var(--text-main)',
                    fontSize: 'var(--text-lg)'
                  }}>
                    <Tag className="w-5 h-5" />
                    Video Details
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
                      <Type className="w-4 h-4" />
                      Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Epic comeback match analysis..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontSize: 'var(--text-base)',
                        outline: 'none',
                        transition: 'all var(--transition-base)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                      required
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {title.length}/100 characters
                    </p>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
                      <Tag className="w-4 h-4" />
                      Category *
                    </label>
                    <div className="space-y-2">
                      {["UNHEARD STORIES", "MATCH ANALYSIS", "SPORTS AROUND THE GLOBE"].map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between"
                          style={{
                            background: category === cat ? 'var(--accent)' : 'var(--bg-surface)',
                            color: category === cat ? 'white' : 'var(--text-main)',
                            border: '1px solid ' + (category === cat ? 'var(--accent)' : 'var(--border-subtle)'),
                            fontWeight: category === cat ? 'var(--fw-semibold)' : 'var(--fw-regular)'
                          }}
                        >
                          <span>{cat}</span>
                          {category === cat && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
                      <AlignLeft className="w-4 h-4" />
                      Description
                    </label>
                    <Textarea
                      placeholder="Share highlights, background story, or key moments from your video..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg min-h-[140px] resize-none"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontSize: 'var(--text-base)',
                        outline: 'none',
                        transition: 'all var(--transition-base)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    />
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {description.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Publish Button - Sticky */}
              <div className="sticky top-32">
                <Button
                  type="submit"
                  disabled={isUploading || !videoFile || !title || !category}
                  className="w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    opacity: (isUploading || !videoFile || !title || !category) ? 0.5 : 1,
                    cursor: (isUploading || !videoFile || !title || !category) ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6" />
                      Publish Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
