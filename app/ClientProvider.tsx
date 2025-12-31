// app/ClientProvider.tsx
'use client';

import { ThemeProvider } from '@/lib/context/ThemeContext';
import { COLORS, GRADIENTS } from '@/lib/constants/colors';
import { SessionProvider } from 'next-auth/react';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <div 
        className="min-h-screen w-full relative"
        style={{
          background: GRADIENTS.background.primary,
        }}
      >
        {/* Animated Grid Background */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${COLORS.gray[400]}2e 1px, transparent 1px), linear-gradient(to bottom, ${COLORS.gray[400]}2e 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: GRADIENTS.background.hero,
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Bottom glow effect */}
        <div 
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-64 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(20, 83, 45, 0.2) 100%)',
          }}
        />
      </div>
      </SessionProvider>
    </ThemeProvider>
  );
}