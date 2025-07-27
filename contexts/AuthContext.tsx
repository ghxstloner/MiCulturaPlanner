import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserInfo } from '../types/api';

// Auth Context Types
interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  clearError: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();

  // Initialize authentication on mount
  useEffect(() => {
    authStore.initAuth();
  }, []); // Empty dependency array - only run on mount

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    // State from Zustand store
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    loading: authStore.loading,
    error: authStore.error,
    
    // Actions from Zustand store
    login: authStore.login,
    logout: authStore.logout,
    refreshUser: authStore.refreshUser,
    clearError: authStore.clearError,
  }), [
    authStore.isAuthenticated,
    authStore.user,
    authStore.loading,
    authStore.error,
    authStore.login,
    authStore.logout,
    authStore.refreshUser,
    authStore.clearError,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook for Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export context for advanced usage
export { AuthContext };
