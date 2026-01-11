import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Calendar, Shield, User, Stethoscope } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Heart className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">DocNear</span>
            </button>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/patient/login')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Patient Login
              </button>
              <button
                onClick={() => navigate('/doctor/login')}
                className="px-4 py-2 text-green-600 hover:text-green-700 font-medium transition"
              >
                Doctor Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find & Book Doctors Near You
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with verified doctors instantly. Book appointments with ease.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/patient/signup')}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Sign Up as Patient</span>
            </button>
            <button
              onClick={() => navigate('/doctor/signup')}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2"
            >
              <Stethoscope className="w-5 h-5" />
              <span>Sign Up as Doctor</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Nearby Doctors</h3>
            <p className="text-gray-600">
              Discover qualified doctors near your location with real-time availability status.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book appointments instantly with your preferred doctors at convenient times.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure & Verified</h3>
            <p className="text-gray-600">
              All doctors are verified professionals. Your data is protected and secure.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Care</h3>
            <p className="text-gray-600">
              Access to experienced doctors across multiple specializations for better healthcare.
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">For Patients</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Browse Doctors by Specialization</h4>
                    <p className="text-gray-600">Find the right specialist for your needs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">View Doctor Locations</h4>
                    <p className="text-gray-600">See doctors near you with addresses</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mt-1 mr-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">OTP Verification</h4>
                    <p className="text-gray-600">Secure appointments with OTP verification</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">For Doctors</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mt-1 mr-3">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Manage Your Profile</h4>
                    <p className="text-gray-600">Set specialization, experience, and fees</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mt-1 mr-3">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Control Availability</h4>
                    <p className="text-gray-600">Toggle online/offline status anytime</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mt-1 mr-3">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Accept or Reject Appointments</h4>
                    <p className="text-gray-600">Full control over your appointment schedule</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">DocNear</span>
          </div>
          <p className="text-gray-400">
            Your trusted healthcare companion. Find & Book Doctors Near You.
          </p>
        </div>
      </footer>
    </div>
  );
};
