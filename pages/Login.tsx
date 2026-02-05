import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { User, Briefcase, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === Role.CLIENT) navigate('/client');
      if (user.role === Role.PROVIDER) navigate('/provider');
      if (user.role === Role.ADMIN) navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = (role: Role) => {
    login(role);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome to BookYourService</h1>
        <p className="text-gray-600">Select a role to simulate login (Step 0.1 Demo)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full px-4">
        {/* Client Card */}
        <button
          onClick={() => handleLogin(Role.CLIENT)}
          className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-indigo-500 group"
        >
          <div className="p-4 bg-indigo-50 rounded-full mb-4 group-hover:bg-indigo-100">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Client</h3>
          <p className="text-sm text-gray-500 mt-2 text-center">Browse services, book appointments, and leave reviews.</p>
        </button>

        {/* Provider Card */}
        <button
          onClick={() => handleLogin(Role.PROVIDER)}
          className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-blue-500 group"
        >
           <div className="p-4 bg-blue-50 rounded-full mb-4 group-hover:bg-blue-100">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Provider</h3>
          <p className="text-sm text-gray-500 mt-2 text-center">Create services, manage bookings, and track earnings.</p>
        </button>

        {/* Admin Card */}
        <button
          onClick={() => handleLogin(Role.ADMIN)}
          className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-transparent hover:border-red-500 group"
        >
           <div className="p-4 bg-red-50 rounded-full mb-4 group-hover:bg-red-100">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Admin</h3>
          <p className="text-sm text-gray-500 mt-2 text-center">Approve services, manage users, and oversee the platform.</p>
        </button>
      </div>
      
      <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl text-xs text-yellow-800">
        <p className="font-bold mb-1">System Requirements Note:</p>
        <p>This login screen is for demonstration. In the real system (Step 2), JWT tokens, bcrypt hashing, and secure sessions will be enforced as per <b>SYSTEM_REQUIREMENTS.md</b>.</p>
      </div>
    </div>
  );
};