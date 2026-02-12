/**
 * Premium Design System
 * Elegant design tokens for a sophisticated admin portal
 */

// Spacing scale (in pixels, use with Tailwind classes)
export const SPACING = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '5rem',   // 80px
} as const;

// Premium Border Radius
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.625rem',   // 10px
  lg: '0.875rem',   // 14px
  xl: '1.125rem',   // 18px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
} as const;

// Premium Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Premium Shadows with layered depth
export const SHADOWS = {
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.2)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: '0 0 20px rgb(70 95 255 / 0.15)',
  'glow-lg': '0 0 40px rgb(70 95 255 / 0.2)',
} as const;

// Z-index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  offcanvas: 1055,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

// Premium Animation System
export const ANIMATION = {
  fastest: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slowest: '700ms',
  // Easing functions
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

// Breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Premium UI Patterns
export const UI_PATTERNS = {
  pageMaxWidth: '1600px',
  contentMaxWidth: '1280px',
  sidebarWidthExpanded: '280px',
  sidebarWidthCollapsed: '80px',
  headerHeight: '72px',
  mobileHeaderHeight: '64px',
  cardPadding: '1.5rem',
  cardPaddingLarge: '2rem',
} as const;

// Glassmorphism effects
export const GLASS = {
  light: 'rgba(255, 255, 255, 0.7)',
  medium: 'rgba(255, 255, 255, 0.5)',
  dark: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'blur(12px)',
  backdropStrong: 'blur(20px)',
} as const;

// Status colors mapping
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'light',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'success',
  cancelled: 'error',
  processing: 'info',
  draft: 'light',
} as const;

// Button sizes
export const BUTTON_SIZES = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-base',
} as const;

// Input sizes
export const INPUT_SIZES = {
  sm: 'h-9 px-3 py-1.5 text-sm',
  md: 'h-11 px-4 py-2.5 text-sm',
  lg: 'h-12 px-4 py-3 text-base',
} as const;

// Table cell padding
export const TABLE_PADDING = {
  compact: 'px-3 py-2',
  normal: 'px-4 py-3',
  comfortable: 'px-6 py-4',
} as const;

// Common transitions
export const TRANSITIONS = {
  default: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
} as const;

// Card variants
export const CARD_VARIANTS = {
  default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm',
  elevated: 'bg-white dark:bg-gray-900 rounded-xl shadow-md',
  outlined: 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl',
} as const;

// Form field spacing
export const FORM_SPACING = {
  fieldGap: 'space-y-4',
  labelMargin: 'mb-1.5',
  hintMargin: 'mt-1.5',
  sectionGap: 'space-y-6',
} as const;

// Icon sizes
export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
} as const;

// Loading states
export const LOADING_SPINNER = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
} as const;
