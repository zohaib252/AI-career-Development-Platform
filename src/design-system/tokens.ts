/**
 * CareerPilot Design System Tokens
 * --------------------------------------------------------------------------
 * This file mirrors the CSS custom properties in `src/index.css` so TypeScript
 * components, charts, and templates can reference design tokens from one place.
 *
 * Spacing scale: 4 / 8 / 12 / 16 / 24 / 32px
 * Border radius: 12px (md) – 16px (lg)
 * Motion budget: 150ms – 250ms
 */

export const DESIGN_TOKENS = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },
  radius: {
    control: '10px',
    card: '12px',
    panel: '16px',
  },
  fontSizes: {
    xs: '0.75rem',     // 12px — metadata, captions
    sm: '0.875rem',    // 14px — dense UI controls, table cells
    base: '0.9375rem', // 15px — body prose
    lg: '1.125rem',    // 18px — card titles
    xl: '1.375rem',    // 22px — section headers
    '2xl': '1.75rem',  // 28px — page titles
    '3xl': '2.25rem',  // 36px — hero display
  },
  colors: {
    accent: {
      indigo: '#4f46e5',
      violet: '#7c3aed',
      indigoDark: '#6366f1',
      violetDark: '#8b5cf6',
    },
    semantic: {
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
  },
  motion: {
    fastMs: 150,
    normalMs: 220,
    easing: [0.16, 1, 0.3, 1] as const,
  },
} as const;
