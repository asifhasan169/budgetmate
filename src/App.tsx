import React, { useState, useEffect } from 'react';
import { storage } from './services/storageService';
import { AIService } from './services/aiService';
import { Expense, MonthlyBudget, Settlement, UserProfile, Household, Category, SmartInsight } from './types';

// Auth Provider & Hooks
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmailVerificationNotice } from './pages/EmailVerificationNotice';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { CompleteProfile } from './pages/CompleteProfile';

// Components
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExpenseListView } from './components/expenses/ExpenseListView';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { SettlementView } from './components/settlements/SettlementView';
import { BudgetView } from './components/budgets/BudgetView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SmartInsightsView } from './components/ai/SmartInsightsView';
import { HouseholdSettingsModal } from './components/household/HouseholdSettingsModal';
import { RoommateLoginModal } from './components/auth/RoommateLoginModal';
import { AddRoommateModal } from './components/auth/AddRoommateModal';
import { ProfileView } from './components/profile/ProfileView';

function MainApp() {
  const { user, profile, isEmailVerified, logout } = useAuthContext();

  // Navigation / Routing state
  const getInitialRoute = (): string => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (hash.includes('type=recovery') || path === '/reset-password') {
      return '/reset-password';
    }
    if (path === '/login') return '/login';
    if (path === '/register') return '/register';
    if (path === '/forgot-password') return '/forgot-password';
    if (path === '/verify-email') return '/verify-email';
    if (path === '/complete-profile') return '/complete-profile';

    return '/landing';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync route with browser history
  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Storage state
  const [household, setHousehold] = useState<Household>(storage.getHousehold());
  const [users, setUsers] = useState<UserProfile[]>(storage.getUsers());
  const [activeUser, setActiveUser] = useState<UserProfile>(storage.getActiveUser());
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses());
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(storage.getBudgets());
  const [settlements, setSettlements] = useState<Settlement[]>(storage.getSettlements());

  // Sync Supabase Auth Profile with Storage User
  useEffect(() => {
    if (user && profile) {
      const existingUser = users.find((u) => u.id === user.id || u.email.toLowerCase() === user.email?.toLowerCase());
      if (existingUser) {
        if (existingUser.name !== profile.full_name || existingUser.avatarUrl !== profile.avatar_url) {
          const updatedUser: UserProfile = {
            ...existingUser,
            name: profile.full_name || existingUser.name,
            avatarUrl: profile.avatar_url || existingUser.avatarUrl,
          };
          storage.saveUser(updatedUser);
        }
        storage.setActiveUserId(existingUser.id);
      } else {
        // Create matching local user profile for Supabase user
        const newUser: UserProfile = {
          id: user.id,
          name: profile.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          householdId: 'h1',
          role: 'member',
          color: '#6366f1',
          avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        };
        storage.saveUser(newUser);
        storage.setActiveUserId(newUser.id);
      }
    }
  }, [user, profile]);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Authentication & Add Roommate Modals state
  const [authTargetUser, setAuthTargetUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddRoommateModalOpen, setIsAddRoommateModalOpen] = useState(false);

  // Subscribe to storage updates
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setHousehold(storage.getHousehold());
      setUsers(storage.getUsers());
      setActiveUser(storage.getActiveUser());
      setCategories(storage.getCategories());
      setExpenses(storage.getExpenses());
      setBudgets(storage.getBudgets());
      setSettlements(storage.getSettlements());
    });
    return unsubscribe;
  }, []);

  // Calculated Settlement Summary
  const settlementSummary = storage.calculateSettlementSummary();

  // Rule-based Smart Insights
  const smartInsights: SmartInsight[] = AIService.generateInsights(
    expenses,
    budgets,
    users,
    household.currencySymbol || '₹'
  );

  // Handlers
  const handleSelectUser = (userId: string) => {
    storage.setActiveUserId(userId);
  };

  const handleRequireAuthToSwitch = (targetUser: UserProfile) => {
    setAuthTargetUser(targetUser);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userId: string) => {
    storage.setActiveUserId(userId);
    setIsAuthModalOpen(false);
    setAuthTargetUser(null);
  };

  const handleAddRoommateSuccess = (newRoommate: UserProfile) => {
    setUsers(storage.getUsers());
    alert(`Invitation sent to ${newRoommate.email}! ${newRoommate.name} has been added to ${household.name}.`);
  };

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
      storage.saveExpense(expenseData, activeUser.id);
    } catch (e: any) {
      alert(e.message || 'Error saving expense');
    }
  };

  const handleDeleteExpense = (id: string) => {
    try {
      storage.deleteExpense(id, activeUser.id);
    } catch (e: any) {
      alert(e.message || 'Error deleting expense');
    }
  };

  const handleRequestDeletion = (id: string, reason: string, comment: string) => {
    try {
      storage.requestExpenseDeletion(id, reason, comment, activeUser.id);
    } catch (e: any) {
      alert(e.message || 'Error requesting deletion');
    }
  };

  const handleAddDeletionComment = (id: string, commentText: string) => {
    try {
      storage.addDeletionComment(id, commentText, activeUser.id);
    } catch (e: any) {
      alert(e.message || 'Error adding comment');
    }
  };

  const handleCancelDeletion = (id: string) => {
    try {
      storage.cancelExpenseDeletion(id);
    } catch (e: any) {
      alert(e.message || 'Error canceling deletion');
    }
  };

  const handleCreateSettlement = (settlementData: Omit<Settlement, 'id' | 'createdAt'>) => {
    storage.createSettlement(settlementData);
  };

  const handleUpdateSettlementStatus = (id: string, status: 'settled' | 'rejected', remarks?: string) => {
    try {
      storage.updateSettlementStatus(id, status, activeUser.id, remarks);
    } catch (e: any) {
      alert(e.message || 'Error updating settlement status');
    }
  };

  const handleDeleteSettlement = (id: string) => {
    storage.deleteSettlement(id);
  };

  const handleSetBudget = (userId: string, month: number, year: number, amount: number) => {
    try {
      storage.setBudget(userId, month, year, amount, activeUser.id);
    } catch (e: any) {
      alert(e.message || 'Error setting budget');
    }
  };

  const handleUpdateHousehold = (updatedHousehold: Household) => {
    storage.updateHousehold(updatedHousehold);
  };

  const handleResetData = () => {
    storage.resetData();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
  };

  // Route Views Switching
  if (currentRoute === '/landing') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentRoute === '/login') {
    return <Login onNavigate={navigate} />;
  }

  if (currentRoute === '/register') {
    return <Register onNavigate={navigate} />;
  }

  if (currentRoute === '/verify-email') {
    return <EmailVerificationNotice onNavigate={navigate} />;
  }

  if (currentRoute === '/forgot-password') {
    return <ForgotPassword onNavigate={navigate} />;
  }

  if (currentRoute === '/reset-password') {
    return <ResetPassword onNavigate={navigate} />;
  }

  if (currentRoute === '/complete-profile') {
    return <CompleteProfile onNavigate={navigate} />;
  }

  // Dashboard & Main Workspace (Protected Routes)
  return (
    <ProtectedRoute onNavigate={navigate}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          users={users}
          activeUser={activeUser}
          onSelectUser={handleSelectUser}
          onRequireAuthToSwitch={handleRequireAuthToSwitch}
          onOpenAddRoommateModal={() => setIsAddRoommateModalOpen(true)}
          household={household}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              expenses={expenses}
              budgets={budgets}
              users={users}
              activeUser={activeUser}
              settlementSummary={settlementSummary}
              currencySymbol={household.currencySymbol}
              onOpenAddExpense={handleOpenAddExpense}
              onNavigateTab={setActiveTab}
              onEditExpense={handleEditExpense}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseListView
              expenses={expenses}
              categories={categories}
              users={users}
              activeUser={activeUser}
              settlements={settlements}
              currencySymbol={household.currencySymbol}
              onOpenAddExpense={handleOpenAddExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onRequestDeletion={handleRequestDeletion}
              onConfirmDeletion={handleDeleteExpense}
              onAddDeletionComment={handleAddDeletionComment}
              onCancelDeletion={handleCancelDeletion}
            />
          )}

          {activeTab === 'settlements' && (
            <SettlementView
              settlementSummary={settlementSummary}
              expenses={expenses}
              settlements={settlements}
              users={users}
              activeUser={activeUser}
              currencySymbol={household.currencySymbol}
              onCreateSettlement={handleCreateSettlement}
              onUpdateSettlementStatus={handleUpdateSettlementStatus}
              onDeleteSettlement={handleDeleteSettlement}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetView
              budgets={budgets}
              expenses={expenses}
              users={users}
              activeUser={activeUser}
              currencySymbol={household.currencySymbol}
              onSetBudget={handleSetBudget}
            />
          )}

          {activeTab === 'insights' && (
            <SmartInsightsView
              insights={smartInsights}
              expenses={expenses}
              budgets={budgets}
              users={users}
              currencySymbol={household.currencySymbol}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              expenses={expenses}
              categories={categories}
              users={users}
              settlementSummary={settlementSummary}
              currencySymbol={household.currencySymbol}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              activeUser={activeUser}
              users={users}
              household={household}
              expenses={expenses}
              settlements={settlements}
              onUpdateActiveUser={(u) => setActiveUser(u)}
              onRefreshUsers={() => setUsers(storage.getUsers())}
              onOpenAddRoommateModal={() => setIsAddRoommateModalOpen(true)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <strong className="text-slate-800">BudgetMate</strong> — <span>Shared expenses, simplified.</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500">
              <span>Roommate Perspective: <strong className="text-indigo-600">{activeUser.name}</strong></span>
              <span>•</span>
              <span>Household: <strong className="text-slate-700">{household.name}</strong></span>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={handleSaveExpense}
          categories={categories}
          users={users}
          activeUser={activeUser}
          initialExpense={editingExpense}
          currencySymbol={household.currencySymbol}
        />

        <HouseholdSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          household={household}
          users={users}
          onUpdateHousehold={handleUpdateHousehold}
          onResetData={handleResetData}
        />

        {/* Roommate Authentication Switch Login Modal */}
        <RoommateLoginModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthTargetUser(null);
          }}
          targetUser={authTargetUser}
          onSuccess={handleAuthSuccess}
        />

        {/* Add New Roommate Invite Modal */}
        <AddRoommateModal
          isOpen={isAddRoommateModalOpen}
          onClose={() => setIsAddRoommateModalOpen(false)}
          onSuccess={handleAddRoommateSuccess}
        />

      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
