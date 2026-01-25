// app/admin/dashboard/upload/images/page.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  X,
  Check,
  Trash2,
  Plus,
  Copy,
  Loader2,
  Image as ImageIcon,
  Grid3X3,
  LayoutGrid,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Maximize2,
  ZoomIn,
} from "lucide-react";

interface ImageRecord {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes?: number;
  createdAt: string;
}

const CACHE_KEY = "uploaded_images_cache";
const CACHE_EXPIRY = 5 * 60 * 1000;

interface CacheData {
  images: ImageRecord[];
  timestamp: number;
}

export default function ImagesUploadPage() {
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFromCache = (): ImageRecord[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_EXPIRY;

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data.images;
    } catch {
      return null;
    }
  };

  const saveToCache = (images: ImageRecord[]) => {
    try {
      const data: CacheData = {
        images,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to cache images:", err);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  const fetchImages = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getFromCache();
        if (cached) {
          setImages(cached);
          setLoading(false);
          fetchFromServer(true);
          return;
        }
      }

      await fetchFromServer(false);
    } catch (err) {
      setError("Failed to fetch images");
      setLoading(false);
    }
  };

  const fetchFromServer = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const response = await fetch("/api/upload/images");
      const data = await response.json();

      if (response.ok) {
        setImages(data.images);
        saveToCache(data.images);
      } else if (!silent) {
        setError(data.error || "Failed to fetch images");
      }
    } catch (err) {
      if (!silent) setError("Failed to fetch images");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
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

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length > 0) {
      validateAndSetFiles(files);
      setShowUploadBox(true);
    }
  }, []);

  const validateAndSetFiles = (files: File[]) => {
    if (files.length > 6) {
      setError("Maximum 6 images allowed at once");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    setError("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndSetFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setSuccess(`Successfully uploaded ${data.images.length} image(s)`);
        setSelectedFiles([]);
        setShowUploadBox(false);
        setUploadProgress(0);

        const newImages = [...data.images, ...images];
        setImages(newImages);
        saveToCache(newImages);

        setTimeout(() => setSuccess(""), 3000);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, publicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setDeleting(id);
    setError("");

    try {
      const response = await fetch(
        `/api/upload/images?publicId=${encodeURIComponent(publicId)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      const updatedImages = images.filter((img) => img.id !== id);
      setImages(updatedImages);
      saveToCache(updatedImages);

      setSuccess("Image deleted successfully");
      setSelectedImage(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = () => {
    clearCache();
    fetchImages(true);
  };

  const filteredImages = images.filter(
    (img) =>
      img.format.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="max-w-7xl mx-auto"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {dragActive && (
        <div className="fixed inset-0 z-50 bg-purple-500/10 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Upload className="w-10 h-10 text-white animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Drop your images here
            </h3>
            <p className="text-gray-500">Release to upload up to 6 images</p>
          </div>
        </div>
      )}

      <div className="mb-8  px-4 sm:px-0">
        <div className="flex items-center gap-3 mb-2"></div>
        <p className="text-gray-500 ml-14">
          Upload, organize, and manage your images
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by format or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "compact"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={() => setShowUploadBox(!showUploadBox)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  showUploadBox
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                }`}
              >
                {showUploadBox ? (
                  <>
                    <X className="w-5 h-5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Upload New
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="mx-6 mt-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
              <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-emerald-700 font-medium">{success}</p>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto text-emerald-400 hover:text-emerald-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {showUploadBox && (
          <div className="m-6 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl border-2 border-dashed border-blue-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Upload New Images
                  </h2>
                  <p className="text-sm text-gray-500">
                    Select up to 6 images at once
                  </p>
                </div>
              </div>

              <label className="block cursor-pointer">
                <div
                  className={`relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-xl transition-all duration-300 ${
                    selectedFiles.length > 0
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex flex-col items-center p-8">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-xl opacity-30" />
                      <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-1">
                      Drop images here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF, WebP • Max 10MB each
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Selected ({selectedFiles.length}/6)
                    </h3>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="absolute bottom-2 left-2 right-2 text-xs text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="mt-6 p-4 bg-white rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Uploading {selectedFiles.length} image
                      {selectedFiles.length !== 1 ? "s" : ""}...
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {!uploading && (
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0}
                  className={`w-full mt-6 px-6 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedFiles.length > 0
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Upload {selectedFiles.length} Image
                  {selectedFiles.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              All Images
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredImages.length}
                {searchQuery && ` of ${images.length}`})
              </span>
            </h2>
          </div>

          {loading && images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <p className="mt-4 text-gray-500 font-medium">
                Loading your images...
              </p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl blur-xl opacity-20" />
                <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 p-6 rounded-2xl">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              {searchQuery ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try a different search term
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No images yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Upload your first image to get started
                  </p>
                  <button
                    onClick={() => setShowUploadBox(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                  >
                    Upload Images
                  </button>
                </>
              )}
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
              }`}
            >
              {filteredImages.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div
                    className={`relative ${
                      viewMode === "grid" ? "aspect-square" : "aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Image ${img.id}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                    {/* View Button (centered on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => setSelectedImage(img)}
                        className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
                        title="View"
                      >
                        <ZoomIn className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Info Badge */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                        {img.width} × {img.height}
                      </span>
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-md uppercase">
                        {img.format}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Copy and Delete at bottom */}
                  <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => copyToClipboard(img.url, img.id)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        copiedId === img.id
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      title="Copy URL"
                    >
                      {copiedId === img.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id, img.publicId)}
                      disabled={deleting === img.id}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === img.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-gray-900 flex items-center justify-center min-h-[300px] max-h-[60vh]">
              <img
                src={selectedImage.url}
                alt={`Image ${selectedImage.id}`}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>

            <div className="p-6 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Maximize2 className="w-4 h-4" />
                    Resolution
                  </div>
                  <p className="font-bold text-gray-800">
                    {selectedImage.width} × {selectedImage.height}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <HardDrive className="w-4 h-4" />
                    Size
                  </div>
                  <p className="font-bold text-gray-800">
                    {formatFileSize(selectedImage.bytes)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <ImageIcon className="w-4 h-4" />
                    Format
                  </div>
                  <p className="font-bold text-gray-800 uppercase">
                    {selectedImage.format}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Uploaded
                  </div>
                  <p className="font-bold text-gray-800">
                    {formatDate(selectedImage.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={selectedImage.url}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-mono"
                  />
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(selectedImage.url, selectedImage.id)
                  }
                  className={`px-5 py-3 font-semibold rounded-xl transition-all flex items-center gap-2 ${
                    copiedId === selectedImage.id
                      ? "bg-emerald-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg"
                  }`}
                >
                  {copiedId === selectedImage.id ? (
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
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </div>
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
      `}</style>
    </div>
  );
}
