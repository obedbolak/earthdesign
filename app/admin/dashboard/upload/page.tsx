// app/upload/video/page.tsx
"use client";

import { useState } from "react";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export default function UploadVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkFile = (f: File) => {
    const validTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!validTypes.includes(f.type)) {
      setError("Please select a video file (MP4, MOV, AVI, WebM)");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File must be ≤ 100 MB");
      return;
    }
    setFile(f);
    setFileName(f.name);
    setError(null);
    setResponse(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) checkFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) checkFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/videos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
      if (!res.ok) setError(data.error || "Upload failed");
    } catch (err: any) {
      setError(err.message || "Network error");
      setResponse(null);
    } finally {
      setUploading(false);
    }
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Upload Video File
          </h1>
          <p className="text-gray-500">
            Upload videos to Cloudinary and get shareable URLs
          </p>
        </div>

        <div
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
            ${
              file
                ? "border-green-400 bg-green-50"
                : isDragging
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            }
            ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
          `}
        >
          {!file ? (
            <>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-medium mb-1">
                Drag & drop your video here
              </p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <label className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg">
                Browse Files
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-4">
                Supports MP4, MOV, AVI, WebM (max 100 MB)
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="font-semibold text-green-700">{fileName}</p>
              <p className="text-sm text-gray-600">
                File ready to upload ({formatBytes(file.size)})
              </p>
              <button
                onClick={() => {
                  setFile(null);
                  setFileName("");
                  setResponse(null);
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {response?.success && response?.video && (
          <div className="mt-6 p-5 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-start mb-4">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-green-800 font-semibold text-lg mb-1">
                  Video Uploaded Successfully!
                </p>
                <p className="text-green-700 text-sm">
                  Your video is now available on Cloudinary
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    readOnly
                    value={response.video.url}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => copyToClipboard(response.video.url)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
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
                        Copied!
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
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <a
                  href={response.video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium text-sm underline"
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open video in new tab
                </a>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Video Details
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatDuration(response.video.duration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {response.video.format.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Resolution:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {response.video.width}x{response.video.height}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatBytes(response.video.bytes)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Preview
                </p>
                <video
                  src={response.video.url}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: "300px" }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setFileName("");
                setResponse(null);
                setError(null);
              }}
              className="mt-4 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Upload Another Video
            </button>
          </div>
        )}

        {file && !response?.success && (
          <button
            onClick={handleUpload}
            disabled={uploading || isDragging}
            className={`mt-6 w-full py-4 rounded-xl text-white font-semibold text-lg transition-all shadow-lg
              ${
                uploading || isDragging
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transform hover:-translate-y-0.5"
              }
            `}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Uploading Video...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Upload Video</span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
