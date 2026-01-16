/**
 * LOGIN PAGE (IMPROVED & SECURE)
 * Route: /login
 * DB: auth.users (Supabase Auth)
 * UI: Enhanced form + Password toggle + Loading states
 */

import { useState } from 'react';
import { supabase } from '../../services/supabase-production';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle redirect from other pages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset')) {
      setSuccessMessage('Password reset link sent to your email.');
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        // Handle specific auth errors
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in.');
        } else {
          throw new Error('Login failed. Please try again later.');
        }
      }

      if (!data.user) {
        throw new Error('Login failed. Please try again.');
      }

      // Fetch user role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single();

      // Check if user is suspended
      if (profileData?.status === 'suspended') {
        throw new Error('Your account has been suspended. Please contact support.');
      }

      // Check if user is pending approval (for providers/admins)
      if (profileData?.role === 'provider' && profileData?.status === 'pending') {
        throw new Error('Your provider application is pending approval.');
      }

      if (profileData?.role === 'admin' && profileData?.status === 'unapproved') {
        throw new Error('Admin access not approved. Contact management.');
      }

      // Login successful - redirect based on role
      const userRole = profileData?.role;
      
      if (userRole === 'customer') {
        navigate('/customer/bookings');
      } else if (userRole === 'provider') {
        navigate('/provider/requests');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
      
      if (error) {
        throw error;
      }

      setSuccessMessage('Password reset email sent! Check your inbox.');
      setError(null);
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your BookYourService account</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000-16zm1 10a1 1 0 01-1-1 1 1 0 001 0V9a1 1 0 00-2-2H9a1 1 0 000 0v3.984l-3.464 3.463a1 1 0 00-1.415 1.414l-7.071 7.071a1 1 0 00-1.414 0l-7.071-7.071a1 1 0 00-1.414 0l-7.997 3.997a1 1 0 00-.293-.707l-7.997-3.997a1 1 0 00-1.414 0l-2.828-2.828a1 1 0 00-.293.707l-7.997 3.997a1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 sm:text-sm"
                placeholder="you@example.com"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997 3.997A1 1 0 0014.001 18v-3.984a1 1 0 00-.707-.293l-7.997-3.997a1 1 0 00-1.414-0l-7.997-3.997a1 1 0 00-1.414 0l-7.997 3.997a1 1 0 00-.293-.707l-2.828-2.828a1 1 0 00-.293.707l-7.997 3.997a1 1 0 000 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 sm:text-sm"
                placeholder="Enter your password"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 1110 5v2a1 1 0 01-1-1H6a1 1 0 000-1-1V7a1 1 0 000-1-1H5zm-2 0a3 3 0 110-6h6a3 3 0 110-6h6zM3 9a1 1 0 110-2h10a1 1 0 110-2H3z" clipRule="evenodd" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112.19 0l-1.695-2.195c.068-.404.145-.8.287-1.1.29-.688.538-1.627.561-2.362 1.331-.638 2.828-1.565 3.632-1.317 5.688-2.195 6.857-2.887 8.905-1.565a1.1 1.1 0 01-1.252-2.825L12.475 3.896a10.08 10.08 0 01-7.498-3.06z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-2 0a3 3 0 110-6h6a3 3 0 110-6h6zM3 9a1 1 0 110-2h10a1 1 0 110-2H3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-blue-400"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
