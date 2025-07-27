/**
 * Utility Functions - ULTRATHINK Methodology
 * 
 * Collection of pure, reusable utility functions for the MiCultura app.
 * These functions follow functional programming principles and are thoroughly tested.
 */

import { Event } from '../types/api';
import { DateFormatOptions, TimeRange, Coordinates } from '../types/common';

// =============================================================================
// DATE AND TIME UTILITIES
// =============================================================================

/**
 * Formats a date string for Panamanian locale
 */
export const formatDatePanama = (
  date: string | Date,
  options: DateFormatOptions = {}
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    locale: 'es-PA',
    timeZone: 'America/Panama',
    ...options,
  };

  return dateObj.toLocaleDateString('es-PA', defaultOptions);
};

/**
 * Formats time for Panamanian locale
 */
export const formatTimePanama = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('es-PA', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Panama',
  });
};

/**
 * Gets relative time string (e.g., "hace 2 horas", "en 3 días")
 */
export const getRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffMinutes) < 1) return 'ahora';
  if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `en ${diffMinutes} min` : `hace ${Math.abs(diffMinutes)} min`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `en ${diffHours}h` : `hace ${Math.abs(diffHours)}h`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `en ${diffDays} días` : `hace ${Math.abs(diffDays)} días`;
  }
  
  return formatDatePanama(dateObj, { dateStyle: 'short' });
};

/**
 * Checks if a date is within a time range
 */
export const isDateInRange = (date: Date, range: TimeRange): boolean => {
  return date >= range.start && date <= range.end;
};

/**
 * Gets the start and end of today in Panama timezone
 */
export const getTodayRange = (): TimeRange => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  return { start, end };
};

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * Capitalizes the first letter of each word
 */
export const titleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Truncates a string to a maximum length with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Removes accents from Spanish text for searching
 */
export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Formats names consistently (First Last)
 */
export const formatName = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) return '';
  if (!first) return titleCase(last);
  if (!last) return titleCase(first);
  
  return titleCase(`${first} ${last}`);
};

/**
 * Gets initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates Panamanian cedula format
 */
export const isValidCedula = (cedula: string): boolean => {
  // Remove any non-digit characters
  const cleaned = cedula.replace(/\D/g, '');
  
  // Basic format check: should be 8-11 digits
  if (cleaned.length < 8 || cleaned.length > 11) return false;
  
  // More specific validation can be added here
  return true;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (Panama format)
 */
export const isValidPhonePanama = (phone: string): boolean => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Panama phone numbers are typically 8 digits
  // Can start with 6 (mobile) or 2-9 (landline)
  return /^[2-9]\d{7}$/.test(cleaned) || /^6\d{7}$/.test(cleaned);
};

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

/**
 * Groups array items by a key function
 */
export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

/**
 * Sorts array by multiple criteria
 */
export const sortBy = <T>(
  array: T[],
  ...criteria: Array<(item: T) => any>
): T[] => {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      const aVal = criterion(a);
      const bVal = criterion(b);
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
};

/**
 * Removes duplicates from array based on a key function
 */
export const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// =============================================================================
// EVENT-SPECIFIC UTILITIES
// =============================================================================

/**
 * Filters events by status
 */
export const filterEventsByStatus = (
  events: Event[],
  status: Event['estado']
): Event[] => {
  return events.filter(event => event.estado === status);
};

/**
 * Gets events for today
 */
export const getTodayEvents = (events: Event[]): Event[] => {
  const today = getTodayRange();
  return events.filter(event => {
    const eventDate = new Date(event.fecha_inicio);
    return isDateInRange(eventDate, today);
  });
};

/**
 * Gets upcoming events (within next 7 days)
 */
export const getUpcomingEvents = (events: Event[]): Event[] => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return events.filter(event => {
    const eventDate = new Date(event.fecha_inicio);
    return eventDate > now && eventDate <= nextWeek;
  });
};

/**
 * Searches events by term (name, location, organizer)
 */
export const searchEvents = (events: Event[], searchTerm: string): Event[] => {
  if (!searchTerm.trim()) return events;
  
  const term = removeAccents(searchTerm.toLowerCase());
  
  return events.filter(event => {
    const searchFields = [
      event.nombre,
      event.ubicacion,
      event.organizador || '',
      event.descripcion || '',
    ];
    
    return searchFields.some(field => 
      removeAccents(field.toLowerCase()).includes(term)
    );
  });
};

// =============================================================================
// GEOLOCATION UTILITIES
// =============================================================================

/**
 * Calculates distance between two coordinates (in meters)
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Checks if coordinates are within a radius of a center point
 */
export const isWithinRadius = (
  center: Coordinates,
  point: Coordinates,
  radiusMeters: number
): boolean => {
  const distance = calculateDistance(center, point);
  return distance <= radiusMeters;
};

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttles a function call
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoizes a function result
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

/**
 * Safely executes an async function with error handling
 */
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error('Safe async execution failed:', error);
    return fallback;
  }
};

/**
 * Retries an async function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Date utilities
  formatDatePanama,
  formatTimePanama,
  getRelativeTime,
  isDateInRange,
  getTodayRange,
  
  // String utilities
  titleCase,
  truncate,
  removeAccents,
  formatName,
  getInitials,
  
  // Validation utilities
  isValidCedula,
  isValidEmail,
  isValidPhonePanama,
  
  // Array utilities
  groupBy,
  sortBy,
  uniqueBy,
  
  // Event utilities
  filterEventsByStatus,
  getTodayEvents,
  getUpcomingEvents,
  searchEvents,
  
  // Geolocation utilities
  calculateDistance,
  isWithinRadius,
  
  // Performance utilities
  debounce,
  throttle,
  memoize,
  
  // Error handling utilities
  safeAsync,
  retryWithBackoff,
};