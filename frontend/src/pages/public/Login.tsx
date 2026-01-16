import { useState } from 'react';
import { Button, Input } from '../components/ui';
import { AuthLayout } from '../layouts';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate login (Replace with actual Supabase auth)
    setTimeout(() => {
      if (email && password) {
        // Navigate to dashboard
        window.location.href = '/customer/dashboard';
      } else {
        setError('Please enter email and password');
      }
      setLoading(false);
    }, 1000);
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your BookYourService account"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText="We'll never share your email with anyone else"
          icon={
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997 3.997A1 1 0 001-1.414L10 9.882l-7.997-3.997a1 1 0 000-1.414l-7.997-3.997a1 1 0 000-2v-2a1 1 0 000-2v4l-8-8z" clipRule="evenodd" />
            </svg>
          }
        />

        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPasswordToggle={true}
          onTogglePassword={togglePassword}
          helperText="Must be at least 6 characters"
          icon={
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 111-2 0V4a1 1 0 01-1 0H7a1 1 0 000-2V6h4v4h2v1h4.293l6.707 6.707a1.2 1.2 0 010-1.414L10.414 10H10a1 1 0 000-2V6h.414z" clipRule="evenodd" />
            </svg>
          }
        />

        <div className="flex items-center justify-between">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot your password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!email || !password || loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};
