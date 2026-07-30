import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { authService } from '../services/authService';
import { Loader2, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterProps {
  onNavigate: (route: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="Verification link sent to your email"
        onNavigateHome={() => onNavigate('/landing')}
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>

          <p className="text-xs text-neutral-600">
            We have sent a verification email to{' '}
            <strong className="text-black font-semibold">{email}</strong>.
          </p>

          <p className="text-xs text-neutral-500">
            Please check your inbox and click the verification link before signing in to your account.
          </p>

          <div className="pt-4 space-y-2">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              Proceed to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join BudgetMate to manage shared expenses"
      onNavigateHome={() => onNavigate('/landing')}
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email Address Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center pt-4">
          <p className="text-xs text-neutral-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-bold text-black hover:underline cursor-pointer"
            >
              Back to Login
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
