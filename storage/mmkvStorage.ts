import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Instancia principal de MMKV (mucho más rápida que AsyncStorage)
export const storage = new MMKV({
  id: 'micultura-storage',
  encryptionKey: 'micultura-secure-key-2025'
});

// Instancia separada para auth (mejor organización)
export const authStorage = new MMKV({
  id: 'micultura-auth',
  encryptionKey: 'micultura-auth-secure-2025'
});

// Adaptador para Zustand persist middleware
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

// Adaptador específico para auth
export const zustandAuthStorage: StateStorage = {
  setItem: (name, value) => {
    return authStorage.set(name, value);
  },
  getItem: (name) => {
    const value = authStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return authStorage.delete(name);
  },
};

// Utilidades de storage optimizadas
export const StorageUtils = {
  // Auth utilities con storage dedicado
  setToken: (token: string) => authStorage.set('access_token', token),
  getToken: () => authStorage.getString('access_token') ?? null,
  clearToken: () => authStorage.delete('access_token'),
  
  setUserInfo: (userInfo: any) => authStorage.set('user_info', JSON.stringify(userInfo)),
  getUserInfo: () => {
    const data = authStorage.getString('user_info');
    return data ? JSON.parse(data) : null;
  },
  clearUserInfo: () => authStorage.delete('user_info'),
  
  // Utilidad para limpiar todo
  clearAll: () => {
    storage.clearAll();
    authStorage.clearAll();
  },
  
  // Performance monitoring
  getStorageSize: () => storage.size,
  trimStorage: () => storage.trim(),
};