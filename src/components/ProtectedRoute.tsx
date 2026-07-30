import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (route: string) => void;
  requireProfile?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onNavigate,
  requireProfile = true,
}) => {
  const { user, profile, loading, isEmailVerified } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        onNavigate('/login');
      } else if (!isEmailVerified) {
        onNavigate('/verify-email');
      } else if (requireProfile && !profile) {
        onNavigate('/complete-profile');
      }
    }
  }, [loading, user, isEmailVerified, profile, requireProfile, onNavigate]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking authentication..." />;
  }

  if (!user || !isEmailVerified || (requireProfile && !profile)) {
    return <LoadingSpinner fullScreen label="Redirecting..." />;
  }

  return <>{children}</>;
};
