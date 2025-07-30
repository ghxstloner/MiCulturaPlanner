import { StorageUtils } from '../storage/mmkvStorage';
import { LoginResponse, StandardResponse, UserInfo } from '../types/api';
import { apiClient } from './api';

export class AuthService {
  private cleanUserInfo(userInfo: any): UserInfo {
    const { 
      imagen, photo, avatar, blob_data, foto, picture, imagen_perfil,
      ...cleanInfo 
    } = userInfo;
    return cleanInfo as UserInfo;
  }

  async login(login: string, password: string): Promise<LoginResponse> {
    console.log('🌐 [API] Enviando request de login...');
    console.log('🌐 [API] URL destino:', process.env.EXPO_PUBLIC_API_URL);
    
    // ✅ PROBAR CONECTIVIDAD PRIMERO
    const connectivityTest = await apiClient.testConnection();
    if (!connectivityTest) {
      console.warn('🌐 [API] ⚠️ Problemas de conectividad detectados, pero continuando...');
    }
    
    const apiStart = Date.now();
    
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      login,
      password,
    }) as LoginResponse;
    
    const apiElapsed = Date.now() - apiStart;
    console.log(`🌐 [API] Response recibido en ${apiElapsed}ms`);
    
    // ✅ ALERTAR SI ES MUY LENTO
    if (apiElapsed > 5000) {
      console.warn(`🌐 [API] ⚠️ Request muy lento: ${apiElapsed}ms - Posible problema de red`);
    }

    if (response.access_token) {
      console.log('💾 [STORAGE] Guardando datos con MMKV...');
      const storageStart = Date.now();
      
      StorageUtils.setToken(response.access_token);
      const cleanUserInfo = this.cleanUserInfo(response.user_info);
      StorageUtils.setUserInfo(cleanUserInfo);
      
      console.log(`💾 [STORAGE] Datos guardados en ${Date.now() - storageStart}ms`);
    }

    return {
      ...response,
      user_info: this.cleanUserInfo(response.user_info)
    };
  }

  async logout(): Promise<void> {
    console.log('🔐 [AUTH] Limpiando storage...');
    StorageUtils.clearToken();
    StorageUtils.clearUserInfo();
  }

  async getCurrentUser(): Promise<StandardResponse<UserInfo>> {
    const response = await apiClient.get('/auth/me') as StandardResponse<UserInfo>;
    
    if (response.data) {
      response.data = this.cleanUserInfo(response.data);
    }
    
    return response;
  }

  async verifyToken(): Promise<StandardResponse> {
    return await apiClient.post('/auth/verify-token', {}) as StandardResponse;
  }

  async getStoredToken(): Promise<string | null> {
    return StorageUtils.getToken();
  }

  async getStoredUserInfo(): Promise<UserInfo | null> {
    return StorageUtils.getUserInfo();
  }
}

export const authService = new AuthService();