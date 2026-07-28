import React, { useState, useEffect } from 'react';
import { storage } from './services/storageService';
import { AIService } from './services/aiService';
import { Expense, MonthlyBudget, Settlement, UserProfile, Household, Category, SmartInsight } from './types';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Storage state
  const [household, setHousehold] = useState<Household>(storage.getHousehold());
  const [users, setUsers] = useState<UserProfile[]>(storage.getUsers());
  const [activeUser, setActiveUser] = useState<UserProfile>(storage.getActiveUser());
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses());
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(storage.getBudgets());
  const [settlements, setSettlements] = useState<Settlement[]>(storage.getSettlements());

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

  // Calculated Settlement Summary (All-time running net balance across all household expenses & settlements)
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

  return (
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-800">BudgetMate</strong> — Roommate Expense & Smart Settlement Engine
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
  );
}

