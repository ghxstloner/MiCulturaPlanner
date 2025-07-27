import { FacialRecognitionResponse, StandardResponse } from '../types/api';
import { apiClient } from './api';

interface EmbeddingCreateResponse extends StandardResponse {
  embedding_id?: number;
  tripulante_info?: {
    crew_id: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  };
}

interface EmbeddingInfoResponse extends StandardResponse {
  embedding_id: number;
  crew_id: string;
  modelo: string;
  confidence: number;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
  tripulante: {
    nombres: string;
    apellidos: string;
  } | null;
}

export class FacialService {
  async recognizeFace(
    photo: string,
    idEvento: number,
  ): Promise<FacialRecognitionResponse> {
    const formData = new FormData();
    
    formData.append('photo', {
      uri: photo,
      type: 'image/jpeg',
      name: 'recognition.jpg',
    } as any);
    
    formData.append('id_evento', idEvento.toString());


    return apiClient.postFormData('/facial/recognize', formData);
  }

  async createEmbedding(
    photo: string,
    crewId: string,
    modelo: string = 'Facenet512'
  ): Promise<EmbeddingCreateResponse> {
    const formData = new FormData();
    
    formData.append('photo', {
      uri: photo,
      type: 'image/jpeg',
      name: `embedding_${crewId}.jpg`,
    } as any);
    
    formData.append('crew_id', crewId);
    formData.append('modelo', modelo);

    return apiClient.postFormData('/facial/create-embedding', formData);
  }

  async getEmbeddingInfo(crewId: string): Promise<EmbeddingInfoResponse> {
    return apiClient.get(`/facial/embedding/${crewId}`);
  }
}

export const facialService = new FacialService();