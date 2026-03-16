export const color = {
  white: "#ffffff",
  black: "#000000",

  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",

  red50: "#fef2f2",
  red100: "#fee2e2",
  red500: "#ef4444",
  red600: "#dc2626",
  red700: "#b91c1c",

  green50: "#f0fdf4",
  green100: "#dcfce7",
  green600: "#16a34a",
  green700: "#15803d",

  zinc100: "#f4f4f5",
  zinc600: "#52525b",
} as const;

export const radius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  full: "9999px",
} as const;

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
} as const;

export const spacing = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
} as const;

export const shadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
} as const;

export const transition = {
  fast: "150ms ease",
  normal: "200ms ease",
} as const;
