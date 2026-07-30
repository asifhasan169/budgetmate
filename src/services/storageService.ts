import { Category, Expense, ExpenseFilter, Household, MonthlyBudget, Settlement, SettlementSummary, UserProfile } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_BUDGETS, INITIAL_EXPENSES, INITIAL_HOUSEHOLD, INITIAL_SETTLEMENTS, INITIAL_USERS } from './mockData';

const KEYS = {
  HOUSEHOLD: 'bm_household',
  USERS: 'bm_users',
  ACTIVE_USER_ID: 'bm_active_user_id',
  EXPENSES: 'bm_expenses',
  CATEGORIES: 'bm_categories',
  BUDGETS: 'bm_budgets',
  SETTLEMENTS: 'bm_settlements',
  CURRENCY: 'bm_currency'
};

type StorageListener = () => void;

class StorageService {
  private listeners: Set<StorageListener> = new Set();

  constructor() {
    this.initializeDefaults();
  }

  public subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify() {
    this.listeners.forEach(fn => fn());
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Error reading localStorage key ${key}:`, e);
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Error writing localStorage key ${key}:`, e);
    }
  }

  private initializeDefaults() {
    if (!localStorage.getItem(KEYS.HOUSEHOLD)) {
      this.setItem(KEYS.HOUSEHOLD, INITIAL_HOUSEHOLD);
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      this.setItem(KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(KEYS.ACTIVE_USER_ID)) {
      this.setItem(KEYS.ACTIVE_USER_ID, INITIAL_USERS[0].id);
    }
    if (!localStorage.getItem(KEYS.EXPENSES)) {
      this.setItem(KEYS.EXPENSES, INITIAL_EXPENSES);
    }
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      this.setItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(KEYS.BUDGETS)) {
      this.setItem(KEYS.BUDGETS, INITIAL_BUDGETS);
    }
    if (!localStorage.getItem(KEYS.SETTLEMENTS)) {
      this.setItem(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
    }
  }

  // Household & Users
  public getHousehold(): Household {
    const h = this.getItem(KEYS.HOUSEHOLD, INITIAL_HOUSEHOLD);
    if (!h.currencySymbol || h.currencySymbol === '$') {
      h.currencySymbol = '₹';
      this.setItem(KEYS.HOUSEHOLD, h);
    }
    return h;
  }

  public updateHousehold(household: Household): void {
    this.setItem(KEYS.HOUSEHOLD, household);
  }

  public getUsers(): UserProfile[] {
    return this.getItem(KEYS.USERS, INITIAL_USERS);
  }

  public getActiveUserId(): string {
    return this.getItem(KEYS.ACTIVE_USER_ID, INITIAL_USERS[0].id);
  }

  public setActiveUserId(userId: string): void {
    this.setItem(KEYS.ACTIVE_USER_ID, userId);
  }

  public getActiveUser(): UserProfile {
    const users = this.getUsers();
    const activeId = this.getActiveUserId();
    return users.find(u => u.id === activeId) || users[0];
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const users = this.getUsers();
    let updatedUser: UserProfile | null = null;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...updates };
        return updatedUser;
      }
      return u;
    });

    if (updatedUser) {
      this.setItem(KEYS.USERS, updatedUsers);
    }
    return updatedUser || users[0];
  }

  public saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    this.setItem(KEYS.USERS, users);
  }

  public removeRoommate(userIdToRemove: string): void {
    const users = this.getUsers();
    const userToRemove = users.find(u => u.id === userIdToRemove);
    if (!userToRemove) return;
    if (userToRemove.role === 'owner') {
      throw new Error("Room Owner cannot be removed directly. Transfer ownership first.");
    }

    const filteredUsers = users.filter(u => u.id !== userIdToRemove);
    this.setItem(KEYS.USERS, filteredUsers);

    // If active user was removed, switch active user
    if (this.getActiveUserId() === userIdToRemove) {
      this.setActiveUserId(filteredUsers[0]?.id || INITIAL_USERS[0].id);
    }
  }

  public transferOwnership(newOwnerId: string): void {
    const users = this.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === newOwnerId) {
        return { ...u, role: 'owner' as const };
      }
      if (u.role === 'owner') {
        return { ...u, role: 'member' as const };
      }
      return u;
    });
    this.setItem(KEYS.USERS, updatedUsers);
  }

  public leaveRoom(userId: string): { success: boolean; error?: string; isLastMember?: boolean } {
    const users = this.getUsers();
    const userLeaving = users.find(u => u.id === userId);
    if (!userLeaving) return { success: false, error: 'User not found' };

    if (userLeaving.role === 'owner' && users.length > 1) {
      return {
        success: false,
        error: 'You must transfer ownership before leaving this room.'
      };
    }

    if (users.length === 1) {
      return { success: true, isLastMember: true };
    }

    const remainingUsers = users.filter(u => u.id !== userId);
    this.setItem(KEYS.USERS, remainingUsers);
    this.setActiveUserId(remainingUsers[0].id);
    return { success: true };
  }

  public deleteHousehold(): void {
    localStorage.removeItem(KEYS.HOUSEHOLD);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.ACTIVE_USER_ID);
  }

  // Categories
  public getCategories(): Category[] {
    return this.getItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }

  // Expenses CRUD
  public getExpenses(): Expense[] {
    const expenses = this.getItem<Expense[]>(KEYS.EXPENSES, INITIAL_EXPENSES);
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getExpenseById(id: string): Expense | undefined {
    return this.getExpenses().find(e => e.id === id);
  }

  public saveExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }, activeUserId?: string): Expense {
    const expenses = this.getExpenses();
    const nowISO = new Date().toISOString();

    if (expense.id) {
      // Edit existing - enforce ownership rule
      const existing = expenses.find(e => e.id === expense.id);
      if (existing && activeUserId && existing.createdBy !== activeUserId) {
        console.warn(`Permission Denied: User ${activeUserId} attempted to edit expense created by ${existing.createdBy}`);
        throw new Error(`Permission Denied: Only the creator of this expense can edit it.`);
      }

      const updatedExpenses = expenses.map(e => {
        if (e.id === expense.id) {
          return {
            ...e,
            ...expense,
            updatedAt: nowISO
          } as Expense;
        }
        return e;
      });
      this.setItem(KEYS.EXPENSES, updatedExpenses);
      return updatedExpenses.find(e => e.id === expense.id)!;
    } else {
      // Create new
      const newExpense: Expense = {
        ...expense,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: nowISO,
        updatedAt: nowISO
      } as Expense;

      const newExpenses = [newExpense, ...expenses];
      this.setItem(KEYS.EXPENSES, newExpenses);
      return newExpense;
    }
  }

  public deleteExpense(id: string, activeUserId?: string): void {
    const expenses = this.getExpenses();
    const existing = expenses.find(e => e.id === id);

    if (existing && activeUserId && existing.createdBy !== activeUserId) {
      console.warn(`Permission Denied: User ${activeUserId} attempted to delete expense created by ${existing.createdBy}`);
      throw new Error(`Permission Denied: Only the creator of this expense can delete it.`);
    }

    const updated = expenses.filter(e => e.id !== id);
    this.setItem(KEYS.EXPENSES, updated);
  }

  public requestExpenseDeletion(id: string, reason: string, comment: string, activeUserId: string): Expense {
    const expenses = this.getExpenses();
    const existing = expenses.find(e => e.id === id);
    if (!existing) throw new Error("Expense not found");

    if (existing.createdBy !== activeUserId) {
      throw new Error("Permission Denied: Only the creator of this expense can initiate deletion.");
    }

    const user = this.getUsers().find(u => u.id === activeUserId);
    const updatedExpenses = expenses.map(e => {
      if (e.id === id) {
        return {
          ...e,
          isDeletionPending: true,
          deletionReasonInfo: {
            reason,
            comment,
            requestedByUserId: activeUserId,
            requestedByUserName: user ? user.name : 'Roommate',
            requestedAt: new Date().toISOString(),
            roommateComments: [],
            isSettledWarningAcknowledged: true
          },
          updatedAt: new Date().toISOString()
        } as Expense;
      }
      return e;
    });

    this.setItem(KEYS.EXPENSES, updatedExpenses);
    return updatedExpenses.find(e => e.id === id)!;
  }

  public addDeletionComment(expenseId: string, commentText: string, activeUserId: string): Expense {
    const expenses = this.getExpenses();
    const existing = expenses.find(e => e.id === expenseId);
    if (!existing || !existing.deletionReasonInfo) {
      throw new Error("Expense or deletion request not found");
    }

    const user = this.getUsers().find(u => u.id === activeUserId);
    const newComment = {
      id: `c-${Date.now()}`,
      userId: activeUserId,
      userName: user ? user.name : 'Roommate',
      comment: commentText,
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = expenses.map(e => {
      if (e.id === expenseId && e.deletionReasonInfo) {
        return {
          ...e,
          deletionReasonInfo: {
            ...e.deletionReasonInfo,
            roommateComments: [...(e.deletionReasonInfo.roommateComments || []), newComment]
          }
        } as Expense;
      }
      return e;
    });

    this.setItem(KEYS.EXPENSES, updatedExpenses);
    return updatedExpenses.find(e => e.id === expenseId)!;
  }

  public cancelExpenseDeletion(id: string): Expense {
    const expenses = this.getExpenses();
    const updatedExpenses = expenses.map(e => {
      if (e.id === id) {
        const { isDeletionPending, deletionReasonInfo, ...rest } = e;
        return {
          ...rest,
          updatedAt: new Date().toISOString()
        } as Expense;
      }
      return e;
    });

    this.setItem(KEYS.EXPENSES, updatedExpenses);
    return updatedExpenses.find(e => e.id === id)!;
  }

  // Budgets
  public getBudgets(): MonthlyBudget[] {
    return this.getItem<MonthlyBudget[]>(KEYS.BUDGETS, INITIAL_BUDGETS);
  }

  public setBudget(userId: string, month: number, year: number, amount: number, activeUserId?: string): MonthlyBudget {
    const activeUser = this.getActiveUser();
    if (activeUserId && userId !== activeUserId && activeUser.role !== 'owner') {
      throw new Error(`Permission Denied: You can only edit your own monthly budget.`);
    }

    const budgets = this.getBudgets();
    const users = this.getUsers();
    const household = this.getHousehold();
    const user = users.find(u => u.id === userId);

    const existingIndex = budgets.findIndex(b => b.userId === userId && b.month === month && b.year === year);
    if (existingIndex >= 0) {
      budgets[existingIndex].amount = amount;
      this.setItem(KEYS.BUDGETS, budgets);
      return budgets[existingIndex];
    } else {
      const newBudget: MonthlyBudget = {
        id: `b-${userId}-${month}-${year}`,
        householdId: household.id,
        userId,
        userName: user ? user.name : 'Roommate',
        month,
        year,
        amount
      };
      budgets.push(newBudget);
      this.setItem(KEYS.BUDGETS, budgets);
      return newBudget;
    }
  }

  // Settlements
  public getSettlements(activeUserId?: string): Settlement[] {
    const raw = this.getItem<Settlement[]>(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
    if (!activeUserId) return raw;
    // Visibility Rule: Users should only see settlements that involve them (as debtor or creditor)
    return raw.filter(s => s.owedByUserId === activeUserId || s.owedToUserId === activeUserId);
  }

  public createSettlement(settlement: Omit<Settlement, 'id' | 'createdAt'>): Settlement {
    const settlements = this.getItem<Settlement[]>(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
    const newSettlement: Settlement = {
      ...settlement,
      id: `settle-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    settlements.unshift(newSettlement);
    this.setItem(KEYS.SETTLEMENTS, settlements);
    return newSettlement;
  }

  public updateSettlementStatus(id: string, status: 'settled' | 'rejected', activeUserId: string, creditorRemarks?: string): Settlement {
    const settlements = this.getItem<Settlement[]>(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
    const existing = settlements.find(s => s.id === id);

    if (!existing) {
      throw new Error("Settlement record not found.");
    }

    // Creditor Permission Rule: Only the creditor (owedToUserId) can accept or reject a settlement
    if (existing.owedToUserId !== activeUserId) {
      throw new Error("Permission Denied: Only the creditor can accept or reject this settlement payment.");
    }

    const updated = settlements.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          creditorRemarks: creditorRemarks || s.creditorRemarks,
          settledAt: status === 'settled' ? new Date().toISOString() : s.settledAt
        };
      }
      return s;
    });

    this.setItem(KEYS.SETTLEMENTS, updated);
    return updated.find(s => s.id === id)!;
  }

  public deleteSettlement(id: string): void {
    const settlements = this.getItem<Settlement[]>(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
    const updated = settlements.filter(s => s.id !== id);
    this.setItem(KEYS.SETTLEMENTS, updated);
  }

  // Settlement Calculator
  public calculateSettlementSummary(month?: number, year?: number): SettlementSummary {
    const expenses = this.getExpenses();
    const users = this.getUsers();
    const settlements = this.getItem<Settlement[]>(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);

    // Filter expenses by month/year if provided
    const filteredExpenses = expenses.filter(e => {
      if (!month || !year) return true;
      const d = new Date(e.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      return m === month && y === year;
    });

    // ONLY settlements with status === 'settled' adjust running balances
    const filteredSettlements = settlements.filter(s => {
      if (s.status !== 'settled') return false;
      if (!month || !year) return true;
      return s.month === month && s.year === year;
    });

    const totalHouseholdExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const roommateStats = users.map(user => {
      let totalPaid = 0;
      let fairShareOwed = 0;

      filteredExpenses.forEach(exp => {
        // Did this user pay for this expense?
        if (exp.paidByUserId === user.id) {
          totalPaid += exp.amount;
        }

        // How much is this user's fair share for this expense?
        const detail = exp.splitDetails?.find(d => d.userId === user.id);
        if (detail) {
          fairShareOwed += detail.amount;
        } else if (exp.splitType === 'equal') {
          // Fallback equal split calculation
          fairShareOwed += exp.amount / (users.length || 1);
        }
      });

      // Factor in recorded settlements:
      // If user paid a settlement to someone else (owedByUserId === user.id), increase net balance (+ amount)
      // If user received a settlement from someone else (owedToUserId === user.id), decrease net balance (- amount)
      let settlementAdjustments = 0;
      filteredSettlements.forEach(s => {
        if (s.owedByUserId === user.id) {
          settlementAdjustments += s.amount;
        }
        if (s.owedToUserId === user.id) {
          settlementAdjustments -= s.amount;
        }
      });

      const netBalance = (totalPaid - fairShareOwed) + settlementAdjustments;

      return {
        userId: user.id,
        userName: user.name,
        totalPaid: Math.round(totalPaid * 100) / 100,
        fairShareOwed: Math.round(fairShareOwed * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100
      };
    });

    // Compute net transfers between debtors and creditors
    const transfers: SettlementSummary['transfers'] = [];
    const creditors = roommateStats.filter(r => r.netBalance > 0.01).map(r => ({ ...r, amountOwed: r.netBalance }));
    const debtors = roommateStats.filter(r => r.netBalance < -0.01).map(r => ({ ...r, amountOwed: Math.abs(r.netBalance) }));

    debtors.forEach(debtor => {
      creditors.forEach(creditor => {
        if (debtor.amountOwed <= 0.01 || creditor.amountOwed <= 0.01) return;
        const transferAmount = Math.min(debtor.amountOwed, creditor.amountOwed);
        
        transfers.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Math.round(transferAmount * 100) / 100
        });

        debtor.amountOwed -= transferAmount;
        creditor.amountOwed -= transferAmount;
      });
    });

    return {
      totalHouseholdExpenses: Math.round(totalHouseholdExpenses * 100) / 100,
      roommates: roommateStats,
      transfers
    };
  }

  // Reset to initial seed state
  public resetData(): void {
    localStorage.clear();
    this.initializeDefaults();
    this.notify();
  }
}

export const storage = new StorageService();
