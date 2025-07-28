import { StandardResponse } from '../types/api';
import { apiClient } from './api';

export interface ReportStats {
  totalEventos: number;
  eventosActivos: number;
  eventosFinalizados: number;
  promedioAsistencia: number;
  eventosPorMes: Record<string, number>;
  asistenciaCompleta: number;
  asistenciaParcial: number;
  ausencias: number;
  tendenciaEventos: number;
  tendenciaMarcaciones: number;
}

export interface ReportesResponse extends StandardResponse<ReportStats> {}

export class ReportesService {
  async getStats(): Promise<ReportesResponse> {
    return apiClient.get('/reportes/stats');
  }
}

export const reportesService = new ReportesService();