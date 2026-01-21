/**
 * Chunked upload utility for large files
 * Splits file into smaller chunks and uploads sequentially
 */

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export interface ChunkUploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
  sessionId?: string;
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
  const sessionId =
    options.sessionId ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const chunks = Math.ceil(file.size / CHUNK_SIZE);

  try {
    // Upload each chunk
    for (let i = 0; i < chunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", chunks.toString());
      formData.append("sessionId", sessionId);
      formData.append("fileName", file.name);
      formData.append("fileSize", file.size.toString());

      const response = await fetch("/api/upload/video-chunk", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Chunk ${i + 1} upload failed`);
      }

      // Update progress
      const uploadedBytes = end;
      const progressPercent = (uploadedBytes / file.size) * 100;
      onProgress?.(Math.min(progressPercent, 99)); // Cap at 99% until finalized
    }

    // Finalize upload
    const finalizeResponse = await fetch("/api/upload/video-finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        fileName: file.name,
        totalChunks: chunks,
      }),
    });

    if (!finalizeResponse.ok) {
      const errorData = await finalizeResponse.json();
      throw new Error(errorData.error || "Failed to finalize upload");
    }

    const result: ChunkUploadResponse = await finalizeResponse.json();
    onProgress?.(100);

    return result;
  } catch (error) {
    throw error;
  }
}
