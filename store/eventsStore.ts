import { create } from 'zustand';
import { eventsService } from '../services/eventsService';
import { Event, EventDetail, EventPlanification, EventoBackend, FacialRecognitionResponse, PlanificacionBackend, Tripulante } from '../types/api';

interface EventsState {
  events: Event[];
  currentEvent: EventDetail | null;
  currentPlanification: EventPlanification | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadEvents: () => Promise<void>;
  loadEventDetail: (eventId: number) => Promise<void>;
  loadEventPlanification: (eventId: number) => Promise<void>;
  markAttendance: (eventId: number, photoUri: string) => Promise<FacialRecognitionResponse>;
  clearError: () => void;
}

// Función para mapear evento del backend al frontend
const mapEventoBackendToFrontend = (evento: EventoBackend): Event => {
  const fechaEvento = evento.fecha_evento || new Date().toISOString().split('T')[0];
  const horaInicio = evento.hora_inicio || '08:00:00';
  const horaFin = evento.hora_fin || '17:00:00';
  
  return {
    id: evento.id_evento,
    nombre: evento.descripcion_evento || `Evento ${evento.id_evento}`,
    descripcion: evento.descripcion_evento || undefined,
    fecha_inicio: `${fechaEvento}T${horaInicio}`,
    fecha_fin: `${fechaEvento}T${horaFin}`,
    ubicacion: evento.descripcion_lugar || 'Ubicación no especificada',
    organizador: evento.descripcion_departamento || undefined,
    estado: determineEventStatus(fechaEvento, horaInicio, horaFin),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

// Función para determinar el estado del evento
const determineEventStatus = (fecha: string, horaInicio: string, horaFin: string): Event['estado'] => {
  const now = new Date();
  const fechaInicio = new Date(`${fecha}T${horaInicio}`);
  const fechaFin = new Date(`${fecha}T${horaFin}`);
  
  if (now < fechaInicio) {
    return 'programado';
  } else if (now >= fechaInicio && now <= fechaFin) {
    return 'en_curso';
  } else {
    return 'finalizado';
  }
};

// Función para mapear planificación del backend al frontend
const mapPlanificacionBackendToFrontend = (planificacion: PlanificacionBackend[]): EventPlanification => {
  const tripulantes: Tripulante[] = planificacion.map(plan => ({
    crew_id: plan.crew_id,
    nombres: plan.nombres,
    apellidos: plan.apellidos,
    cedula: plan.identidad || undefined,
    email: undefined,
    departamento: undefined,
    cargo: undefined,
    activo: plan.estatus === '1' || plan.estatus === 'activo',
    id_tripulante: plan.id_planificacion,
  }));

  return {
    tripulantes,
    evento_id: 0,
    total_asignados: tripulantes.length,
  };
};

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  currentEvent: null,
  currentPlanification: null,
  loading: false,
  error: null,

  loadEvents: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await eventsService.getEvents();
      
      if (response.success && response.data) {
        const eventsMapped = response.data.map(mapEventoBackendToFrontend);
        set({ 
          events: eventsMapped,
          loading: false,
          error: null
        });
      } else {
        set({ 
          events: [],
          loading: false,
          error: response.message || 'Error al cargar eventos'
        });
      }
    } catch (error: any) {
      console.error('Error cargando eventos:', error);
      set({ 
        loading: false, 
        error: error.message || 'Error de conexión con el servidor'
      });
    }
  },

  loadEventDetail: async (eventId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await eventsService.getEventDetail(eventId);
      
      if (response.success && response.data) {
        const eventMapped = mapEventoBackendToFrontend(response.data);
        const eventDetail: EventDetail = {
          ...eventMapped,
          direccion: response.data.descripcion_lugar || undefined,
          requisitos: [],
        };
        
        set({ 
          currentEvent: eventDetail,
          loading: false,
          error: null
        });
      } else {
        set({ 
          currentEvent: null,
          loading: false,
          error: response.message || 'Evento no encontrado'
        });
      }
    } catch (error: any) {
      console.error('Error cargando detalle del evento:', error);
      set({ 
        loading: false, 
        error: error.message || 'Error de conexión'
      });
    }
  },

  loadEventPlanification: async (eventId: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await eventsService.getEventPlanification(eventId);
      
      if (response.success && response.data) {
        const planificationMapped = mapPlanificacionBackendToFrontend(response.data);
        planificationMapped.evento_id = eventId;
        
        set({ 
          currentPlanification: planificationMapped,
          loading: false,
          error: null
        });
      } else {
        set({ 
          currentPlanification: null,
          loading: false,
          error: response.message || 'No hay planificación para este evento'
        });
      }
    } catch (error: any) {
      console.error('Error cargando planificación del evento:', error);
      set({ 
        loading: false, 
        error: error.message || 'Error de conexión'
      });
    }
  },

  markAttendance: async (eventId: number, photoUri: string): Promise<FacialRecognitionResponse> => {
    try {
      const result = await eventsService.markAttendance({
        eventId,
        photoUri,
      });

      return result;
    } catch (error: any) {
      console.error('Error marcando asistencia:', error);
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));