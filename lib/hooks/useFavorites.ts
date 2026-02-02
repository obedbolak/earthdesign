// lib/hooks/useFavorites.ts
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState, useCallback, useMemo } from "react";

/* =========================================================
 * Types
 * ========================================================= */

export type FavoriteEntityType = "LOTISSEMENT" | "PARCELLE" | "BATIMENT";

export interface FavoriteItem {
  id: number;
  userId: string;
  entityType: FavoriteEntityType;
  lotissementId?: number | null;
  parcelleId?: number | null;
  batimentId?: number | null;
  createdAt: string;
  lotissement?: any;
  parcelle?: any;
  batiment?: any;
}

export interface FavoriteMap {
  LOTISSEMENT: number[];
  PARCELLE: number[];
  BATIMENT: number[];
}

/* =========================================================
 * Fetcher
 * ========================================================= */

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

/* =========================================================
 * Hook: useFavorites - Get all user favorites
 * ========================================================= */

export function useFavorites() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data, error, isLoading, mutate } = useSWR<{
    data: FavoriteItem[];
    count: number;
  }>(isAuthenticated ? "/api/favorites" : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    favorites: data?.data || [],
    count: data?.count || 0,
    loading: isLoading,
    error: error?.message || null,
    isAuthenticated,
    refetch: mutate,
  };
}

/* =========================================================
 * Hook: useFavoriteIds - Get favorite IDs for quick lookup
 * ========================================================= */

export function useFavoriteIds() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data, error, isLoading, mutate } = useSWR<{
    favorites: FavoriteMap;
  }>(isAuthenticated ? "/api/favorites/check" : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const favoriteMap = useMemo(() => {
    return (
      data?.favorites || {
        LOTISSEMENT: [],
        PARCELLE: [],
        BATIMENT: [],
      }
    );
  }, [data]);

  const isFavorite = useCallback(
    (entityType: FavoriteEntityType, entityId: number): boolean => {
      return favoriteMap[entityType]?.includes(entityId) || false;
    },
    [favoriteMap],
  );

  return {
    favoriteMap,
    isFavorite,
    loading: isLoading,
    error: error?.message || null,
    isAuthenticated,
    refetch: mutate,
  };
}

/* =========================================================
 * Hook: useFavoriteToggle - Toggle favorite status
 * ========================================================= */

export function useFavoriteToggle() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [loading, setLoading] = useState<string | null>(null); // "TYPE:ID" format
  const [error, setError] = useState<string | null>(null);

  // Get current favorites for optimistic updates
  const { favoriteMap, refetch: refetchIds } = useFavoriteIds();
  const { refetch: refetchFavorites } = useFavorites();

  const toggleFavorite = useCallback(
    async (
      entityType: FavoriteEntityType,
      entityId: number,
    ): Promise<{ success: boolean; isFavorite: boolean; error?: string }> => {
      if (!isAuthenticated) {
        return {
          success: false,
          isFavorite: false,
          error: "Please sign in to save favorites",
        };
      }

      const key = `${entityType}:${entityId}`;
      const currentlyFavorite = favoriteMap[entityType]?.includes(entityId);

      setLoading(key);
      setError(null);

      try {
        if (currentlyFavorite) {
          // Remove favorite
          const res = await fetch(
            `/api/favorites?entityType=${entityType}&entityId=${entityId}`,
            { method: "DELETE" },
          );

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to remove favorite");
          }

          // Refetch to update cache
          await Promise.all([refetchIds(), refetchFavorites()]);

          return { success: true, isFavorite: false };
        } else {
          // Add favorite
          const res = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entityType, entityId }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to add favorite");
          }

          // Refetch to update cache
          await Promise.all([refetchIds(), refetchFavorites()]);

          return { success: true, isFavorite: true };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return {
          success: false,
          isFavorite: currentlyFavorite,
          error: message,
        };
      } finally {
        setLoading(null);
      }
    },
    [isAuthenticated, favoriteMap, refetchIds, refetchFavorites],
  );

  const isToggling = useCallback(
    (entityType: FavoriteEntityType, entityId: number): boolean => {
      return loading === `${entityType}:${entityId}`;
    },
    [loading],
  );

  return {
    toggleFavorite,
    isToggling,
    loading: !!loading,
    error,
    isAuthenticated,
  };
}

/* =========================================================
 * Combined Hook: useFavoriteButton - All-in-one for buttons
 * ========================================================= */

export function useFavoriteButton(
  entityType: FavoriteEntityType,
  entityId: number,
) {
  const {
    isFavorite,
    isAuthenticated,
    loading: checkLoading,
  } = useFavoriteIds();
  const { toggleFavorite, isToggling } = useFavoriteToggle();

  const isFav = isFavorite(entityType, entityId);
  const isLoading = checkLoading || isToggling(entityType, entityId);

  const toggle = useCallback(async () => {
    return toggleFavorite(entityType, entityId);
  }, [toggleFavorite, entityType, entityId]);

  return {
    isFavorite: isFav,
    isLoading,
    isAuthenticated,
    toggle,
  };
}
