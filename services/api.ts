import { StorageUtils } from '../storage/mmkvStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://micultura.amaxoniaerp.com/api/v1";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = StorageUtils.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // ✅ FUNCIÓN HELPER para crear fetch con timeout agresivo
  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const startTime = Date.now();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`🌐 [FETCH] ❌ Timeout después de ${timeoutMs}ms para: ${url}`);
        throw new Error(`Timeout: Request tardó más de ${timeoutMs / 1000} segundos`);
      }
      console.error(`🌐 [FETCH] ❌ Error de red: ${error.message}`);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    }, 15000); // ✅ 15 segundos timeout

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }, 15000); // ✅ 15 segundos timeout

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = StorageUtils.getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    }, 60000); // ✅ 30 segundos para uploads

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ✅ FUNCIÓN DE PRUEBA DE CONECTIVIDAD
  async testConnection(): Promise<boolean> {
    try {
      console.log('🌐 [TEST] Probando conectividad...');
      const startTime = Date.now();
      
      const response = await this.fetchWithTimeout(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }, 5000);
      
      const elapsed = Date.now() - startTime;
      console.log(`🌐 [TEST] ✅ Conectividad OK en ${elapsed}ms`);
      
      return response.ok;
    } catch (error: any) {
      console.error(`🌐 [TEST] ❌ Falla de conectividad: ${error.message}`);
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);