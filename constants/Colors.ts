// Paleta de colores inspirada en la bandera de Panamá - Solo modo claro
const primaryRed = '#d21033';   // Rojo de la bandera panameña
const primaryBlue = '#005293';  // Azul de la bandera panameña

export default {
  light: {
    // Colores principales basados en la bandera de Panamá
    text: '#1A202C',
    textSecondary: '#4A5568', // Más oscuro para mejor contraste
    background: '#F4F6F8',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    // Colores de marca panameña
    tint: primaryBlue,
    primary: primaryBlue,
    primaryRed: primaryRed,
    secondary: primaryRed,
    accent: primaryBlue,
    
    // Estados y utilidades - COLORES CORREGIDOS
    success: '#16A085', // Verde más sutil y profesional
    warning: '#F39C12', // Naranja más balanceado
    error: '#E74C3C',   // Rojo menos agresivo
    info: primaryBlue,
    
    // Grises modernos para contraste óptimo
    greyLight: '#F8F9FA',
    greyMedium: '#6C757D', // Más oscuro para mejor legibilidad
    greyDark: '#343A40',
    
    // Navegación
    tabIconDefault: '#6C757D',
    tabIconSelected: primaryBlue,
    
    // Bordes y separadores
    border: '#DEE2E6',
    divider: '#E9ECEF',
    
    // Overlays y sombras
    overlay: 'rgba(26, 32, 44, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.08)', // Sombra más sutil para iOS
  },
};