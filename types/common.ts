/**
 * Common Types and Interfaces - ULTRATHINK Methodology
 * 
 * This file contains shared types, interfaces, and utilities
 * for better type safety and developer experience.
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Form Validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = any> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Color Theme Types
export interface ColorPalette {
  primary: string;
  primaryRed: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  greyLight: string;
  greyMedium: string;
  greyDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export type ColorScheme = 'light' | 'dark';

// Navigation Types
export interface NavigationProps {
  navigation: any;
  route: any;
}

// Component Props Helpers
export interface BaseComponentProps {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  disabled?: boolean;
}

export interface ErrorProps extends BaseComponentProps {
  error?: string | null;
  onErrorDismiss?: () => void;
}

// Event Handler Types
export type EventHandler<T = void> = () => T;
export type ParameterizedEventHandler<P, T = void> = (param: P) => T;
export type AsyncEventHandler<T = void> = () => Promise<T>;
export type AsyncParameterizedEventHandler<P, T = void> = (param: P) => Promise<T>;

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type NonNullable<T> = T extends null | undefined ? never : T;

// Time and Date Utilities
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

// File and Media Types
export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
}

// Performance Monitoring
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkLatency?: number;
  cacheHitRate?: number;
}

// Error Handling
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Configuration Types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  debugMode: boolean;
  features: Record<string, boolean>;
}

// Analytics Events
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
}

// Notification Types
export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    handler: EventHandler;
  };
}

// Search and Filter Types
export interface SearchQuery {
  term: string;
  filters: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxAge?: number;
  staleWhileRevalidate?: boolean;
}

// Device Information
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  screenDimensions: {
    width: number;
    height: number;
  };
  hasNetworkConnection: boolean;
  isEmulator?: boolean;
}

// Location Types (for events)
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Location {
  coordinates: Coordinates;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

// Permission Types
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface Permission {
  type: 'camera' | 'location' | 'notifications' | 'storage';
  status: PermissionStatus;
  canAskAgain: boolean;
}

// Feature Flag Types
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  config?: Record<string, any>;
  rolloutPercentage?: number;
}

// Export helper functions for type guards
export const isApiResponse = <T>(obj: any): obj is ApiResponse<T> => {
  return obj && typeof obj.success === 'boolean';
};

export const isValidationError = (obj: any): obj is ValidationError => {
  return obj && typeof obj.field === 'string' && typeof obj.message === 'string';
};

export const isAppError = (error: any): error is AppError => {
  return error instanceof Error;
};