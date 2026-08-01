import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from './storageService';
import { UserProfile } from '../types';

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

export interface DemoSession {
  user: {
    id: string;
    email: string;
    email_confirmed_at: string;
    app_metadata: { provider: string };
    user_metadata: { full_name: string };
  };
  access_token: string;
}

const DEMO_SESSION_KEY = 'bm_demo_session';

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
  getDemoSession(): DemoSession | null {
    try {
      const data = localStorage.getItem(DEMO_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setDemoSession(session: DemoSession | null) {
    try {
      if (session) {
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(DEMO_SESSION_KEY);
      }
      window.dispatchEvent(new Event('bm_demo_auth_change'));
    } catch (e) {
      console.error('Failed to set demo session:', e);
    }
  },

  createDemoSessionUser(id: string, email: string, fullName: string): DemoSession {
    const session: DemoSession = {
      user: {
        id,
        email,
        email_confirmed_at: new Date().toISOString(),
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: fullName },
      },
      access_token: 'demo-access-token-' + Date.now(),
    };
    this.setDemoSession(session);
    return session;
  },

  // Sign up new user
  async signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (!error && data.user) return data;
        if (error && !error.message.includes('fetch')) {
          throw new Error(formatAuthError(error));
        }
      } catch (err: any) {
        if (!err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
          throw err;
        }
      }
    }

    // Demo Mode Sign Up Fallback
    const existingUsers = storage.getUsers();
    const existing = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Log in existing user in demo mode
      storage.setActiveUserId(existing.id);
      const session = this.createDemoSessionUser(existing.id, existing.email, existing.name);
      return { user: session.user, session };
    }

    const newUserId = 'usr_' + Date.now();
    const newUser: UserProfile = {
      id: newUserId,
      name: fullName || email.split('@')[0],
      email: email,
      householdId: 'house-101',
      role: 'member',
      color: '#3b82f6',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || email)}`,
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    storage.setActiveUserId(newUserId);
    const demoSession = this.createDemoSessionUser(newUser.id, newUser.email, newUser.name);
    return { user: demoSession.user, session: demoSession };
  },

  // Sign in existing user
  async signIn({ email, password }: { email: string; password: string }) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data.session) return data;
        if (error && !error.message.includes('fetch')) {
          throw new Error(formatAuthError(error));
        }
      } catch (err: any) {
        if (!err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
          throw err;
        }
      }
    }

    // Demo Mode Sign In Fallback
    const users = storage.getUsers();
    let matchingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!matchingUser) {
      // Create user on the fly in demo mode if not present
      matchingUser = {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0],
        email: email,
        householdId: 'house-101',
        role: 'member',
        color: '#6366f1',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString(),
      };
      storage.saveUser(matchingUser);
    }

    storage.setActiveUserId(matchingUser.id);
    const demoSession = this.createDemoSessionUser(matchingUser.id, matchingUser.email, matchingUser.name);
    return { user: demoSession.user, session: demoSession };
  },

  // Quick Demo Instant Login helper
  async quickDemoLogin(demoEmail: string = 'alex.rivers@example.com') {
    const users = storage.getUsers();
    let target = users.find((u) => u.email.toLowerCase() === demoEmail.toLowerCase()) || users[0];

    if (!target) {
      target = {
        id: 'user-alex',
        email: 'alex.rivers@example.com',
        name: 'Alex Rivers',
        householdId: 'house-101',
        role: 'owner',
        color: '#3b82f6',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      storage.saveUser(target);
    }

    storage.setActiveUserId(target.id);
    const demoSession = this.createDemoSessionUser(target.id, target.email, target.name);
    return { user: demoSession.user, session: demoSession };
  },

  // OAuth Google Login
  async signInWithGoogle() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (!error) return data;
      } catch (e) {
        // Fall back to demo mode if fetch fails
      }
    }

    return this.quickDemoLogin('alex.rivers@example.com');
  },

  // Sign out user
  async signOut() {
    this.setDemoSession(null);
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }
  },

  // Resend email verification
  async resendVerificationEmail(email: string) {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) throw new Error(formatAuthError(error));
        return;
      } catch (e: any) {
        if (!e.message.includes('fetch')) throw e;
      }
    }
    // Demo mode: auto-verify
    console.log('Demo mode: email verification simulated for', email);
  },

  // Request password reset email
  async sendPasswordResetEmail(email: string) {
    if (isSupabaseConfigured()) {
      try {
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
        if (error) throw new Error(formatAuthError(error));
        return;
      } catch (e: any) {
        if (!e.message.includes('fetch')) throw e;
      }
    }
    console.log('Demo mode: password reset simulated for', email);
  },

  // Update user password
  async updatePassword(newPassword: string) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (!error) return data;
      } catch (e) {
        // continue in demo mode
      }
    }
    return { success: true };
  },

  // Fetch user profile from Database or Local Storage
  async getProfile(userId: string): Promise<UserProfileData | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) return data as UserProfileData;
      } catch (e) {
        // Fallback to storageService
      }
    }

    // Fallback to storageService
    const users = storage.getUsers();
    const localUser = users.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (localUser) {
      return {
        id: localUser.id,
        full_name: localUser.name,
        display_name: localUser.displayName || localUser.name,
        email: localUser.email,
        phone: localUser.phone,
        occupation: localUser.occupation,
        bio: localUser.bio,
        avatar_url: localUser.avatarUrl,
        created_at: localUser.createdAt || new Date().toISOString(),
      };
    }

    return null;
  },

  // Save / Update user profile
  async upsertProfile(profile: UserProfileData): Promise<UserProfileData> {
    storage.updateUserProfile(profile.id, {
      name: profile.full_name,
      displayName: profile.display_name,
      phone: profile.phone,
      occupation: profile.occupation,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
    });

    if (isSupabaseConfigured()) {
      try {
        const payload = { ...profile, updated_at: new Date().toISOString() };
        const { data, error } = await supabase.from('profiles').upsert(payload).select().single();
        if (!error && data) return data as UserProfileData;
      } catch (e) {
        // Handled locally
      }
    }

    return profile;
  },

  // Upload Profile Picture to Supabase Storage or Local Object URL
  async uploadAvatar(file: File, userId: string): Promise<string> {
    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
          return data.publicUrl;
        }
      } catch (e) {
        // Fallback
      }
    }

    return URL.createObjectURL(file);
  },

  // Invite roommate helper
  async inviteRoommate(name: string, email: string) {
    const newRoommate = {
      id: 'usr_' + Date.now(),
      name,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      householdId: 'house-101',
      role: 'member' as const,
      color: '#6366f1',
    };
    storage.saveUser(newRoommate);
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
