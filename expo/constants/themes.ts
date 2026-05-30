export type ThemeId = 'classic' | 'rose' | 'cherry' | 'lavender' | 'gold';

export interface AppTheme {
  id: ThemeId;
  name: string;
  proOnly: boolean;
  background: [string, string, string];
  primary: string;
  title: string;
  boardBorder: string;
  cellBg: string;
}

export const THEMES: AppTheme[] = [
  {
    id: 'classic',
    name: 'Classic Valentine',
    proOnly: false,
    background: ['#FFB6C1', '#FFB6C1', '#FF9CAD'],
    primary: '#8B0000',
    title: '#8B0000',
    boardBorder: '#FFFFFF',
    cellBg: 'rgba(255, 255, 255, 0.15)',
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    proOnly: true,
    background: ['#FFE4E8', '#FFB7C5', '#E75480'],
    primary: '#9B1B30',
    title: '#7A1025',
    boardBorder: '#FFF0F3',
    cellBg: 'rgba(255, 240, 243, 0.35)',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    proOnly: true,
    background: ['#FFF5F7', '#FFD6E0', '#FF8FAB'],
    primary: '#C2185B',
    title: '#880E4F',
    boardBorder: '#FFFFFF',
    cellBg: 'rgba(255, 255, 255, 0.25)',
  },
  {
    id: 'lavender',
    name: 'Lavender Love',
    proOnly: true,
    background: ['#F3E8FF', '#E9D5FF', '#C4B5FD'],
    primary: '#6D28D9',
    title: '#4C1D95',
    boardBorder: '#FAF5FF',
    cellBg: 'rgba(250, 245, 255, 0.4)',
  },
  {
    id: 'gold',
    name: 'Golden Hearts',
    proOnly: true,
    background: ['#FFF8E7', '#FFE8A3', '#F4C430'],
    primary: '#8B6914',
    title: '#5C4A0E',
    boardBorder: '#FFFBEB',
    cellBg: 'rgba(255, 251, 235, 0.45)',
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'classic';

export function getThemeById(id: ThemeId): AppTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
