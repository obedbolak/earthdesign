// components/FavoriteButton.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  showToast?: boolean;
}

export default function FavoriteButton({
  entityType,
  entityId,
  size = "md",
  variant = "default",
  className = "",
  showToast = true,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isFavorite, isLoading, isAuthenticated, toggle } = useFavoriteButton(
    entityType,
    entityId,
  );
  const [showMessage, setShowMessage] = useState<string | null>(null);

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
      if (showToast) {
        setShowMessage("Please sign in to save favorites");
        setTimeout(() => setShowMessage(null), 3000);
      }
      router.push(
        "/auth/signin?callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return;
    }

    const result = await toggle();

    if (showToast && result.success) {
      setShowMessage(
        result.isFavorite ? "Added to favorites!" : "Removed from favorites",
      );
      setTimeout(() => setShowMessage(null), 2000);
    } else if (showToast && result.error) {
      setShowMessage(result.error);
      setTimeout(() => setShowMessage(null), 3000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
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
            className={`${iconSizes[size]} animate-spin text-gray-500`}
          />
        ) : (
          <motion.div
            initial={false}
            animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`
                ${iconSizes[size]}
                transition-colors duration-200
                ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : variant === "overlay"
                      ? "text-white"
                      : "text-gray-600 hover:text-red-500"
                }
              `}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Toast Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
            className="absolute bottom-full left-1/2 mb-2 px-3 py-1.5 
                       bg-gray-900 text-white text-xs font-medium rounded-lg
                       whitespace-nowrap shadow-lg z-50"
          >
            {showMessage}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
