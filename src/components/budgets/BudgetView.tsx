import React, { useState } from 'react';
import { Expense, MonthlyBudget, UserProfile } from '../../types';
import { PieChart, DollarSign, Edit3, Check, AlertTriangle, CheckCircle, TrendingUp, ShieldAlert } from 'lucide-react';

interface BudgetViewProps {
  budgets: MonthlyBudget[];
  expenses: Expense[];
  users: UserProfile[];
  activeUser: UserProfile;
  currencySymbol?: string;
  onSetBudget: (userId: string, month: number, year: number, amount: number) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  expenses,
  users,
  activeUser,
  currencySymbol = '₹',
  onSetBudget
}) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>('');

  const handleSaveBudget = (userId: string) => {
    const numeric = parseFloat(tempAmount);
    if (!isNaN(numeric) && numeric > 0) {
      onSetBudget(userId, currentMonth, currentYear, numeric);
    }
    setEditingUserId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Monthly Roommate Budget Planner</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Set and track individual monthly spending limits ({now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
          </p>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(u => {
          const userBudget = budgets.find(b => b.userId === u.id && b.month === currentMonth && b.year === currentYear)?.amount || 1500;
          
          // Calculate user's fair share of expenses
          const userSpent = expenses.reduce((sum, e) => {
            const detail = e.splitDetails?.find(d => d.userId === u.id);
            return sum + (detail ? detail.amount : (e.amount / users.length));
          }, 0);

          const remaining = userBudget - userSpent;
          const pctUsed = Math.min(100, Math.round((userSpent / (userBudget || 1)) * 100));

          const isOver = remaining < 0;
          const isCaution = pctUsed >= 80 && !isOver;

          return (
            <div
              key={u.id}
              className={`bg-white border rounded-xl p-6 shadow-sm space-y-4 transition-all ${
                u.id === activeUser.id ? 'border-indigo-300 ring-2 ring-indigo-50/80' : 'border-slate-200'
              }`}
            >
              {/* Roommate info & header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-indigo-200" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">{u.name}</span>
                      {u.id === activeUser.id && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{u.email}</span>
                  </div>
                </div>

                {/* Edit Budget Trigger */}
                {editingUserId === u.id ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="50"
                      value={tempAmount}
                      onChange={e => setTempAmount(e.target.value)}
                      className="w-24 bg-slate-50 border border-indigo-500 text-slate-900 font-bold px-2 py-1 text-xs rounded-md focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveBudget(u.id)}
                      className="p-1.5 bg-slate-900 text-white rounded-md font-bold hover:bg-slate-800"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingUserId(u.id);
                      setTempAmount(userBudget.toString());
                    }}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    title="Change Monthly Budget Limit"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Set Target</span>
                  </button>
                )}
              </div>

              {/* Progress Bar & Status */}
              <div className="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">Budget Utilization</span>
                  <span className={`font-extrabold ${isOver ? 'text-rose-600' : isCaution ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {pctUsed}% used
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      isOver ? 'bg-rose-500' : isCaution ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pctUsed)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Budget</span>
                    <span className="font-bold text-slate-900 text-xs">{currencySymbol}{userBudget.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Spent Share</span>
                    <span className="font-bold text-slate-700 text-xs">{currencySymbol}{userSpent.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Remaining</span>
                    <span className={`font-bold text-xs ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {currencySymbol}{remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert Banner */}
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                isOver ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                isCaution ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {isOver ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Exceeded target budget by {currencySymbol}{Math.abs(remaining).toFixed(2)}.</span>
                  </>
                ) : isCaution ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Approaching monthly budget threshold ({pctUsed}% spent).</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Spending is comfortably within target limits.</span>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
