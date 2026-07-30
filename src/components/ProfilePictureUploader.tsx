import React, { useState, useRef } from 'react';
import { Camera, Upload, User, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

interface ProfilePictureUploaderProps {
  userId?: string;
  avatarUrl?: string;
  onAvatarUploaded: (url: string) => void;
  disabled?: boolean;
}

export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  userId,
  avatarUrl,
  onAvatarUploaded,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(avatarUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Show local instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      if (userId) {
        // Upload to Supabase Storage bucket
        const uploadedPublicUrl = await authService.uploadAvatar(file, userId);
        setPreviewUrl(uploadedPublicUrl);
        onAvatarUploaded(uploadedPublicUrl);
      } else {
        // Pass blob preview if userId not generated yet (e.g. before user registration finished)
        onAvatarUploaded(objectUrl);
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group">
        {/* Avatar Display */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-neutral-300 bg-neutral-100 overflow-hidden flex items-center justify-center shadow-xs">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-neutral-400" />
          )}
        </div>

        {/* Upload Overlay Button */}
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          title="Upload avatar"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="text-center">
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold text-neutral-700 hover:text-black transition-colors underline cursor-pointer disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Choose profile photo'}
        </button>
        <p className="text-[10px] text-neutral-400 mt-0.5">JPG, PNG or WebP (max 5MB)</p>
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium text-center">{error}</p>
      )}
    </div>
  );
};
