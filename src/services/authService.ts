import { supabase } from '../lib/supabase';

export interface UserProfileData {
  id: string;
  full_name: string;
  display_name?: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  occupation?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const formatAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred.';
  const msg = error.message || String(error);
  
  if (msg.includes('Invalid login credentials')) return 'Invalid email address or password.';
  if (msg.includes('Email not confirmed')) return 'Your email address is not verified yet. Please check your inbox or resend verification.';
  if (msg.includes('User already registered')) return 'An account with this email address already exists.';
  if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters long.';
  if (msg.includes('Unable to validate email address')) return 'Please provide a valid email address.';
  if (msg.includes('Token has expired') || msg.includes('Invalid token')) return 'The reset link has expired or is invalid. Please request a new link.';
  
  return msg;
};

export const authService = {
  // Sign up new user
  async signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw new Error(formatAuthError(error));
    return data;
  },

  // Sign in existing user
  async signIn({ email, password }: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(formatAuthError(error));
    return data;
  },

  // OAuth Google Login
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw new Error(formatAuthError(error));
    return data;
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(formatAuthError(error));
  },

  // Resend email verification
  async resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) throw new Error(formatAuthError(error));
  },

  // Request password reset email
  async sendPasswordResetEmail(email: string) {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw new Error(formatAuthError(error));
  },

  // Update user password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(formatAuthError(error));
    return data;
  },

  // Fetch user profile from Database
  async getProfile(userId: string): Promise<UserProfileData | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as UserProfileData | null;
  },

  // Save / Update user profile
  async upsertProfile(profile: UserProfileData): Promise<UserProfileData> {
    const payload = {
      ...profile,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    if (error) throw new Error(formatAuthError(error));
    return data as UserProfileData;
  },

  // Upload Profile Picture to Supabase Storage
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Invite roommate helper for existing household modal
  async inviteRoommate(name: string, email: string) {
    const newRoommate = {
      id: 'usr_' + Date.now(),
      name,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      householdId: 'h1',
      role: 'member' as const,
      color: '#6366f1',
    };
    return newRoommate;
  },

  // Authenticate roommate switch modal helper
  async authenticateRoommate(email: string, password: string, _targetUserId: string) {
    if (password === 'password123' || password.length >= 6) {
      return { success: true };
    }
    return { success: false, error: 'Invalid password. Default demo password is: password123' };
  },
};
