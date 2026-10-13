/** Design tokens - same palette as the website (tailwind.config.ts): clay = brand orange, moss = teal, ink = navy. */
export const colors = {
  clay: { 50: "#fff4ef", 100: "#ffe4d8", 200: "#ffc7b0", 300: "#ffa183", 400: "#ff774f", 500: "#f9582a", 600: "#da3f14", 700: "#b43010", 800: "#8f2813", 900: "#752414" },
  moss: { 50: "#effcf9", 100: "#d5f6ef", 200: "#aeeadf", 300: "#7cd8ca", 400: "#46bfb0", 500: "#25a395", 600: "#1b8379", 700: "#1a6a63", 800: "#1a554f", 900: "#19463f" },
  ink: { 50: "#f6f7fb", 100: "#eceef5", 200: "#dde0ec", 300: "#bcc1d6", 400: "#8a91ae", 500: "#646c8a", 600: "#4a5270", 700: "#363d58", 800: "#1f2540", 900: "#0f1228" },
  paper: "#ffffff",
  danger: "#c62828",
  dangerBg: "#fdecea",
  warnBg: "#fff4e0",
  warn: "#9a5b00",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export const shadow = {
  card: { shadowColor: "#0f1228", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
} as const;
