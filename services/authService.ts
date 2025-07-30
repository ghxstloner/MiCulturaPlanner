import { StorageUtils } from '../storage/mmkvStorage';
import { LoginResponse, StandardResponse, UserInfo } from '../types/api';
import { apiClient } from './api';

export class AuthService {
  // ✅ MÉTODO NUEVO para limpiar campos pesados
  private cleanUserInfo(userInfo: any): UserInfo {
    // Elimina cualquier campo que pueda contener BLOBs o datos pesados
    const { 
      imagen, 
      photo, 
      avatar, 
      blob_data, 
      foto,
      picture,
      imagen_perfil,
      ...cleanInfo 
    } = userInfo;
    
    return cleanInfo as UserInfo;
  }

  async login(login: string, password: string): Promise<LoginResponse> {
    console.log('🌐 [API] Enviando request de login...');
    const apiStart = Date.now();
    
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      login,
      password,
    }) as LoginResponse;
    
    console.log(`🌐 [API] Response recibido en ${Date.now() - apiStart}ms`);

    if (response.access_token) {
      console.log('💾 [STORAGE] Guardando datos con MMKV...');
      const storageStart = Date.now();
      
      // ✅ GUARDAR con MMKV (sincrónico y rapidísimo)
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
    // ✅ LIMPIEZA ultra rápida con MMKV
    StorageUtils.clearToken();
    StorageUtils.clearUserInfo();
  }

  async getCurrentUser(): Promise<StandardResponse<UserInfo>> {
    const response = await apiClient.get('/auth/me') as StandardResponse<UserInfo>;
    
    // ✅ LIMPIA la respuesta antes de devolverla
    if (response.data) {
      response.data = this.cleanUserInfo(response.data);
    }
    
    return response;
  }

  async verifyToken(): Promise<StandardResponse> {
    return await apiClient.post('/auth/verify-token', {}) as StandardResponse;
  }

  async getStoredToken(): Promise<string | null> {
    // ✅ MMKV sincrónico - instantáneo
    return StorageUtils.getToken();
  }

  async getStoredUserInfo(): Promise<UserInfo | null> {
    // ✅ MMKV sincrónico - instantáneo
    return StorageUtils.getUserInfo();
  }
}

export const authService = new AuthService();