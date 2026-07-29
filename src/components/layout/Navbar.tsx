import React, { useState } from 'react';
import { UserProfile, Household } from '../../types';
import { Wallet, Plus, Users, Sparkles, PieChart, Receipt, DollarSign, Settings, Check, ChevronDown, UserPlus, Lock, User } from 'lucide-react';
import { BudgetMateLogo } from '../common/BudgetMateLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  users: UserProfile[];
  activeUser: UserProfile;
  onSelectUser: (userId: string) => void;
  onRequireAuthToSwitch: (user: UserProfile) => void;
  onOpenAddRoommateModal: () => void;
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
  onRequireAuthToSwitch,
  onOpenAddRoommateModal,
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
    { id: 'analytics', label: 'Analytics & Export', icon: PieChart },
    { id: 'profile', label: 'Profile & Room', icon: User }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 sm:py-0 gap-3">
          
          {/* Brand Logo & Household Pill */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-2xs flex-shrink-0">
                <BudgetMateLogo size={26} className="text-black" />
              </div>
              <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-tighter text-black">
                BudgetMate
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                Shared expenses, simplified.
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
                className="flex items-center space-x-2 bg-white hover:bg-neutral-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-200 text-black transition-all shadow-xs cursor-pointer"
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
                <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 mb-1 flex items-center justify-between">
                    <span>Roommate Perspective</span>
                    <Lock className="w-3 h-3 text-neutral-400" />
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setShowUserDropdown(false);
                        if (u.id === activeUser.id) {
                          onSelectUser(u.id);
                        } else {
                          // Require password authentication to switch to another roommate
                          onRequireAuthToSwitch(u);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-neutral-50 transition-colors cursor-pointer ${
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
                      {u.id === activeUser.id ? (
                        <Check className="w-4 h-4 text-black flex-shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}

                  {/* Option: + Add New Roommate */}
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAddRoommateModal();
                    }}
                    className="w-full flex items-center space-x-2 px-3.5 py-2.5 text-xs text-left text-black font-bold hover:bg-neutral-50 border-t border-neutral-100 transition-colors cursor-pointer mt-1"
                  >
                    <UserPlus className="w-4 h-4 text-black" />
                    <span>+ Add New Roommate</span>
                  </button>

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
