import { EventoBackend, EventsResponse, FacialRecognitionResponse, PlanificacionBackend, StandardResponse } from '../types/api';
import { apiClient } from './api';

interface MarkAttendanceRequest {
  eventId: number;
  photoUri: string;
}

export class EventsService {
  async getEvents(activosSolo: boolean = true): Promise<EventsResponse> {
    return apiClient.get(`/eventos/?activos_solo=${activosSolo}`);
  }

  async getEventDetail(idEvento: number): Promise<StandardResponse<EventoBackend>> {
    return apiClient.get(`/eventos/${idEvento}`);
  }

  async getEventPlanification(idEvento: number): Promise<StandardResponse<PlanificacionBackend[]>> {
    return apiClient.get(`/eventos/${idEvento}/planificacion`);
  }

  async markAttendance(request: MarkAttendanceRequest): Promise<FacialRecognitionResponse> {
    const formData = new FormData();
    
    // Agregar la foto
    formData.append('photo', {
      uri: request.photoUri,
      type: 'image/jpeg',
      name: 'attendance.jpg',
    } as any);
    
    // Agregar otros campos
    formData.append('id_evento', request.eventId.toString());

    return apiClient.postFormData('/facial/recognize', formData);
  }
}

export const eventsService = new EventsService();