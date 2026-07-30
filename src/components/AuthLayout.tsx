import React from 'react';
import { BudgetMateLogo } from './common/BudgetMateLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onNavigateHome?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 font-sans antialiased flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-3 cursor-pointer group focus:outline-none"
        >
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-2xs group-hover:scale-105 transition-transform">
            <BudgetMateLogo size={30} className="text-black" />
          </div>
          <span className="font-display font-extrabold text-3xl tracking-tighter text-black">
            BudgetMate
          </span>
        </button>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-xs font-medium text-neutral-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Auth Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200 sm:rounded-3xl sm:px-10">
          {children}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          BudgetMate — Shared expenses, simplified.
        </p>
      </div>

    </div>
  );
};
