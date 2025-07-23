export interface CulturalEvent {
    id: string;
    name: string;
    location: string;
    address: string;
    description: string;
    startDate: string;
    endDate: string;
    latitude: number;
    longitude: number;
    radius: number; // Radio en metros para validar asistencia
    category: 'teatro' | 'musica' | 'danza' | 'artes_visuales' | 'literatura' | 'cine' | 'patrimonio';
    status: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
    organizador: string;
    requiredPersonnel: string[];
  }
  
  // Mock data de eventos culturales en Panamá
  export const MOCK_EVENTS: CulturalEvent[] = [
    {
      id: '1',
      name: 'Festival Nacional de Teatro Panameño',
      location: 'Teatro Nacional',
      address: 'Avenida B, Casco Viejo, Ciudad de Panamá',
      description: 'Festival anual que celebra las artes escénicas panameñas',
      startDate: '2025-07-25T08:00:00Z',
      endDate: '2025-07-25T22:00:00Z',
      latitude: 8.9537,
      longitude: -79.5371,
      radius: 50,
      category: 'teatro',
      status: 'programado',
      organizador: 'Dirección de Artes Escénicas',
      requiredPersonnel: ['personal_tecnico', 'coordinador_evento', 'asistente_direccion']
    },
    {
      id: '2',
      name: 'Concierto de la Orquesta Sinfónica Nacional',
      location: 'Teatro Anayansi',
      address: 'Atlapa, Ciudad de Panamá',
      description: 'Presentación especial de música sinfónica panameña',
      startDate: '2025-07-26T19:00:00Z',
      endDate: '2025-07-26T22:00:00Z',
      latitude: 9.0192,
      longitude: -79.5051,
      radius: 75,
      category: 'musica',
      status: 'programado',
      organizador: 'Dirección de Música',
      requiredPersonnel: ['coordinador_musical', 'personal_tecnico', 'asistente_produccion']
    },
    {
      id: '3',
      name: 'Exposición de Arte Contemporáneo Panameño',
      location: 'Museo de Arte Contemporáneo',
      address: 'Ancón, Ciudad de Panamá',
      description: 'Muestra de artistas contemporáneos panameños',
      startDate: '2025-07-27T09:00:00Z',
      endDate: '2025-07-27T18:00:00Z',
      latitude: 8.9667,
      longitude: -79.5447,
      radius: 40,
      category: 'artes_visuales',
      status: 'en_curso',
      organizador: 'Dirección de Patrimonio',
      requiredPersonnel: ['curador', 'guia_museo', 'personal_seguridad']
    }
  ];
  
  export const EVENT_CATEGORIES = {
    teatro: { label: 'Teatro', icon: 'library', color: '#8B5A3C' }, // Cambiar de 'theater-masks'
    musica: { label: 'Música', icon: 'musical-notes', color: '#1B4D8C' },
    danza: { label: 'Danza', icon: 'body', color: '#D4AF37' },
    artes_visuales: { label: 'Artes Visuales', icon: 'brush', color: '#FF6B6B' }, // Cambiar de 'palette'
    literatura: { label: 'Literatura', icon: 'book', color: '#32CD32' },
    cine: { label: 'Cine', icon: 'videocam', color: '#9C27B0' },
    patrimonio: { label: 'Patrimonio', icon: 'library', color: '#795548' }
  };
  
  export const PERSONNEL_TYPES = {
    personal_tecnico: 'Personal Técnico',
    coordinador_evento: 'Coordinador de Evento',
    asistente_direccion: 'Asistente de Dirección',
    coordinador_musical: 'Coordinador Musical',
    asistente_produccion: 'Asistente de Producción',
    curador: 'Curador',
    guia_museo: 'Guía de Museo',
    personal_seguridad: 'Personal de Seguridad'
  };