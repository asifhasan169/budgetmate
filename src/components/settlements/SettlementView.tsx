import React, { useState } from 'react';
import { Expense, Settlement, SettlementSummary, UserProfile } from '../../types';
import { DollarSign, CheckCircle2, ArrowRight, Wallet, History, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Send, Trash2, Calendar, Clock, Tag, CreditCard, Filter } from 'lucide-react';

interface SettlementViewProps {
  settlementSummary: SettlementSummary;
  expenses: Expense[];
  settlements: Settlement[];
  users: UserProfile[];
  activeUser: UserProfile;
  currencySymbol?: string;
  onCreateSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
  onUpdateSettlementStatus?: (id: string, status: 'settled' | 'rejected', remarks?: string) => void;
  onDeleteSettlement?: (id: string) => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  settlementSummary,
  expenses,
  settlements,
  users,
  activeUser,
  currencySymbol = '₹',
  onCreateSettlement,
  onUpdateSettlementStatus,
  onDeleteSettlement
}) => {
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showMathExplanation, setShowMathExplanation] = useState(false);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'all' | 'you_owe' | 'owed_to_you' | 'settlements'>('all');
  
  // Selected transfer for modal
  const [selectedTransferIndex, setSelectedTransferIndex] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');
  const [settleNotes, setSettleNotes] = useState('');
  const [customSettleAmount, setCustomSettleAmount] = useState<string>('');

  const transfers = settlementSummary.transfers;
  const currentTransfer = transfers[selectedTransferIndex] || transfers[0];

  // Visibility Rule: Users should only see settlements that involve them as debtor or creditor
  const visibleSettlements = settlements.filter(s => s.owedByUserId === activeUser.id || s.owedToUserId === activeUser.id);
  
  // Pending payment submissions awaiting creditor review
  const pendingApprovals = visibleSettlements.filter(s => s.owedToUserId === activeUser.id && s.status === 'pending');

  const openSettleModalFor = (idx: number) => {
    setSelectedTransferIndex(idx);
    const target = transfers[idx] || transfers[0];
    if (target) {
      setCustomSettleAmount(target.amount.toString());
    } else {
      setCustomSettleAmount('');
    }
    setShowSettleModal(true);
  };

  const handleSettleUp = (e: React.FormEvent) => {
    e.preventDefault();
    const target = transfers[selectedTransferIndex] || transfers[0];
    if (!target) {
      setShowSettleModal(false);
      return;
    }

    // Debtor permission check: Debtor submits payment proof/details
    const parsedAmt = parseFloat(customSettleAmount);
    const finalAmt = (!isNaN(parsedAmt) && parsedAmt > 0) ? parsedAmt : target.amount;

    const now = new Date();
    onCreateSettlement({
      householdId: activeUser.householdId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      owedByUserId: target.fromUserId,
      owedByUserName: target.fromUserName,
      owedToUserId: target.toUserId,
      owedToUserName: target.toUserName,
      amount: Math.round(finalAmt * 100) / 100,
      status: 'pending', // Debtor payment submitted -> awaits Creditor approval
      paymentMethod,
      notes: settleNotes || `Roommate balance settlement via ${paymentMethod}`,
      settledAt: now.toISOString()
    });

    setShowSettleModal(false);
    setSettleNotes('');
  };

  // Preset percentage calculations for partial settlement
  const handleSetPresetPct = (pct: number) => {
    if (!currentTransfer) return;
    const calculated = Math.round((currentTransfer.amount * pct) * 100) / 100;
    setCustomSettleAmount(calculated.toString());
  };

  // Calculated remaining debt after partial payment preview
  const enteredAmount = parseFloat(customSettleAmount) || 0;
  const currentTotalDebt = currentTransfer ? currentTransfer.amount : 0;
  const remainingAfterSettle = Math.max(0, currentTotalDebt - enteredAmount);

  // Itemized Expense Ledger list computation
  const itemizedLedger = expenses.map(exp => {
    const isPaidByActiveUser = exp.paidByUserId === activeUser.id;
    const activeSplit = exp.splitDetails?.find(s => s.userId === activeUser.id);
    const activeUserShare = activeSplit ? activeSplit.amount : (exp.amount / 2);

    // Net balance contribution of this expense for active user
    // If paid by active user: active user is owed (exp.amount - activeUserShare)
    // If paid by roommate: active user owes activeUserShare
    const netImpact = isPaidByActiveUser ? (exp.amount - activeUserShare) : -activeUserShare;

    return {
      ...exp,
      isPaidByActiveUser,
      activeUserShare,
      netImpact
    };
  });

  // Filtered ledger based on tab
  const filteredLedger = itemizedLedger.filter(item => {
    if (activeLedgerTab === 'you_owe') return item.netImpact < 0;
    if (activeLedgerTab === 'owed_to_you') return item.netImpact > 0;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-black tracking-tight">
            settlement calculator
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            automatic calculations based on itemized roommate splits & payments
          </p>
        </div>

        {transfers.length > 0 && (
          <button
            onClick={() => openSettleModalFor(0)}
            className="mibu-pill-active px-4 py-2 text-xs font-bold flex items-center space-x-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>settle up now</span>
          </button>
        )}
      </div>

      {/* Main Settlement Status Cards */}
      <div className="space-y-6">
        
        {/* Pending Settlement Payment Approvals (Creditor Action) */}
        {pendingApprovals.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Settlement Approvals (Action Required)</span>
              </h2>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {pendingApprovals.length} Awaiting Review
              </span>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map(ps => (
                <div key={ps.id} className="bg-white border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="text-sm font-bold text-black flex items-center space-x-2">
                      <span>{ps.owedByUserName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{ps.owedToUserName}</span>
                      <span className="font-display font-black text-black ml-2">{currencySymbol}{ps.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      Via {ps.paymentMethod || 'UPI'} • Submitted {new Date(ps.settledAt || ps.createdAt).toLocaleDateString()}
                    </div>
                    {ps.notes && <p className="text-xs text-neutral-600 italic mt-1">"{ps.notes}"</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateSettlementStatus && onUpdateSettlementStatus(ps.id, 'settled')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-transform active:scale-95 cursor-pointer"
                    >
                      Accept Payment
                    </button>
                    <button
                      onClick={() => onUpdateSettlementStatus && onUpdateSettlementStatus(ps.id, 'rejected')}
                      className="px-3.5 py-1.5 bg-neutral-100 hover:bg-rose-100 text-neutral-700 hover:text-rose-700 border border-neutral-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outstanding Net Transfers Alert */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Calculated Net Settlement Transfers
          </h2>

          {transfers.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
              <h3 className="font-bold text-black text-sm">All Roommate Balances Are Fully Settled! ({currencySymbol}0.00 balance)</h3>
              <p className="text-xs text-neutral-500">
                Everyone has paid their exact fair share for all logged household expenses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transfers.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-black shadow-xs">
                      {currencySymbol}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black flex items-center space-x-2">
                        <span>{t.fromUserName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{t.toUserName}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {t.fromUserId === activeUser.id ? (
                          <span className="text-amber-700 font-bold">You owe {t.toUserName}</span>
                        ) : t.toUserId === activeUser.id ? (
                          <span className="text-emerald-700 font-bold">{t.fromUserName} owes you</span>
                        ) : (
                          <span>Calculated net balance transfer</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="font-display font-bold text-xl text-black">
                      {currencySymbol}{t.amount.toFixed(2)}
                    </div>
                    {t.fromUserId === activeUser.id ? (
                      <button
                        onClick={() => openSettleModalFor(idx)}
                        className="mibu-pill-active px-4 py-1.5 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                      >
                        Pay / Settle
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                        Awaiting Payment
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Roommate Fair Share Summary Table */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Roommate Fair Share Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-800">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5 rounded-l-xl">Roommate</th>
                  <th className="px-4 py-2.5">Out-of-Pocket Paid</th>
                  <th className="px-4 py-2.5">Fair Share Owed</th>
                  <th className="px-4 py-2.5 rounded-r-xl text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {settlementSummary.roommates.map(rm => (
                  <tr key={rm.userId} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-bold text-black flex items-center space-x-2">
                      <span>{rm.userName}</span>
                      {rm.userId === activeUser.id && (
                        <span className="text-[10px] bg-black text-white px-2 py-0.2 rounded-full font-bold uppercase">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">{currencySymbol}{rm.totalPaid.toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">{currencySymbol}{rm.fairShareOwed.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-display font-bold text-right ${rm.netBalance >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {rm.netBalance >= 0 ? '+' : ''}{currencySymbol}{rm.netBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Math Explanation Accordion */}
          <div className="border-t border-neutral-100 pt-3">
            <button
              onClick={() => setShowMathExplanation(!showMathExplanation)}
              className="text-xs font-bold text-black hover:underline flex items-center space-x-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>How is this math calculated?</span>
              {showMathExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMathExplanation && (
              <div className="mt-3 bg-neutral-50 p-4 rounded-2xl text-xs text-neutral-600 space-y-2 border border-neutral-200">
                <p className="font-bold text-black">Formula & Transparency Rules:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Out-of-Pocket Paid:</strong> Total sum of expenses swiped/paid directly by that roommate.</li>
                  <li><strong>Fair Share Owed:</strong> Sum of itemized split shares assigned to that roommate across every expense.</li>
                  <li><strong>Net Balance = (Out-of-Pocket Paid - Fair Share Owed) + Settlements Paid - Settlements Received.</strong></li>
                  <li>A <strong>positive net balance</strong> means you fronted more cash and are owed a reimbursement.</li>
                  <li>A <strong>negative net balance</strong> means you owe your roommate to equalize the account.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Shared Expense & Settlement Activity Ledger */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          
          {/* Ledger Navigation Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-black" />
              <span>Itemized Shared Expenses & Activity Ledger</span>
            </h2>

            <div className="flex flex-wrap bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveLedgerTab('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeLedgerTab === 'all' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-500 hover:text-black'}`}
              >
                All Shared Items ({expenses.length})
              </button>
              <button
                onClick={() => setActiveLedgerTab('you_owe')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeLedgerTab === 'you_owe' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-500 hover:text-black'}`}
              >
                You Owe
              </button>
              <button
                onClick={() => setActiveLedgerTab('owed_to_you')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeLedgerTab === 'owed_to_you' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-500 hover:text-black'}`}
              >
                Owed To You
              </button>
              <button
                onClick={() => setActiveLedgerTab('settlements')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeLedgerTab === 'settlements' ? 'bg-white text-black font-bold shadow-xs' : 'text-neutral-500 hover:text-black'}`}
              >
                Settlements ({visibleSettlements.length})
              </button>
            </div>
          </div>

          {/* Ledger List View */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            
            {/* Show Settlements List if Settlements Tab Active (Filtered for Active User Visibility) */}
            {activeLedgerTab === 'settlements' ? (
              visibleSettlements.length === 0 ? (
                <p className="text-xs text-neutral-400 py-8 text-center">No past settlement payments involving you recorded.</p>
              ) : (
                visibleSettlements.map(s => (
                  <div
                    key={s.id}
                    className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-2 hover:bg-neutral-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          s.status === 'settled' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          s.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                          'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {s.status === 'settled' ? '✓' : s.status === 'rejected' ? '✕' : '⏳'}
                        </div>
                        <span className="font-bold text-black">{s.owedByUserName} → {s.owedToUserName}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-display font-bold text-black text-sm">{currencySymbol}{s.amount.toFixed(2)}</span>
                        {onDeleteSettlement && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete this settlement record of ${currencySymbol}${s.amount.toFixed(2)}?`)) {
                                onDeleteSettlement(s.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete settlement entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-200/60">
                      <div className="flex items-center space-x-2">
                        <span className="bg-white text-black px-2.5 py-0.5 rounded-full border border-neutral-200 font-semibold text-[10px]">
                          Via {s.paymentMethod || 'UPI'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.status === 'settled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          s.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {s.status === 'settled' ? 'Accepted & Settled' : s.status === 'rejected' ? 'Payment Rejected' : 'Awaiting Creditor Approval'}
                        </span>
                      </div>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {new Date(s.settledAt || s.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {s.notes && (
                      <p className="text-[11px] text-neutral-500 italic">"{s.notes}"</p>
                    )}
                  </div>
                ))
              )
            ) : (
              /* Show Itemized Shared Expenses Ledger */
              filteredLedger.length === 0 ? (
                <p className="text-xs text-neutral-400 py-8 text-center">No itemized expenses found in this filter.</p>
              ) : (
                filteredLedger.map(exp => (
                  <div
                    key={exp.id}
                    className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-100/60 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-black text-sm">{exp.title}</span>
                        <span className="bg-white text-neutral-700 px-2 py-0.5 rounded-full border border-neutral-200 text-[10px] font-semibold">
                          {exp.categoryName}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {exp.date}
                        </span>
                        <span>•</span>
                        <span>Paid out-of-pocket by <strong className="text-black">{exp.paidByUserName}</strong> ({currencySymbol}{exp.amount.toFixed(2)})</span>
                        {exp.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>{exp.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60">
                      <div className={`font-display font-bold text-sm ${exp.netImpact >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {exp.netImpact >= 0 ? `+${currencySymbol}${exp.netImpact.toFixed(2)} (Owed to you)` : `-${currencySymbol}${Math.abs(exp.netImpact).toFixed(2)} (You owe)`}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Your split share: {currencySymbol}{exp.activeUserShare.toFixed(2)} ({exp.splitType})
                      </p>
                    </div>
                  </div>
                ))
              )
            )}

          </div>
        </div>

      </div>

      {/* Settle Up Interactive Modal with Partial Payment & Live Balance Preview */}
      {showSettleModal && currentTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                Record Roommate Settlement
              </h3>
              <button
                onClick={() => setShowSettleModal(false)}
                className="text-neutral-400 hover:text-black font-bold p-1 rounded-lg hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleUp} className="space-y-4 text-xs">
              
              {/* Transfer Header Card */}
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-3 border border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Payer:</span>
                  <strong className="text-black">{currentTransfer.fromUserName}</strong>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Recipient:</span>
                  <strong className="text-black">{currentTransfer.toUserName}</strong>
                </div>
                <div className="flex justify-between text-neutral-600 pt-1 border-t border-neutral-200">
                  <span>Current Outstanding Debt:</span>
                  <strong className="font-display font-bold text-base text-black">{currencySymbol}{currentTotalDebt.toFixed(2)}</strong>
                </div>
              </div>

              {/* Partial Settlement Amount Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-700">Settlement Payment Amount ({currencySymbol}):</label>
                  <span className="text-[10px] text-neutral-400 font-semibold">Custom or Partial</span>
                </div>

                {/* Preset Pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetPresetPct(0.25)}
                    className="py-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetPct(0.50)}
                    className="py-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetPct(0.75)}
                    className="py-1 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetPct(1.0)}
                    className="py-1 px-2 bg-black text-white text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    Full 100%
                  </button>
                </div>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Enter amount to pay"
                  value={customSettleAmount}
                  onChange={e => setCustomSettleAmount(e.target.value)}
                  className="w-full bg-white border border-neutral-300 text-black font-bold rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-black shadow-xs"
                />
              </div>

              {/* Live Remaining Balance Preview Box */}
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-semibold">Remaining Debt After Payment:</span>
                <span className="font-display font-extrabold text-emerald-900 text-sm">
                  {currencySymbol}{remainingAfterSettle.toFixed(2)}
                </span>
              </div>

              {/* Payment Channel Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700">Payment Channel / App (India)</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-xl px-3.5 py-2 focus:outline-none focus:border-black font-medium"
                >
                  <option value="UPI (GPay / PhonePe / Paytm)">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                  <option value="Net Banking (IMPS / NEFT)">Net Banking (IMPS / NEFT)</option>
                  <option value="Paytm Wallet / Amazon Pay">Paytm Wallet / Amazon Pay</option>
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                </select>
              </div>

              {/* Settlement Note */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Partial rent reimbursement"
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-xl px-3.5 py-2 focus:outline-none focus:border-black"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2 font-semibold text-neutral-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mibu-pill-active px-5 py-2.5 text-xs font-bold shadow-xs active:scale-95"
                >
                  Confirm Settlement Payment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
