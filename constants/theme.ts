// Dream Journal Theme
export const Colors = {
  // Backgrounds
  bg: '#080618',
  bgCard: '#0F0C24',
  bgCardAlt: '#16133A',
  surface: '#1C1945',
  surfaceLight: '#262350',

  // Brand
  primary: '#7B5EA7',
  primaryLight: '#B48EE8',
  primaryDark: '#5A4080',
  accent: '#F0C060',
  accentSoft: '#F5D585',
  accentPink: '#E87BB0',

  // Gradients (used as arrays)
  gradientCard: ['#13103080', '#0F0C2480'] as string[],
  gradientPrimary: ['#9B6EE8', '#6B4AAA'] as string[],
  gradientAccent: ['#F5D580', '#E8A030'] as string[],

  // Text
  textPrimary: '#F0EEFF',
  textSecondary: '#9B93C8',
  textMuted: '#4E4A72',
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#5EC87A',
  warning: '#F0C060',
  error: '#E06060',
  lucid: '#60C0E0',
  nightmare: '#E06080',
  recurring: '#C080E0',
  vivid: '#80D0A0',

  // UI
  border: '#201C4A',
  borderLight: '#2E2A60',
  borderGlow: '#7B5EA740',
  divider: '#141230',
  overlay: 'rgba(8,6,24,0.92)',
  transparent: 'transparent',

  // Glass
  glass: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 30,
  hero: 38,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,

  // Line Heights
  tight: 1.3,
  normal: 1.5,
  relaxed: 1.7,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 30,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  md: {
    shadowColor: '#7B5EA7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  lg: {
    shadowColor: '#B48EE8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
  },
  accent: {
    shadowColor: '#F0C060',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const DREAM_TAGS = [
  { id: 'lucid', label: 'Lucid', color: Colors.lucid },
  { id: 'nightmare', label: 'Nightmare', color: Colors.nightmare },
  { id: 'recurring', label: 'Recurring', color: Colors.recurring },
  { id: 'vivid', label: 'Vivid', color: Colors.vivid },
  { id: 'peaceful', label: 'Peaceful', color: Colors.success },
  { id: 'adventure', label: 'Adventure', color: Colors.accent },
  { id: 'strange', label: 'Strange', color: Colors.primaryLight },
  { id: 'emotional', label: 'Emotional', color: Colors.error },
];

export const WAKE_MOODS = [
  { id: 'refreshed', emoji: '😌', label: 'Refreshed' },
  { id: 'groggy', emoji: '😴', label: 'Groggy' },
  { id: 'anxious', emoji: '😟', label: 'Anxious' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'confused', emoji: '😵', label: 'Confused' },
  { id: 'energized', emoji: '⚡', label: 'Energized' },
];

export const ACCENT_COLORS = [
  { id: 'purple', label: 'Cosmic', primary: '#7B5EA7', light: '#B48EE8', accent: '#F0C060' },
  { id: 'blue', label: 'Ocean', primary: '#3B82C4', light: '#6FB0F0', accent: '#60E0D0' },
  { id: 'rose', label: 'Aurora', primary: '#A0527A', light: '#D884AB', accent: '#F0A060' },
  { id: 'emerald', label: 'Forest', primary: '#2E8B6A', light: '#5EC8A0', accent: '#A0E060' },
  { id: 'indigo', label: 'Nebula', primary: '#5050B0', light: '#8888E8', accent: '#E0B060' },
];
