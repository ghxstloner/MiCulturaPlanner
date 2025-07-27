import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, StandardResponse, UserInfo } from '../types/api';
import { apiClient } from './api';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_info';

export class AuthService {
  async login(login: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      login,
      password,
    });

    if (response.access_token) {
      await this.storeToken(response.access_token);
      await this.storeUserInfo(response.user_info);
    }

    return response;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  async getCurrentUser(): Promise<StandardResponse<UserInfo>> {
    return apiClient.get('/auth/me');
  }

  async verifyToken(): Promise<StandardResponse> {
    return apiClient.post('/auth/verify-token', {});
  }

  async storeToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async storeUserInfo(userInfo: UserInfo): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo));
  }

  async getStoredUserInfo(): Promise<UserInfo | null> {
    const userInfoStr = await AsyncStorage.getItem(USER_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  }
}

export const authService = new AuthService();