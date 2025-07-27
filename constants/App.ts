/**
 * Application Constants - ULTRATHINK Methodology
 * 
 * Centralized constants for the MiCultura app following best practices:
 * - Organized by domain
 * - Type-safe with TypeScript
 * - Well-documented
 * - Easy to maintain and modify
 */

// =============================================================================
// APP METADATA
// =============================================================================

export const APP_INFO = {
  NAME: 'MiCultura',
  FULL_NAME: 'MiCultura - Sistema de Asistencia Digital',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de asistencia a eventos culturales del Ministerio de Cultura de Panamá',
  ORGANIZATION: 'Ministerio de Cultura',
  COUNTRY: 'República de Panamá',
} as const;

// =============================================================================
// BRANDING AND DESIGN
// =============================================================================

export const BRAND_COLORS = {
  PANAMA_RED: '#d21033',
  PANAMA_BLUE: '#005293',
  PANAMA_WHITE: '#FFFFFF',
  ACCENT: '#1B4D8C',
} as const;

export const TYPOGRAPHY = {
  FONT_FAMILY: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  WEIGHTS: {
    LIGHT: '300',
    REGULAR: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64,
} as const;

export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  XXL: 24,
  ROUND: 9999,
} as const;

// =============================================================================
// TIMING AND ANIMATIONS
// =============================================================================

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SPLASH: 3000,
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  API_CALL: 1000,
} as const;

export const TIMEOUT_DURATIONS = {
  API_REQUEST: 30000, // 30 seconds
  CAMERA_CAPTURE: 60000, // 1 minute
  LOGIN: 15000, // 15 seconds
} as const;

// =============================================================================
// UI COMPONENTS
// =============================================================================

export const BUTTON_HEIGHTS = {
  SM: 36,
  MD: 44,
  LG: 56,
} as const;

export const INPUT_HEIGHTS = {
  SM: 40,
  MD: 48,
  LG: 56,
} as const;

export const MODAL_SIZES = {
  SM: '30%',
  MD: '50%',
  LG: '70%',
  XL: '90%',
} as const;

// =============================================================================
// BUSINESS LOGIC
// =============================================================================

export const EVENT_STATUS = {
  PROGRAMADO: 'programado',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
} as const;

export const EVENT_CATEGORIES = {
  TEATRO: 'teatro',
  MUSICA: 'musica',
  DANZA: 'danza',
  ARTES_VISUALES: 'artes_visuales',
  LITERATURA: 'literatura',
  CINE: 'cine',
  PATRIMONIO: 'patrimonio',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'presente',
  ABSENT: 'ausente',
  LATE: 'tardanza',
  EXCUSED: 'excusado',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinador',
  STAFF: 'personal',
  VOLUNTEER: 'voluntario',
} as const;

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    ALLOWED_CHARS: /^[a-zA-Z0-9._-]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 100,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE_PANAMA: {
    PATTERN: /^[2-9]\d{7}$|^6\d{7}$/,
    LENGTH: 8,
  },
  CEDULA_PANAMA: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 11,
    PATTERN: /^\d{8,11}$/,
  },
} as const;

// =============================================================================
// GEOLOCATION
// =============================================================================

export const PANAMA_BOUNDS = {
  NORTH: 9.6469,
  SOUTH: 7.2056,
  EAST: -77.1584,
  WEST: -83.0517,
} as const;

export const DEFAULT_LOCATION = {
  LATITUDE: 8.9824, // Panama City
  LONGITUDE: -79.5199,
  ACCURACY_THRESHOLD: 100, // meters
} as const;

export const GEOFENCE_RADIUS = {
  SMALL_VENUE: 25, // meters
  MEDIUM_VENUE: 50,
  LARGE_VENUE: 100,
  OUTDOOR_EVENT: 200,
} as const;

// =============================================================================
// CAMERA AND MEDIA
// =============================================================================

export const CAMERA_SETTINGS = {
  QUALITY: 0.8,
  ASPECT_RATIO: [4, 3] as [number, number],
  FACE_DETECTION: true,
  AUTO_FOCUS: true,
} as const;

export const IMAGE_SETTINGS = {
  MAX_WIDTH: 800,
  MAX_HEIGHT: 600,
  COMPRESSION: 0.8,
  FORMAT: 'JPEG',
} as const;

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_INFO: '@user_info',
  APP_SETTINGS: '@app_settings',
  CACHED_EVENTS: '@cached_events',
  THEME_PREFERENCE: '@theme_preference',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  PERFORMANCE_METRICS: '@performance_metrics',
} as const;

// =============================================================================
// API ENDPOINTS (relative paths)
// =============================================================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  EVENTS: {
    LIST: '/eventos',
    DETAIL: '/eventos/:id',
    PLANIFICATION: '/planificacion/:id',
    ATTENDANCE: '/asistencia',
  },
  USERS: {
    PROFILE: '/usuarios/perfil',
    UPDATE: '/usuarios/actualizar',
  },
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  NETWORK: {
    NO_CONNECTION: 'Sin conexión a internet. Verifique su conectividad.',
    TIMEOUT: 'La solicitud tardó demasiado en responder. Intente nuevamente.',
    SERVER_ERROR: 'Error del servidor. Intente nuevamente más tarde.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
    SESSION_EXPIRED: 'Su sesión ha expirado. Inicie sesión nuevamente.',
    UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es obligatorio.',
    INVALID_EMAIL: 'Ingrese un email válido.',
    INVALID_PHONE: 'Ingrese un número de teléfono válido.',
    INVALID_CEDULA: 'Ingrese una cédula válida.',
    PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} caracteres.`,
  },
  CAMERA: {
    PERMISSION_DENIED: 'Se necesita acceso a la cámara para registrar asistencia.',
    CAPTURE_FAILED: 'No se pudo capturar la foto. Intente nuevamente.',
    PROCESSING_FAILED: 'Error al procesar la imagen.',
  },
  LOCATION: {
    PERMISSION_DENIED: 'Se necesita acceso a la ubicación para verificar asistencia.',
    OUT_OF_RANGE: 'Está demasiado lejos del evento para registrar asistencia.',
    ACCURACY_LOW: 'La precisión de la ubicación es insuficiente.',
  },
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Bienvenido al sistema MiCultura.',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente.',
    PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  },
  ATTENDANCE: {
    MARKED_SUCCESS: 'Asistencia registrada exitosamente.',
    ALREADY_MARKED: 'Su asistencia ya fue registrada para este evento.',
  },
  GENERAL: {
    DATA_SAVED: 'Datos guardados correctamente.',
    DATA_REFRESHED: 'Información actualizada.',
  },
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  BIOMETRIC_AUTH: false,
  OFFLINE_MODE: false,
  ANALYTICS: true,
  PERFORMANCE_MONITORING: true,
  PUSH_NOTIFICATIONS: true,
  DARK_MODE: false, // Disabled as per user requirements
  FACIAL_RECOGNITION: true,
  GEOLOCATION_VERIFICATION: true,
} as const;

// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================

export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 16, // milliseconds (60fps)
  RENDER_TIME_ERROR: 33, // milliseconds (30fps)
  MEMORY_WARNING: 100, // MB
  MEMORY_ERROR: 200, // MB
  API_RESPONSE_WARNING: 2000, // milliseconds
  API_RESPONSE_ERROR: 5000, // milliseconds
} as const;

// =============================================================================
// ACCESSIBILITY
// =============================================================================

export const ACCESSIBILITY = {
  MIN_TOUCH_TARGET: 44, // minimum touch target size
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3,
  },
  FOCUS_RING_WIDTH: 2,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  APP_INFO,
  BRAND_COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  ANIMATION_DURATION,
  DEBOUNCE_DELAYS,
  TIMEOUT_DURATIONS,
  BUTTON_HEIGHTS,
  INPUT_HEIGHTS,
  MODAL_SIZES,
  EVENT_STATUS,
  EVENT_CATEGORIES,
  ATTENDANCE_STATUS,
  USER_ROLES,
  VALIDATION_RULES,
  PANAMA_BOUNDS,
  DEFAULT_LOCATION,
  GEOFENCE_RADIUS,
  CAMERA_SETTINGS,
  IMAGE_SETTINGS,
  SUPPORTED_IMAGE_FORMATS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  PERFORMANCE_THRESHOLDS,
  ACCESSIBILITY,
};