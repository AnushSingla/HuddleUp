import { useState, useCallback } from "react";
import { API } from "@/api";

export const useVideoUpload = () => {
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const uploadVideo = useCallback(async (formData) => {
    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      setError(null);
      setDuplicateInfo(null);

      const response = await API.post("/video/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      const { video, jobId } = response.data;
      setVideoId(video._id);
      setUploadStatus("processing");
      setUploadProgress(100);

      return { videoId: video._id, jobId };
    } catch (err) {
      const errorData = err.response?.data;
      
      // Handle duplicate detection responses
      if (err.response?.status === 409 && errorData?.duplicateType) {
        setUploadStatus("duplicate_detected");
        setDuplicateInfo({
          type: errorData.duplicateType,
          message: errorData.message,
          originalVideo: errorData.originalVideo,
          potentialDuplicates: errorData.potentialDuplicates,
          canProceed: errorData.canProceed
        });
        setError(errorData.message);
      } else {
        setError(errorData?.message || "Upload failed");
        setUploadStatus("failed");
      }
      
      throw err;
    }
  }, []);

  const proceedWithDuplicate = useCallback(async (formData) => {
    try {
      setUploadStatus("uploading");
      setUploadProgress(0);
      setError(null);
      setDuplicateInfo(null);

      // Add flag to ignore duplicates
      formData.append("ignoreDuplicates", "true");

      const response = await API.post("/video/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      const { video, jobId } = response.data;
      setVideoId(video._id);
      setUploadStatus("processing");
      setUploadProgress(100);

      return { videoId: video._id, jobId };
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
      setUploadStatus("failed");
      throw err;
    }
  }, []);

  const checkProcessingStatus = useCallback(async (id) => {
    try {
      const response = await API.get(`/videos/${id}/status`);
      const { status, progress } = response.data;

      setProcessingProgress(progress);

      if (status === "completed") {
        setUploadStatus("completed");
      } else if (status === "failed") {
        setUploadStatus("failed");
        setError("Video processing failed");
      }

      return response.data;
    } catch (err) {
      console.error("Error checking status:", err);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setProcessingProgress(0);
    setError(null);
    setVideoId(null);
    setDuplicateInfo(null);
  }, []);

  return {
    uploadVideo,
    proceedWithDuplicate,
    checkProcessingStatus,
    reset,
    uploadStatus,
    uploadProgress,
    processingProgress,
    error,
    videoId,
    duplicateInfo,
  };
};
