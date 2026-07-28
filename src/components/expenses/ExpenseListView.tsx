import React, { useState } from 'react';
import { Category, Expense, UserProfile, Settlement } from '../../types';
import { Search, Plus, Trash2, Edit3, Receipt, Calendar, Eye, Image as ImageIcon, AlertTriangle, MessageSquare } from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { DeleteExpenseModal } from './DeleteExpenseModal';

interface ExpenseListViewProps {
  expenses: Expense[];
  categories: Category[];
  users: UserProfile[];
  activeUser: UserProfile;
  settlements?: Settlement[];
  currencySymbol?: string;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onRequestDeletion?: (id: string, reason: string, comment: string) => void;
  onConfirmDeletion?: (id: string) => void;
  onAddDeletionComment?: (id: string, commentText: string) => void;
  onCancelDeletion?: (id: string) => void;
}

const getCategoryEmoji = (categoryName: string, specificUsage?: string): string => {
  const text = (categoryName + ' ' + (specificUsage || '')).toLowerCase();
  if (text.includes('pet') || text.includes('dog') || text.includes('cat')) return '🐶';
  if (text.includes('coffee') || text.includes('starbucks') || text.includes('tea') || text.includes('cafe')) return '☕';
  if (text.includes('repair') || text.includes('fix') || text.includes('tool') || text.includes('maintenance')) return '🛠️';
  if (text.includes('commute') || text.includes('uber') || text.includes('ola') || text.includes('auto') || text.includes('cab') || text.includes('travel')) return '🚕';
  if (text.includes('grocery') || text.includes('food') || text.includes('blinkit') || text.includes('swiggy') || text.includes('market')) return '🛒';
  if (text.includes('rent') || text.includes('house') || text.includes('apartment')) return '🏠';
  if (text.includes('wifi') || text.includes('internet') || text.includes('broadband')) return '📡';
  if (text.includes('electric') || text.includes('bescom') || text.includes('power') || text.includes('light')) return '⚡';
  if (text.includes('water') || text.includes('maid') || text.includes('cook')) return '🧹';
  if (text.includes('entertainment') || text.includes('movie') || text.includes('fun')) return '🍿';
  return '💳';
};

export const ExpenseListView: React.FC<ExpenseListViewProps> = ({
  expenses,
  categories,
  users,
  activeUser,
  settlements = [],
  currencySymbol = '₹',
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onRequestDeletion,
  onConfirmDeletion,
  onAddDeletionComment,
  onCancelDeletion
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaidBy, setSelectedPaidBy] = useState<string>('all');
  const [selectedSplitType, setSelectedSplitType] = useState<string>('all');
  const [previewReceiptExpense, setPreviewReceiptExpense] = useState<Expense | null>(null);

  // Deletion modal state
  const [deleteTargetExpense, setDeleteTargetExpense] = useState<Expense | null>(null);

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exp.specificUsage && exp.specificUsage.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || exp.categoryId === selectedCategory;
    const matchesPaidBy = selectedPaidBy === 'all' || exp.paidByUserId === selectedPaidBy;
    const matchesSplit = selectedSplitType === 'all' ||
                          (selectedSplitType === 'equal' ? exp.splitType === 'equal' : exp.splitType !== 'equal');

    return matchesSearch && matchesCategory && matchesPaidBy && matchesSplit;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="font-display font-black text-2xl text-black tracking-tight">
            expenses history
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            view, search & manage all shared household receipts
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="mibu-pill-active px-4 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-transform active:scale-95 self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>log expense</span>
        </button>
      </div>

      {/* Filter Bar Pills */}
      <div className="bg-white border border-neutral-200 p-5 rounded-3xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-black"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-black"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Paid By Filter */}
          <select
            value={selectedPaidBy}
            onChange={e => setSelectedPaidBy(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-black"
          >
            <option value="all">All Roommates</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Split Type Filter */}
          <select
            value={selectedSplitType}
            onChange={e => setSelectedSplitType(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-black"
          >
            <option value="all">All Split Types</option>
            <option value="equal">Equal 50/50 Splits</option>
            <option value="custom">Custom Overrides</option>
          </select>

        </div>

        {/* Filter Summary Counter */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <span>Showing <strong className="text-black">{filteredExpenses.length}</strong> expenses</span>
          <span>Total Filtered: <strong className="text-black font-display font-bold">{currencySymbol}{totalFilteredAmount.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="bg-white border border-neutral-200 rounded-3xl shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-3">
            <Receipt className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm font-semibold text-neutral-700">No expenses found matching filters.</p>
            <p className="text-xs text-neutral-400">Try adjusting your search criteria or log a new expense.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredExpenses.map(exp => {
              const activeUserDetail = exp.splitDetails?.find(d => d.userId === activeUser.id);
              const activeUserShare = activeUserDetail ? activeUserDetail.amount : (exp.amount / 2);
              const emoji = getCategoryEmoji(exp.categoryName, exp.specificUsage);

              return (
                <div
                  key={exp.id}
                  className="p-4 hover:bg-neutral-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left info */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xl flex-shrink-0">
                      {emoji}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-black text-sm">{exp.title}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
                        <span className="text-black font-semibold">{exp.categoryName}</span>
                        {exp.specificUsage && (
                          <span className="bg-neutral-100 text-black px-2 py-0.2 rounded-full border border-neutral-200 font-medium text-[10px]">
                            {exp.specificUsage}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {exp.date}
                        </span>
                        <span>•</span>
                        <span>paid by <strong className="text-black">{exp.paidByUserName.split(' ')[0]}</strong></span>
                        <span>•</span>
                        <span className="text-[10px] text-neutral-400">{exp.paymentMethod || 'UPI'}</span>
                      </div>

                      {exp.notes && (
                        <p className="text-xs text-neutral-500 italic pt-0.5">
                          "{exp.notes}"
                        </p>
                      )}

                      {/* Deletion Request Alert Badge & Comments Preview */}
                      {exp.isDeletionPending && exp.deletionReasonInfo && (
                        <div 
                          onClick={() => setDeleteTargetExpense(exp)}
                          className="mt-2 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:bg-amber-100/60 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-amber-900">Deletion Requested by {exp.deletionReasonInfo.requestedByUserName}:</span>{' '}
                              <span className="text-amber-800 font-semibold">{exp.deletionReasonInfo.reason}</span>
                              {exp.deletionReasonInfo.comment && (
                                <span className="text-neutral-600 block text-[11px] italic">"{exp.deletionReasonInfo.comment}"</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-amber-700" />
                            <span>{exp.deletionReasonInfo.roommateComments?.length || 0} Comments →</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-neutral-100 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <div className="font-display font-bold text-base text-black">
                        -{currencySymbol}{exp.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Your share: <strong>{currencySymbol}{activeUserShare.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {exp.receiptUrl && (
                        <button
                          onClick={() => setPreviewReceiptExpense(exp)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors mr-1 cursor-pointer"
                          title="View attached receipt image"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      )}
                      {exp.createdBy === activeUser.id ? (
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                          title={`View Expense Details (Created by ${exp.paidByUserName})`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (exp.createdBy !== activeUser.id && !exp.isDeletionPending) {
                            alert(`Permission Denied: Only the expense creator (${exp.paidByUserName}) can delete this expense.`);
                            return;
                          }
                          setDeleteTargetExpense(exp);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          exp.createdBy === activeUser.id || exp.isDeletionPending
                            ? 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer' 
                            : 'text-neutral-300 cursor-not-allowed opacity-50'
                        }`}
                        title={exp.createdBy === activeUser.id ? "Delete / Request Deletion" : `Only ${exp.paidByUserName} can delete this expense`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
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

      {/* Delete Expense Modal with Reason Selection, Settled Warning, & Roommate Comments */}
      {deleteTargetExpense && (
        <DeleteExpenseModal
          isOpen={!!deleteTargetExpense}
          onClose={() => setDeleteTargetExpense(null)}
          expense={deleteTargetExpense}
          activeUser={activeUser}
          settlements={settlements}
          currencySymbol={currencySymbol}
          onRequestDeletion={(id, reason, comment) => {
            if (onRequestDeletion) onRequestDeletion(id, reason, comment);
            setDeleteTargetExpense(null);
          }}
          onConfirmDeletion={(id) => {
            if (onConfirmDeletion) {
              onConfirmDeletion(id);
            } else {
              onDeleteExpense(id);
            }
            setDeleteTargetExpense(null);
          }}
          onAddComment={(id, commentText) => {
            if (onAddDeletionComment) onAddDeletionComment(id, commentText);
          }}
          onCancelDeletion={(id) => {
            if (onCancelDeletion) onCancelDeletion(id);
            setDeleteTargetExpense(null);
          }}
        />
      )}

    </div>
  );
};
