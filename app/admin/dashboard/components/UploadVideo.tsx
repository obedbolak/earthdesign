// app/admin/dashboard/upload/video/page.tsx
"use client";
import { useState, useRef, useCallback, useEffect } from "react";
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

declare global {
  interface Window {
    cloudinary?: any;
  }
}

export default function VideoUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null,
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Cloudinary SDK on mount
  useEffect(() => {
    // Check if already loaded
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
      // Upload directly to Cloudinary using FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
      );
      formData.append("folder", "earthdesign");
      formData.append("resource_type", "video");

      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Return a promise that resolves when upload completes
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-0 mb-20 p-4">
      {/* Header */}

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8">
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
              {/* Animated Background Pattern */}
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
                {/* Icon Container */}
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

                {/* Text */}
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
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30" />

                <div className="relative flex items-center gap-5">
                  {/* Video Thumbnail/Icon */}
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

                  {/* File Info */}
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

                  {/* Remove Button */}
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

                {/* Progress Bar */}
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
            {/* Success Header */}
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

            {/* Video Player */}
            <div className="p-8">
              <div className="relative group rounded-2xl overflow-hidden bg-black shadow-2xl">
                <video
                  src={uploadedVideo.url}
                  controls
                  className="w-full aspect-video"
                  poster=""
                />
              </div>

              {/* Video Stats */}
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

              {/* Video URL */}
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
                    onClick={() => copyToClipboard(uploadedVideo.url)}
                    className={`flex-shrink-0 px-5 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 ${
                      copied
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25"
                    }`}
                  >
                    {copied ? (
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

              {/* Upload Another Button */}
              <button
                onClick={() => {
                  setUploadedVideo(null);
                  setSelectedFile(null);
                  setUploadProgress(0);
                }}
                className="w-full mt-6 px-6 py-4 font-semibold rounded-xl border-2 border-dashed border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Another Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add shimmer animation */}
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
