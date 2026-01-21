/**
 * Chunked upload utility for large files
 * Uses Cloudinary's resumable upload API for server-side chunk handling
 */

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export interface ChunkUploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface ChunkUploadResponse {
  url: string;
  publicId: string;
  duration: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadFileInChunks(
  options: ChunkUploadOptions,
): Promise<ChunkUploadResponse> {
  const { file, onProgress } = options;
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadId: string | null = null;

  try {
    // Upload each chunk
    for (let i = 0; i < chunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
      );
      formData.append("folder", "earthdesign");
      formData.append("resource_type", "video");
      formData.append("chunk_size", CHUNK_SIZE.toString());
      formData.append("chunk_index", i.toString());
      formData.append("chunks", chunks.toString());

      if (uploadId) {
        formData.append("upload_id", uploadId);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `Chunk ${i + 1} upload failed`,
        );
      }

      const data = await response.json();

      // Store upload_id for subsequent chunks
      if (data.upload_id) {
        uploadId = data.upload_id;
      }

      // Update progress
      const uploadedBytes = end;
      const progressPercent = (uploadedBytes / file.size) * 100;
      onProgress?.(Math.min(progressPercent, 99)); // Cap at 99% until finalized
    }

    onProgress?.(100);

    // Get final result from last chunk response
    if (!uploadId) {
      throw new Error("Upload failed: No upload ID received");
    }

    // Cloudinary returns the complete video data on the last chunk
    // Fetch it using the upload_id
    const finalResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload_info?upload_id=${uploadId}`,
    );

    if (!finalResponse.ok) {
      throw new Error("Failed to retrieve upload information");
    }

    const finalData = await finalResponse.json();

    const result: ChunkUploadResponse = {
      url: finalData.secure_url || "",
      publicId: finalData.public_id || "",
      duration: finalData.duration || 0,
      width: finalData.width || 0,
      height: finalData.height || 0,
      format: finalData.format || "",
      bytes: finalData.bytes || 0,
    };

    return result;
  } catch (error) {
    throw error;
  }
}
