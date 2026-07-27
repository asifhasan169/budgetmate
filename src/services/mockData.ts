import { Category, Expense, Household, MonthlyBudget, Settlement, UserProfile } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Groceries', icon: 'ShoppingCart', color: 'bg-emerald-500 text-emerald-50 border-emerald-600', description: 'Food, pantry & household supplies' },
  { id: 'cat-2', name: 'Rent', icon: 'Home', color: 'bg-indigo-500 text-indigo-50 border-indigo-600', description: 'Monthly lease payment' },
  { id: 'cat-3', name: 'Utilities & Electricity', icon: 'Zap', color: 'bg-amber-500 text-amber-50 border-amber-600', description: 'Power, water, heating & gas' },
  { id: 'cat-4', name: 'Internet & WiFi', icon: 'Wifi', color: 'bg-blue-500 text-blue-50 border-blue-600', description: 'Fiber broadband & subscriptions' },
  { id: 'cat-5', name: 'Dining Out & Takeaway', icon: 'Utensils', color: 'bg-rose-500 text-rose-50 border-rose-600', description: 'Restaurants, coffee & pizza nights' },
  { id: 'cat-6', name: 'Entertainment & Streaming', icon: 'Film', color: 'bg-purple-500 text-purple-50 border-purple-600', description: 'Netflix, gaming & events' },
  { id: 'cat-7', name: 'Transport & Fuel', icon: 'Car', color: 'bg-cyan-500 text-cyan-50 border-cyan-600', description: 'Gasoline, Uber, subway & parking' },
  { id: 'cat-8', name: 'Household Supplies', icon: 'Package', color: 'bg-teal-500 text-teal-50 border-teal-600', description: 'Cleaning supplies, towels, soap' },
  { id: 'cat-9', name: 'Medical & Healthcare', icon: 'HeartPulse', color: 'bg-red-500 text-red-50 border-red-600', description: 'Pharmacy, first aid, checkups' },
  { id: 'cat-10', name: 'Maintenance & Repairs', icon: 'Wrench', color: 'bg-stone-500 text-stone-50 border-stone-600', description: 'Fixing appliances, keys, plumbing' },
  { id: 'cat-11', name: 'Others', icon: 'Tag', color: 'bg-slate-500 text-slate-50 border-slate-600', description: 'Miscellaneous expenses' }
];

export const INITIAL_HOUSEHOLD: Household = {
  id: 'house-101',
  name: 'Sunset Heights #4B',
  inviteCode: 'BM-4B89X',
  createdAt: '2026-06-01T00:00:00.000Z',
  currencySymbol: '₹'
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-alex',
    email: 'alex.rivers@example.com',
    name: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    householdId: 'house-101',
    role: 'owner',
    color: '#3b82f6' // blue
  },
  {
    id: 'user-sam',
    email: 'sam.chen@example.com',
    name: 'Sam Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    householdId: 'house-101',
    role: 'member',
    color: '#10b981' // emerald
  }
];

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const formatDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    householdId: 'house-101',
    title: 'Whole Foods Weekly Groceries',
    amount: 168.50,
    categoryId: 'cat-1',
    categoryName: 'Groceries',
    categoryIcon: 'ShoppingCart',
    categoryColor: 'bg-emerald-500 text-emerald-50 border-emerald-600',
    date: formatDate(1),
    paidByUserId: 'user-alex',
    paidByUserName: 'Alex Rivers',
    splitType: 'equal',
    splitDetails: [
      { userId: 'user-alex', userName: 'Alex Rivers', amount: 84.25, percentage: 50 },
      { userId: 'user-sam', userName: 'Sam Chen', amount: 84.25, percentage: 50 }
    ],
    notes: 'Bought organic produce, milk, olive oil and snacks for the week',
    specificUsage: 'Blinkit & Nature’s Basket',
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
    createdBy: 'user-alex',
    updatedBy: 'user-alex',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'exp-2',
    householdId: 'house-101',
    title: 'Monthly High-Speed Fiber Internet',
    amount: 80.00,
    categoryId: 'cat-4',
    categoryName: 'Internet & WiFi',
    categoryIcon: 'Wifi',
    categoryColor: 'bg-blue-500 text-blue-50 border-blue-600',
    date: formatDate(3),
    paidByUserId: 'user-sam',
    paidByUserName: 'Sam Chen',
    splitType: 'equal',
    splitDetails: [
      { userId: 'user-alex', userName: 'Alex Rivers', amount: 40.00, percentage: 50 },
      { userId: 'user-sam', userName: 'Sam Chen', amount: 40.00, percentage: 50 }
    ],
    notes: '1 Gbps plan for July',
    paymentMethod: 'Auto Debit',
    createdBy: 'user-sam',
    updatedBy: 'user-sam',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'exp-3',
    householdId: 'house-101',
    title: 'Electricity & Power Bill',
    amount: 145.20,
    categoryId: 'cat-3',
    categoryName: 'Utilities & Electricity',
    categoryIcon: 'Zap',
    categoryColor: 'bg-amber-500 text-amber-50 border-amber-600',
    date: formatDate(5),
    paidByUserId: 'user-alex',
    paidByUserName: 'Alex Rivers',
    splitType: 'equal',
    splitDetails: [
      { userId: 'user-alex', userName: 'Alex Rivers', amount: 72.60, percentage: 50 },
      { userId: 'user-sam', userName: 'Sam Chen', amount: 72.60, percentage: 50 }
    ],
    notes: 'AC running during heatwave',
    paymentMethod: 'Bank Transfer',
    createdBy: 'user-alex',
    updatedBy: 'user-alex',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 'exp-4',
    householdId: 'house-101',
    title: 'Friday Pizza & Craft Beers',
    amount: 62.40,
    categoryId: 'cat-5',
    categoryName: 'Dining Out & Takeaway',
    categoryIcon: 'Utensils',
    categoryColor: 'bg-rose-500 text-rose-50 border-rose-600',
    date: formatDate(7),
    paidByUserId: 'user-sam',
    paidByUserName: 'Sam Chen',
    splitType: 'custom_percentage',
    splitDetails: [
      { userId: 'user-alex', userName: 'Alex Rivers', amount: 37.44, percentage: 60 },
      { userId: 'user-sam', userName: 'Sam Chen', amount: 24.96, percentage: 40 }
    ],
    notes: 'Alex ordered extra large specialty pie + wings',
    paymentMethod: 'Venmo',
    createdBy: 'user-sam',
    updatedBy: 'user-sam',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: 'exp-5',
    householdId: 'house-101',
    title: 'Target Dish Soap & Paper Towels',
    amount: 42.10,
    categoryId: 'cat-8',
    categoryName: 'Household Supplies',
    categoryIcon: 'Package',
    categoryColor: 'bg-teal-500 text-teal-50 border-teal-600',
    date: formatDate(10),
    paidByUserId: 'user-sam',
    paidByUserName: 'Sam Chen',
    splitType: 'equal',
    splitDetails: [
      { userId: 'user-alex', userName: 'Alex Rivers', amount: 21.05, percentage: 50 },
      { userId: 'user-sam', userName: 'Sam Chen', amount: 21.05, percentage: 50 }
    ],
    notes: 'Restocked kitchen cleaning bulk pack',
    paymentMethod: 'Debit Card',
    createdBy: 'user-sam',
    updatedBy: 'user-sam',
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    updatedAt: new Date(Date.now() - 864000000).toISOString()
  },
  {
    id: 'exp-6',
    householdId: 'house-101',
    title: 'Monthly Apartment Rent',
    amount: 2400.00,
    categoryId: 'cat-2',
    categoryName: 'Rent',
    categoryIcon: 'Home',
    categoryColor: 'bg-indigo-500 text-indigo-50 border-indigo-600',
    date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
    paidByUserId: 'user-alex',
    paidByUserName: 'Alex Rivers',
    splitType: 'equal',
    splitDetails: [
      { userId: 'user-alex', userName: 'Alex Rivers', amount: 1200.00, percentage: 50 },
      { userId: 'user-sam', userName: 'Sam Chen', amount: 1200.00, percentage: 50 }
    ],
    notes: 'Lease payment via landlord portal',
    paymentMethod: 'Bank Transfer',
    createdBy: 'user-alex',
    updatedBy: 'user-alex',
    createdAt: new Date(Date.now() - 1200000000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000000).toISOString()
  }
];

export const INITIAL_BUDGETS: MonthlyBudget[] = [
  {
    id: 'b-alex',
    householdId: 'house-101',
    userId: 'user-alex',
    userName: 'Alex Rivers',
    month: currentMonth,
    year: currentYear,
    amount: 1600.00
  },
  {
    id: 'b-sam',
    householdId: 'house-101',
    userId: 'user-sam',
    userName: 'Sam Chen',
    month: currentMonth,
    year: currentYear,
    amount: 1500.00
  }
];

export const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: 'settle-1',
    householdId: 'house-101',
    month: currentMonth > 1 ? currentMonth - 1 : 12,
    year: currentMonth > 1 ? currentYear : currentYear - 1,
    owedByUserId: 'user-sam',
    owedByUserName: 'Sam Chen',
    owedToUserId: 'user-alex',
    owedToUserName: 'Alex Rivers',
    amount: 115.80,
    status: 'settled',
    paymentMethod: 'Zelle',
    notes: 'June final balancing settlement',
    settledAt: '2026-06-30T18:30:00.000Z',
    createdAt: '2026-06-30T12:00:00.000Z'
  }
];
