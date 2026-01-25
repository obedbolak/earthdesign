// File: components/DialogflowChatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { COLORS, GRADIENTS } from "@/lib/constants/colors";

// Message type
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function DialogflowChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your EarthDesignAI assistant. How can I help you find your perfect property today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Auto-greet user after delay
  useEffect(() => {
    // Check if user has been greeted before
    const hasBeenGreeted = sessionStorage.getItem("chatbot_greeted");

    if (!hasBeenGreeted) {
      // Show notification after 5 seconds
      const notificationTimer = setTimeout(() => {
        setShowNotification(true);
        setHasGreeted(true);
        sessionStorage.setItem("chatbot_greeted", "true");
      }, 5000);

      // Auto-hide notification after 10 seconds
      const hideTimer = setTimeout(() => {
        setShowNotification(false);
      }, 15000);

      return () => {
        clearTimeout(notificationTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  // Handle opening chat from notification
  const handleOpenFromNotification = () => {
    setShowNotification(false);
    setIsOpen(true);
  };

  // Send message to Dialogflow
  const sendToDialogflow = async (userMessage: string) => {
    setIsLoading(true);

    try {
      // Replace this with your actual Dialogflow API call
      const response = await fetch("/api/dialogflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId: `session-${Date.now()}`, // Generate unique session ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setIsLoading(false);
      return data.fulfillmentText || data.response;
    } catch (error) {
      console.error("Dialogflow error:", error);
      setIsLoading(false);

      // Fallback to mock responses if API fails
      const lowerMessage = userMessage.toLowerCase();

      if (
        lowerMessage.includes("hello") ||
        lowerMessage.includes("hi") ||
        lowerMessage.includes("hey")
      ) {
        return "Hello! I'm here to help you find the perfect property. Would you like to see properties for sale, for rent, or learn more about a specific area?";
      } else if (
        lowerMessage.includes("sale") ||
        lowerMessage.includes("buy")
      ) {
        return "Great! We have many properties for sale. Are you interested in villas, apartments, land, or commercial properties?";
      } else if (lowerMessage.includes("rent")) {
        return "We have excellent rental properties available. What type of property are you looking for? Apartment, house, or office space?";
      } else if (lowerMessage.includes("villa")) {
        return "We have stunning villas available! Would you like to see villas in Yaoundé, Douala, or another city?";
      } else if (lowerMessage.includes("apartment")) {
        return "I can show you our apartment listings. What's your preferred number of bedrooms?";
      } else if (
        lowerMessage.includes("price") ||
        lowerMessage.includes("cost")
      ) {
        return "What's your budget range? This will help me find properties that match your requirements.";
      } else if (
        lowerMessage.includes("location") ||
        lowerMessage.includes("where")
      ) {
        return "We have properties across Cameroon including Yaoundé, Douala, Bamenda, and more. Which area interests you?";
      } else if (lowerMessage.includes("thank")) {
        return "You're welcome! Is there anything else I can help you with?";
      } else {
        return "I can help you find properties, answer questions about listings, or connect you with our agents. What would you like to know?";
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Get bot response
    const botResponseText = await sendToDialogflow(inputText);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: "Properties for Sale", icon: "🏠" },
    { label: "Properties for Rent", icon: "🔑" },
    { label: "Contact Agent", icon: "📞" },
    { label: "View Locations", icon: "📍" },
  ];

  return (
    <>
      {/* Greeting Notification - Chat Bubble Style */}
      {showNotification && !isOpen && (
        <div className="fixed bottom-[4.5rem] sm:bottom-24 right-3 sm:right-6 z-50 animate-slideIn w-[calc(100vw-1.5rem)] max-w-[280px] sm:max-w-xs">
          <div
            onClick={handleOpenFromNotification}
            className="relative cursor-pointer group"
          >
            {/* Chat Bubble */}
            <div
              className="backdrop-blur-xl rounded-2xl shadow-2xl p-3 sm:p-4 border hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300"
              style={{
                background: `${COLORS.primary[900]}E6`,
                borderColor: `${COLORS.primary[500]}80`,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotification(false);
                }}
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition hover:scale-110 active:scale-95"
                style={{ background: `${COLORS.white}20` }}
                aria-label="Close notification"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>

              <div className="flex gap-2 sm:gap-3 pr-5 sm:pr-4">
                {/* AI Icon */}
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ background: GRADIENTS.button.primary }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm leading-relaxed">
                    👋 Hi! Need help finding your perfect property? I'm here to
                    assist!
                  </p>
                </div>
              </div>
            </div>

            {/* Pointer arrow */}
            <div
              className="absolute -bottom-2 right-5 sm:right-8 w-3 h-3 transform rotate-45"
              style={{
                background: `${COLORS.primary[900]}E6`,
                borderRight: `1px solid ${COLORS.primary[500]}80`,
                borderBottom: `1px solid ${COLORS.primary[500]}80`,
              }}
            />
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center group"
          style={{ background: GRADIENTS.button.primary }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7" />
          {hasGreeted && (
            <span
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold animate-pulse"
              style={{ background: COLORS.yellow[500] }}
            >
              !
            </span>
          )}
        </button>
      )}

      {/* Chat Window - FULLY RESPONSIVE */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col transition-all duration-300 backdrop-blur-xl
                      ${
                        isMinimized
                          ? "bottom-3 right-3 sm:bottom-6 sm:right-6 h-14 sm:h-16 w-72 sm:w-96 rounded-2xl"
                          : "inset-0 sm:inset-auto sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 h-[100dvh] sm:h-[85vh] sm:max-h-[650px] w-full sm:w-[400px] md:w-[420px] rounded-none sm:rounded-2xl"
                      }
                      border-0 sm:border shadow-2xl`}
          style={{
            background: `${COLORS.gray[900]}F2`,
            borderColor: `${COLORS.primary[600]}80`,
          }}
        >
          {/* Header */}
          <div
            className="p-3 sm:p-4 rounded-t-none sm:rounded-t-2xl flex items-center justify-between flex-shrink-0 backdrop-blur-sm border-b"
            style={{
              background: GRADIENTS.button.primary,
              borderColor: `${COLORS.primary[500]}40`,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: `${COLORS.white}30` }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">
                  EarthDesignAI
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <p className="text-[10px] sm:text-xs text-white opacity-90 truncate">
                    {isMinimized ? "Minimized" : "Online • Ready to help"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition hover:scale-110 active:scale-95 flex items-center justify-center hidden sm:flex"
                style={{ background: `${COLORS.white}20` }}
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition hover:scale-110 active:scale-95 flex items-center justify-center"
                style={{ background: `${COLORS.white}20` }}
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
                style={{
                  background: `${COLORS.gray[900]}CC`,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}
                      style={{
                        background:
                          message.sender === "user"
                            ? GRADIENTS.button.primary
                            : `${COLORS.primary[700]}80`,
                      }}
                    >
                      {message.sender === "user" ? (
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 py-2 backdrop-blur-sm border shadow-sm ${
                        message.sender === "user"
                          ? "rounded-tr-sm"
                          : "rounded-tl-sm"
                      }`}
                      style={{
                        background:
                          message.sender === "user"
                            ? GRADIENTS.button.primary
                            : `${COLORS.primary[800]}E6`,
                        borderColor:
                          message.sender === "user"
                            ? `${COLORS.primary[400]}60`
                            : `${COLORS.primary[600]}60`,
                      }}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed text-white break-words">
                        {message.text}
                      </p>
                      <p className="text-[9px] sm:text-[10px] mt-1 opacity-60 text-white">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                      style={{ background: `${COLORS.primary[700]}80` }}
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm border shadow-sm"
                      style={{
                        background: `${COLORS.primary[800]}E6`,
                        borderColor: `${COLORS.primary[600]}60`,
                      }}
                    >
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: COLORS.primary[400],
                            animationDelay: "0ms",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: COLORS.primary[400],
                            animationDelay: "150ms",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: COLORS.primary[400],
                            animationDelay: "300ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div
                  className="px-3 sm:px-4 py-2.5 sm:py-3 border-t flex-shrink-0 backdrop-blur-sm"
                  style={{
                    background: `${COLORS.gray[900]}CC`,
                    borderColor: `${COLORS.primary[700]}40`,
                  }}
                >
                  <p
                    className="text-[10px] sm:text-xs font-medium mb-2"
                    style={{ color: COLORS.primary[300] }}
                  >
                    Quick actions:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          setInputText(action.label);
                          setTimeout(handleSendMessage, 100);
                        }}
                        className="text-left px-2.5 py-2 rounded-lg text-[10px] sm:text-xs transition border backdrop-blur-sm flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                        style={{
                          background: `${COLORS.primary[800]}80`,
                          borderColor: `${COLORS.primary[600]}60`,
                          color: COLORS.white,
                        }}
                      >
                        <span className="text-sm flex-shrink-0">
                          {action.icon}
                        </span>
                        <span className="font-medium truncate leading-tight">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div
                className="p-3 sm:p-4 border-t rounded-b-none sm:rounded-b-2xl flex-shrink-0 backdrop-blur-sm"
                style={{
                  background: `${COLORS.gray[900]}E6`,
                  borderColor: `${COLORS.primary[700]}40`,
                  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
                }}
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl focus:outline-none focus:ring-2 text-xs sm:text-sm backdrop-blur-sm border text-white placeholder-gray-400 min-w-0 focus:ring-primary-500"
                    style={{
                      background: `${COLORS.primary[900]}80`,
                      borderColor: `${COLORS.primary[600]}60`,
                    }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 text-white rounded-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ background: GRADIENTS.button.primary }}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <p
                  className="text-[9px] sm:text-[10px] mt-2 text-center opacity-80"
                  style={{ color: COLORS.primary[400] }}
                >
                  Powered by Google Dialogflow AI
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS for animations and custom styles */}
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

        /* Custom scrollbar for webkit browsers */
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: ${COLORS.primary[700]}80;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: ${COLORS.primary[600]}CC;
        }

        /* Prevent text selection on buttons */
        button {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }
      `}</style>
    </>
  );
}
