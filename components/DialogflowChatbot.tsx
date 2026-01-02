// File: components/DialogflowChatbot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Loader2, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { COLORS, GRADIENTS } from '@/lib/constants/colors';

// Message type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function DialogflowChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your EarthDesignAI assistant. How can I help you find your perfect property today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Auto-greet user after delay
  useEffect(() => {
    // Check if user has been greeted before (using localStorage)
    const hasBeenGreeted = localStorage.getItem('chatbot_greeted');
    
    if (!hasBeenGreeted) {
      // Show notification after 5 seconds
      const notificationTimer = setTimeout(() => {
        setShowNotification(true);
        setHasGreeted(true);
        localStorage.setItem('chatbot_greeted', 'true');
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
      const response = await fetch('/api/dialogflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId: `session-${Date.now()}` // Generate unique session ID
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setIsLoading(false);
      return data.fulfillmentText || data.response;
      
    } catch (error) {
      console.error('Dialogflow error:', error);
      setIsLoading(false);
      
      // Fallback to mock responses if API fails
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm here to help you find the perfect property. Would you like to see properties for sale, for rent, or learn more about a specific area?";
      } else if (lowerMessage.includes('sale') || lowerMessage.includes('buy')) {
        return "Great! We have many properties for sale. Are you interested in villas, apartments, land, or commercial properties?";
      } else if (lowerMessage.includes('rent')) {
        return "We have excellent rental properties available. What type of property are you looking for? Apartment, house, or office space?";
      } else if (lowerMessage.includes('villa')) {
        return "We have stunning villas available! Would you like to see villas in Yaoundé, Douala, or another city?";
      } else if (lowerMessage.includes('apartment')) {
        return "I can show you our apartment listings. What's your preferred number of bedrooms?";
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "What's your budget range? This will help me find properties that match your requirements.";
      } else if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
        return "We have properties across Cameroon including Yaoundé, Douala, Bamenda, and more. Which area interests you?";
      } else if (lowerMessage.includes('thank')) {
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
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Get bot response
    const botResponseText = await sendToDialogflow(inputText);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: 'Properties for Sale', icon: '🏠' },
    { label: 'Properties for Rent', icon: '🔑' },
    { label: 'Contact Agent', icon: '📞' },
    { label: 'View Locations', icon: '📍' },
  ];

  return (
    <>
      {/* Greeting Notification - Chat Bubble Style */}
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-slideIn">
          <div 
            onClick={handleOpenFromNotification}
            className="relative cursor-pointer group"
          >
            {/* Chat Bubble */}
            <div 
              className="backdrop-blur-xl rounded-2xl shadow-2xl p-4 max-w-xs border hover:scale-105 transition-all duration-300"
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
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                style={{ background: `${COLORS.white}20` }}
                aria-label="Close notification"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex gap-3 pr-4">
                {/* AI Icon */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ background: GRADIENTS.button.primary }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">
                    👋 Hi! Need help finding your perfect property? I'm here to assist!
                  </p>
                </div>
              </div>
            </div>

            {/* Pointer arrow */}
            <div 
              className="absolute -bottom-2 right-8 w-3 h-3 transform rotate-45"
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
          className="fixed bottom-6 right-6 w-16 h-16 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group"
          style={{ background: GRADIENTS.button.primary }}
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7" />
          {hasGreeted && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
              style={{ background: COLORS.yellow[500] }}
            >
              !
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 backdrop-blur-xl border ${
            isMinimized ? 'h-16' : 'h-[600px]'
          } w-96 max-w-[calc(100vw-3rem)]`}
          style={{ 
            maxHeight: isMinimized ? '4rem' : '80vh',
            background: `${COLORS.gray[900]}F2`,
            borderColor: `${COLORS.primary[600]}80`,
          }}
        >
          {/* Header */}
          <div 
            className="p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0 backdrop-blur-sm border-b"
            style={{
              background: GRADIENTS.button.primary,
              borderColor: `${COLORS.primary[500]}40`,
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: `${COLORS.white}30` }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">EarthDesignAI Assistant</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-white opacity-90">Online • Ready to help</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-lg transition flex items-center justify-center"
                style={{ background: `${COLORS.white}20` }}
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
              >
                {isMinimized ? <Maximize2 className="w-5 h-5 text-white" /> : <Minimize2 className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg transition flex items-center justify-center"
                style={{ background: `${COLORS.white}20` }}
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ background: `${COLORS.gray[900]}CC` }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.sender === 'user'
                          ? ''
                          : ''
                      }`}
                      style={{
                        background: message.sender === 'user' 
                          ? GRADIENTS.button.primary 
                          : `${COLORS.primary[700]}80`
                      }}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 backdrop-blur-sm border ${
                        message.sender === 'user'
                          ? 'rounded-tr-none'
                          : 'rounded-tl-none'
                      }`}
                      style={{
                        background: message.sender === 'user'
                          ? GRADIENTS.button.primary
                          : `${COLORS.primary[800]}E6`,
                        borderColor: message.sender === 'user'
                          ? `${COLORS.primary[400]}60`
                          : `${COLORS.primary[600]}60`,
                      }}
                    >
                      <p className="text-sm leading-relaxed text-white">{message.text}</p>
                      <p className="text-[10px] mt-1 opacity-70 text-white">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: `${COLORS.primary[700]}80` }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div 
                      className="rounded-2xl rounded-tl-none px-4 py-3 backdrop-blur-sm border"
                      style={{
                        background: `${COLORS.primary[800]}E6`,
                        borderColor: `${COLORS.primary[600]}60`,
                      }}
                    >
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.primary[400], animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.primary[400], animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: COLORS.primary[400], animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div 
                  className="px-4 py-2 border-t flex-shrink-0 backdrop-blur-sm"
                  style={{
                    background: `${COLORS.gray[900]}CC`,
                    borderColor: `${COLORS.primary[700]}40`,
                  }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: COLORS.primary[300] }}>
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
                        className="text-left px-3 py-2 rounded-lg text-xs transition border backdrop-blur-sm flex items-center gap-2 hover:scale-105"
                        style={{
                          background: `${COLORS.primary[800]}80`,
                          borderColor: `${COLORS.primary[600]}60`,
                          color: COLORS.white,
                        }}
                      >
                        <span>{action.icon}</span>
                        <span className="font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div 
                className="p-4 border-t rounded-b-2xl flex-shrink-0 backdrop-blur-sm"
                style={{
                  background: `${COLORS.gray[900]}E6`,
                  borderColor: `${COLORS.primary[700]}40`,
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
                    className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 text-sm backdrop-blur-sm border text-white placeholder-gray-400"
                    style={{
                      background: `${COLORS.primary[900]}80`,
                      borderColor: `${COLORS.primary[600]}60`,
                    }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="px-4 py-3 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: GRADIENTS.button.primary }}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] mt-2 text-center" style={{ color: COLORS.primary[400] }}>
                  Powered by Google Dialogflow AI
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS for animations */}
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
      `}</style>
    </>
  );
}