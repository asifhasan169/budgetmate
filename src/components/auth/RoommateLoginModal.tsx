import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Lock, Mail, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';

interface RoommateLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserProfile | null;
  onSuccess: (userId: string) => void;
}

export const RoommateLoginModal: React.FC<RoommateLoginModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess
}) => {
  if (!isOpen || !targetUser) return null;

  const [email, setEmail] = useState(targetUser.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authService.authenticateRoommate(email, password, targetUser.id);
      if (res.success) {
        onSuccess(targetUser.id);
        onClose();
        setPassword('');
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden my-auto space-y-0">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center space-x-2.5">
            <img
              src={targetUser.avatarUrl}
              alt={targetUser.name}
              className="w-8 h-8 rounded-full object-cover border border-black"
            />
            <div>
              <h2 className="text-sm font-bold text-black">Authenticate Roommate</h2>
              <p className="text-[11px] text-neutral-500">Sign in as {targetUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-neutral-700 block">Roommate Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-black text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-neutral-700 block">Password:</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Enter password (e.g. password123)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-black text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-black font-medium"
              />
            </div>
            <p className="text-[10px] text-neutral-400 pt-0.5">
              Default demo password: <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700 font-mono">password123</code>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-neutral-500 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mibu-pill-active px-5 py-2 text-xs font-bold shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Login'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
