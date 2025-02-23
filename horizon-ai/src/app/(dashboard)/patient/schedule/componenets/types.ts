// Session interface
export interface Session {
    id: string;
    sessionDate: Date;
    therapist: string;
    therapistId: string;
    summary: string;
    detailedNotes?: string;
    keyPoints: string[];
    insights: string[];
    mood: string;
    progress: string;
    goals: string[];
    warnings: string[];
    transcript: string;
    journalingPrompt: string;
    journalingResponse: string;
    patientId: string;
    status: string;
    icon: unknown;
  }
  
  // Therapist interface
export interface Therapist {
    id: string;
    first_name: string;
    last_name: string;
}