import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useEventsStore } from '../store/eventsStore';
import { Event, EventDetail, EventPlanification, FacialRecognitionResponse } from '../types/api';

// Events Context Types
interface EventsContextType {
  // State
  events: Event[];
  currentEvent: EventDetail | null;
  currentPlanification: EventPlanification | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadEvents: () => Promise<void>;
  loadEventDetail: (eventId: number) => Promise<void>;
  loadEventPlanification: (eventId: number) => Promise<void>;
  markAttendance: (eventId: number, photoUri: string) => Promise<FacialRecognitionResponse>;
  clearError: () => void;
  
  // Computed Values
  activeEvents: Event[];
  upcomingEvents: Event[];
  completedEvents: Event[];
  todayEvents: Event[];
  thisWeekEvents: Event[];
}

// Create Context
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Provider Props
interface EventsProviderProps {
  children: ReactNode;
}

// Events Provider Component
export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const eventsStore = useEventsStore();

  // Computed values for better UX
  const getActiveEvents = (): Event[] => {
    return eventsStore.events.filter(event => event.estado === 'en_curso');
  };

  const getUpcomingEvents = (): Event[] => {
    return eventsStore.events.filter(event => event.estado === 'programado');
  };

  const getCompletedEvents = (): Event[] => {
    return eventsStore.events.filter(event => event.estado === 'finalizado');
  };

  const getTodayEvents = (): Event[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return eventsStore.events.filter(event => {
      const eventDate = new Date(event.fecha_inicio).toISOString().split('T')[0];
      return eventDate === todayStr;
    });
  };

  const getThisWeekEvents = (): Event[] => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return eventsStore.events.filter(event => {
      const eventDate = new Date(event.fecha_inicio);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  };

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue = useMemo<EventsContextType>(() => ({
    // State from Zustand store
    events: eventsStore.events,
    currentEvent: eventsStore.currentEvent,
    currentPlanification: eventsStore.currentPlanification,
    loading: eventsStore.loading,
    error: eventsStore.error,
    
    // Actions from Zustand store
    loadEvents: eventsStore.loadEvents,
    loadEventDetail: eventsStore.loadEventDetail,
    loadEventPlanification: eventsStore.loadEventPlanification,
    markAttendance: eventsStore.markAttendance,
    clearError: eventsStore.clearError,
    
    // Computed values
    activeEvents: getActiveEvents(),
    upcomingEvents: getUpcomingEvents(),
    completedEvents: getCompletedEvents(),
    todayEvents: getTodayEvents(),
    thisWeekEvents: getThisWeekEvents(),
  }), [
    eventsStore.events,
    eventsStore.currentEvent,
    eventsStore.currentPlanification,
    eventsStore.loading,
    eventsStore.error,
    eventsStore.loadEvents,
    eventsStore.loadEventDetail,
    eventsStore.loadEventPlanification,
    eventsStore.markAttendance,
    eventsStore.clearError,
  ]);

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
};

// Custom Hook for Events Context
export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  
  return context;
};

// Export context for advanced usage
export { EventsContext };