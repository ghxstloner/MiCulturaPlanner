/**
 * Context API Implementation for MiCultura App
 * 
 * This module provides a comprehensive Context API system that wraps
 * the existing Zustand stores and provides structured access to global state.
 * 
 * Features:
 * - Type-safe context access
 * - Centralized state management
 * - Computed values for better UX
 * - Error boundaries and validation
 */

// Main App Provider and Context
export {
  AppContext, AppProvider,
  useAppContext
} from './AppContext';

// Individual Context Providers and Hooks
export {
  AuthContext, AuthProvider,
  useAuth
} from './AuthContext';

export {
  EventsContext, EventsProvider,
  useEvents
} from './EventsContext';

/**
 * Usage Examples:
 * 
 * 1. Wrap your app with AppProvider:
 * ```tsx
 * import { AppProvider } from '@/contexts';
 * 
 * export default function App() {
 *   return (
 *     <AppProvider>
 *       <YourAppComponents />
 *     </AppProvider>
 *   );
 * }
 * ```
 * 
 * 2. Use individual hooks:
 * ```tsx
 * import { useAuth, useEvents } from '@/contexts';
 * 
 * export function MyComponent() {
 *   const { user, login } = useAuth();
 *   const { events, loadEvents } = useEvents();
 *   // ... component logic
 * }
 * ```
 * 
 * 3. Use combined context:
 * ```tsx
 * import { useAppContext } from '@/contexts';
 * 
 * export function MyComponent() {
 *   const { auth, events } = useAppContext();
 *   // Access all contexts through one hook
 * }
 * ```
 */