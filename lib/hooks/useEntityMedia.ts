// lib/hooks/useEntityMedia.ts
import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";

/* =========================================================
 * TYPES
 * ========================================================= */

export interface MediaItem {
  id: number;
  entityType: string;
  url: string;
  type: "image" | "video";
  order: number;
  caption?: string | null;
  isPrimary: boolean;
  lotissementId?: number | null;
  parcelleId?: number | null;
  batimentId?: number | null;
  infrastructureId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseEntityMediaOptions {
  entityType: string;
  entityId: number | null | undefined;
  autoFetch?: boolean;
}

export interface AddMediaInput {
  url: string;
  type: "image" | "video";
  caption?: string;
  isPrimary?: boolean;
}

export interface MediaOperationResult {
  success: boolean;
  data?: MediaItem;
  error?: string;
}

/* =========================================================
 * CONSTANTS
 * ========================================================= */

const ENTITY_FOREIGN_KEYS: Record<string, string> = {
  LOTISSEMENT: "lotissementId",
  PARCELLE: "parcelleId",
  BATIMENT: "batimentId",
  INFRASTRUCTURE: "infrastructureId",
};

// ✅ FIXED: Capital M to match your API route
const MEDIA_API_PATH = "/api/data/Media";

/* =========================================================
 * FETCHER
 * ========================================================= */

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch: ${res.status}`);
  }
  return res.json();
};

/* =========================================================
 * MAIN HOOK
 * ========================================================= */

export function useEntityMedia({
  entityType,
  entityId,
  autoFetch = true,
}: UseEntityMediaOptions) {
  // Mutation states
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Normalize entity type to uppercase
  const normalizedEntityType = useMemo(
    () => entityType?.toUpperCase() || "",
    [entityType],
  );

  // Get foreign key for this entity type
  const foreignKey = useMemo(
    () => ENTITY_FOREIGN_KEYS[normalizedEntityType] || null,
    [normalizedEntityType],
  );

  // SWR Key - only fetch if we have valid params
  const swrKey = useMemo(() => {
    if (!normalizedEntityType || entityId == null || !autoFetch) {
      return null;
    }
    return `${MEDIA_API_PATH}?entityType=${normalizedEntityType}&entityId=${entityId}`;
  }, [normalizedEntityType, entityId, autoFetch]);

  // Fetch with SWR
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    data: MediaItem[];
  }>(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    errorRetryCount: 2,
  });

  // Extract and sort media
  const media = useMemo(() => {
    const items = data?.data || [];
    return [...items].sort((a, b) => {
      // Primary first, then by order
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [data]);

  // Filter by type
  const images = useMemo(
    () => media.filter((m) => m.type === "image"),
    [media],
  );

  const videos = useMemo(
    () => media.filter((m) => m.type === "video"),
    [media],
  );

  // Primary image
  const primaryImage = useMemo(() => {
    return images.find((m) => m.isPrimary) || images[0] || null;
  }, [images]);

  const primaryImageUrl = primaryImage?.url || null;

  /* =========================================================
   * ADD MEDIA
   * ========================================================= */
  const addMedia = useCallback(
    async (input: AddMediaInput): Promise<MediaOperationResult> => {
      if (!normalizedEntityType || entityId == null) {
        return { success: false, error: "Missing entity type or ID" };
      }

      if (!foreignKey) {
        return { success: false, error: `Unknown entity type: ${entityType}` };
      }

      setAdding(true);
      setOperationError(null);

      try {
        const body = {
          entityType: normalizedEntityType,
          entityId: entityId,
          url: input.url.trim(),
          type: input.type,
          caption: input.caption || null,
          isPrimary: input.isPrimary ?? media.length === 0,
          [foreignKey]: entityId,
        };

        const res = await fetch(MEDIA_API_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to add media");
        }

        const json = await res.json();
        const newMedia = json.data;

        // Update cache optimistically
        await mutate(
          (current) => ({
            data: [...(current?.data || []), newMedia],
          }),
          { revalidate: false },
        );

        return { success: true, data: newMedia };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add media";
        setOperationError(message);
        return { success: false, error: message };
      } finally {
        setAdding(false);
      }
    },
    [
      normalizedEntityType,
      entityType,
      entityId,
      foreignKey,
      media.length,
      mutate,
    ],
  );

  /* =========================================================
   * DELETE MEDIA
   * ========================================================= */
  const deleteMedia = useCallback(
    async (mediaId: number): Promise<MediaOperationResult> => {
      setDeletingId(mediaId);
      setOperationError(null);

      try {
        const res = await fetch(`${MEDIA_API_PATH}/${mediaId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to delete media");
        }

        // Update cache
        await mutate(
          (current) => ({
            data: (current?.data || []).filter((m) => m.id !== mediaId),
          }),
          { revalidate: false },
        );

        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete media";
        setOperationError(message);
        return { success: false, error: message };
      } finally {
        setDeletingId(null);
      }
    },
    [mutate],
  );

  /* =========================================================
   * SET PRIMARY
   * ========================================================= */
  const setPrimary = useCallback(
    async (mediaId: number): Promise<MediaOperationResult> => {
      setUpdatingId(mediaId);
      setOperationError(null);

      try {
        // First unset current primary
        const currentPrimary = media.find(
          (m) => m.isPrimary && m.id !== mediaId,
        );
        if (currentPrimary) {
          await fetch(`${MEDIA_API_PATH}/${currentPrimary.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPrimary: false }),
          });
        }

        // Set new primary
        const res = await fetch(`${MEDIA_API_PATH}/${mediaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrimary: true }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to set primary");
        }

        // Update cache
        await mutate(
          (current) => ({
            data: (current?.data || []).map((m) => ({
              ...m,
              isPrimary: m.id === mediaId,
            })),
          }),
          { revalidate: false },
        );

        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set primary";
        setOperationError(message);
        return { success: false, error: message };
      } finally {
        setUpdatingId(null);
      }
    },
    [media, mutate],
  );

  /* =========================================================
   * UPDATE MEDIA
   * ========================================================= */
  const updateMedia = useCallback(
    async (
      mediaId: number,
      updates: Partial<Pick<MediaItem, "caption" | "order" | "isPrimary">>,
    ): Promise<MediaOperationResult> => {
      setUpdatingId(mediaId);
      setOperationError(null);

      try {
        const res = await fetch(`${MEDIA_API_PATH}/${mediaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update media");
        }

        const json = await res.json();

        // Update cache
        await mutate(
          (current) => ({
            data: (current?.data || []).map((m) =>
              m.id === mediaId ? { ...m, ...json.data } : m,
            ),
          }),
          { revalidate: false },
        );

        return { success: true, data: json.data };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update media";
        setOperationError(message);
        return { success: false, error: message };
      } finally {
        setUpdatingId(null);
      }
    },
    [mutate],
  );

  /* =========================================================
   * REFRESH
   * ========================================================= */
  const refresh = useCallback(() => mutate(), [mutate]);

  const clearError = useCallback(() => setOperationError(null), []);

  /* =========================================================
   * RETURN
   * ========================================================= */
  return {
    // Data
    media,
    images,
    videos,
    primaryImage,
    primaryImageUrl,

    // Loading states
    loading: isLoading,
    isValidating,
    adding,
    updatingId,
    deletingId,

    // Error
    error: error?.message || operationError,
    fetchError: error?.message || null,
    operationError,

    // Actions
    addMedia,
    updateMedia,
    deleteMedia,
    setPrimary,
    refresh,
    clearError,

    // Helpers
    hasMedia: media.length > 0,
    hasImages: images.length > 0,
    hasVideos: videos.length > 0,
    mediaCount: media.length,
    imageCount: images.length,
    videoCount: videos.length,
  };
}

export default useEntityMedia;
