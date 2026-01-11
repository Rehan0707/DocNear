import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Doctor } from '../types';
import { Calendar, Clock, User, ArrowLeft, FileText } from 'lucide-react';

export const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor & { profiles?: any; specializations?: any } | null>(null);
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    symptoms: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.user_type !== 'patient') {
      navigate('/patient/login');
      return;
    }
    loadDoctor();
  }, [user, doctorId, navigate]);

  const loadDoctor = async () => {
    if (!doctorId) return;

    const { data } = await supabase
      .from('doctors')
      .select('*, profiles(*), specializations(*)')
      .eq('id', doctorId)
      .maybeSingle();

    if (data) {
      setDoctor(data);
    } else {
      setError('Doctor not found');
    }
    setLoading(false);
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !doctorId) return;

    setError('');
    setSubmitting(true);

    try {
      const otp = generateOTP();

      const { error: appointmentError } = await supabase.from('appointments').insert({
        patient_id: user.id,
        doctor_id: doctorId,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        symptoms: formData.symptoms,
        otp,
        status: 'pending',
      });

      if (appointmentError) throw appointmentError;

      navigate('/patient/dashboard', {
        state: { message: 'Appointment booked successfully! Waiting for doctor confirmation.' },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Doctor not found'}</p>
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">
                  Dr. {doctor.profiles?.full_name}
                </h3>
                <p className="text-gray-600">{doctor.specializations?.name}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Experience: {doctor.experience_years} years</p>
                  {doctor.address && <p>Location: {doctor.address}</p>}
                  <p className="text-lg font-semibold text-blue-600 mt-2">
                    Consultation Fee: ${doctor.consultation_fee}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Appointment Date
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={formData.appointment_date}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Appointment Time
              </label>
              <input
                type="time"
                required
                value={formData.appointment_time}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_time: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Symptoms / Reason for Visit
              </label>
              <textarea
                required
                rows={4}
                value={formData.symptoms}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                placeholder="Please describe your symptoms or reason for the appointment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> An OTP will be generated for this
                appointment. The doctor will share this OTP with you during your visit for
                verification.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/patient/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
