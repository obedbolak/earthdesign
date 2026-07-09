// lib/constants/colors.ts

export const COLORS = {
  // Primary greens (unchanged)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Emerald (unchanged)
  emerald: {
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Teal (unchanged)
  teal: {
    500: '#14b8a6',
    800: '#115e59',
    950: '#042f2e',
  },

  // Neutrals (unchanged)
  gray: {
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Accent colors – EXTENDED
  yellow: {
    300: '#fde68a',  // added (for softer accents if needed)
    400: '#fbbf24',  // existing
    500: '#f59e0b',  // added – used in some components
  },

  // Semantic colors
  white: '#ffffff',
  black: '#000000',
} as const;

export const GRADIENTS = {
  // Background gradients
  background: {
    primary: 'linear-gradient(135deg, #14532d 0%, #064e3b 50%, #042f2e 100%)',
    hero: 'linear-gradient(135deg, #14532d 0%, #115e59 50%, #052e16 100%)',
    card: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
  },
  // Button gradients
  button: {
    primary: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
    secondary: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    hover: 'linear-gradient(135deg, #15803d 0%, #047857 100%)',
  },
  // Badge gradients
  badge: {
    primary: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    feature: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
    status: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
  },
  // Text gradients
  text: {
    primary: 'linear-gradient(135deg, #4ade80 0%, #34d399 50%, #4ade80 100%)',
    glow: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
  },
  // Overlay gradients
  overlay: {
    dark: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
    darkReverse: 'linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
    subtle: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
  },
  // Special effects
  glow: {
    primary: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
    strong: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
  },
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: '0 0 60px rgba(34, 197, 94, 0.5)',
  glowStrong: '0 0 80px rgba(34, 197, 94, 0.8)',
} as const;