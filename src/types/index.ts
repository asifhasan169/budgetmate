export type SplitType = 'equal' | 'custom_percentage' | 'custom_amount';

export interface SplitDetail {
  userId: string;
  userName: string;
  amount: number;
  percentage: number;
}

export interface DeletionComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface DeletionReasonInfo {
  reason: string;
  comment?: string;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedAt: string;
  roommateComments?: DeletionComment[];
  isSettledWarningAcknowledged?: boolean;
}

export interface Expense {
  id: string;
  householdId: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // ISO date string YYYY-MM-DD
  paidByUserId: string;
  paidByUserName: string;
  splitType: SplitType;
  splitDetails: SplitDetail[];
  notes?: string;
  specificUsage?: string;
  paymentMethod?: string;
  receiptUrl?: string; // Base64 or object URL or path
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletionReasonInfo?: DeletionReasonInfo;
  isDeletionPending?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  householdId: string;
  role: 'owner' | 'member';
  color: string;
  displayName?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  occupation?: string;
  bio?: string;
  joinedDate?: string;
  authProvider?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  currencySymbol: string;
}

export interface MonthlyBudget {
  id: string;
  householdId: string;
  userId: string;
  userName: string;
  month: number; // 1 - 12
  year: number;
  amount: number;
}

export interface Settlement {
  id: string;
  householdId: string;
  month: number;
  year: number;
  owedByUserId: string;
  owedByUserName: string;
  owedToUserId: string;
  owedToUserName: string;
  amount: number;
  status: 'pending' | 'settled' | 'rejected';
  paymentMethod?: string;
  paymentProofUrl?: string;
  notes?: string;
  creditorRemarks?: string;
  settledAt?: string;
  createdAt: string;
}

export interface SettlementSummary {
  totalHouseholdExpenses: number;
  roommates: {
    userId: string;
    userName: string;
    totalPaid: number;
    fairShareOwed: number;
    netBalance: number; // Positive = gets back money, Negative = owes money
  }[];
  transfers: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
  }[];
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'tip' | 'positive' | 'prediction';
  title: string;
  message: string;
  category?: string;
  impactAmount?: number;
  actionLabel?: string;
}

export interface ExpenseFilter {
  search: string;
  categoryId: string;
  paidByUserId: string;
  startDate: string;
  endDate: string;
  minAmount?: number;
  maxAmount?: number;
}
