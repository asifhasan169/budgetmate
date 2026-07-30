import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { authService } from '../services/authService';
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (route: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await authService.sendPasswordResetEmail(email.trim());
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout
        title="Reset link sent"
        subtitle="Check your email inbox for instructions"
        onNavigateHome={() => onNavigate('/landing')}
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>

          <p className="text-xs text-neutral-600">
            We have sent password reset instructions to{' '}
            <strong className="text-black font-semibold">{email}</strong>.
          </p>

          <p className="text-xs text-neutral-500">
            Click the link in the email to set up your new password.
          </p>

          <div className="pt-4">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive a password reset link"
      onNavigateHome={() => onNavigate('/landing')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-xs font-bold text-neutral-600 hover:text-black transition-colors underline cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
