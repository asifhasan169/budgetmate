import React, { useState } from 'react';
import { UserProfile, Household } from '../../types';
import { Wallet, Plus, Users, Sparkles, PieChart, Receipt, DollarSign, Settings, Check, ChevronDown, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  users: UserProfile[];
  activeUser: UserProfile;
  onSelectUser: (userId: string) => void;
  household: Household;
  onOpenAddExpense: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  users,
  activeUser,
  onSelectUser,
  household,
  onOpenAddExpense,
  onOpenSettings
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Wallet },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settlements', label: 'Settlements', icon: DollarSign },
    { id: 'budgets', label: 'Budget Planner', icon: PieChart },
    { id: 'insights', label: 'Smart Insights', icon: Sparkles },
    { id: 'analytics', label: 'Analytics & Export', icon: PieChart }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 sm:py-0 gap-3">
          
          {/* Brand Logo & Household Pill */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-tighter text-black">
                mibu
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                roommates
              </span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-neutral-500 border-l border-neutral-200 pl-3">
              <Users className="w-3.5 h-3.5 text-black" />
              <span className="font-semibold text-neutral-800">{household.name}</span>
              <span className="text-neutral-300">•</span>
              <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-600">
                {household.inviteCode}
              </span>
            </div>
          </div>

          {/* Right Actions: User Selector & Add Expense */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            
            {/* User Perspective Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 bg-white hover:bg-neutral-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-200 text-black transition-all shadow-xs"
                title="Switch roommate perspective"
              >
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-black flex-shrink-0"
                />
                <span className="hidden sm:inline text-neutral-500 font-normal">as</span>
                <span className="font-bold text-black max-w-[90px] sm:max-w-none truncate">{activeUser.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 mb-1">
                    Roommate Perspective
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-neutral-50 transition-colors ${
                        u.id === activeUser.id ? 'bg-neutral-100 font-bold text-black' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{u.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{u.email}</div>
                        </div>
                      </div>
                      {u.id === activeUser.id && <Check className="w-4 h-4 text-black flex-shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-neutral-100 mt-1 pt-1.5 px-3.5">
                    <p className="text-[10px] text-neutral-400 italic">
                      Switch views to check balances and settlements as each roommate.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Add Expense Black Pill Button */}
            <button
              onClick={onOpenAddExpense}
              className="flex items-center space-x-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs px-3.5 sm:px-4 py-2 rounded-full shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>add expense</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors border border-transparent hover:border-neutral-200"
              title="Household & App Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Pills */}
        <nav className="flex space-x-2 overflow-x-auto py-2.5 border-t border-neutral-200/60 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-black text-white shadow-xs font-semibold'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-black hover:border-black'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
