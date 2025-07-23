const tintColorLight = '#1B4D8C'; // Azul institucional del MinCultura Panamá
const tintColorDark = '#4A90D9';

export default {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    tint: tintColorLight,
    primary: tintColorLight,
    secondary: '#D4AF37', // Dorado cultural
    accent: '#8B5A3C', // Terracota
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    greyLight: '#E9ECEF',
    greyMedium: '#6C757D',
    greyDark: '#495057',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F1419',
    surface: '#1A1F24',
    card: '#252A30',
    tint: tintColorDark,
    primary: tintColorDark,
    secondary: '#F4D03F', // Dorado más brillante para modo oscuro
    accent: '#CD853F', // Terracota más claro
    success: '#32CD32',
    warning: '#FFD700',
    error: '#FF6B6B',
    greyLight: '#3A3F47',
    greyMedium: '#8E9297',
    greyDark: '#C7C9CC',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};