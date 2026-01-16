import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button'; // Assume Button.tsx uses standard HTML now
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService'; // Fixed Path

// ============================================
// LOGIN PAGE (MVP - NO EXTERNAL LIBS)
// ============================================
// Purpose: User Login with visual feedback.
// Stack: React + Tailwind CSS (Standard HTML).
// Type: Production-Grade (No Framer Motion, No Lucide).
// 
// IMPORTANT:
// 1. Removed `lucide-react` imports (Missing Library).
// 2. Removed `framer-motion` imports (Missing Library).
// 3. Fixed `AuthService` path (From `../../../` to `../../`).
// 4. Replaced Icons with Text/Emojis.
// 5. Replaced Motion with Tailwind `transition` classes.
// ============================================

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/c/dashboard'); // Redirect to Customer Dashboard
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 transition-all duration-300 ease-in-out">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="text-slate-600">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">✉️</span> {/* Mail Icon Emoji */}
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span> {/* Lock Icon Emoji */}
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? '🙈' : '👁️'} {/* Eye Icons Emojis */}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" isLoading={loading} className="w-full shadow-lg hover:shadow-xl transition-all duration-300">
            {loading ? 'Logging in...' : 'Log In'}
            {!loading && '➡️'} {/* Arrow Right Emoji */}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
