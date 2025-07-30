import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { marcacionesService } from '../services/marcacionesService';
import { zustandStorage } from '../storage/mmkvStorage';
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

// Función para mapear datos del backend al frontend (mantener igual)
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

export const useMarcacionesStore = create<MarcacionesState>()(
  persist(
    (set, get) => ({
      marcaciones: [],
      loading: false,
      error: null,

      loadRecentMarcaciones: async (limit = 10) => {
        console.log('⏰ [MARCACIONES] Cargando marcaciones recientes...');
        set({ loading: true, error: null });
        
        try {
          const startTime = Date.now();
          const response = await marcacionesService.getRecentMarcaciones(limit);
          console.log(`⏰ [MARCACIONES] Marcaciones obtenidas en ${Date.now() - startTime}ms`);
          
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
          console.error('⏰ [MARCACIONES] Error cargando marcaciones:', error);
          set({ 
            loading: false, 
            error: error.message || 'Error de conexión'
          });
        }
      },

      loadTodayMarcaciones: async () => {
        console.log('⏰ [MARCACIONES] Cargando marcaciones de hoy...');
        set({ loading: true, error: null });
        
        try {
          const startTime = Date.now();
          const response = await marcacionesService.getTodayMarcaciones();
          console.log(`⏰ [MARCACIONES] Marcaciones de hoy obtenidas en ${Date.now() - startTime}ms`);
          
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
          console.error('⏰ [MARCACIONES] Error cargando marcaciones de hoy:', error);
          set({ 
            loading: false, 
            error: error.message || 'Error de conexión'
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'marcaciones-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ 
        marcaciones: state.marcaciones 
      }), // Solo persistir marcaciones (no loading, error)
      version: 1,
    }
  )
);