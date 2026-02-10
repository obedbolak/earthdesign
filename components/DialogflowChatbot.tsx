// components/DialogflowChatbot.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

const WHATSAPP_NUMBER = "237652149121";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in your properties. Could you help me find the right one?",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

// WhatsApp SVG Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function DialogflowChatbot() {
  const [showNotification, setShowNotification] = useState(false);

  // Auto-show notification after 5 seconds (once per session)
  useEffect(() => {
    const hasBeenGreeted = sessionStorage.getItem("chatbot_greeted");

    if (!hasBeenGreeted) {
      const showTimer = setTimeout(() => {
        setShowNotification(true);
        sessionStorage.setItem("chatbot_greeted", "true");
      }, 5000);

      const hideTimer = setTimeout(() => {
        setShowNotification(false);
      }, 15000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  return (
    <>
      {/* Greeting Notification Bubble */}
      {showNotification && (
        <div className="fixed bottom-[4.5rem] sm:bottom-24 right-3 sm:right-6 z-50 animate-slideIn w-[calc(100vw-1.5rem)] max-w-[280px] sm:max-w-xs">
          <div className="relative">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div
                className="backdrop-blur-xl rounded-2xl shadow-2xl p-3 sm:p-4 border hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300"
                style={{
                  background: "#075E54E6",
                  borderColor: "#25D36680",
                }}
              >
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowNotification(false);
                  }}
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition hover:scale-110 active:scale-95"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                  aria-label="Close notification"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>

                <div className="flex gap-2 sm:gap-3 pr-5 sm:pr-4">
                  {/* WhatsApp Icon */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg bg-[#25D366]">
                    <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm leading-relaxed">
                      👋 Hi! Need help finding your perfect property? Chat with
                      us on WhatsApp!
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-1">
                      Typically replies instantly
                    </p>
                  </div>
                </div>
              </div>
            </a>

            {/* Pointer arrow */}
            <div
              className="absolute -bottom-2 right-5 sm:right-8 w-3 h-3 transform rotate-45"
              style={{
                background: "#075E54E6",
                borderRight: "1px solid #25D36680",
                borderBottom: "1px solid #25D36680",
              }}
            />
          </div>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center group"
        style={{ background: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />

        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#25D366]" />

        {/* Notification dot */}
        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold text-white animate-pulse">
          1
        </span>
      </a>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }

        button {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
      `}</style>
    </>
  );
}
