import { create } from 'zustand';
import { marcacionesService } from '../services/marcacionesService';
import { Marcacion, MarcacionBackend } from '../types/api';

interface MarcacionesState {
  marcaciones: Marcacion[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadRecentMarcaciones: (limit?: number) => Promise<void>;
  loadTodayMarcaciones: () => Promise<void>;
  clearError: () => void;
}

// Función para mapear datos del backend al frontend
const mapMarcacionBackendToFrontend = (marcacion: MarcacionBackend): Marcacion => {
  return {
    id: marcacion.id_marcacion,
    crew_id: marcacion.crew_id,
    evento_id: 0,
    nombres: marcacion.nombres,
    apellidos: marcacion.apellidos,
    fecha: marcacion.fecha_marcacion || '',
    hora: marcacion.hora_display,
    tipo: marcacion.tipo_marcacion_texto,
    evento_nombre: marcacion.descripcion_evento,
    ubicacion: marcacion.descripcion_lugar || undefined,
    verificado: true
  };
};

export const useMarcacionesStore = create<MarcacionesState>((set, get) => ({
  marcaciones: [],
  loading: false,
  error: null,

  loadRecentMarcaciones: async (limit = 10) => {
    set({ loading: true, error: null });
    
    try {
      const response = await marcacionesService.getRecentMarcaciones(limit);
      
      if (response.success && response.data) {
        const marcacionesMapped = response.data.map(mapMarcacionBackendToFrontend);
        set({ 
          marcaciones: marcacionesMapped,
          loading: false,
          error: null
        });
      } else {
        set({ 
          marcaciones: [],
          loading: false,
          error: response.message || 'Error al cargar marcaciones'
        });
      }
    } catch (error: any) {
      console.error('Error cargando marcaciones:', error);
      set({ 
        loading: false, 
        error: error.message || 'Error de conexión'
      });
    }
  },

  loadTodayMarcaciones: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await marcacionesService.getTodayMarcaciones();
      
      if (response.success && response.data) {
        const marcacionesMapped = response.data.map(mapMarcacionBackendToFrontend);
        set({ 
          marcaciones: marcacionesMapped,
          loading: false,
          error: null
        });
      } else {
        set({ 
          marcaciones: [],
          loading: false,
          error: response.message || 'Error al cargar marcaciones de hoy'
        });
      }
    } catch (error: any) {
      console.error('Error cargando marcaciones de hoy:', error);
      set({ 
        loading: false, 
        error: error.message || 'Error de conexión'
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));