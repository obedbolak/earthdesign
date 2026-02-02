// components/ShareButton.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, Check, Mail, Link2, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";
import { EntityType } from "@/lib/hooks/useProperties";

// Custom icons for social platforms
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const MessengerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
  </svg>
);

// Types
type SharePlatform =
  | "whatsapp"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "telegram"
  | "messenger"
  | "email"
  | "copy"
  | "native";

interface Platform {
  id: SharePlatform;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverBg: string;
  getShareUrl: (url: string, title: string, description?: string) => string;
}

interface ShareButtonProps {
  entityType: EntityType;
  entityId: number | string;
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  variant?: "default" | "compact" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  platforms: Platform[];
  onShare: (platform: Platform) => void;
  onCopyLink: () => void;
  copied: boolean;
  sharing: SharePlatform | null;
  shareUrl: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

// Platform configuration
const platforms: Platform[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: WhatsAppIcon,
    color: "#25D366",
    hoverBg: "hover:bg-[#25D366]/10",
    getShareUrl: (url: string, title: string, description?: string) =>
      `https://wa.me/?text=${encodeURIComponent(`*${title}*\n\n${description || ""}\n\n${url}`)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: FacebookIcon,
    color: "#1877F2",
    hoverBg: "hover:bg-[#1877F2]/10",
    getShareUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    name: "X",
    icon: TwitterIcon,
    color: "#000000",
    hoverBg: "hover:bg-black/10",
    getShareUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: LinkedInIcon,
    color: "#0A66C2",
    hoverBg: "hover:bg-[#0A66C2]/10",
    getShareUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: TelegramIcon,
    color: "#0088CC",
    hoverBg: "hover:bg-[#0088CC]/10",
    getShareUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: MessengerIcon,
    color: "#006AFF",
    hoverBg: "hover:bg-[#006AFF]/10",
    getShareUrl: (url: string) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`,
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "#EA4335",
    hoverBg: "hover:bg-[#EA4335]/10",
    getShareUrl: (url: string, title: string, description?: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ""}\n\n${url}`)}`,
  },
];

// Floating popup component using portal
function SharePopup({
  isOpen,
  onClose,
  buttonRef,
  platforms,
  onShare,
  onCopyLink,
  copied,
  sharing,
  shareUrl,
  title,
  description,
  imageUrl,
}: SharePopupProps) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    showAbove: true,
  });
  const [mounted, setMounted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popupHeight = 420;
      const popupWidth = 320;
      const padding = 16;

      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove =
        spaceAbove > popupHeight + padding || spaceAbove > spaceBelow;

      let left = rect.left + rect.width / 2 - popupWidth / 2;
      left = Math.max(
        padding,
        Math.min(left, window.innerWidth - popupWidth - padding),
      );

      const top = showAbove ? rect.top - popupHeight - 12 : rect.bottom + 12;

      setPosition({ top, left, showAbove });
    }
  }, [isOpen, buttonRef]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, buttonRef]);

  // Don't render on server or if not open
  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none"
            onClick={onClose}
          />

          {/* Floating Popup */}
          <motion.div
            ref={popupRef}
            initial={{
              opacity: 0,
              scale: 0.9,
              y: position.showAbove ? 10 : -10,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position.showAbove ? 10 : -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed z-[9999] w-[320px]"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {/* Main popup container */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                boxShadow: `
                  0 0 0 1px rgba(0, 0, 0, 0.05),
                  0 4px 6px -1px rgba(0, 0, 0, 0.1),
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 25px 50px -12px rgba(0, 0, 0, 0.25)
                `,
              }}
            >
              {/* Gradient header */}
              <div
                className="relative px-5 py-4"
                style={{
                  background: GRADIENTS.button.primary,
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Share</h3>
                      <p className="text-xs text-white/70">Choose a platform</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                {/* Sparkle decoration */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-3 right-16"
                >
                  <Sparkles className="w-4 h-4 text-white/40" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Preview card (compact) */}
                {(imageUrl || title) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.gray[200]}, ${COLORS.gray[200]})`,
                      border: `1px solid ${COLORS.gray[200]}`,
                    }}
                  >
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-semibold text-sm line-clamp-1"
                        style={{ color: COLORS.gray[800] }}
                      >
                        {title}
                      </p>
                      {description && (
                        <p
                          className="text-xs line-clamp-1 mt-0.5"
                          style={{ color: COLORS.gray[500] }}
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Platform grid */}
                <div className="grid grid-cols-4 gap-2">
                  {platforms.map((platform, index) => {
                    const IconComponent = platform.icon;
                    return (
                      <motion.button
                        key={platform.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onShare(platform)}
                        disabled={sharing !== null}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${platform.hoverBg}`}
                        style={{
                          background:
                            sharing === platform.id
                              ? `${platform.color}15`
                              : "transparent",
                        }}
                      >
                        <motion.div
                          animate={
                            sharing === platform.id
                              ? { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }
                              : {}
                          }
                          transition={{
                            duration: 0.5,
                            repeat: sharing === platform.id ? Infinity : 0,
                          }}
                          className="relative"
                        >
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-shadow"
                            style={{
                              background: platform.color,
                              boxShadow: `0 4px 14px ${platform.color}40`,
                            }}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: COLORS.gray[600] }}
                        >
                          {platform.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Copy link section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl overflow-hidden"
                      style={{
                        background: COLORS.gray[200],
                        border: `1px solid ${COLORS.gray[200]}`,
                      }}
                    >
                      <Link2
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: COLORS.gray[400] }}
                      />
                      <span
                        className="text-xs truncate flex-1"
                        style={{ color: COLORS.gray[600] }}
                      >
                        {shareUrl}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onCopyLink}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background: copied
                          ? "#22c55e"
                          : GRADIENTS.button.primary,
                        color: "white",
                        boxShadow: copied
                          ? "0 4px 14px rgba(34, 197, 94, 0.4)"
                          : "0 4px 14px rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            className="flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {copied ? "Done!" : "Copy"}
                    </motion.button>
                  </div>

                  {/* Success message */}
                  <AnimatePresence>
                    {copied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-medium shadow-lg">
                          <Check className="w-3 h-3" />
                          Link copied to clipboard!
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Bottom accent line */}
              <div
                className="h-1"
                style={{ background: GRADIENTS.button.primary }}
              />
            </div>

            {/* Arrow pointer */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
              style={{
                background: position.showAbove
                  ? "rgba(255, 255, 255, 0.98)"
                  : GRADIENTS.button.primary,
                top: position.showAbove ? "calc(100% - 8px)" : "-8px",
                boxShadow: position.showAbove
                  ? "2px 2px 4px rgba(0,0,0,0.1)"
                  : "-2px -2px 4px rgba(0,0,0,0.1)",
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default function ShareButton({
  entityType,
  entityId,
  title,
  description,
  imageUrl,
  url,
  variant = "default",
  size = "md",
  className = "",
  showLabel = false,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState<SharePlatform | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Generate share URL
  const shareUrl =
    url ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/${entityType.toLowerCase()}/${entityId}`
      : "");

  // Size configurations
  const sizes = {
    sm: { button: "p-1.5", icon: "w-4 h-4", text: "text-xs" },
    md: { button: "p-2", icon: "w-5 h-5", text: "text-sm" },
    lg: { button: "p-3", icon: "w-6 h-6", text: "text-base" },
  };

  const sizeConfig = sizes[size];

  // Track share via API
  const trackShare = useCallback(
    async (platform: SharePlatform) => {
      try {
        const response = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            entityId:
              typeof entityId === "string" ? parseInt(entityId) : entityId,
            platform,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to track share");
        }

        return true;
      } catch (err) {
        console.error("Failed to track share:", err);
        return false;
      }
    },
    [entityType, entityId],
  );

  // Handle share to platform
  const handleShare = async (platform: Platform) => {
    setSharing(platform.id);

    try {
      await trackShare(platform.id);

      const shareLink = platform.getShareUrl(shareUrl, title, description);
      const width = 600;
      const height = 500;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        shareLink,
        "share",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
      );

      // Close after brief delay
      setTimeout(() => {
        setIsOpen(false);
      }, 500);
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setSharing(null);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      await trackShare("copy");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        setCopied(true);
        await trackShare("copy");
        setTimeout(() => setCopied(false), 2500);
      } catch (copyErr) {
        console.error("Copy failed:", copyErr);
      }

      document.body.removeChild(textArea);
    }
  };

  // Toggle popup
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Try native share first on mobile
    if (navigator.share && window.innerWidth < 768) {
      navigator
        .share({
          title,
          text: description,
          url: shareUrl,
        })
        .then(() => trackShare("native"))
        .catch((err) => {
          if ((err as Error).name !== "AbortError") {
            setIsOpen(true);
          }
        });
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleButtonClick}
        className={`relative bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all flex items-center gap-2 ${sizeConfig.button} ${className}`}
        style={{
          boxShadow: isOpen
            ? `0 0 0 3px ${COLORS.primary[500]}40, 0 4px 12px rgba(0,0,0,0.15)`
            : "0 2px 8px rgba(0,0,0,0.1)",
        }}
        aria-label="Share"
      >
        <motion.div
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Share2
            className={sizeConfig.icon}
            style={{ color: isOpen ? COLORS.primary[600] : COLORS.gray[700] }}
          />
        </motion.div>
        {showLabel && (
          <span
            className={`${sizeConfig.text} font-medium pr-1`}
            style={{ color: COLORS.gray[700] }}
          >
            Share
          </span>
        )}

        {/* Active indicator dot */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ background: COLORS.primary[500] }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Popup */}
      <SharePopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        buttonRef={buttonRef}
        platforms={platforms}
        onShare={handleShare}
        onCopyLink={handleCopyLink}
        copied={copied}
        sharing={sharing}
        shareUrl={shareUrl}
        title={title}
        description={description}
        imageUrl={imageUrl}
      />
    </div>
  );
}
