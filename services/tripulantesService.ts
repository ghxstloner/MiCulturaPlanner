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

export interface TripulantesResponse extends StandardResponse<Tripulante[]> {}

export class TripulantesService {
  async getTripulantes(): Promise<TripulantesResponse> {
    return apiClient.get('/tripulantes/');
  }

  async getTripulanteById(id: number): Promise<StandardResponse<Tripulante>> {
    return apiClient.get(`/tripulantes/${id}`);
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