import { create } from 'zustand';
import { eventsService } from '../services/eventsService';
import { Event, EventDetail, EventPlanification, EventoBackend, FacialRecognitionResponse, PlanificacionBackend, Tripulante } from '../types/api';

interface EventsState {
  events: Event[];
  currentEvent: EventDetail | null;
  currentPlanification: EventPlanification | null;
  loading: boolean;
  error: string | null;
  hasMoreEvents: boolean;
  currentFilter: string | null;
  
  // Actions
  loadEvents: (filtro?: string, refresh?: boolean) => Promise<void>;
  loadMoreEvents: () => Promise<void>;
  loadEventDetail: (eventId: number) => Promise<void>;
  loadEventPlanification: (eventId: number) => Promise<void>;
  markAttendance: (eventId: number, photoUri: string) => Promise<FacialRecognitionResponse>;
  clearError: () => void;
  setFilter: (filter: string | null) => void;
}

// Función para mapear evento del backend al frontend
const mapEventoBackendToFrontend = (evento: EventoBackend): Event => {
  const fechaEvento = evento.fecha_evento || new Date().toISOString().split('T')[0];
  const horaInicio = evento.hora_inicio || '08:00:00';
  const horaFin = evento.hora_fin || '17:00:00';
  
  // Determinar estado basado en estatus del backend (1 = activo, 0 = inactivo)
  const estatus = evento.estatus ?? 0;
  const estado = estatus === 1 ? 'activo' : 'inactivo';
  
  return {
    id: evento.id_evento,
    nombre: evento.descripcion_evento || `Evento ${evento.id_evento}`,
    descripcion: evento.descripcion_evento || undefined,
    fecha_inicio: `${fechaEvento}T${horaInicio}`,
    fecha_fin: `${fechaEvento}T${horaFin}`,
    ubicacion: evento.descripcion_lugar || 'Ubicación no especificada',
    organizador: evento.descripcion_departamento || undefined,
    pais: evento.pais_nombre || undefined,
    estado: estado,
    estatus: estatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
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
    fecha_vuelo: plan.fecha_vuelo || undefined,
    hora_entrada: plan.hora_entrada || undefined,
    hora_salida: plan.hora_salida || undefined,
    imagen: plan.imagen || undefined, // Mapear el campo imagen correctamente
  }));

  return {
    tripulantes,
    evento_id: 0,
    total_asignados: tripulantes.length,
  };
};

// Función para verificar si se puede marcar asistencia - CORREGIDA PARA JEFES
export const canMarkAttendance = async (event: Event): Promise<boolean> => {
  try {
    // Verificar que el evento esté activo
    if (event.estado !== 'activo' || event.estatus !== 1) {
      return false;
    }
    
    // Verificar que el evento sea hoy
    const today = new Date().toISOString().split('T')[0];
    const eventDate = event.fecha_inicio.split('T')[0];
    
    if (eventDate !== today) {
      return false;
    }
    
    // Verificar si el evento ya finalizó
    const now = new Date();
    const eventEndDate = new Date(event.fecha_fin);
    
    if (now > eventEndDate) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en canMarkAttendance:', error);
    return false;
  }
};

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  currentEvent: null,
  currentPlanification: null,
  loading: false,
  error: null,
  hasMoreEvents: true,
  currentFilter: null,

  loadEvents: async (filtro?: string, refresh = true) => {
    set({ loading: true, error: null });
    
    try {
      const state = get();
      const offset = refresh ? 0 : state.events.length;
      const response = await eventsService.getEvents(false, filtro, offset, 20);
      
      if (response.success && response.data) {
        const eventsMapped = response.data.map(mapEventoBackendToFrontend);
        set({ 
          events: refresh ? eventsMapped : [...state.events, ...eventsMapped],
          loading: false,
          error: null,
          hasMoreEvents: eventsMapped.length === 20,
          currentFilter: filtro || null
        });
      } else {
        set({ 
          events: refresh ? [] : state.events,
          loading: false,
          error: response.message || 'Error al cargar eventos',
          hasMoreEvents: false
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

  loadMoreEvents: async () => {
    const state = get();
    if (state.loading || !state.hasMoreEvents) return;
    
    await state.loadEvents(state.currentFilter || undefined, false);
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

  setFilter: (filter: string | null) => {
    const state = get();
    if (state.currentFilter !== filter) {
      state.loadEvents(filter || undefined, true);
    }
  },
}));