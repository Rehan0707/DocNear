# DocNear - Find & Book Doctors Near You

A complete healthcare web application with separate patient and doctor portals for easy appointment booking and management.

## Features

### Patient Portal
- **Sign up and login** with email/password
- **Browse doctors** by specialization
- **Search and filter** doctors by name, specialization, or location
- **View doctor profiles** with experience, fees, and availability status
- **Book appointments** with preferred date, time, and symptoms
- **View appointment history** with status tracking
- **OTP verification** for secure appointments

### Doctor Portal
- **Sign up and login** with professional details
- **Set specialization** and experience
- **Toggle availability** (Online/Offline status)
- **View appointment requests**
- **Accept or reject** appointment requests
- **Mark appointments as completed**
- **Dashboard statistics** showing total, pending, confirmed, and completed appointments
- **View OTPs** for appointment verification

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth with email/password
- **Routing**: React Router
- **Icons**: Lucide React

## Database Schema

The application uses the following tables:
- `specializations` - Medical specializations lookup
- `profiles` - User profiles (both patients and doctors)
- `doctors` - Doctor-specific information
- `patients` - Patient-specific information
- `appointments` - Appointment bookings with OTP verification

## Demo Accounts

The application comes with pre-configured demo doctor accounts for testing:

### Demo Doctors (Password: `demo123` for all)
- **sarah.johnson@docnear.com** - Cardiologist, 15 years experience
- **michael.chen@docnear.com** - Dermatologist, 10 years experience
- **emily.davis@docnear.com** - Pediatrician, 8 years experience
- **james.wilson@docnear.com** - Orthopedic, 12 years experience
- **lisa.anderson@docnear.com** - General Physician, 20 years experience

You can create your own patient account by signing up through the patient portal.

## Setup Instructions

### 1. Configure Supabase

Update the `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

The development server starts automatically in this environment.

### 4. Build for Production

```bash
npm run build
```

## User Flows

### Patient Flow
1. Sign up as a patient with basic information
2. Browse available doctors filtered by specialization
3. View doctor profiles with availability status
4. Book an appointment by selecting date, time, and describing symptoms
5. View appointment status (pending, confirmed, rejected, completed)
6. See OTP for confirmed appointments

### Doctor Flow
1. Sign up as a doctor with professional details
2. Set specialization, experience, address, and consultation fee
3. Toggle availability status to appear online/offline to patients
4. View incoming appointment requests
5. Accept or reject appointment requests
6. View OTP for each appointment to verify with patients
7. Mark appointments as completed after consultation

## Security Features

- Row Level Security (RLS) enabled on all tables
- Patients can only view their own appointments
- Doctors can only view and manage their own appointments
- Secure authentication with Supabase Auth
- OTP generation for appointment verification

## Key Components

- `AuthContext.tsx` - Authentication state management
- `PatientDashboard.tsx` - Patient portal with doctor discovery
- `DoctorDashboard.tsx` - Doctor portal with appointment management
- `BookAppointment.tsx` - Appointment booking flow
- `Home.tsx` - Landing page

## Notes

- The application uses a simplified location system with latitude/longitude fields
- OTP is automatically generated during appointment booking
- Doctors can see the OTP to verify appointments with patients
- All appointments require doctor confirmation before being marked as confirmed
