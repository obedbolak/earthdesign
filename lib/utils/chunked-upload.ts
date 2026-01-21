/**
 * Chunked upload utility for large files
 * Uploads file directly to Cloudinary via an API proxy route
 */

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

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Use proxy upload endpoint that handles Vercel request limits
    const response = await fetch("/api/upload/video-proxy", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    onProgress?.(100);

    const result: ChunkUploadResponse = {
      url: data.url || data.secure_url || "",
      publicId: data.publicId || data.public_id || "",
      duration: data.duration || 0,
      width: data.width || 0,
      height: data.height || 0,
      format: data.format || "",
      bytes: data.bytes || 0,
    };

    return result;
  } catch (error) {
    throw error;
  }
}
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
