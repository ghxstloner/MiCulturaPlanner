export interface User {
    id: string;
    name: string;
    email: string;
    cedula: string;
    position: string;
    department: string;
    phone?: string;
    photo?: string;
  }
  
  export interface AttendanceRecord {
    id: string;
    userId: string;
    eventId: string;
    timestamp: string;
    location: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
    photo: string;
    status: 'pending' | 'verified' | 'rejected';
    verificationMethod: 'facial' | 'manual';
    notes?: string;
  }
  
  export interface LocationValidation {
    isValid: boolean;
    distance: number;
    requiredRadius: number;
    message: string;
  }
  
  export interface FacialRecognitionResult {
    success: boolean;
    confidence: number;
    userId?: string;
    message: string;
  }