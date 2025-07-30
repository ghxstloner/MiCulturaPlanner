import { StandardResponse } from '../types/api';
import { apiClient } from './api';

export interface Tripulante {
  id_tripulante: number;
  crew_id: string;
  nombres: string;
  apellidos: string;
  identidad: string | null;
  email: string | null;
  celular: string | null;
  imagen: string | null;
  departamento: string | null;
  cargo: string | null;
  estatus: number;
}

export interface TripulantesMetadata {
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
  current_page_count: number;
}

export interface TripulantesResponse extends StandardResponse<Tripulante[]> {
  metadata?: TripulantesMetadata;
}

export class TripulantesService {
  async getTripulantes(offset: number = 0, limit: number = 50): Promise<TripulantesResponse> {
    return apiClient.get(`/tripulantes/?offset=${offset}&limit=${limit}`);
  }

  async getTripulanteById(id: number): Promise<StandardResponse<Tripulante>> {
    return apiClient.get(`/tripulantes/${id}`);
  }

  async searchTripulantes(query: string): Promise<TripulantesResponse> {
    return apiClient.get(`/tripulantes/search?q=${encodeURIComponent(query)}`);
  }

  async createTripulante(tripulante: Omit<Tripulante, 'id_tripulante'>): Promise<StandardResponse<Tripulante>> {
    return apiClient.post('/tripulantes', tripulante);
  }

  async updateTripulante(id: number, tripulante: Partial<Tripulante>): Promise<StandardResponse<Tripulante>> {
    return apiClient.post(`/tripulantes/${id}`, tripulante);
  }

  async deleteTripulante(id: number): Promise<StandardResponse> {
    return apiClient.post(`/tripulantes/${id}/delete`, {});
  }
}

export const tripulantesService = new TripulantesService();