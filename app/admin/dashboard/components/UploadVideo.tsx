// app/admin/dashboard/upload/video/page.tsx
"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Upload,
  X,
  Check,
  Video as VideoIcon,
  Play,
  Clock,
  HardDrive,
  Monitor,
  FileVideo,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Trash2,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Plus,
  Calendar,
} from "lucide-react";

interface UploadedVideo {
  url: string;
  publicId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface VideoRecord {
  id: string;
  url: string;
  publicId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  bytes: number;
}

declare global {
  interface Window {
    cloudinary?: any;
  }
}

type ViewMode = "list" | "upload";

export default function VideoUploadPage() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null,
  );
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Video list states
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate thumbnail URL from Cloudinary video URL
  const getVideoThumbnail = (videoUrl: string) => {
    try {
      // Convert video URL to thumbnail
      // Changes: /video/upload/... to /video/upload/so_0,w_400,h_300,c_fill/...
      // And changes extension to .jpg
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split("/");

      const uploadIndex = pathParts.findIndex((part) => part === "upload");
      if (uploadIndex === -1) return videoUrl;

      // Insert transformation after 'upload'
      pathParts.splice(uploadIndex + 1, 0, "so_0,w_400,h_300,c_fill,f_jpg");

      // Change extension to jpg
      const lastPart = pathParts[pathParts.length - 1];
      const extensionIndex = lastPart.lastIndexOf(".");
      if (extensionIndex !== -1) {
        pathParts[pathParts.length - 1] =
          lastPart.substring(0, extensionIndex) + ".jpg";
      }

      url.pathname = pathParts.join("/");
      return url.toString();
    } catch {
      return videoUrl;
    }
  };

  // Sort videos by most recent first
  const sortedVideos = useMemo(() => {
    return [...videos].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [videos]);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    }

    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    }

    const years = Math.floor(diffInDays / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  };

  // Format full date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Load Cloudinary SDK on mount
  useEffect(() => {
    if (window.cloudinary) {
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://upload-widget.cloudinary.com/latest/CloudinaryUploadWidget.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log("Cloudinary widget loaded");
    };
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/upload/videos");
      const data = await response.json();

      if (response.ok) {
        setVideos(data.videos);
      } else {
        setError(data.error || "Failed to fetch videos");
      }
    } catch (err) {
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Reset upload state when switching to upload view
  const handleSwitchToUpload = () => {
    setSelectedFile(null);
    setUploadedVideo(null);
    setError("");
    setUploadProgress(0);
    setViewMode("upload");
  };

  // Switch back to list view
  const handleSwitchToList = () => {
    setSelectedFile(null);
    setUploadedVideo(null);
    setError("");
    setUploadProgress(0);
    setViewMode("list");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      validateAndSetFile(file);
    } else {
      setError("Please drop a valid video file");
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be less than 100MB");
      return;
    }
    setSelectedFile(file);
    setError("");
    setUploadedVideo(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
      );
      formData.append("folder", "earthdesign");
      formData.append("resource_type", "video");

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);

            const videoData: UploadedVideo = {
              url: result.secure_url,
              publicId: result.public_id,
              duration: result.duration || 0,
              width: result.width || 0,
              height: result.height || 0,
              format: result.format || "",
              bytes: result.bytes || 0,
            };

            setUploadProgress(100);
            setTimeout(() => {
              setUploadedVideo(videoData);
              setSelectedFile(null);
              fetchVideos();
            }, 500);

            resolve();
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            reject(error);
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        );
        xhr.send(formData);
      });

      await uploadPromise;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      setDeleting(publicId);
      const response = await fetch(
        `/api/upload/videos?publicId=${encodeURIComponent(publicId)}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        setVideos(videos.filter((v) => v.publicId !== publicId));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete video");
      }
    } catch (err) {
      setError("Failed to delete video");
    } finally {
      setDeleting(null);
    }
  };

  // Handle video play
  const handlePlayVideo = (videoId: string) => {
    // Pause any currently playing video
    if (playingVideoId && playingVideoId !== videoId) {
      const prevVideo = videoRefs.current[playingVideoId];
      if (prevVideo) {
        prevVideo.pause();
        prevVideo.currentTime = 0;
      }
    }
    setPlayingVideoId(videoId);
  };

  // Handle video close/stop
  const handleStopVideo = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setPlayingVideoId(null);
  };

  // Handle video ended
  const handleVideoEnded = (videoId: string) => {
    setPlayingVideoId(null);
  };

  const copyVideoLink = async (url: string, videoId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedVideoId(videoId);
      setTimeout(() => setCopiedVideoId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-0 mb-20 p-4">
      {/* Videos List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in fade-in duration-300">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <VideoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Video Library
                  </h2>
                  <p className="text-sm text-gray-600">
                    {videos.length} video{videos.length !== 1 ? "s" : ""}{" "}
                    uploaded
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchVideos}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={handleSwitchToUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Upload Video
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
                  <p className="text-gray-500">Loading videos...</p>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No videos yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload your first video to get started
                </p>
                <button
                  onClick={handleSwitchToUpload}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Upload className="w-5 h-5" />
                  Upload Your First Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="relative group bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Most Recent Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        Latest
                      </div>
                    )}

                    {/* Thumbnail / Video Preview */}
                    <div className="relative h-32 bg-gray-900 flex items-center justify-center overflow-hidden">
                      {playingVideoId === video.id ? (
                        <>
                          {/* Video Player */}
                          <video
                            ref={(el) => {
                              videoRefs.current[video.id] = el;
                            }}
                            src={video.url}
                            className="w-full h-full object-cover"
                            autoPlay
                            controls
                            onEnded={() => handleVideoEnded(video.id)}
                            onError={() => handleStopVideo(video.id)}
                          />
                          {/* Close button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStopVideo(video.id);
                            }}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Thumbnail Image */}
                          <img
                            src={getVideoThumbnail(video.url)}
                            alt={`${video.format.toUpperCase()} video thumbnail`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          {/* Fallback icon */}
                          <VideoIcon className="absolute w-10 h-10 text-gray-600" />
                          {/* Play overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayVideo(video.id);
                            }}
                            className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer group/play"
                          >
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-white/30 transition-all duration-300">
                              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                            </div>
                          </button>
                          {/* Duration badge */}
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-medium pointer-events-none">
                            {formatDuration(video.duration)}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {video.format.toUpperCase()} Video
                          </p>
                          {/* Relative time with tooltip for full date */}
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <p
                              className="text-xs text-gray-500 cursor-help"
                              title={formatDateTime(video.createdAt)}
                            >
                              {formatRelativeTime(video.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">
                            {video.width}×{video.height}
                          </p>
                          <p className="text-gray-500">Resolution</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatFileSize(video.bytes)}
                          </p>
                          <p className="text-gray-500">Size</p>
                        </div>
                      </div>
                      {/* Full Date/Time */}?{/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => copyVideoLink(video.url, video.id)}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            copiedVideoId === video.id
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                          }`}
                          title="Copy URL"
                        >
                          {copiedVideoId === video.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteVideo(video.publicId)}
                          disabled={deleting === video.publicId}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === video.publicId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload View */}
      {viewMode === "upload" && (
        <div className="animate-in slide-in-from-right duration-300">
          {/* Back Button */}
          <button
            onClick={handleSwitchToList}
            className="flex items-center gap-2 mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Videos
          </button>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upload Video
                  </h2>
                  <p className="text-sm text-gray-600">
                    Add a new video to your library
                  </p>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  dragActive ? "scale-[1.02]" : "hover:scale-[1.01]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className={`flex flex-col items-center justify-center w-full min-h-[280px] border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-gradient-to-b from-gray-50 to-white hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div
                      className={`absolute inset-0 opacity-[0.03] transition-opacity duration-300 ${
                        dragActive ? "opacity-[0.08]" : ""
                      }`}
                    >
                      <div className="absolute top-4 left-4 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
                      <div className="absolute bottom-4 right-4 w-40 h-40 bg-pink-500 rounded-full blur-3xl" />
                    </div>
                  </div>

                  <div className="relative flex flex-col items-center justify-center p-8">
                    <div
                      className={`relative mb-6 transition-transform duration-300 ${
                        dragActive
                          ? "scale-110 -translate-y-2"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40" />
                      <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-5 rounded-2xl shadow-lg">
                        <Upload
                          className={`w-10 h-10 text-white transition-transform duration-300 ${
                            dragActive ? "animate-bounce" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xl font-semibold text-gray-800 mb-2">
                        {dragActive
                          ? "Drop your video here"
                          : "Drag & drop your video"}
                      </p>
                      <p className="text-gray-500 mb-4">
                        or{" "}
                        <span className="text-purple-600 font-medium hover:text-purple-700">
                          browse files
                        </span>
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                          <FileVideo className="w-4 h-4" />
                          MP4, MOV, AVI, WebM
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                          <HardDrive className="w-4 h-4" />
                          Max 100MB
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Selected File Preview */}
              {selectedFile && !uploading && (
                <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="relative bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-purple-100 rounded-xl p-5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30" />

                    <div className="relative flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate text-lg">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <HardDrive className="w-4 h-4" />
                            {formatFileSize(selectedFile.size)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FileVideo className="w-4 h-4" />
                            {selectedFile.type.split("/")[1]?.toUpperCase() ||
                              "VIDEO"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={removeFile}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white animate-pulse" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          Uploading video...
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedFile?.name}
                        </p>
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>

                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${uploadProgress}%`,
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s infinite linear",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-3">
                      {uploadProgress < 50
                        ? "Preparing your video..."
                        : uploadProgress < 90
                          ? "Processing video content..."
                          : "Almost done..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700">Upload Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                    <button
                      onClick={() => setError("")}
                      className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {!uploadedVideo && !uploading && (
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`w-full mt-6 px-6 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedFile
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Upload Video
                </button>
              )}
            </div>

            {/* Uploaded Video Success */}
            {uploadedVideo && (
              <div className="border-t border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Successfully Uploaded!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your video is ready to use
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="relative group rounded-2xl overflow-hidden bg-black shadow-2xl">
                    <video
                      src={uploadedVideo.url}
                      controls
                      className="w-full aspect-video"
                      poster=""
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                      {
                        icon: Clock,
                        label: "Duration",
                        value: formatDuration(uploadedVideo.duration),
                        color: "from-blue-500 to-cyan-500",
                      },
                      {
                        icon: HardDrive,
                        label: "File Size",
                        value: formatFileSize(uploadedVideo.bytes),
                        color: "from-purple-500 to-pink-500",
                      },
                      {
                        icon: Monitor,
                        label: "Resolution",
                        value: `${uploadedVideo.width}×${uploadedVideo.height}`,
                        color: "from-orange-500 to-red-500",
                      },
                      {
                        icon: FileVideo,
                        label: "Format",
                        value: uploadedVideo.format.toUpperCase(),
                        color: "from-emerald-500 to-teal-500",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="relative group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}
                        />
                        <div className="relative">
                          <div
                            className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 mb-3`}
                          >
                            <stat.icon
                              className={`w-4 h-4 bg-gradient-to-br ${stat.color} bg-clip-text`}
                              style={{
                                color: "transparent",
                                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                              }}
                            />
                          </div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold text-gray-800 mt-1">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Copy className="w-4 h-4" />
                      Video URL
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          readOnly
                          value={uploadedVideo.url}
                          className="w-full px-4 py-3 pr-12 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-600 font-mono"
                        />
                      </div>
                      <button
                        onClick={() =>
                          copyVideoLink(uploadedVideo.url, "uploaded")
                        }
                        className={`flex-shrink-0 px-5 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                          copiedVideoId === "uploaded"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25"
                        }`}
                      >
                        {copiedVideoId === "uploaded" ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy URL
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => {
                        setUploadedVideo(null);
                        setSelectedFile(null);
                        setUploadProgress(0);
                      }}
                      className="flex-1 px-6 py-4 font-semibold rounded-xl border-2 border-dashed border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Another Video
                    </button>
                    <button
                      onClick={handleSwitchToList}
                      className="flex-1 px-6 py-4 font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <VideoIcon className="w-5 h-5" />
                      View All Videos
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
