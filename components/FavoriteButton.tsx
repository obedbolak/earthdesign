// components/FavoriteButton.tsx
"use client";

import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import {
  useFavoriteButton,
  FavoriteEntityType,
} from "@/lib/hooks/useFavorites";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  entityType: FavoriteEntityType;
  entityId: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "overlay" | "minimal";
  className?: string;
}

export default function FavoriteButton({
  entityType,
  entityId,
  size = "md",
  variant = "default",
  className = "",
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isFavorite, isLoading, isAuthenticated, toggle } = useFavoriteButton(
    entityType,
    entityId,
  );

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantClasses = {
    default: "bg-white/90 hover:bg-white shadow-lg",
    overlay: "bg-black/30 hover:bg-black/50 backdrop-blur-sm",
    minimal: "bg-transparent hover:bg-gray-100",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(
        "/auth/signin?callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return;
    }

    await toggle();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full flex items-center justify-center
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <Loader2
          className={`${iconSizes[size]} animate-spin ${
            variant === "overlay" ? "text-white/70" : "text-gray-400"
          }`}
        />
      ) : (
        <motion.div
          initial={false}
          animate={isFavorite ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Heart
            className={`
              ${iconSizes[size]}
              transition-colors duration-200
              ${
                isFavorite
                  ? "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                  : variant === "overlay"
                    ? "text-white hover:text-red-400"
                    : variant === "minimal"
                      ? "text-gray-500 hover:text-red-500"
                      : "text-gray-600 hover:text-red-500"
              }
            `}
          />
        </motion.div>
      )}
    </motion.button>
  );
}
