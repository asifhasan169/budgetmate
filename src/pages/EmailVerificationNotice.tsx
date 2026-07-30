import React, { useState } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { MailCheck, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailVerificationNoticeProps {
  onNavigate: (route: string) => void;
}

export const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({ onNavigate }) => {
  const { user, resendVerification, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await resendVerification();
      setMessage('A new verification email has been sent to your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onNavigate('/login');
  };

  return (
    <AuthLayout
      title="Email verification required"
      subtitle="Please verify your email address to continue"
      onNavigateHome={() => onNavigate('/landing')}
    >
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center mx-auto">
          <MailCheck className="w-6 h-6" />
        </div>

        <p className="text-xs text-neutral-600">
          An email verification link was sent to{' '}
          <strong className="text-black font-semibold">{user?.email || 'your email'}</strong>.
        </p>

        <p className="text-xs text-neutral-500">
          Only verified users are allowed to access BudgetMate features. Please click the link in your email to activate your account.
        </p>

        {message && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 space-y-2">
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Email...</span>
              </>
            ) : (
              <span>Resend Verification Email</span>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 font-semibold text-xs rounded-full transition-colors cursor-pointer"
          >
            Sign Out & Return to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
