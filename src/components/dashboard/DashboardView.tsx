import React, { useState } from 'react';
import { Expense, MonthlyBudget, SettlementSummary, UserProfile } from '../../types';
import { Search, ChevronDown, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, ChevronRight, Calculator, Calendar, Image as ImageIcon, Check } from 'lucide-react';
import { ReceiptModal } from '../expenses/ReceiptModal';
import { AliveGraph } from './AliveGraph';
import { CategorySvgIcon } from '../categories/CategorySvgIcon';
import { BudgetMateLogo } from '../common/BudgetMateLogo';

interface DashboardViewProps {
  expenses: Expense[];
  budgets: MonthlyBudget[];
  users: UserProfile[];
  activeUser: UserProfile;
  settlementSummary: SettlementSummary;
  currencySymbol?: string;
  onOpenAddExpense: () => void;
  onNavigateTab: (tab: string) => void;
  onEditExpense: (expense: Expense) => void;
}

// Category emoji helper for mibu style icons
const getCategoryEmoji = (categoryName: string, specificUsage?: string): string => {
  const text = (categoryName + ' ' + (specificUsage || '')).toLowerCase();
  if (text.includes('pet') || text.includes('dog') || text.includes('cat')) return '🐶';
  if (text.includes('coffee') || text.includes('starbucks') || text.includes('tea') || text.includes('cafe')) return '☕';
  if (text.includes('repair') || text.includes('fix') || text.includes('tool') || text.includes('maintenance')) return '🛠️';
  if (text.includes('commute') || text.includes('uber') || text.includes('ola') || text.includes('auto') || text.includes('cab') || text.includes('travel')) return '🚕';
  if (text.includes('grocery') || text.includes('food') || text.includes('blinkit') || text.includes('swiggy') || text.includes('market') || text.includes('supermarket')) return '🛒';
  if (text.includes('rent') || text.includes('house') || text.includes('apartment')) return '🏠';
  if (text.includes('wifi') || text.includes('internet') || text.includes('broadband')) return '📡';
  if (text.includes('electric') || text.includes('bescom') || text.includes('power') || text.includes('light')) return '⚡';
  if (text.includes('water') || text.includes('maid') || text.includes('cook')) return '🧹';
  if (text.includes('entertainment') || text.includes('movie') || text.includes('fun') || text.includes('party')) return '🍿';
  return '💳';
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  budgets,
  users,
  activeUser,
  settlementSummary,
  currencySymbol = '₹',
  onOpenAddExpense,
  onNavigateTab,
  onEditExpense
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'this_month' | 'this_week' | 'specific_day'>('this_month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewReceiptExpense, setPreviewReceiptExpense] = useState<Expense | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Active user budget & stats
  const activeBudget = budgets.find(b => b.userId === activeUser.id && b.month === currentMonth && b.year === currentYear)?.amount || 1500;
  
  const activeRoommateStat = settlementSummary.roommates.find(r => r.userId === activeUser.id) || {
    totalPaid: 0,
    fairShareOwed: 0,
    netBalance: 0
  };

  const activeUserFairShare = activeRoommateStat.fairShareOwed;
  const activeUserPaid = activeRoommateStat.totalPaid;
  const remainingBudget = activeBudget - activeUserFairShare;

  // Today's expenses
  const todayStr = now.toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filtered expenses list based on selected filter option
  const filteredExpenses = expenses.filter(e => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchCat = e.categoryName.toLowerCase().includes(q);
      const matchUsage = (e.specificUsage || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchUsage) return false;
    }

    if (selectedFilter === 'specific_day') {
      const targetDate = selectedDate || todayStr;
      return e.date === targetDate;
    }

    if (selectedFilter === 'this_week') {
      if (!e.date) return false;
      const expDate = new Date(e.date + 'T00:00:00');
      const nowObj = new Date();
      const diffTime = nowObj.getTime() - expDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    }

    if (selectedFilter === 'this_month') {
      if (!e.date) return false;
      const expDate = new Date(e.date + 'T00:00:00');
      const nowObj = new Date();
      return expDate.getMonth() === nowObj.getMonth() && expDate.getFullYear() === nowObj.getFullYear();
    }

    return true;
  });

  // Settlement transfers
  const transfers = settlementSummary.transfers;
  const activeUserTransfer = transfers.find(t => t.fromUserId === activeUser.id || t.toUserId === activeUser.id);

  // Days selector array (for horizontal day bar in mibu style)
  const daysList = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (3 - i));
    return {
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
      isToday: d.toISOString().split('T')[0] === todayStr,
      dateStr: d.toISOString().split('T')[0]
    };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* 1. Mibu Style Minimal Banner / Hero Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xs">
        {/* Floating Category Pills around character */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="mibu-pill px-3 py-1 text-[11px] font-semibold text-neutral-700">balance</span>
          <span className="mibu-pill px-3 py-1 text-[11px] font-semibold text-neutral-700">expenses</span>
          <span className="mibu-pill px-3 py-1 text-[11px] font-semibold text-neutral-700">roommates</span>
          <span className="mibu-pill px-3 py-1 text-[11px] font-semibold text-neutral-700">food</span>
          <span className="mibu-pill px-3 py-1 text-[11px] font-semibold text-neutral-700">utilities</span>
          <span className="mibu-pill px-3 py-1 text-[11px] font-semibold text-neutral-700">settle</span>
        </div>

        {/* Minimal Option 9 House + Receipt Logo */}
        <div className="my-3 flex justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm">
            <BudgetMateLogo size={68} className="text-black" />
          </div>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tighter text-black mt-2">
          BudgetMate
        </h1>
        <p className="text-xs text-neutral-500 font-semibold tracking-tight mt-0.5">
          Shared expenses, simplified.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="mibu-pill-active px-5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>log new expense</span>
          </button>
          <button
            onClick={() => onNavigateTab('settlements')}
            className="mibu-pill px-4 py-2 text-xs font-bold text-black hover:bg-neutral-100 transition-colors"
          >
            settlement calculator
          </button>
        </div>
      </div>

      {/* 2. Main Minimal Total Spending View with Apple Health Style Alive Graph */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        
        {/* Top Controls Bar: Period Selector Dropdown + Search input */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="mibu-pill px-4 py-1.5 text-xs font-bold text-black flex items-center space-x-1.5 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                <span>
                  {selectedFilter === 'this_month' && 'This Month'}
                  {selectedFilter === 'this_week' && 'This Week'}
                  {selectedFilter === 'specific_day' && 'Specific Day'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {isPeriodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPeriodDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-44 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setSelectedFilter('this_month');
                        setSelectedDate(null);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                        selectedFilter === 'this_month' ? 'text-black bg-neutral-100/70' : 'text-neutral-600'
                      }`}
                    >
                      <span>This Month</span>
                      {selectedFilter === 'this_month' && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFilter('this_week');
                        setSelectedDate(null);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                        selectedFilter === 'this_week' ? 'text-black bg-neutral-100/70' : 'text-neutral-600'
                      }`}
                    >
                      <span>This Week</span>
                      {selectedFilter === 'this_week' && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedFilter('specific_day');
                        if (!selectedDate) setSelectedDate(todayStr);
                        setIsPeriodDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                        selectedFilter === 'specific_day' ? 'text-black bg-neutral-100/70' : 'text-neutral-600'
                      }`}
                    >
                      <span>Specific Day</span>
                      {selectedFilter === 'specific_day' && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Inline Date Selector when Specific Day is selected */}
            {selectedFilter === 'specific_day' && (
              <input
                type="date"
                value={selectedDate || todayStr}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 focus:border-black rounded-full px-3 py-1 text-xs text-black font-semibold focus:outline-none transition-colors cursor-pointer shadow-xs"
              />
            )}
          </div>

          <div className="relative flex-1 max-w-xs min-w-[160px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-full pl-9 pr-3 py-1.5 text-xs text-black focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Apple Health / Linear Style Alive Dynamic Drag Wave Graph */}
        <AliveGraph
          expenses={expenses}
          activeUser={activeUser}
          currencySymbol={currencySymbol}
          selectedFilter={selectedFilter}
          selectedDate={selectedDate || undefined}
          totalHouseholdExpenses={settlementSummary.totalHouseholdExpenses}
          activeUserFairShare={activeUserFairShare}
          activeUserPaid={activeUserPaid}
          onSelectDate={(dStr) => {
            setSelectedDate(dStr);
            setSelectedFilter('specific_day');
          }}
        />

        {/* Horizontal Calendar Day Bar */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 pt-2 border-t border-neutral-100">
          {daysList.map((d, idx) => {
            const isSelected = selectedDate ? selectedDate === d.dateStr : (selectedFilter === 'specific_day' && d.isToday);
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(d.dateStr);
                  setSelectedFilter('specific_day');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer ${
                  isSelected ? 'bg-black text-white font-bold shadow-xs scale-105' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                }`}
              >
                <span className="text-sm font-display font-bold">{d.dayNum}</span>
                <span className="text-[10px] uppercase font-semibold">{d.dayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Roommate Settlement Status Minimal Card */}
      {activeUserTransfer ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              activeUserTransfer.fromUserId === activeUser.id ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}>
              {activeUserTransfer.fromUserId === activeUser.id ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="text-xs">
              {activeUserTransfer.fromUserId === activeUser.id ? (
                <div>
                  <span className="text-neutral-600">You owe </span>
                  <span className="font-bold text-black">{activeUserTransfer.toUserName}</span>
                  <span className="font-bold text-amber-700 ml-1.5 text-sm">{currencySymbol}{activeUserTransfer.amount.toFixed(2)}</span>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-black">{activeUserTransfer.fromUserName}</span>
                  <span className="text-neutral-600"> owes you </span>
                  <span className="font-bold text-emerald-700 text-sm">{currencySymbol}{activeUserTransfer.amount.toFixed(2)}</span>
                </div>
              )}
              <p className="text-[10px] text-neutral-400 mt-0.5">Calculated based on out-of-pocket splits</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('settlements')}
            className="mibu-pill px-3.5 py-1.5 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors flex-shrink-0"
          >
            Settle Up
          </button>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center space-x-2 text-xs text-neutral-700 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">All roommate accounts are completely settled up! ($0.00 balance)</span>
        </div>
      )}

      {/* 4. Transactions List (Matching Screen 2 Minimal Item Design) */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {selectedFilter === 'today' ? 'Today' : 'Recent Transactions'}
          </div>
          <div className="text-xs font-bold text-black">
            Total: -{currencySymbol}{filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(exp => {
              const emoji = getCategoryEmoji(exp.categoryName, exp.specificUsage);
              return (
                <div
                  key={exp.id}
                  onClick={() => onEditExpense(exp)}
                  className="py-3.5 flex items-center justify-between hover:bg-neutral-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <CategorySvgIcon
                      categoryName={exp.categoryName}
                      categoryId={exp.categoryId}
                      iconName={exp.categoryIcon}
                      size={18}
                      variant="black-badge"
                      className="w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-transform"
                    />

                    <div className="min-w-0">
                      <div className="font-bold text-sm text-black group-hover:underline truncate">
                        {exp.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                        <span className="font-semibold text-neutral-700">{exp.categoryName}</span>
                        {exp.specificUsage && (
                          <span className="bg-neutral-100 text-neutral-800 px-2 py-0.2 rounded-full border border-neutral-200 font-medium text-[10px]">
                            {exp.specificUsage}
                          </span>
                        )}
                        <span>•</span>
                        <span>paid by {exp.paidByUserName.split(' ')[0]}</span>
                        <span>•</span>
                        <span className="text-[10px] text-neutral-400">{exp.paymentMethod || 'UPI'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3 flex items-center gap-3">
                    {exp.receiptUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewReceiptExpense(exp);
                        }}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                        title="View attached receipt image"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    )}
                    <div>
                      <div className="font-display font-bold text-sm text-black">
                        -{currencySymbol}{exp.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {exp.date}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-neutral-400">
              No expenses recorded for this filter.
            </div>
          )}
        </div>
      </div>

      {/* Receipt Lightbox Modal */}
      {previewReceiptExpense && previewReceiptExpense.receiptUrl && (
        <ReceiptModal
          isOpen={!!previewReceiptExpense}
          onClose={() => setPreviewReceiptExpense(null)}
          receiptUrl={previewReceiptExpense.receiptUrl}
          expense={previewReceiptExpense}
          currencySymbol={currencySymbol}
        />
      )}

    </div>
  );
};
