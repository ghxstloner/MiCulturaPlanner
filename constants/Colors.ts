// Paleta de colores inspirada en la bandera de Panamá - Solo modo claro
const primaryRed = '#d21033';   // Rojo de la bandera panameña
const primaryBlue = '#005293';  // Azul de la bandera panameña

export default {
  light: {
    // Colores principales basados en la bandera de Panamá
    text: '#1A202C',
    textSecondary: '#718096',
    background: '#F4F6F8',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    // Colores de marca panameña
    tint: primaryBlue,
    primary: primaryBlue,
    primaryRed: primaryRed,
    secondary: primaryRed,
    accent: primaryBlue,
    
    // Estados y utilidades
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    info: primaryBlue,
    
    // Grises modernos para contraste óptimo
    greyLight: '#F7FAFC',
    greyMedium: '#A0AEC0',
    greyDark: '#4A5568',
    
    // Navegación
    tabIconDefault: '#A0AEC0',
    tabIconSelected: primaryBlue,
    
    // Bordes y separadores
    border: '#E2E8F0',
    divider: '#EDF2F7',
    
    // Overlays y sombras
    overlay: 'rgba(26, 32, 44, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};