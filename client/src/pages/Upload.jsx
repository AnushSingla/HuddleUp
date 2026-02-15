import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "@/components/ui/PageWrapper";
import { UploadCloud, X, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { API } from "../api";

const MAX_FILE_SIZE_MB = 100;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_CATEGORIES = ['UNHEARD STORIES', 'MATCH ANALYSIS', 'SPORTS AROUND THE GLOBE'];

// Form validation hook
const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateTitle = (title) => {
    if (!title || title.trim().length === 0) {
      return "Video title is required";
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }
    return null;
  };

  const validateDescription = (description) => {
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
    }
    return null;
  };

  const validateCategory = (category) => {
    if (!category || category.trim().length === 0) {
      return "Please select a category";
    }
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return "Invalid category selected";
    }
    return null;
  };

  const validateVideoFile = (file) => {
    if (!file) {
      return "Video file is required";
    }
    if (!file.type.startsWith("video/")) {
      return "Please select a valid video file";
    }
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return `Unsupported video format. Accepted formats: MP4, WebM, OGG, QuickTime`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File exceeds ${MAX_FILE_SIZE_MB}MB limit`;
    }
    return null;
  };

  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'title':
        error = validateTitle(value);
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'category':
        error = validateCategory(value);
        break;
      case 'videoFile':
        error = validateVideoFile(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error;
  };

  const validateAll = (formData) => {
    const newErrors = {
      title: validateTitle(formData.title),
      description: validateDescription(formData.description),
      category: validateCategory(formData.category),
      videoFile: validateVideoFile(formData.videoFile)
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== null);
  };

  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateField,
    validateAll,
    clearError,
    clearAllErrors,
    validators: {
      validateTitle,
      validateDescription,
      validateCategory,
      validateVideoFile
    }
  };
};

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

  const { errors, validateField, validateAll, clearError, validators } = useFormValidation();

  const isFormValid =
    !validators.validateTitle(title) &&
    !validators.validateCategory(category) &&
    !validators.validateDescription(description) &&
    !validators.validateVideoFile(videoFile);

  const handleFileSelect = (file) => {
    const error = validateField('videoFile', file);

    if (error) {
      setFileError(error);
      setVideoFile(null);
      setPreviewURL(null);
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

    const isValid = validateAll({
      title,
      description,
      category,
      videoFile
    });

    if (!isValid) {
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
    <PageWrapper>
      <div className="min-h-screen py-16 px-6"
        style={{ background: 'var(--bg-primary)' }}>

        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              Share Your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Game Story
              </span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-sub)' }}>
              Upload match analysis, unheard stories, or global sports moments.
            </p>
          </div>

          {/* Upload Form */}
          <div className="max-w-4xl mx-auto">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 md:p-12"
              noValidate
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* Video Upload Area */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
                    Select Video File *
                  </label>
                  {videoFile && !fileError && (
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Ready
                    </span>
                  )}
                </div>

                {!videoFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative cursor-pointer transition-all"
                    style={{
                      border: isDragging ? '2px dashed var(--accent)' : '2px dashed var(--border-medium)',
                      background: isDragging ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-primary)',
                      padding: '3rem 2rem',
                      borderRadius: '12px'
                    }}
                  >
                    <div className="text-center">
                      <div className="mb-4 transition-transform"
                        style={{
                          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                          color: 'var(--turf-green)'
                        }}>
                        <UploadCloud className="w-12 h-12 mx-auto" strokeWidth={1.5} />
                      </div>

                      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                        {isDragging ? "Drop it here" : "Click to select or drag & drop"}
                      </h3>

                      <p className="text-sm mb-4" style={{ color: 'var(--text-sub)' }}>
                        MP4, WebM, MOV (Max {MAX_FILE_SIZE_MB}MB)
                      </p>
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
                  <div className="relative rounded-xl overflow-hidden" style={{
                    background: '#000',
                    aspectRatio: '16/9'
                  }}>
                    <video
                      src={previewURL}
                      className="w-full h-full"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setPreviewURL(null);
                        clearError('videoFile');
                        setFileError("");
                      }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'var(--clay-red)',
                        border: '2px solid var(--clay-red)'
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/*Error banner for large file */}
              {(fileError || errors.videoFile) && (
                <div className="mb-8 px-4 py-4 rounded-lg flex items-center gap-3" style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--clay-red)'
                }}>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="font-semibold text-sm">{fileError || errors.videoFile}</p>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Title and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
                        Video Title *
                      </label>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        validateField('title', e.target.value);
                      }}
                      onBlur={() => validateField('title', title)}
                      required
                      placeholder="Epic match comeback..."
                      className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                      style={{
                        background: 'var(--bg-primary)',
                        border: errors.title ? '1px solid var(--clay-red)' : '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontSize: 'var(--text-base)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.title ? 'var(--clay-red)' : 'var(--accent)'}
                    />
                    <div className="flex justify-between mt-2">
                      {errors.title ? (
                        <p className="text-sm flex items-center gap-2" style={{ color: 'var(--clay-red)' }}>
                          <AlertTriangle className="w-4 h-4" /> {errors.title}
                        </p>
                      ) : <span></span>}
                      <span className={`text-xs ${title.length > MAX_TITLE_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                        {title.length}/{MAX_TITLE_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
                      Select Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        validateField('category', e.target.value);
                      }}
                      onBlur={() => validateField('category', category)}
                      required
                      className="w-full px-4 py-3 rounded-lg outline-none transition-all appearance-none"
                      style={{
                        background: 'var(--bg-primary)',
                        border: errors.category ? '1px solid var(--clay-red)' : '1px solid var(--border-subtle)',
                        color: category ? 'var(--text-main)' : 'var(--text-sub)',
                        fontSize: 'var(--text-base)',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5rem 1.5rem',
                        paddingRight: '2.5rem'
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.category ? 'var(--clay-red)' : 'var(--accent)'}
                    >
                      <option value="">Choose a category...</option>
                      {ALLOWED_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm flex items-center gap-2" style={{ color: 'var(--clay-red)' }}>
                        <AlertTriangle className="w-4 h-4" /> {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-sub)', letterSpacing: '0.1em' }}>
                      Background Story
                    </label>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      validateField('description', e.target.value);
                    }}
                    onBlur={() => validateField('description', description)}
                    placeholder="Tell us more about this moment..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg resize-none outline-none transition-all"
                    style={{
                      background: 'var(--bg-primary)',
                      border: errors.description ? '1px solid var(--clay-red)' : '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      lineHeight: '1.6',
                      fontSize: 'var(--text-base)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = errors.description ? 'var(--clay-red)' : 'var(--accent)'}
                  />
                  <div className="flex justify-between mt-2">
                    {errors.description ? (
                      <p className="text-sm flex items-center gap-2" style={{ color: 'var(--clay-red)' }}>
                        <AlertTriangle className="w-4 h-4" /> {errors.description}
                      </p>
                    ) : <span></span>}
                    <span className={`text-xs ${description.length > MAX_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                      {description.length}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                        Publishing...
                      </span>
                      <span className="text-sm font-mono" style={{ color: 'var(--turf-green)' }}>
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${uploadProgress}%`,
                          background: 'linear-gradient(90deg, var(--turf-green), var(--accent))'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Ready to Publish Message */}
                {isFormValid && !isUploading && (
                  <div className="flex items-center justify-center gap-2 mb-4 text-green-500 font-bold">
                    <CheckCircle className="w-5 h-5" />
                    <span>All good! Ready to publish</span>
                  </div>
                )}

                {/* Publish Button */}
                <motion.button
                  type="submit"
                  disabled={isUploading}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full px-6 py-4 font-bold text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    borderRadius: 'var(--r-md)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                    letterSpacing: '0.05em',
                    opacity: (!isFormValid || isUploading) ? 0.6 : 1,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUploading ? "Publishing..." : "Publish to Arena"}
                </motion.button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Upload;