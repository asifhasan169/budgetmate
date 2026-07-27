import React, { useState } from 'react';
import { Expense, MonthlyBudget, SmartInsight, UserProfile } from '../../types';
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle, TrendingUp, RefreshCw, Bot } from 'lucide-react';

interface SmartInsightsViewProps {
  insights: SmartInsight[];
  expenses: Expense[];
  budgets: MonthlyBudget[];
  users: UserProfile[];
  currencySymbol?: string;
  onRefreshInsights?: () => void;
}

export const SmartInsightsView: React.FC<SmartInsightsViewProps> = ({
  insights,
  expenses,
  budgets,
  users,
  currencySymbol = '₹',
  onRefreshInsights
}) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<SmartInsight[] | null>(null);

  const activeInsights = aiInsights || insights;

  const handleFetchGeminiInsights = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          budgets,
          roommates: users,
          currencySymbol
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.insights && Array.isArray(data.insights)) {
          setAiInsights(data.insights);
        }
      }
    } catch (e) {
      console.warn('Fallback to local rules engine for AI insights:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Smart Budgeting Insights</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based & Gemini-powered financial analysis for your household
          </p>
        </div>

        <button
          onClick={handleFetchGeminiInsights}
          disabled={loadingAI}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-sm flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-center"
        >
          <Bot className="w-4 h-4" />
          <span>{loadingAI ? 'Analyzing with Gemini...' : 'Generate AI Report'}</span>
        </button>
      </div>

      {/* Insights Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeInsights.map((ins, idx) => {
          let icon = Lightbulb;
          let colorClass = 'bg-blue-50/70 border-blue-200 text-blue-900';
          let iconBg = 'bg-blue-100 text-blue-700';

          if (ins.type === 'warning') {
            icon = AlertTriangle;
            colorClass = 'bg-rose-50/70 border-rose-200 text-rose-900';
            iconBg = 'bg-rose-100 text-rose-700';
          } else if (ins.type === 'positive') {
            icon = CheckCircle;
            colorClass = 'bg-emerald-50/70 border-emerald-200 text-emerald-900';
            iconBg = 'bg-emerald-100 text-emerald-700';
          } else if (ins.type === 'prediction') {
            icon = TrendingUp;
            colorClass = 'bg-amber-50/70 border-amber-200 text-amber-900';
            iconBg = 'bg-amber-100 text-amber-700';
          }

          const IconComponent = icon;

          return (
            <div
              key={ins.id || idx}
              className={`p-5 rounded-xl border ${colorClass} shadow-sm space-y-3 bg-white`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-md ${iconBg}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{ins.title}</h3>
                </div>
                {ins.category && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200 uppercase">
                    {ins.category}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ins.message}
              </p>

              {ins.actionLabel && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">
                    {ins.actionLabel} →
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
