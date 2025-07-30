import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { zustandAuthStorage } from '../storage/mmkvStorage';
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

// ✅ FUNCIÓN HELPER para limpiar UserInfo (mantener igual)
const cleanUserInfo = (userInfo: any): UserInfo => {
  const { 
    imagen, photo, avatar, blob_data, foto, picture, imagen_perfil,
    ...cleanInfo 
  } = userInfo || {};
  return cleanInfo as UserInfo;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      login: async (login: string, password: string) => {
        console.log('🔐 [AUTH] Iniciando login...');
        set({ loading: true, error: null });
        
        try {
          const startTime = Date.now();
          const response = await authService.login(login, password);
          console.log(`🔐 [AUTH] Login completado en ${Date.now() - startTime}ms`);
          
          set({ 
            isAuthenticated: true, 
            user: cleanUserInfo(response.user_info), // ✅ LIMPIA AQUÍ
            loading: false,
            error: null
          });
          
          return true;
        } catch (error: any) {
          console.error('🔐 [AUTH] Error en login:', error);
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
        console.log('🔐 [AUTH] Iniciando logout...');
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
          console.error('🔐 [AUTH] Error en logout:', error);
          // Forzar logout local aunque falle el servidor
          set({ 
            isAuthenticated: false, 
            user: null,
            loading: false,
            error: null
          });
        }
      },

      initAuth: async () => {
        console.log('🔐 [AUTH] Inicializando auth...');
        set({ loading: true, error: null });
        
        try {
          const token = await authService.getStoredToken();
          
          if (token) {
            try {
              const currentUserResponse = await authService.getCurrentUser();
              set({ 
                isAuthenticated: true, 
                user: cleanUserInfo(currentUserResponse.data), // ✅ LIMPIA AQUÍ
                loading: false,
                error: null
              });
            } catch (error: any) {
              console.warn('🔐 [AUTH] Token inválido, limpiando datos:', error);
              await authService.logout();
              set({ 
                isAuthenticated: false, 
                user: null,
                loading: false,
                error: null
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
          console.error('🔐 [AUTH] Error inicializando auth:', error);
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
            user: cleanUserInfo(response.data), // ✅ LIMPIA AQUÍ
            error: null 
          });
          return true;
        } catch (error: any) {
          console.error('🔐 [AUTH] Error refrescando usuario:', error);
          const errorMessage = error.message || 'Error al actualizar información del usuario';
          set({ error: errorMessage });
          
          if (error.status === 401 || error.status === 403) {
            get().logout();
          }
          
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandAuthStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      }), // Solo persistir datos esenciales
      version: 1,
    }
  )
);