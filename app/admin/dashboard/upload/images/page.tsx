// app/admin/dashboard/upload/images/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Upload, X, Check, Trash2, Plus, Copy, Loader2 } from "lucide-react";

interface ImageRecord {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

export default function ImagesUploadPage() {
  // UI States
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Data States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch all images on mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/upload/images");
      const data = await response.json();

      if (response.ok) {
        setImages(data.images);
      } else {
        setError(data.error || "Failed to fetch images");
      }
    } catch (err) {
      setError("Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 6) {
      setError("Maximum 6 images allowed");
      return;
    }

    setSelectedFiles(files);
    setError("");
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

      setSuccess(`Successfully uploaded ${data.images.length} image(s)`);
      setSelectedFiles([]);
      setShowUploadBox(false);

      // Refresh the images list
      fetchImages();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
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
      const response = await fetch(`/api/upload/images/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
      setSuccess("Image deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Image Manager</h1>
          <button
            onClick={() => setShowUploadBox(!showUploadBox)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              showUploadBox
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-teal-600 text-white hover:bg-teal-700"
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

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Upload Box - Conditional */}
        {showUploadBox && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Upload New Images
            </h2>

            {/* File Input */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WebP (Max 6 images)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({selectedFiles.length}/6)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {selectedFiles.length} Image
                  {selectedFiles.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        )}

        {/* Images Gallery */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            All Images ({images.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">Loading images...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No images uploaded yet</p>
              <button
                onClick={() => setShowUploadBox(true)}
                className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
              >
                Upload your first image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="relative aspect-square">
                    <img
                      src={img.url}
                      alt={`Image ${img.id}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Copy URL Button */}
                      <button
                        onClick={() => copyToClipboard(img.url, img.id)}
                        className={`p-2 rounded-full transition ${
                          copiedId === img.id
                            ? "bg-green-500 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                        title="Copy URL"
                      >
                        {copiedId === img.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(img.id, img.publicId)}
                        disabled={deleting === img.id}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === img.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-2 bg-gray-50 text-xs text-gray-600">
                    <p className="font-medium">
                      {img.width} × {img.height}
                    </p>
                    <p className="text-gray-400 uppercase">{img.format}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
