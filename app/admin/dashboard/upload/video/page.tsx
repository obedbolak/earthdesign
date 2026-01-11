// app/admin/dashboard/upload/video/page.tsx
"use client";
import { useState } from "react";
import { Upload, X, Check, Video as VideoIcon } from "lucide-react";

interface UploadedVideo {
  url: string;
  publicId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export default function VideoUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("Video must be less than 100MB");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedVideo(data.video);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
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
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Video</h1>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Video (Max 100MB)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <VideoIcon className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  MP4, MOV, AVI, WebM (Max 100MB)
                </p>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Video
            </h3>
            <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-4">
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-teal-100 rounded-lg p-3">
                  <VideoIcon className="w-8 h-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full animate-pulse"
                style={{ width: "100%" }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Processing video...
            </p>
          </div>
        )}

        {/* Uploaded Video */}
        {uploadedVideo && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Successfully Uploaded
              </h3>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <video src={uploadedVideo.url} controls className="w-full" />
              <div className="p-4 bg-gray-50 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">
                      {formatDuration(uploadedVideo.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Size</p>
                    <p className="font-medium">
                      {formatFileSize(uploadedVideo.bytes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Resolution</p>
                    <p className="font-medium">
                      {uploadedVideo.width} x {uploadedVideo.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Format</p>
                    <p className="font-medium">
                      {uploadedVideo.format.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={uploadedVideo.url}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                    />
                    <button
                      onClick={() => copyToClipboard(uploadedVideo.url)}
                      className={`px-4 py-2 ${
                        copied ? "bg-green-600" : "bg-blue-600"
                      } text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap`}
                    >
                      {copied ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
