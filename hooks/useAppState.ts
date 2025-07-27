import { useMemo } from 'react';
import { useAppContext } from '../contexts';
import { Event } from '../types/api';

/**
 * Advanced App State Hook following ULTRATHINK methodology
 * 
 * This hook provides optimized access to app state with computed values,
 * memoization, and performance optimizations.
 */
export const useAppState = () => {
  const { auth, events } = useAppContext();

  // Memoized computed values for performance
  const computedValues = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

    return {
      // Authentication computed values
      isLoggedIn: auth.isAuthenticated && !!auth.user,
      userFullName: auth.user ? `${auth.user.name || ''} ${auth.user.email || ''}`.trim() : '',
      userInitials: auth.user 
        ? `${auth.user.name?.[0] || ''}${auth.user.email?.[0] || ''}`.toUpperCase()
        : '',

      // Events computed values
      totalEvents: events.events.length,
      activeEventsCount: events.events.filter(event => event.estado === 'en_curso').length,
      upcomingEventsCount: events.events.filter(event => event.estado === 'programado').length,
      completedEventsCount: events.events.filter(event => event.estado === 'finalizado').length,

      // Time-based event filters
      todayEvents: events.events.filter(event => {
        const eventDate = new Date(event.fecha_inicio);
        return eventDate >= today && eventDate < tomorrow;
      }),

      tomorrowEvents: events.events.filter(event => {
        const eventDate = new Date(event.fecha_inicio);
        return eventDate >= tomorrow && eventDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
      }),

      thisWeekEvents: events.events.filter(event => {
        const eventDate = new Date(event.fecha_inicio);
        return eventDate >= weekStart && eventDate <= weekEnd;
      }),

      nextWeekEvents: events.events.filter(event => {
        const eventDate = new Date(event.fecha_inicio);
        const nextWeekStart = new Date(weekEnd.getTime() + 1);
        const nextWeekEnd = new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        return eventDate >= nextWeekStart && eventDate <= nextWeekEnd;
      }),

      // Event statistics
      eventsByStatus: {
        programado: events.events.filter(event => event.estado === 'programado'),
        en_curso: events.events.filter(event => event.estado === 'en_curso'),
        finalizado: events.events.filter(event => event.estado === 'finalizado'),
        cancelado: events.events.filter(event => event.estado === 'cancelado'),
      },

      // Loading states
      isLoading: auth.loading || events.loading,
      hasErrors: !!auth.error || !!events.error,
      errors: [auth.error, events.error].filter(Boolean),
    };
  }, [
    auth.isAuthenticated,
    auth.user,
    auth.loading,
    auth.error,
    events.events,
    events.loading,
    events.error,
  ]);

  // Action helpers with error handling
  const actions = useMemo(() => ({
    // Auth actions
    login: auth.login,
    logout: auth.logout,
    refreshUser: auth.refreshUser,
    clearAuthError: auth.clearError,

    // Events actions
    loadEvents: events.loadEvents,
    loadEventDetail: events.loadEventDetail,
    loadEventPlanification: events.loadEventPlanification,
    markAttendance: events.markAttendance,
    clearEventsError: events.clearError,

    // Combined actions
    clearAllErrors: () => {
      auth.clearError();
      events.clearError();
    },

    refreshAll: async () => {
      await Promise.all([
        auth.refreshUser(),
        events.loadEvents(),
      ]);
    },
  }), [auth, events]);

  // Utility functions
  const utils = useMemo(() => ({
    // Event utilities
    getEventById: (id: number) => events.events.find(event => event.id === id),
    
    getEventsByLocation: (location: string) => 
      events.events.filter(event => 
        event.ubicacion.toLowerCase().includes(location.toLowerCase())
      ),

    getEventsByOrganizer: (organizer: string) => 
      events.events.filter(event => 
        event.organizador?.toLowerCase().includes(organizer.toLowerCase())
      ),

    // Date utilities
    isEventToday: (event: Event) => {
      const eventDate = new Date(event.fecha_inicio);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    },

    isEventThisWeek: (event: Event) => {
      const eventDate = new Date(event.fecha_inicio);
      const now = new Date();
      const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      return eventDate >= weekStart && eventDate <= weekEnd;
    },

    // Format utilities
    formatEventDate: (event: Event) => {
      return new Date(event.fecha_inicio).toLocaleDateString('es-PA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },

    formatEventTime: (event: Event) => {
      return new Date(event.fecha_inicio).toLocaleTimeString('es-PA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  }), [events.events]);

  return {
    // Raw state
    auth,
    events,

    // Computed values
    ...computedValues,

    // Actions
    ...actions,

    // Utilities
    ...utils,
  };
};

export default useAppState;