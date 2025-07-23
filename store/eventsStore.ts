import * as Location from 'expo-location';
import { create } from 'zustand';
import { CulturalEvent, MOCK_EVENTS } from '../constants/Events';
import { AttendanceRecord, FacialRecognitionResult, LocationValidation } from '../types';

interface EventsState {
  events: CulturalEvent[];
  currentEvent: CulturalEvent | null;
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  
  // Actions
  loadEvents: () => Promise<void>;
  setCurrentEvent: (eventId: string) => void;
  validateLocation: (eventId: string, currentLocation: Location.LocationObject) => Promise<LocationValidation>;
  simulateFacialRecognition: (photo: string) => Promise<FacialRecognitionResult>;
  recordAttendance: (eventId: string, photo: string, location: Location.LocationObject) => Promise<boolean>;
  getAttendanceHistory: () => AttendanceRecord[];
}

// Función para calcular distancia entre dos puntos
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  currentEvent: null,
  attendanceRecords: [],
  loading: false,

  loadEvents: async () => {
    set({ loading: true });
    
    try {
      // Simular carga desde API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar eventos de hoy y futuros
      const today = new Date();
      const activeEvents = MOCK_EVENTS.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today || event.status === 'en_curso';
      });
      
      set({ 
        events: activeEvents,
        loading: false 
      });
    } catch (error) {
      console.error('Error cargando eventos:', error);
      set({ loading: false });
    }
  },

  setCurrentEvent: (eventId: string) => {
    const event = get().events.find(e => e.id === eventId);
    set({ currentEvent: event || null });
  },

  validateLocation: async (eventId: string, currentLocation: Location.LocationObject) => {
    const event = get().events.find(e => e.id === eventId);
    
    if (!event) {
      return {
        isValid: false,
        distance: 0,
        requiredRadius: 0,
        message: 'Evento no encontrado'
      };
    }

    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      event.latitude,
      event.longitude
    );

    const isValid = distance <= event.radius;

    return {
      isValid,
      distance: Math.round(distance),
      requiredRadius: event.radius,
      message: isValid 
        ? `Ubicación verificada. Estás a ${Math.round(distance)}m del evento.`
        : `Estás a ${Math.round(distance)}m del evento. Debes estar dentro de ${event.radius}m.`
    };
  },

  simulateFacialRecognition: async (photo: string) => {
    // Simular procesamiento de reconocimiento facial
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular resultado aleatorio con alta probabilidad de éxito
    const success = Math.random() > 0.1; // 90% de éxito
    const confidence = success ? 0.85 + Math.random() * 0.14 : 0.3 + Math.random() * 0.4;
    
    return {
      success,
      confidence: Math.round(confidence * 100) / 100,
      userId: success ? 'user_id_from_face' : undefined,
      message: success 
        ? `Reconocimiento exitoso (${Math.round(confidence * 100)}% confianza)`
        : 'No se pudo verificar la identidad. Intenta de nuevo.'
    };
  },

  recordAttendance: async (eventId: string, photo: string, location: Location.LocationObject) => {
    try {
      const timestamp = new Date().toISOString();
      const attendanceId = `attendance_${Date.now()}`;
      
      const newRecord: AttendanceRecord = {
        id: attendanceId,
        userId: 'current_user', // En una app real vendría del authStore
        eventId,
        timestamp,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined
        },
        photo,
        status: 'verified',
        verificationMethod: 'facial'
      };

      const currentRecords = get().attendanceRecords;
      set({ 
        attendanceRecords: [...currentRecords, newRecord]
      });

      return true;
    } catch (error) {
      console.error('Error registrando asistencia:', error);
      return false;
    }
  },

  getAttendanceHistory: () => {
    return get().attendanceRecords;
  },
}));