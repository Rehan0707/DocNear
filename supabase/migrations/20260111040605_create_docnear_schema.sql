/*
  # DocNear Healthcare Application Schema

  ## Overview
  Complete database schema for a healthcare appointment booking platform with patient and doctor portals.

  ## New Tables

  ### 1. `specializations`
  Lookup table for medical specializations
  - `id` (uuid, primary key)
  - `name` (text, unique) - Specialization name (e.g., Cardiologist, Dermatologist)
  - `created_at` (timestamptz)

  ### 2. `profiles`
  Extended user profiles for both patients and doctors
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `user_type` (text) - Either 'patient' or 'doctor'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `doctors`
  Doctor-specific information
  - `id` (uuid, primary key, references profiles)
  - `specialization_id` (uuid, references specializations)
  - `experience_years` (integer)
  - `is_available` (boolean) - Online/Offline status
  - `latitude` (decimal) - For map location
  - `longitude` (decimal) - For map location
  - `address` (text)
  - `consultation_fee` (decimal)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `patients`
  Patient-specific information
  - `id` (uuid, primary key, references profiles)
  - `date_of_birth` (date)
  - `gender` (text)
  - `address` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `appointments`
  Appointment bookings between patients and doctors
  - `id` (uuid, primary key)
  - `patient_id` (uuid, references patients)
  - `doctor_id` (uuid, references doctors)
  - `appointment_date` (date)
  - `appointment_time` (time)
  - `status` (text) - pending, confirmed, completed, cancelled, rejected
  - `otp` (text) - 6-digit OTP for verification
  - `otp_verified` (boolean)
  - `symptoms` (text) - Patient's symptoms/reason for visit
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their own data
  - Patients can view doctors and book appointments
  - Doctors can view their appointments and update availability
*/

-- Create specializations table
CREATE TABLE IF NOT EXISTS specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialization_id uuid REFERENCES specializations(id),
  experience_years integer DEFAULT 0,
  is_available boolean DEFAULT true,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  address text,
  consultation_fee decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
  otp text,
  otp_verified boolean DEFAULT false,
  symptoms text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default specializations
INSERT INTO specializations (name) VALUES
  ('General Physician'),
  ('Cardiologist'),
  ('Dermatologist'),
  ('Pediatrician'),
  ('Orthopedic'),
  ('Gynecologist'),
  ('Neurologist'),
  ('Psychiatrist'),
  ('Dentist'),
  ('Ophthalmologist')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for specializations (public read)
CREATE POLICY "Anyone can view specializations"
  ON specializations FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for doctors
CREATE POLICY "Anyone can view available doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can insert own profile"
  ON doctors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Patients can view own profile"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Patients can insert own profile"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can update own profile"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );

CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
  );

CREATE POLICY "Patients can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
  )
  WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid())
  );

CREATE POLICY "Doctors can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  )
  WITH CHECK (
    doctor_id IN (SELECT id FROM doctors WHERE id = auth.uid())
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization_id);
CREATE INDEX IF NOT EXISTS idx_doctors_availability ON doctors(is_available);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);