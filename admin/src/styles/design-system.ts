/**
 * Design System Constants
 * Central design tokens for consistent UI across the application
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
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Typography
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
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Animation durations
export const ANIMATION = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// Breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Common UI patterns
export const UI_PATTERNS = {
  pageMaxWidth: '1440px',
  contentMaxWidth: '1200px',
  sidebarWidth: '280px',
  headerHeight: '64px',
  mobileHeaderHeight: '56px',
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
