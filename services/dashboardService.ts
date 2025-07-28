import { StandardResponse } from '../types/api';
import { apiClient } from './api';

export interface DashboardStats {
  totalEventos: number;
  eventosHoy: number;
  eventosActivos: number;
  totalAsistencias: number;
}

export interface DashboardResponse extends StandardResponse<DashboardStats> {}

export class DashboardService {
  async getStats(): Promise<DashboardResponse> {
    return apiClient.get('/dashboard/stats');
  }
}

export const dashboardService = new DashboardService(); 