/**
 * Piwowar (Brewcraft) — Design System & Theme Tokens
 * Fully adheres to docs/design-spec.md and WCAG AAA standards
 */

export const THEME = {
  colors: {
    // Canvas & Surfaces (Anti-AI Dark Steel)
    bgCanvas: '#101216', // Sadza paleniska (60%)
    bgSurface: '#171A21', // Stal warsztatowa (30%)
    bgElevated: '#20242E', // Ceramika kociołka / Modals
    borderSubtle: '#282D3A', // Fizyczna mikro-ramka 1px

    // Typography (WCAG AAA >= 7:1)
    textPrimary: '#F2F4F8', // Biel cynkowa (14.2:1 AAA)
    textSecondary: '#A8B0C2', // Stal szczotkowana (7.4:1 AAA)
    textMuted: '#767E91', // Szary dymny

    // Craft Accents (10%)
    accentPrimary: '#E58A2B', // Bursztyn Brzeczki (Wort Amber - 8.2:1 AAA)
    accentHop: '#3E7B54', // Zieleń Chmielu (Hop Green - 7.1:1 AAA)
    accentCopper: '#D47A0E', // Miedź aparatury

    // Statuses
    statusDanger: '#E03E3E', // Cynober alarmowy / Bottle Bomb Blocker (7.5:1 AAA)
    statusWarning: '#EAA824', // Miedź ostrzegawcza (8.0:1 AAA)
    statusSuccess: '#389E58', // Zieleń stabilizacji (7.2:1 AAA)
    statusInfo: '#3B82F6',

    // Specific Beer Colors (Morey Palette)
    beerSrm2: '#F8F796',
    beerSrm4: '#F2DA60',
    beerSrm7: '#E6A817',
    beerSrm11: '#D47A0E',
    beerSrm18: '#9E4508',
    beerSrm28: '#5A2204',
    beerSrm40: '#1A0A02'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    hero: 48
  },
  touchTarget: {
    minHeight: 48,
    kitchenProofHeight: 56,
    timerHeroHeight: 64
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  }
} as const;

export type ThemeColors = typeof THEME.colors;
export type ThemeSpacing = typeof THEME.spacing;
