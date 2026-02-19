/**
 * App color palette — 3-tier depth system for polished surfaces.
 *
 * Surface hierarchy (dark):
 *   background  → deepest layer (page)
 *   surfaceRaised → cards, tab bar, modals
 *   surfaceOverlay → inputs, search bars
 */

export const Colors = {
  light: {
    text: '#0E1116',
    textSecondary: '#656D76',
    textMuted: '#8B949E',
    background: '#FFFFFF',
    surfaceRaised: '#F5F6F8',
    surfaceOverlay: '#EBEDF0',
    tint: '#D94F35',
    icon: '#656D76',
    tabIconDefault: '#8B949E',
    tabIconSelected: '#D94F35',
    inputBackground: '#F5F6F8',
    inputBorder: '#D1D5DB',
    placeholder: '#8B949E',
    error: '#E5342D',
    cardBackground: '#F5F6F8',
    separator: '#D1D5DB',
  },
  dark: {
    text: '#E8EAED',
    textSecondary: '#8B929A',
    textMuted: '#5C6370',
    background: '#0f1114',
    surfaceRaised: '#1a1d21',
    surfaceOverlay: '#22262b',
    tint: '#E8583E',
    icon: '#7C8590',
    tabIconDefault: '#5C6370',
    tabIconSelected: '#E8583E',
    inputBackground: '#1a1d21',
    inputBorder: '#2e3238',
    placeholder: '#5C6370',
    error: '#F04438',
    cardBackground: '#1a1d21',
    separator: '#2e3238',
  },
};
