import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Doctor, Specialization, Appointment } from '../types';
import {
  MapPin,
  User,
  LogOut,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Circle
} from 'lucide-react';

export const PatientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<(Doctor & { profiles?: any; specializations?: any })[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'appointments'>('discover');

  useEffect(() => {
    if (!user || user.user_type !== 'patient') {
      navigate('/patient/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);

    const { data: specsData } = await supabase
      .from('specializations')
      .select('*')
      .order('name');

    if (specsData) setSpecializations(specsData);

    await loadDoctors();
    await loadAppointments();

    setLoading(false);
  };

  const loadDoctors = async () => {
    let query = supabase
      .from('doctors')
      .select('*, profiles(*), specializations(*)')
      .order('created_at', { ascending: false });

    if (selectedSpecialization) {
      query = query.eq('specialization_id', selectedSpecialization);
    }

    const { data } = await query;
    if (data) setDoctors(data);
  };

  const loadAppointments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors(*, profiles(*), specializations(*))
      `)
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: false });

    if (data) setAppointments(data as any);
  };

  useEffect(() => {
    loadDoctors();
  }, [selectedSpecialization]);

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      doctor.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      doctor.specializations?.name?.toLowerCase().includes(searchLower) ||
      doctor.address?.toLowerCase().includes(searchLower)
    );
  });

  const handleBookAppointment = (doctor: Doctor) => {
    navigate(`/patient/book/${doctor.id}`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-blue-500 p-2 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">DocNear</h1>
                <p className="text-xs text-gray-500">Patient Portal</p>
              </div>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 font-medium">
                {user?.profile?.full_name}
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
        <div className="mb-6 flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'discover'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Discover Doctors</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'appointments'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>My Appointments</span>
            </div>
          </button>
        </div>

        {activeTab === 'discover' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-2" />
                    Search Doctors
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, specialization, or location..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="w-4 h-4 inline mr-2" />
                    Filter by Specialization
                  </label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No doctors found</p>
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Dr. {doctor.profiles?.full_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doctor.specializations?.name}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doctor.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {doctor.is_available ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                      {doctor.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{doctor.address}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-semibold">
                          ${doctor.consultation_fee}
                        </span>
                        <span className="ml-1">consultation fee</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      disabled={!doctor.is_available}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No appointments yet</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
                >
                  Discover doctors to book appointments
                </button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4 mb-4 md:mb-0">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Dr. {appointment.doctors?.profiles?.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.doctors?.specializations?.name}
                        </p>
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{appointment.appointment_date}</span>
                          <Clock className="w-4 h-4 ml-4 mr-2" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        {appointment.symptoms && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                          </p>
                        )}
                        {appointment.otp && appointment.status === 'confirmed' && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">OTP:</span>{' '}
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {appointment.otp}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
