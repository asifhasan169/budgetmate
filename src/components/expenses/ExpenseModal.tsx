import React, { useState, useEffect } from 'react';
import { Category, Expense, SplitDetail, SplitType, UserProfile } from '../../types';
import { X, DollarSign, Calendar, Tag, CreditCard, Upload, RefreshCw, Calculator, User, AlertCircle, FileText, Eye, Trash2 } from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  categories: Category[];
  users: UserProfile[];
  activeUser: UserProfile;
  initialExpense?: Expense | null;
  currencySymbol?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  users,
  activeUser,
  initialExpense,
  currencySymbol = '₹'
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [specificUsage, setSpecificUsage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidByUserId, setPaidByUserId] = useState(activeUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // Custom split state for 2 roommates (extendable)
  const [customPcts, setCustomPcts] = useState<Record<string, number>>({});
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(initialExpense.amount.toString());
      setCategoryId(initialExpense.categoryId);
      setSpecificUsage(initialExpense.specificUsage || '');
      setDate(initialExpense.date);
      setPaidByUserId(initialExpense.paidByUserId);
      setSplitType(initialExpense.splitType);
      setNotes(initialExpense.notes || '');
      setPaymentMethod(initialExpense.paymentMethod || 'UPI (GPay / PhonePe / Paytm)');
      setReceiptUrl(initialExpense.receiptUrl || '');

      const pcts: Record<string, number> = {};
      const amts: Record<string, number> = {};
      initialExpense.splitDetails.forEach(d => {
        pcts[d.userId] = d.percentage;
        amts[d.userId] = d.amount;
      });
      setCustomPcts(pcts);
      setCustomAmounts(amts);
    } else {
      // Reset form
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || 'cat-1');
      setSpecificUsage('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaidByUserId(activeUser.id);
      setSplitType('equal');
      setNotes('');
      setPaymentMethod('UPI (GPay / PhonePe / Paytm)');
      setReceiptUrl('');

      const defaultPct = 100 / (users.length || 1);
      const pcts: Record<string, number> = {};
      users.forEach(u => (pcts[u.id] = defaultPct));
      setCustomPcts(pcts);
      setCustomAmounts({});
    }
  }, [initialExpense, isOpen, users, activeUser, categories]);

  const numericAmount = parseFloat(amount) || 0;

  // Handle percentage split sliders
  const handlePercentageChange = (changedUserId: string, newPct: number) => {
    const remainingPct = Math.max(0, 100 - newPct);
    const otherUsers = users.filter(u => u.id !== changedUserId);
    const splitOther = otherUsers.length > 0 ? remainingPct / otherUsers.length : 0;

    const newMap: Record<string, number> = {};
    users.forEach(u => {
      newMap[u.id] = u.id === changedUserId ? newPct : Math.round(splitOther * 100) / 100;
    });
    setCustomPcts(newMap);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numericAmount <= 0) return;

    const selectedCategory = categories.find(c => c.id === categoryId) || categories[0];
    const paidByUser = users.find(u => u.id === paidByUserId) || activeUser;

    // Calculate split details
    let details: SplitDetail[] = [];

    if (splitType === 'equal') {
      const equalShare = Math.round((numericAmount / (users.length || 1)) * 100) / 100;
      details = users.map((u, idx) => {
        // Adjust penny rounding on last item
        const isLast = idx === users.length - 1;
        const currentSum = equalShare * (users.length - 1);
        const lastShare = Math.round((numericAmount - currentSum) * 100) / 100;
        return {
          userId: u.id,
          userName: u.name,
          amount: isLast ? lastShare : equalShare,
          percentage: 100 / users.length
        };
      });
    } else if (splitType === 'custom_percentage') {
      details = users.map(u => {
        const pct = customPcts[u.id] || (100 / users.length);
        const amt = Math.round((numericAmount * (pct / 100)) * 100) / 100;
        return {
          userId: u.id,
          userName: u.name,
          amount: amt,
          percentage: pct
        };
      });
    } else {
      // Custom fixed amounts
      details = users.map(u => {
        const amt = customAmounts[u.id] || (numericAmount / users.length);
        const pct = numericAmount > 0 ? (amt / numericAmount) * 100 : (100 / users.length);
        return {
          userId: u.id,
          userName: u.name,
          amount: Math.round(amt * 100) / 100,
          percentage: Math.round(pct * 100) / 100
        };
      });
    }

    onSave({
      id: initialExpense?.id,
      householdId: activeUser.householdId,
      title: title.trim(),
      amount: numericAmount,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      date,
      paidByUserId: paidByUser.id,
      paidByUserName: paidByUser.name,
      splitType,
      splitDetails: details,
      notes: notes.trim(),
      specificUsage: specificUsage.trim(),
      paymentMethod,
      receiptUrl,
      createdBy: initialExpense ? initialExpense.createdBy : activeUser.id,
      updatedBy: activeUser.id
    });

    onClose();
  };

  const isEditing = !!initialExpense;
  const isCreator = !initialExpense || initialExpense.createdBy === activeUser.id;
  const isReadOnly = isEditing && !isCreator;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg sm:max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isReadOnly ? 'View Expense' : initialExpense ? 'Edit Expense' : 'Log New Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Permission Warning Banner */}
        {isReadOnly && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-amber-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Read-Only View: Only the creator ({initialExpense?.paidByUserName}) can edit or delete this expense.</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Title & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Swiggy Lunch, Rent, Electricity, Groceries"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Amount ({currencySymbol}) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 font-bold rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category & Specific Usage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Specific Usage / Merchant</label>
              <input
                type="text"
                placeholder="e.g. Blinkit, Swiggy, BESCOM, Milkman"
                value={specificUsage}
                onChange={e => setSpecificUsage(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Date & Who Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Who Paid Out-of-Pocket?</label>
              <select
                value={paidByUserId}
                onChange={e => setPaidByUserId(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Payment Method (India)</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            >
              <option value="UPI (GPay / PhonePe / Paytm)">UPI (GPay / PhonePe / Paytm / BHIM)</option>
              <option value="Net Banking / IMPS">Net Banking / IMPS / NEFT</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Paytm / Amazon Pay Wallet">Paytm / Amazon Pay Wallet</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          {/* Split Calculator Section */}
          <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>Roommate Split Calculator</span>
              </label>

              {/* Split Type Selector Pills */}
              <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-[11px] font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSplitType('equal')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${splitType === 'equal' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Equal (50/50)
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom_percentage')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${splitType === 'custom_percentage' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Custom %
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom_amount')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${splitType === 'custom_amount' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Fixed {currencySymbol}
                </button>
              </div>
            </div>

            {/* Split Details Live Breakdown */}
            <div className="space-y-2 pt-1">
              {splitType === 'equal' && (
                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>Divided equally among roommates:</span>
                  <span className="font-bold text-indigo-600 text-sm">
                    {currencySymbol}{(numericAmount / (users.length || 1)).toFixed(2)} / person
                  </span>
                </div>
              )}

              {splitType === 'custom_percentage' && (
                <div className="space-y-3">
                  {users.map(u => {
                    const pct = customPcts[u.id] ?? (100 / users.length);
                    const calculatedAmt = Math.round((numericAmount * (pct / 100)) * 100) / 100;

                    return (
                      <div key={u.id} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-700">
                          <span className="font-semibold">{u.name}:</span>
                          <span className="font-bold text-indigo-600">
                            {pct.toFixed(0)}% ({currencySymbol}{calculatedAmt.toFixed(2)})
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pct}
                          onChange={e => handlePercentageChange(u.id, parseFloat(e.target.value))}
                          className="w-full accent-indigo-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {splitType === 'custom_amount' && (
                <div className="space-y-2">
                  {users.map(u => {
                    const val = customAmounts[u.id] ?? (numericAmount / users.length);
                    return (
                      <div key={u.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-700 w-1/3">{u.name}:</span>
                        <div className="relative w-2/3">
                          <span className="absolute left-2.5 top-2 text-slate-400">{currencySymbol}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={val}
                            onChange={e => {
                              const newAmt = parseFloat(e.target.value) || 0;
                              setCustomAmounts({ ...customAmounts, [u.id]: newAmt });
                            }}
                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notes & Receipt Upload */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Add extra detail, e.g. bought organic items, split 60/40 due to guest stay"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-900 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Receipt Image (Optional)</label>
              
              {!receiptUrl ? (
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Upload Scan / Photo</span>
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={receiptUrl} 
                      alt="Receipt thumbnail" 
                      onClick={() => setShowReceiptPreview(true)}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        Receipt attached ✓
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">Click thumbnail or button to preview</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowReceiptPreview(true)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptUrl('')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove receipt image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {initialExpense ? 'Save Changes' : 'Record Expense'}
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Full-screen Receipt Image Preview Lightbox */}
      <ReceiptModal
        isOpen={showReceiptPreview}
        onClose={() => setShowReceiptPreview(false)}
        receiptUrl={receiptUrl}
        expense={initialExpense ? initialExpense : {
          id: 'temp',
          title: title || 'Expense Receipt',
          amount: numericAmount,
          categoryId,
          categoryName: categories.find(c => c.id === categoryId)?.name || 'General',
          categoryIcon: '',
          categoryColor: '',
          date,
          paidByUserId,
          paidByUserName: users.find(u => u.id === paidByUserId)?.name || activeUser.name,
          splitType,
          splitDetails: [],
          createdBy: activeUser.id,
          updatedBy: activeUser.id,
          householdId: activeUser.householdId,
          createdAt: date,
          updatedAt: date,
          paymentMethod,
          specificUsage
        }}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
