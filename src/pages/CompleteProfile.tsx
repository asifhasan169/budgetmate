import React, { useState, useEffect } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { authService, UserProfileData } from '../services/authService';
import { ProfilePictureUploader } from '../components/ProfilePictureUploader';
import { Loader2, User, Phone, Briefcase, Calendar, FileText, AlertCircle } from 'lucide-react';

interface CompleteProfileProps {
  onNavigate: (route: string) => void;
}

export const CompleteProfile: React.FC<CompleteProfileProps> = ({ onNavigate }) => {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize fields from existing user metadata or profile if present
  useEffect(() => {
    if (user) {
      setFullName(profile?.full_name || user.user_metadata?.full_name || '');
      setDisplayName(profile?.display_name || '');
      setPhone(profile?.phone || '');
      setDateOfBirth(profile?.date_of_birth || '');
      setGender(profile?.gender || '');
      setOccupation(profile?.occupation || '');
      setBio(profile?.bio || '');
      setAvatarUrl(profile?.avatar_url || '');
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('No authenticated user session found.');
      return;
    }

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    setLoading(true);

    try {
      const profileData: UserProfileData = {
        id: user.id,
        email: user.email || '',
        full_name: fullName.trim(),
        display_name: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
        occupation: occupation.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl || undefined,
      };

      await authService.upsertProfile(profileData);
      await refreshProfile();

      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="Set up your details to start using BudgetMate"
      onNavigateHome={() => onNavigate('/landing')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Picture Uploader */}
        <ProfilePictureUploader
          userId={user?.id}
          avatarUrl={avatarUrl}
          onAvatarUploaded={(url) => setAvatarUrl(url)}
          disabled={loading}
        />

        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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

        {/* Display Name Field (Optional) */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
            Display Name <span className="text-neutral-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
          />
        </div>

        {/* Grid: Phone & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                disabled={loading}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Grid: Gender & Occupation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black outline-none transition-colors disabled:opacity-50"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
              Occupation
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Software Engineer"
                disabled={loading}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Bio (Optional) */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wider">
            Bio
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio about yourself..."
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-xs text-black placeholder:text-neutral-400 outline-none transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-full shadow-xs transition-all active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <span>Save Profile & Continue to Dashboard</span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
