/**
 * Sistema de diseño del Panel Familiar de Hábitos y Recompensas.
 * Usa ThemeProvider de styled-components para acceder al tema.
 */

// Propiedades compartidas entre temas
const sharedTheme = {
  HABIT_COLORS: {
    sleep:        '#6366F1',
    movement:     '#22C55E',
    food:         '#F97316',
    study:        '#3B82F6',
    cleaning:     '#EAB308',
    coexistence:  '#EC4899',
    household:    '#14B8A6',
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px',
    lg: '24px', xl: '32px', xxl: '48px',
  },
  typography: {
    fontFamily: "'Nunito', 'Inter', sans-serif",
    sizes: {
      xs: '12px', sm: '14px', md: '16px',
      lg: '20px', xl: '24px', display: '32px',
    },
    weights: { normal: 400, medium: 500, bold: 700, black: 900 },
  },
  borderRadius: {
    sm: '8px', md: '12px', lg: '16px', xl: '24px',
  },
  shadows: {
    card: '0 2px 8px rgba(0,0,0,0.06)',
    hover: '0 4px 16px rgba(0,0,0,0.10)',
  },
  animations: {
    fast:   '0.15s ease',
    normal: '0.25s ease',
    slow:   '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  points: {
    gold:   '#F59E0B',
    silver: '#94A3B8',
    bronze: '#B45309',
  },
  sizes: {
    bottomNavHeight: '80px',
    appHeaderHeight: '56px',
    touchTarget: '44px',
    progressRingLarge: '130px',
    progressRingSmall: '72px',
    containerMax: '480px',
  },
};

// Tema claro (default)
export const lightTheme = {
  ...sharedTheme,
  colors: {
    primary: '#6366F1',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
};

// Tema oscuro
export const darkTheme = {
  ...sharedTheme,
  colors: {
    primary: '#6366F1',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    background: '#0F172A',
    surface: '#1E293B',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
  },
};

// Mantener export de theme para compatibilidad durante migración
export const theme = lightTheme;

export default theme;
