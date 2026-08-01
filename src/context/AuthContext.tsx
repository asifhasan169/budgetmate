import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService, UserProfileData } from '../services/authService';

interface AuthContextType {
  user: User | any | null;
  session: Session | any | null;
  profile: UserProfileData | null;
  loading: boolean;
  isEmailVerified: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [session, setSession] = useState<Session | any | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    try {
      const userProfile = await authService.getProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfile(null);
    }
  };

  const syncDemoAuth = async () => {
    const demoSession = authService.getDemoSession();
    if (demoSession) {
      setSession(demoSession);
      setUser(demoSession.user);
      await fetchProfile(demoSession.user.id);
    } else {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Fetch initial session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data } = await supabase.auth.getSession();
          const currentSession = data.session;
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchProfile(currentSession.user.id);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase session fetch bypassed:', err);
      }

      // Check Demo Session Fallback
      await syncDemoAuth();
      setLoading(false);
    };

    initAuth();

    // 2. Listen to Supabase session changes if configured
    let authListener: any = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user.id);
        } else {
          await syncDemoAuth();
        }
        setLoading(false);
      });
      authListener = data;
    }

    // 3. Listen to local demo auth changes
    const handleDemoAuthChange = async () => {
      await syncDemoAuth();
    };
    window.addEventListener('bm_demo_auth_change', handleDemoAuthChange);

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      window.removeEventListener('bm_demo_auth_change', handleDemoAuthChange);
    };
  }, []);

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (user?.email) {
      await authService.resendVerificationEmail(user.email);
    }
  };

  // Determine email verification status
  const isEmailVerified = Boolean(
    !user ||
      !isSupabaseConfigured() ||
      user.email_confirmed_at ||
      (user.app_metadata?.provider && user.app_metadata.provider !== 'email')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isEmailVerified,
        logout,
        refreshProfile,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
