import { StandardResponse } from '../types/api';
import { apiClient } from './api';

interface TripulanteBackend {
  id_tripulante: number;
  crew_id: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  identidad: string | null;
  email: string | null;
  celular: string | null;
  imagen: string | null;
  departamento: string | null;
  cargo: string | null;
  estatus: number;
  id_departamento: number | null;
  id_cargo: number | null;
}

type TripulanteSearchResponse = StandardResponse<TripulanteBackend[]>;
type TripulanteDetailResponse = StandardResponse<TripulanteBackend>;

export class TripulantesService {
  async searchTripulantes(query: string): Promise<TripulanteSearchResponse> {
    return apiClient.get(`/tripulantes/search?q=${encodeURIComponent(query)}`);
  }

  async getTripulante(crewId: string): Promise<TripulanteDetailResponse> {
    return apiClient.get(`/tripulantes/${crewId}`);
  }
}

export const tripulantesService = new TripulantesService();