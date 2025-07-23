import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  
  // Actions
  login: (cedula: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

// Mock users data para Panamá
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Ana María González',
    email: 'ana.gonzalez@mincultura.gob.pa',
    cedula: '8-123-456',
    position: 'Coordinadora de Eventos',
    department: 'Dirección de Artes Escénicas',
    phone: '+507 6123-4567'
  },
  {
    id: '2',
    name: 'Carlos Eduardo Ramírez',
    email: 'carlos.ramirez@mincultura.gob.pa',
    cedula: '8-765-432',
    position: 'Personal Técnico',
    department: 'Dirección de Música',
    phone: '+507 6765-4321'
  },
  {
    id: '3',
    name: 'María Fernanda López',
    email: 'maria.lopez@mincultura.gob.pa',
    cedula: '8-112-233',
    position: 'Curadora',
    department: 'Dirección de Patrimonio',
    phone: '+507 6112-2334'
  }
];

const PIN_HASH = '1234'; // PIN de acceso simple para demo

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,

  login: async (cedula: string, pin: string) => {
    set({ loading: true });
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (pin !== PIN_HASH) {
        set({ loading: false });
        return false;
      }

      const user = MOCK_USERS.find(u => u.cedula === cedula);
      if (!user) {
        set({ loading: false });
        return false;
      }

      // Guardar datos de sesión
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      set({ 
        isAuthenticated: true, 
        user,
        loading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      set({ loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'isAuthenticated']);
      set({ 
        isAuthenticated: false, 
        user: null,
        loading: false
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  },

  initAuth: async () => {
    try {
      const [storedUser, isAuth] = await AsyncStorage.multiGet(['user', 'isAuthenticated']);
      
      if (isAuth[1] === 'true' && storedUser[1]) {
        const user = JSON.parse(storedUser[1]);
        set({ 
          isAuthenticated: true, 
          user,
          loading: false
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error inicializando auth:', error);
      set({ loading: false });
    }
  },

  updateUser: async (userData: Partial<User>) => {
    try {
      const currentUser = get().user;
      if (!currentUser) return false;

      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({ user: updatedUser });
      return true;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return false;
    }
  },
}));