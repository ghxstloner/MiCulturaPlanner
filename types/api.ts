export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info: UserInfo;
  message: string;
}

export interface UserInfo {
  login: string;
  name: string;
  email: string;
  is_admin: boolean;
  id_aerolinea?: number;
  active?: string;
}

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export type EventsResponse = StandardResponse<EventoBackend[]>;

export interface EventoBackend {
  id_evento: number;
  fecha_evento: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  descripcion_evento: string | null;
  descripcion_lugar: string | null;
  descripcion_departamento: string | null;
  pais_nombre: string | null;
  id_departamento?: number;
  estatus?: number; // 1 = activo, 0 = inactivo
}

// Interface mapeada para el frontend
export interface Event {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  organizador?: string;
  pais?: string;
  estado: 'activo' | 'inactivo'; // Cambiado de estados complejos a simple activo/inactivo
  estatus: number; // Campo original del backend
  created_at: string;
  updated_at: string;
}

export interface EventDetail extends Event {
  direccion?: string;
  requisitos?: string[];
}

export interface PlanificacionBackend {
  id_planificacion: number;
  crew_id: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  identidad: string | null;
  fecha_vuelo: string | null;
  hora_entrada: string | null;
  hora_salida: string | null;
  estatus: string;
  descripcion_evento: string | null;
  descripcion_lugar: string | null;
  imagen: string | null; // ✅ Campo agregado para la imagen
  // ✅ MARCACIONES REALES - Campos de marcaciones reales
  marcacion_hora_entrada: string | null;
  marcacion_hora_salida: string | null;
  procesado: number;
}

export interface EventPlanification {
  tripulantes: Tripulante[];
  evento_id: number;
  total_asignados: number;
}

export interface Tripulante {
  crew_id: string;
  nombres: string;
  apellidos: string;
  cedula?: string;
  email?: string;
  departamento?: string;
  cargo?: string;
  activo: boolean;
  id_tripulante: number;
  // Nuevos campos para mostrar en la planificación
  fecha_vuelo?: string;
  hora_entrada?: string;
  hora_salida?: string;
  imagen?: string;
  // ✅ MARCACIONES REALES - Campos de marcaciones reales
  marcacion_entrada?: string;
  marcacion_salida?: string;
  procesado?: number;
}

export interface FacialRecognitionResponse {
  success: boolean;
  message: string;
  tripulante_info?: {
    crew_id: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    departamento: string;
    cargo: string;
  };
  marcacion_info?: {
    id_marcacion: number;
    tipo_marcacion: string;
    fecha: string;
    hora: string;
    evento: string;
  };
  matches_found?: FacialMatch[];
  processing_time?: number;
  requires_reassignment?: boolean;
}

export interface FacialMatch {
  crew_id: string;
  nombres: string;
  apellidos: string;
  confidence: number;
  distance: number;
  id_tripulante: number;
}

export type MarcacionesResponse = StandardResponse<MarcacionBackend[]>;

export interface MarcacionBackend {
  id_marcacion: number;
  crew_id: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  fecha_marcacion: string | null;
  hora_marcacion: string | null;
  hora_display: string;
  tipo_marcacion_texto: string;
  tipo_marcacion: number;
  descripcion_evento: string;
  descripcion_lugar: string | null;
  mensaje: string;
}

// Interface mapeada para el frontend
export interface Marcacion {
  id: number;
  crew_id: string;
  evento_id: number;
  nombres: string;
  apellidos: string;
  fecha: string;
  hora: string;
  tipo: string;
  evento_nombre: string;
  ubicacion?: string;
  verificado: boolean;
}