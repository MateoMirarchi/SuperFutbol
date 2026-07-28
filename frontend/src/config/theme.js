/**
 * theme.js
 * Centralización de la paleta de colores, tipografías y constantes visuales.
 * Todos los componentes y estilos deben referenciar estos valores.
 */

export const colors = {
  // Fondos
  bgDark: '#0A0F1E',
  bgCard: '#0D1A36',
  bgCardHover: '#132244',
  bgOverlay: 'rgba(10, 15, 30, 0.85)',

  // Primarios (azul eléctrico / celeste)
  primary: '#1E90FF',
  primaryLight: '#4AAEFF',
  primaryDark: '#0066CC',

  // Secundario (azul Francia)
  secondary: '#0056A8',
  secondaryLight: '#1A73C2',
  secondaryDark: '#003D7A',

  // Acento (cyan brillante)
  accent: '#00D4FF',
  accentDim: '#0099BB',

  // Textos
  textPrimary: '#E8F4FD',
  textSecondary: '#7FB3D3',
  textMuted: '#4A6F8A',

  // Estado
  success: '#00C853',
  danger: '#FF1744',
  warning: '#FFC107',

  // Bordes
  border: '#1A3A5C',
  borderFocus: '#1E90FF',
};

export const fonts = {
  primary: "'Segoe UI', 'Roboto', Arial, sans-serif",
  heading: "'Segoe UI', 'Roboto', Arial, sans-serif",
};

export const shadows = {
  card: '0 4px 24px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(30, 144, 255, 0.35)',
  glowStrong: '0 0 40px rgba(30, 144, 255, 0.6)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.07)',
};

export const transitions = {
  fast: '0.15s ease',
  normal: '0.25s ease',
  slow: '0.4s ease',
};
