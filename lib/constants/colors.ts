// lib/constants/colors.ts

export const COLORS = {
  // Forest-green brand palette
  primary: {
    50: '#f0f8f4',
    100: '#d9eee2',
    200: '#b5ddc8',
    300: '#83c4a4',
    400: '#4ba77c',
    500: '#16804f',
    600: '#0e7044',
    700: '#0b5b39',
    800: '#0a482f',
    900: '#083b28',
    950: '#05271b',
  },

  // Emerald
  emerald: {
    300: '#7ad3aa',
    400: '#42b982',
    500: '#169766',
    600: '#0e7b53',
    800: '#0b5a41',
    900: '#084b37',
    950: '#052e23',
  },

  // Teal
  teal: {
    500: '#198d78',
    800: '#145d50',
    950: '#0a332c',
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
    primary: 'linear-gradient(135deg, #0b5b39 0%, #084b37 50%, #0a332c 100%)',
    hero: 'linear-gradient(135deg, #0b5b39 0%, #145d50 50%, #083b28 100%)',
    card: 'linear-gradient(135deg, rgba(22, 128, 79, 0.12) 0%, rgba(22, 151, 102, 0.06) 100%)',
  },
  // Button gradients
  button: {
    primary: 'linear-gradient(135deg, #16804f 0%, #0e7044 100%)',
    secondary: 'linear-gradient(135deg, #239665 0%, #169766 100%)',
    hover: 'linear-gradient(135deg, #0e7044 0%, #0b5b39 100%)',
  },
  // Badge gradients
  badge: {
    primary: 'linear-gradient(135deg, #239665 0%, #169766 100%)',
    feature: 'linear-gradient(135deg, #239665 0%, #198d78 100%)',
    status: 'linear-gradient(135deg, #16804f 0%, #0e7b53 100%)',
  },
  // Text gradients
  text: {
    primary: 'linear-gradient(135deg, #83c4a4 0%, #7ad3aa 50%, #83c4a4 100%)',
    glow: 'linear-gradient(135deg, #b5ddc8 0%, #83c4a4 100%)',
  },
  // Overlay gradients
  overlay: {
    dark: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
    darkReverse: 'linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
    subtle: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
  },
  // Special effects
  glow: {
    primary: 'radial-gradient(circle, rgba(22, 128, 79, 0.15) 0%, transparent 70%)',
    strong: 'radial-gradient(circle, rgba(22, 128, 79, 0.3) 0%, transparent 70%)',
  },
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: '0 0 60px rgba(22, 128, 79, 0.3)',
  glowStrong: '0 0 80px rgba(22, 128, 79, 0.55)',
} as const;
