import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { EventsProvider, useEvents } from './EventsContext';

// App Context Types - combines all contexts
interface AppContextType {
  auth: ReturnType<typeof useAuth>;
  events: ReturnType<typeof useEvents>;
}

// Create App Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props
interface AppProviderProps {
  children: ReactNode;
}

// Inner App Provider Component (consumes all contexts)
const AppProviderInner: React.FC<AppProviderProps> = ({ children }) => {
  const auth = useAuth();
  const events = useEvents();

  const contextValue = useMemo<AppContextType>(() => ({
    auth,
    events,
  }), [auth, events]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Main App Provider Component (wraps all context providers)
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <EventsProvider>
        <AppProviderInner>
          {children}
        </AppProviderInner>
      </EventsProvider>
    </AuthProvider>
  );
};

// Custom Hook for App Context (access to all contexts)
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};

// Re-export individual hooks for convenience
export { useAuth } from './AuthContext';
export { useEvents } from './EventsContext';

// Export context for advanced usage
export { AppContext };