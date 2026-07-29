import React from 'react';
import { Category, Expense, SettlementSummary, UserProfile } from '../../types';
import { PieChart, Download, Printer, TrendingUp, DollarSign, Calendar, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
import { CategorySvgIcon } from '../categories/CategorySvgIcon';

interface AnalyticsViewProps {
  expenses: Expense[];
  categories: Category[];
  users: UserProfile[];
  settlementSummary: SettlementSummary;
  currencySymbol?: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#38bdf8', '#f43f5e', '#a855f7', '#06b6d4'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  categories,
  users,
  settlementSummary,
  currencySymbol = '₹'
}) => {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

  // Highest expense
  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
  const topExpense = sortedExpenses[0];

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Paid By', 'Split Type', 'Notes', 'Payment Method'];
    const rows = expenses.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      `"${e.categoryName}"`,
      e.date,
      `"${e.paidByUserName}"`,
      e.splitType,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      `"${e.paymentMethod || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BudgetMate_Household_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Category breakdown chart data
  const catMap: Record<string, number> = {};
  expenses.forEach(e => {
    catMap[e.categoryName] = (catMap[e.categoryName] || 0) + e.amount;
  });
  const categoryData = Object.keys(catMap).map(name => ({
    name,
    amount: Math.round(catMap[name] * 100) / 100
  })).sort((a, b) => b.amount - a.amount);

  // Roommate spending comparison chart data
  const roommateData = settlementSummary.roommates.map(rm => ({
    name: rm.userName,
    PaidOut: rm.totalPaid,
    FairShare: rm.fairShareOwed
  }));

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Analytics & Financial Export</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive household analytics, category distribution & CSV report exporter
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500">Total Logged Expenses</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {currencySymbol}{totalSpent.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">{expenses.length} transaction records</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500">Average Expense Amount</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {currencySymbol}{avgExpense.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">Per logged line item</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500">Highest Single Expense</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {topExpense ? `${currencySymbol}${topExpense.amount.toFixed(2)}` : '$0.00'}
          </div>
          <span className="text-[11px] text-slate-500 truncate block">
            {topExpense ? topExpense.title : 'None'}
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Roommate Out-of-Pocket vs Fair Share */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Roommate Paid vs Fair Share Comparison</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roommateData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${currencySymbol}${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="PaidOut" fill="#4f46e5" name="Paid Out-of-Pocket" radius={[4, 4, 0, 0]} />
                <Bar dataKey="FairShare" fill="#0284c7" name="Fair Share Owed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Totals */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Category Spending Totals</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 6)} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${currencySymbol}${v}`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 5 Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Top 5 Largest Household Expenses</h3>
        <div className="divide-y divide-slate-100">
          {sortedExpenses.slice(0, 5).map((e, idx) => (
            <div key={e.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                <CategorySvgIcon
                  categoryName={e.categoryName}
                  categoryId={e.categoryId}
                  iconName={e.categoryIcon}
                  size={16}
                  variant="black-badge"
                  className="w-7 h-7 flex-shrink-0"
                />
                <div>
                  <span className="font-semibold text-slate-900 block">{e.title}</span>
                  <span className="text-[11px] text-slate-500">{e.categoryName} • Paid by {e.paidByUserName} on {e.date}</span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900 text-sm">{currencySymbol}{e.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
