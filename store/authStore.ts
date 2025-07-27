import { create } from 'zustand';
import { authService } from '../services/authService';
import { UserInfo } from '../types/api';

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,

  login: async (login: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authService.login(login, password);
      
      set({ 
        isAuthenticated: true, 
        user: response.user_info,
        loading: false,
        error: null
      });
      
      return true;
    } catch (error: any) {
      console.error('Error en login:', error);
      const errorMessage = error.message || 'Error de autenticación';
      set({ 
        loading: false, 
        error: errorMessage,
        isAuthenticated: false,
        user: null
      });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    
    try {
      await authService.logout();
      set({ 
        isAuthenticated: false, 
        user: null,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error en logout:', error);
      // Even if logout fails, clear local state
      set({ 
        isAuthenticated: false, 
        user: null,
        loading: false,
        error: 'Error al cerrar sesión'
      });
    }
  },

  initAuth: async () => {
    set({ loading: true, error: null });
    
    try {
      const [token, userInfo] = await Promise.all([
        authService.getStoredToken(),
        authService.getStoredUserInfo()
      ]);
      
      if (token && userInfo) {
        // Verify that the token is still valid
        try {
          const currentUserResponse = await authService.getCurrentUser();
          set({ 
            isAuthenticated: true, 
            user: currentUserResponse.data,
            loading: false,
            error: null
          });
        } catch (error: any) {
          // Invalid token, clear data
          console.warn('Token inválido, limpiando datos:', error);
          await authService.logout();
          set({ 
            isAuthenticated: false, 
            user: null,
            loading: false,
            error: 'Sesión expirada'
          });
        }
      } else {
        set({ 
          loading: false, 
          isAuthenticated: false, 
          user: null,
          error: null
        });
      }
    } catch (error: any) {
      console.error('Error inicializando auth:', error);
      set({ 
        loading: false, 
        isAuthenticated: false, 
        user: null,
        error: 'Error de inicialización'
      });
    }
  },

  refreshUser: async () => {
    const { isAuthenticated } = get();
    
    if (!isAuthenticated) {
      return false;
    }
    
    try {
      const response = await authService.getCurrentUser();
      set({ 
        user: response.data, 
        error: null 
      });
      return true;
    } catch (error: any) {
      console.error('Error refrescando usuario:', error);
      const errorMessage = error.message || 'Error al actualizar información del usuario';
      set({ error: errorMessage });
      
      // If refresh fails due to auth issues, logout
      if (error.status === 401 || error.status === 403) {
        get().logout();
      }
      
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));