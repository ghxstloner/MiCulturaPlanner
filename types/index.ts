export interface User {
  login: string;
  name: string;
  email: string;
  is_admin: boolean;
  id_aerolinea?: number;
  active?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  eventId: string;
  timestamp: string;
  photo: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationMethod: 'facial' | 'manual';
  notes?: string;
}

export interface FacialRecognitionResult {
  success: boolean;
  confidence: number;
  userId?: string;
  message: string;
}