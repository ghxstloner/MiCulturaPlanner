import { MarcacionesResponse } from '../types/api';
import { apiClient } from './api';

export class MarcacionesService {
  async getRecentMarcaciones(limit: number = 10): Promise<MarcacionesResponse> {
    return apiClient.get(`/marcaciones/recent?limit=${limit}`);
  }

  async getTodayMarcaciones(): Promise<MarcacionesResponse> {
    return apiClient.get('/marcaciones/today');
  }

  async getMarcacionesByEvent(eventId: number): Promise<MarcacionesResponse> {
    return apiClient.get(`/marcaciones/event/${eventId}`);
  }

  async getMarcacionesByTripulante(crewId: string, limit: number = 50): Promise<MarcacionesResponse> {
    return apiClient.get(`/marcaciones/tripulante/${crewId}?limit=${limit}`);
  }
}

export const marcacionesService = new MarcacionesService();