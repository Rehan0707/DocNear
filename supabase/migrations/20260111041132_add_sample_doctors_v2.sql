/*
  # Add Sample Doctors for Testing

  ## Purpose
  This migration adds sample doctor accounts for testing and demonstration purposes.

  ## Sample Doctors Added
  - Dr. Sarah Johnson (Cardiologist) - 15 years experience
  - Dr. Michael Chen (Dermatologist) - 10 years experience
  - Dr. Emily Davis (Pediatrician) - 8 years experience
  - Dr. James Wilson (Orthopedic) - 12 years experience
  - Dr. Lisa Anderson (General Physician) - 20 years experience

  ## Notes
  - All doctors are set as available by default
  - Sample locations are set in New York City area
  - These are for demo/testing purposes only
*/

DO $$
DECLARE
  v_spec_cardio uuid;
  v_spec_derm uuid;
  v_spec_ped uuid;
  v_spec_ortho uuid;
  v_spec_general uuid;
  v_doctor_1 uuid := gen_random_uuid();
  v_doctor_2 uuid := gen_random_uuid();
  v_doctor_3 uuid := gen_random_uuid();
  v_doctor_4 uuid := gen_random_uuid();
  v_doctor_5 uuid := gen_random_uuid();
BEGIN
  SELECT id INTO v_spec_cardio FROM specializations WHERE name = 'Cardiologist';
  SELECT id INTO v_spec_derm FROM specializations WHERE name = 'Dermatologist';
  SELECT id INTO v_spec_ped FROM specializations WHERE name = 'Pediatrician';
  SELECT id INTO v_spec_ortho FROM specializations WHERE name = 'Orthopedic';
  SELECT id INTO v_spec_general FROM specializations WHERE name = 'General Physician';

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'sarah.johnson@docnear.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      v_doctor_1,
      'sarah.johnson@docnear.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      now(),
      now()
    );

    INSERT INTO profiles (id, email, full_name, phone, user_type)
    VALUES (v_doctor_1, 'sarah.johnson@docnear.com', 'Sarah Johnson', '+1 (555) 001-0001', 'doctor');

    INSERT INTO doctors (id, specialization_id, experience_years, is_available, latitude, longitude, address, consultation_fee)
    VALUES (v_doctor_1, v_spec_cardio, 15, true, 40.7580, -73.9855, '123 Medical Plaza, Manhattan, NY 10001', 150.00);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'michael.chen@docnear.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      v_doctor_2,
      'michael.chen@docnear.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      now(),
      now()
    );

    INSERT INTO profiles (id, email, full_name, phone, user_type)
    VALUES (v_doctor_2, 'michael.chen@docnear.com', 'Michael Chen', '+1 (555) 002-0002', 'doctor');

    INSERT INTO doctors (id, specialization_id, experience_years, is_available, latitude, longitude, address, consultation_fee)
    VALUES (v_doctor_2, v_spec_derm, 10, true, 40.7489, -73.9680, '456 Health Center, Brooklyn, NY 11201', 120.00);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'emily.davis@docnear.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      v_doctor_3,
      'emily.davis@docnear.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      now(),
      now()
    );

    INSERT INTO profiles (id, email, full_name, phone, user_type)
    VALUES (v_doctor_3, 'emily.davis@docnear.com', 'Emily Davis', '+1 (555) 003-0003', 'doctor');

    INSERT INTO doctors (id, specialization_id, experience_years, is_available, latitude, longitude, address, consultation_fee)
    VALUES (v_doctor_3, v_spec_ped, 8, true, 40.7614, -73.9776, '789 Children Hospital, Manhattan, NY 10019', 100.00);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'james.wilson@docnear.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      v_doctor_4,
      'james.wilson@docnear.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      now(),
      now()
    );

    INSERT INTO profiles (id, email, full_name, phone, user_type)
    VALUES (v_doctor_4, 'james.wilson@docnear.com', 'James Wilson', '+1 (555) 004-0004', 'doctor');

    INSERT INTO doctors (id, specialization_id, experience_years, is_available, latitude, longitude, address, consultation_fee)
    VALUES (v_doctor_4, v_spec_ortho, 12, true, 40.7589, -73.9851, '321 Orthopedic Clinic, Manhattan, NY 10022', 180.00);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'lisa.anderson@docnear.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      v_doctor_5,
      'lisa.anderson@docnear.com',
      crypt('demo123', gen_salt('bf')),
      now(),
      now(),
      now()
    );

    INSERT INTO profiles (id, email, full_name, phone, user_type)
    VALUES (v_doctor_5, 'lisa.anderson@docnear.com', 'Lisa Anderson', '+1 (555) 005-0005', 'doctor');

    INSERT INTO doctors (id, specialization_id, experience_years, is_available, latitude, longitude, address, consultation_fee)
    VALUES (v_doctor_5, v_spec_general, 20, true, 40.7282, -73.7949, '654 Family Care Center, Queens, NY 11375', 80.00);
  END IF;
END $$;