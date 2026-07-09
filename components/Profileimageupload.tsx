// components/ProfileImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Camera, Loader2, Trash2, X, Upload } from "lucide-react";
import Image from "next/image";

interface ProfileImageUploadProps {
  imageType?: "profile" | "agencyLogo";
  currentImage?: string | null;
  onImageUpdate?: (url: string | null) => void;
  className?: string;
}

export default function ProfileImageUpload({
  imageType = "profile",
  currentImage,
  onImageUpdate,
  className = "",
}: ProfileImageUploadProps) {
  const { data: session, update } = useSession();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", imageType);

      const response = await fetch("/api/upload/profile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreview(data.url);

      // Update session
      await update({
        [imageType === "agencyLogo" ? "agencyLogo" : "image"]: data.url,
      });

      // Call callback if provided
      onImageUpdate?.(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      // Reset file input
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
      const response = await fetch(`/api/upload/profile?type=${imageType}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setPreview(null);

      // Update session
      await update({
        [imageType === "agencyLogo" ? "agencyLogo" : "image"]: null,
      });

      // Call callback if provided
      onImageUpdate?.(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = preview || currentImage;
  const userName = session?.user?.name || session?.user?.email || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative ${className}`}>
      {/* Image Display */}
      <div className="relative group">
        {displayImage ? (
          <div className="relative w-full h-full">
            <Image
              src={displayImage}
              alt={imageType === "agencyLogo" ? "Agency Logo" : "Profile"}
              fill
              className="object-cover rounded-full"
              sizes="(max-width: 768px) 100vw, 200px"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deleting}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Change image"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete image"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-600" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Placeholder */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-4xl">
              {imageType === "agencyLogo" ? (
                <Camera className="w-12 h-12" />
              ) : (
                initials
              )}
            </div>

            {/* Upload button overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="w-8 h-8 text-white" />
                  <span className="text-white text-xs font-medium">Upload</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {uploading && displayImage && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
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
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Help text */}
      {!error && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          {imageType === "agencyLogo"
            ? "Upload your agency logo (max 5MB)"
            : "Upload your profile picture (max 5MB)"}
        </p>
      )}
    </div>
  );
}
