export interface Specialization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  user_type: 'patient' | 'doctor';
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  specialization_id: string | null;
  experience_years: number;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  consultation_fee: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  specializations?: Specialization;
}

export interface Patient {
  id: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  otp: string | null;
  otp_verified: boolean;
  symptoms: string | null;
  created_at: string;
  updated_at: string;
  doctors?: Doctor & { profiles?: Profile; specializations?: Specialization };
  patients?: Patient & { profiles?: Profile };
}

export interface User {
  id: string;
  email: string;
  user_type: 'patient' | 'doctor';
  profile?: Profile;
  doctor?: Doctor;
  patient?: Patient;
}
