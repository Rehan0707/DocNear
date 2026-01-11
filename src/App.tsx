import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './components/Home';
import { PatientSignup } from './components/PatientSignup';
import { PatientLogin } from './components/PatientLogin';
import { PatientDashboard } from './components/PatientDashboard';
import { BookAppointment } from './components/BookAppointment';
import { DoctorSignup } from './components/DoctorSignup';
import { DoctorLogin } from './components/DoctorLogin';
import { DoctorDashboard } from './components/DoctorDashboard';
import { AIChatbot } from './components/AIChatbot';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/book/:doctorId" element={<BookAppointment />} />

          <Route path="/doctor/signup" element={<DoctorSignup />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
