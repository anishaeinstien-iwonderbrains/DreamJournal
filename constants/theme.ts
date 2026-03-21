// Dream Journal Theme — Liquid Glass Edition
export const Colors = {
  // Backgrounds — very deep, near-black so glass has contrast to blur against
  bg: '#04030C',
  bgCard: 'rgba(255,255,255,0.06)',   // kept for non-blur fallback
  bgCardAlt: 'rgba(255,255,255,0.09)',
  surface: 'rgba(255,255,255,0.04)',
  surfaceLight: 'rgba(255,255,255,0.10)',

  // Brand
  primary: '#8B6FE8',
  primaryLight: '#C4AAFF',
  primaryDark: '#5A40B0',
  accent: '#FFD060',
  accentSoft: '#FFE599',
  accentPink: '#FF80C0',

  // Text
  textPrimary: '#F4F0FF',
  textSecondary: '#B0A4D8',
  textMuted: '#5C5280',
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#50E88A',
  warning: '#FFD060',
  error: '#FF6070',
  lucid: '#40D8FF',
  nightmare: '#FF5080',
  recurring: '#D060FF',
  vivid: '#60FFB0',

  // UI chrome
  border: 'rgba(255,255,255,0.10)',
  borderLight: 'rgba(255,255,255,0.22)',
  divider: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(4,3,12,0.88)',
  transparent: 'transparent',

  // Liquid Glass tokens
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.15)',
  glassHighlight: 'rgba(255,255,255,0.50)',   // bright shimmer line
  glassShadow: 'rgba(0,0,0,0.50)',
  glassInner: 'rgba(255,255,255,0.04)',
  glassSpecular: 'rgba(255,255,255,0.30)',    // top-edge reflection gradient start
};

export const Typography = {
  xs: 11,
  sm: 13,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 30,
  hero: 38,

  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,

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
    shadowColor: '#8B6FE8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#8B6FE8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  lg: {
    shadowColor: '#C4AAFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.40,
    shadowRadius: 28,
    elevation: 16,
  },
  accent: {
    shadowColor: '#FFD060',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: '#8B6FE8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
};

export const DREAM_TAGS = [
  { id: 'lucid',     label: 'Lucid',     color: '#40D8FF' },
  { id: 'nightmare', label: 'Nightmare', color: '#FF5080' },
  { id: 'recurring', label: 'Recurring', color: '#D060FF' },
  { id: 'vivid',     label: 'Vivid',     color: '#60FFB0' },
  { id: 'peaceful',  label: 'Peaceful',  color: '#50E88A' },
  { id: 'adventure', label: 'Adventure', color: '#FFD060' },
  { id: 'strange',   label: 'Strange',   color: '#C4AAFF' },
  { id: 'emotional', label: 'Emotional', color: '#FF8090' },
];

export const WAKE_MOODS = [
  { id: 'refreshed',  emoji: '😌', label: 'Refreshed' },
  { id: 'groggy',     emoji: '😴', label: 'Groggy' },
  { id: 'anxious',    emoji: '😟', label: 'Anxious' },
  { id: 'happy',      emoji: '😊', label: 'Happy' },
  { id: 'confused',   emoji: '😵', label: 'Confused' },
  { id: 'energized',  emoji: '⚡', label: 'Energized' },
];

// Vivid accent palettes — each supplies primary, light, accent, glow
export const ACCENT_COLORS = [
  {
    id: 'purple',
    label: 'Cosmic',
    primary: '#8B6FE8',
    light: '#C4AAFF',
    accent: '#FFD060',
    glow: 'rgba(139,111,232,0.50)',
  },
  {
    id: 'blue',
    label: 'Ocean',
    primary: '#2E9AFF',
    light: '#80D0FF',
    accent: '#30FFE8',
    glow: 'rgba(46,154,255,0.50)',
  },
  {
    id: 'rose',
    label: 'Aurora',
    primary: '#FF5BA7',
    light: '#FFB0D6',
    accent: '#FFB830',
    glow: 'rgba(255,91,167,0.50)',
  },
  {
    id: 'emerald',
    label: 'Verdant',
    primary: '#00C87A',
    light: '#60FFB8',
    accent: '#B0FF60',
    glow: 'rgba(0,200,122,0.50)',
  },
  {
    id: 'indigo',
    label: 'Nebula',
    primary: '#6040E0',
    light: '#9E80FF',
    accent: '#FF80E0',
    glow: 'rgba(96,64,224,0.50)',
  },
];
