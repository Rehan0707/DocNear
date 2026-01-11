import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import {
  Stethoscope,
  LogOut,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Clock,
  ToggleLeft,
  ToggleRight,
  FileText,
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!user || user.user_type !== 'doctor') {
      navigate('/doctor/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    const { data: doctorData } = await supabase
      .from('doctors')
      .select('is_available')
      .eq('id', user.id)
      .maybeSingle();

    if (doctorData) {
      setIsAvailable(doctorData.is_available);
    }

    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(*, profiles(*))
      `)
      .eq('doctor_id', user.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (appointmentsData) {
      setAppointments(appointmentsData as any);

      setStats({
        total: appointmentsData.length,
        pending: appointmentsData.filter((a) => a.status === 'pending').length,
        confirmed: appointmentsData.filter((a) => a.status === 'confirmed').length,
        completed: appointmentsData.filter((a) => a.status === 'completed').length,
      });
    }

    setLoading(false);
  };

  const toggleAvailability = async () => {
    if (!user) return;

    const newAvailability = !isAvailable;
    const { error } = await supabase
      .from('doctors')
      .update({ is_available: newAvailability })
      .eq('id', user.id);

    if (!error) {
      setIsAvailable(newAvailability);
      await refreshUser();
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'confirm' | 'reject' | 'complete') => {
    const statusMap = {
      confirm: 'confirmed',
      reject: 'rejected',
      complete: 'completed',
    };

    const { error } = await supabase
      .from('appointments')
      .update({ status: statusMap[action] })
      .eq('id', appointmentId);

    if (!error) {
      await loadData();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/doctor/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-green-500 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">DocNear</h1>
                <p className="text-xs text-gray-500">Doctor Portal</p>
              </div>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAvailability}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  isAvailable
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                {isAvailable ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                <span>{isAvailable ? 'Online' : 'Offline'}</span>
              </button>
              <span className="text-sm text-gray-700 font-medium">
                Dr. {user?.profile?.full_name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No appointments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {appointment.patients?.profiles?.full_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                        </div>
                        {appointment.symptoms && (
                          <div className="mt-2 flex items-start">
                            <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                            </p>
                          </div>
                        )}
                        {appointment.otp && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">OTP:</span>{' '}
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-lg">
                                {appointment.otp}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium text-center ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.toUpperCase()}
                      </span>
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
