import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API, buildUrl } from '../../config/api';

// ============================================
// ADVANCED REGISTER PAGE
// ============================================
// Purpose: Modern registration with validation and backend integration
// Stack: React + Framer Motion + API Integration
// Type: Production-Grade

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'provider';
  termsAccepted: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    termsAccepted: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^[6-9]\d{9,10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Please enter a password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);

    try {
      const response = await fetch(buildUrl(API.AUTH.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);

        // Redirect to login after brief success animation
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      }
    } catch (err: any) {
      setErrors({ general: 'Network error. Please check your connection.' });
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
              {/* Progress Steps */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-black text-white">
                    {step === 1 ? 'Create Account' : 'Secure Your Account'}
                  </h1>
                  <div className="flex space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-blue-600' : 'bg-white/30'}`}>
                      <span className="font-bold text-sm">1</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-blue-600' : 'bg-white/30'}`}>
                      <span className="font-bold text-sm">2</span>
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: step === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={step === 1 ? handleSubmitStep1 : handleSubmitStep2} className="p-8 space-y-6">
                {/* General Error */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-2">⚠️</span>
                      <span>{errors.general}</span>
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        Full Name *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          👤
                        </span>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          disabled={loading}
                          className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.fullName ? 'border-red-500' : 'border-slate-200'}`}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        Email Address *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          ✉️
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          disabled={loading}
                          className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          📱
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          disabled={loading}
                          className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.phone ? 'border-red-500' : 'border-slate-200'}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        I want to *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'customer', label: 'Book Services', icon: '👤' },
                          { value: 'provider', label: 'Provide Services', icon: '👨‍🔧' },
                        ].map((option) => (
                          <motion.label
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${formData.role === option.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={option.value}
                              checked={formData.role === option.value}
                              onChange={handleChange}
                              disabled={loading}
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                              <span className="text-3xl">{option.icon}</span>
                              <div>
                                <div className="font-bold text-slate-900">{option.label}</div>
                                <div className="text-xs text-slate-600">
                                  {formData.role === option.value ? 'Selected' : 'Click to select'}
                                </div>
                              </div>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        Password *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          🔒
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••••"
                          disabled={loading}
                          className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 block">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          🔒
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••••"
                          disabled={loading}
                          className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Terms Checkbox */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <p className="text-sm text-red-500 mt-1">{errors.termsAccepted}</p>
                    )}
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6">
                  {step === 2 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="px-6 py-3 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Back
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-transparent animate-spin rounded-full" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      step === 1 ? 'Continue →' : 'Create Account 🚀'
                    )}
                  </motion.button>
                </div>

                {/* Login Link */}
                <p className="text-center text-slate-600 text-sm pt-4">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Home</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Account Created!
            </h2>
            <p className="text-slate-600 mb-6">
              Redirecting you to login page...
            </p>
            <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1500, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
