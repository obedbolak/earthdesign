// components/AdminProfileImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Trash2, X, Upload } from "lucide-react";
import Image from "next/image";

interface AdminProfileImageUploadProps {
  userId: string;
  imageType: "image" | "agencyLogo";
  currentImage?: string | null;
  onImageUpdate?: (url: string | null) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function AdminProfileImageUpload({
  userId,
  imageType,
  currentImage,
  onImageUpdate,
  className = "",
  size = "md",
}: AdminProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // First upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "type",
        imageType === "agencyLogo" ? "agencyLogo" : "profile",
      );

      const uploadResponse = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // Then update the user record
      const updateResponse = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [imageType]: uploadData.url,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Failed to update user");
      }

      setPreview(uploadData.url);
      onImageUpdate?.(uploadData.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeleting(true);
    setError(null);

    try {
      // Delete from Cloudinary
      const deleteResponse = await fetch(
        `/api/upload/profile?type=${imageType === "agencyLogo" ? "agencyLogo" : "profile"}`,
        {
          method: "DELETE",
        },
      );

      if (!deleteResponse.ok) {
        const deleteData = await deleteResponse.json();
        throw new Error(deleteData.error || "Delete failed");
      }

      // Update user record
      const updateResponse = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [imageType]: null,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Failed to update user");
      }

      setPreview(null);
      onImageUpdate?.(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className={`relative ${className}`}>
      {/* Image Display */}
      <div className={`relative group ${sizeClasses[size]}`}>
        {displayImage ? (
          <div className="relative w-full h-full">
            <Image
              src={displayImage}
              alt={imageType === "agencyLogo" ? "Agency Logo" : "Profile"}
              fill
              className="object-cover rounded-lg border-2 border-gray-200"
              sizes="200px"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deleting}
                className="p-1.5 bg-white rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Change image"
              >
                <Camera className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <button
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="p-1.5 bg-white rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete image"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 text-red-600 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Placeholder */}
            <div className="w-full h-full rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>

            {/* Upload button overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-gray-900/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {uploading && displayImage && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center gap-1">
          <X className="w-3 h-3 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
