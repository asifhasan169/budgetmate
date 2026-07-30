import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BudgetMateLogo } from '../components/common/BudgetMateLogo';
import { Wallet, PieChart, Users, ShieldCheck, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, isEmailVerified } = useAuth();

  // If user is already authenticated and verified, auto redirect to dashboard
  useEffect(() => {
    if (user && isEmailVerified) {
      onNavigate('/dashboard');
    }
  }, [user, isEmailVerified, onNavigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 font-sans antialiased flex flex-col justify-between">
      
      {/* Header Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-2xs">
              <BudgetMateLogo size={26} className="text-black" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tighter text-black">
              BudgetMate
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 text-xs font-bold text-neutral-800 hover:text-black border border-neutral-200 hover:border-black rounded-full transition-all cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('/register')}
              className="px-4 py-2 text-xs font-bold bg-black hover:bg-neutral-800 text-white rounded-full transition-all shadow-xs cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-black" />
          <span>Secure Shared Expenses & Household Budgeting</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-black tracking-tight max-w-3xl leading-tight">
          Manage Roommate Expenses, Debt & Budgets Effortlessly.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-2xl">
          BudgetMate keeps shared households aligned. Split bills, track running balances, monitor monthly category budgets, and get smart insights in one clean, minimalist workspace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onNavigate('/register')}
            className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-extrabold rounded-full transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-black text-xs font-extrabold rounded-full transition-all cursor-pointer"
          >
            Sign In to Household
          </button>
        </div>

        {/* Features Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-sm font-bold text-black mb-1">Expense Splitting</h3>
            <p className="text-xs text-neutral-500">
              Split bills equal or custom between roommates with running settlement summaries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-sm font-bold text-black mb-1">Budget Planner</h3>
            <p className="text-xs text-neutral-500">
              Set monthly spending limits for categories and prevent overspending before it happens.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-sm font-bold text-black mb-1">Roommate Accounts</h3>
            <p className="text-xs text-neutral-500">
              Individual authenticated profiles, password security, and automated settlements.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span><strong>BudgetMate</strong> — Shared expenses, simplified.</span>
          <span>Powered by Supabase Authentication & Storage</span>
        </div>
      </footer>

    </div>
  );
};
