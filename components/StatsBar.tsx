// File: components/StatsBar.tsx
"use client";

import { useMemo } from "react";
import { Home, Building2, Layers, Map, Sparkles } from "lucide-react";
import { COLORS } from "@/lib/constants/colors";
import {
  useAllListings,
  Listing,
  EntityType,
  isForSale,
  isForRent,
} from "@/lib/hooks/useProperties";

// =========================================================
// TYPES
// =========================================================
export interface ListingStats {
  total: number;
  published: number;
  featured: number;
  forSale: number;
  forRent: number;
  byCategory: Record<string, number>;
  byEntityType: Record<EntityType, number>;
  averagePrice: number;
}

// =========================================================
// CALCULATE STATS
// =========================================================
export function calculateListingStats(listings: Listing[]): ListingStats {
  const published = listings.filter((l) => l.listingStatus === "PUBLISHED");

  const byCategory = {
    LAND: 0,
    RESIDENTIAL: 0,
    COMMERCIAL: 0,
    INDUSTRIAL: 0,
    MIXED: 0,
  } as Record<string, number>;

  published.forEach((l) => {
    if (l.category && byCategory[l.category] !== undefined) {
      byCategory[l.category]++;
    }
  });

  const byEntityType: Record<EntityType, number> = {
    LOTISSEMENT: listings.filter((l) => l._entityType === "LOTISSEMENT").length,
    PARCELLE: listings.filter((l) => l._entityType === "PARCELLE").length,
    BATIMENT: listings.filter((l) => l._entityType === "BATIMENT").length,
  };

  const prices = published
    .map((l) => parseFloat(String(l.price || 0)))
    .filter((p) => p > 0);

  return {
    total: listings.length,
    published: published.length,
    featured: published.filter((l) => l.featured).length,
    forSale: published.filter((l) => isForSale(l)).length,
    forRent: published.filter((l) => isForRent(l)).length,
    byCategory,
    byEntityType,
    averagePrice: prices.length
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0,
  };
}

// =========================================================
// HOOK - useListingStats
// =========================================================
export function useListingStats() {
  const { listings, loading, error } = useAllListings({
    status: "PUBLISHED",
    limit: 200,
  });

  const stats = useMemo(() => calculateListingStats(listings), [listings]);

  return { stats, listings, loading, error };
}

// =========================================================
// STATS BAR COMPONENT
// =========================================================
interface StatsBarProps {
  stats: ListingStats;
  variant?: "desktop" | "mobile" | "both";
  className?: string;
}

export default function StatsBar({
  stats,
  variant = "both",
  className = "",
}: StatsBarProps) {
  const renderDesktop = () => (
    <div
      className={`hidden sm:block border-b ${className}`}
      style={{
        background: `${COLORS.primary[950]}80`,
        borderColor: `${COLORS.primary[700]}80`,
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm text-white">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Home
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                style={{ color: COLORS.yellow[400] }}
              />
              <span>
                <strong style={{ color: COLORS.yellow[400] }}>
                  {stats.published}
                </strong>{" "}
                <span className="hidden md:inline">Listings</span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Building2
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                style={{ color: "#22c55e" }}
              />
              <span>
                <strong style={{ color: "#22c55e" }}>
                  {stats.byEntityType?.BATIMENT || 0}
                </strong>{" "}
                <span className="hidden lg:inline">Properties</span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Map
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                style={{ color: "#3b82f6" }}
              />
              <span>
                <strong style={{ color: "#3b82f6" }}>
                  {stats.byEntityType?.PARCELLE || 0}
                </strong>{" "}
                <span className="hidden lg:inline">Lands</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
              <Layers
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                style={{ color: "#a855f7" }}
              />
              <span>
                <strong style={{ color: "#a855f7" }}>
                  {stats.byEntityType?.LOTISSEMENT || 0}
                </strong>{" "}
                <span className="hidden lg:inline">Estates</span>
              </span>
            </div>
            {stats.featured > 0 && (
              <div className="hidden lg:flex items-center gap-1.5">
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: COLORS.yellow[400] }}
                />
                <span>
                  <strong style={{ color: COLORS.yellow[400] }}>
                    {stats.featured}
                  </strong>{" "}
                  Featured
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <span className="hidden xl:inline opacity-80">
              📍 Yaoundé, Cameroon
            </span>
            <span className="opacity-80 whitespace-nowrap">
              📞 +237 652 149 121
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobile = () => (
    <div
      className={`sm:hidden border-t ${className}`}
      style={{
        background: `${COLORS.primary[950]}80`,
        borderColor: `${COLORS.primary[700]}80`,
      }}
    >
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between py-1.5 text-[10px] text-white">
          <div className="flex items-center gap-3">
            <span>
              <strong style={{ color: COLORS.yellow[400] }}>
                {stats.published}
              </strong>{" "}
              Listings
            </span>
            <span>
              <strong style={{ color: "#22c55e" }}>
                {stats.byEntityType?.BATIMENT || 0}
              </strong>{" "}
              Props
            </span>
            <span>
              <strong style={{ color: "#3b82f6" }}>
                {stats.byEntityType?.PARCELLE || 0}
              </strong>{" "}
              Lands
            </span>
          </div>
          <span className="opacity-80">📞 +237 677...</span>
        </div>
      </div>
    </div>
  );

  if (variant === "desktop") return renderDesktop();
  if (variant === "mobile") return renderMobile();

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
}
