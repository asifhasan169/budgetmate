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

  private notify() {
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

  public saveExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Expense {
    const expenses = this.getExpenses();
    const nowISO = new Date().toISOString();

    if (expense.id) {
      // Edit existing
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

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses();
    const updated = expenses.filter(e => e.id !== id);
    this.setItem(KEYS.EXPENSES, updated);
  }

  // Budgets
  public getBudgets(): MonthlyBudget[] {
    return this.getItem<MonthlyBudget[]>(KEYS.BUDGETS, INITIAL_BUDGETS);
  }

  public setBudget(userId: string, month: number, year: number, amount: number): MonthlyBudget {
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
  public getSettlements(): Settlement[] {
    return this.getItem<Settlement[]>(KEYS.SETTLEMENTS, INITIAL_SETTLEMENTS);
  }

  public createSettlement(settlement: Omit<Settlement, 'id' | 'createdAt'>): Settlement {
    const settlements = this.getSettlements();
    const newSettlement: Settlement = {
      ...settlement,
      id: `settle-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    settlements.unshift(newSettlement);
    this.setItem(KEYS.SETTLEMENTS, settlements);
    return newSettlement;
  }

  // Settlement Calculator
  public calculateSettlementSummary(month?: number, year?: number): SettlementSummary {
    const expenses = this.getExpenses();
    const users = this.getUsers();

    // Filter expenses by month/year if provided
    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      if (month && m !== month) return false;
      if (year && y !== year) return false;
      return true;
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

      const netBalance = totalPaid - fairShareOwed;

      return {
        userId: user.id,
        userName: user.name,
        totalPaid: Math.round(totalPaid * 100) / 100,
        fairShareOwed: Math.round(fairShareOwed * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100
      };
    });

    // Compute transfers
    const transfers: SettlementSummary['transfers'] = [];
    const creditors = roommateStats.filter(r => r.netBalance > 0.01).map(r => ({ ...r }));
    const debtors = roommateStats.filter(r => r.netBalance < -0.01).map(r => ({ ...r, amountOwed: Math.abs(r.netBalance) }));

    debtors.forEach(debtor => {
      creditors.forEach(creditor => {
        if (debtor.amountOwed <= 0 || creditor.netBalance <= 0) return;
        const transferAmount = Math.min(debtor.amountOwed, creditor.netBalance);
        
        transfers.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Math.round(transferAmount * 100) / 100
        });

        debtor.amountOwed -= transferAmount;
        creditor.netBalance -= transferAmount;
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
