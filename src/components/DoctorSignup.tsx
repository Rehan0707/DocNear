import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Stethoscope, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  experience_years?: string;
  consultation_fee?: string;
  address?: string;
}

export const DoctorSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    experience_years: '',
    address: '',
    consultation_fee: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to create demo appointments for new doctors
  const createDemoAppointments = async (doctorId: string) => {
    try {
      // Get existing patients to use for demo appointments
      const { data: existingPatients } = await supabase
        .from('patients')
        .select('id')
        .limit(3);

      if (!existingPatients || existingPatients.length === 0) {
        // No existing patients, skip demo data
        console.log('No existing patients found, skipping demo appointments');
        return;
      }

      // Calculate dates for demo appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Generate OTP helper
      const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

      // Create demo appointments with different statuses
      const demoAppointments: Array<{
        patient_id: string;
        doctor_id: string;
        appointment_date: string;
        appointment_time: string;
        status: string;
        symptoms: string;
        otp: string | null;
      }> = [
        {
          patient_id: existingPatients[0]?.id,
          doctor_id: doctorId,
          appointment_date: tomorrow.toISOString().split('T')[0],
          appointment_time: '10:00',
          status: 'pending',
          symptoms: 'Regular checkup and consultation',
          otp: null,
        },
      ];

      // Add second appointment if we have at least 2 patients
      if (existingPatients.length >= 2) {
        demoAppointments.push({
          patient_id: existingPatients[1]?.id,
          doctor_id: doctorId,
          appointment_date: nextWeek.toISOString().split('T')[0],
          appointment_time: '14:30',
          status: 'confirmed',
          symptoms: 'Follow-up appointment for previous consultation',
          otp: generateOTP(),
        });
      }

      // Add third appointment (completed) if we have at least 3 patients
      if (existingPatients.length >= 3) {
        demoAppointments.push({
          patient_id: existingPatients[2]?.id,
          doctor_id: doctorId,
          appointment_date: twoWeeksAgo.toISOString().split('T')[0],
          appointment_time: '11:00',
          status: 'completed',
          symptoms: 'General health examination',
          otp: generateOTP(),
        });
      }

      // Insert demo appointments
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .insert(demoAppointments.filter(apt => apt.patient_id));

      if (appointmentsError) {
        console.error('Error creating demo appointments:', appointmentsError);
      }
    } catch (err) {
      console.error('Error creating demo data:', err);
      // Don't throw - demo data is optional and shouldn't block signup
    }
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        return undefined;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return undefined;
      case 'experience_years':
        if (!value) return 'Years of experience is required';
        const years = parseInt(value);
        if (isNaN(years) || years < 0) return 'Please enter a valid number';
        if (years > 100) return 'Please enter a realistic number of years';
        return undefined;
      case 'consultation_fee':
        if (!value) return 'Consultation fee is required';
        const fee = parseFloat(value);
        if (isNaN(fee) || fee < 0) return 'Please enter a valid amount';
        return undefined;
      case 'address':
        if (!value.trim()) return 'Clinic address is required';
        if (value.trim().length < 5) return 'Please enter a complete address';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Sign up user
      const { error: signUpError } = await signUp(
        formData.email.trim(),
        formData.password,
        {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          user_type: 'doctor',
        }
      );

      if (signUpError) throw signUpError;

      // Get the newly created user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not created');

      // Update doctor record with additional information
      const { error: doctorError } = await supabase
        .from('doctors')
        .update({
          experience_years: parseInt(formData.experience_years) || 0,
          address: formData.address.trim() || null,
          consultation_fee: parseFloat(formData.consultation_fee) || 0,
          latitude: 40.7128, // Default coordinates (can be enhanced with geocoding)
          longitude: -74.0060,
        })
        .eq('id', user.id);

      if (doctorError) throw doctorError;

      // Create demo appointments for the new doctor
      await createDemoAppointments(user.id);

      // Navigate to dashboard
      navigate('/doctor/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasError = (field: string) => errors[field as keyof FormErrors];
  const isValid = (field: string) => formData[field as keyof typeof formData] && !hasError(field);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-500 p-3 rounded-full">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Doctor Signup</h2>
        <p className="text-center text-gray-600 mb-8">Join DocNear and connect with patients</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('full_name')
                      ? 'border-red-300 bg-red-50'
                      : isValid('full_name')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Dr. Jane Smith"
                />
                {isValid('full_name') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('full_name') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('full_name') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.full_name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('email')
                      ? 'border-red-300 bg-red-50'
                      : isValid('email')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
                {isValid('email') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('email') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('email') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('phone')
                      ? 'border-red-300 bg-red-50'
                      : isValid('phone')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 000-0000"
                />
                {isValid('phone') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('phone') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('phone') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('password')
                      ? 'border-red-300 bg-red-50'
                      : isValid('password')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  minLength={6}
                />
                {isValid('password') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('password') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('password') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="experience_years"
                  required
                  min="0"
                  max="100"
                  value={formData.experience_years}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('experience_years')
                      ? 'border-red-300 bg-red-50'
                      : isValid('experience_years')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="5"
                />
                {isValid('experience_years') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('experience_years') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('experience_years') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.experience_years}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee ($) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="consultation_fee"
                  required
                  min="0"
                  step="0.01"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('consultation_fee')
                      ? 'border-red-300 bg-red-50'
                      : isValid('consultation_fee')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="50.00"
                />
                {isValid('consultation_fee') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('consultation_fee') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('consultation_fee') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.consultation_fee}</span>
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Address *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField(e.target.name, e.target.value);
                    setErrors(prev => ({ ...prev, [e.target.name]: error }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 ${
                    hasError('address')
                      ? 'border-red-300 bg-red-50'
                      : isValid('address')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="123 Medical Center, NY"
                />
                {isValid('address') && (
                  <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
                {hasError('address') && (
                  <XCircle className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {hasError('address') && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/doctor/login')}
              className="text-green-500 hover:text-green-600 font-medium transition-colors"
            >
              Login
            </button>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-600 font-medium mt-2 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
