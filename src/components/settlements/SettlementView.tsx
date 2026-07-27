import React, { useState } from 'react';
import { Expense, Settlement, SettlementSummary, UserProfile } from '../../types';
import { DollarSign, CheckCircle2, ArrowRight, Wallet, History, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

interface SettlementViewProps {
  settlementSummary: SettlementSummary;
  expenses: Expense[];
  settlements: Settlement[];
  users: UserProfile[];
  activeUser: UserProfile;
  currencySymbol?: string;
  onCreateSettlement: (settlement: Omit<Settlement, 'id' | 'createdAt'>) => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  settlementSummary,
  expenses,
  settlements,
  users,
  activeUser,
  currencySymbol = '₹',
  onCreateSettlement
}) => {
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showMathExplanation, setShowMathExplanation] = useState(false);
  
  // Selected transfer for modal
  const [selectedTransferIndex, setSelectedTransferIndex] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');
  const [settleNotes, setSettleNotes] = useState('');

  const transfers = settlementSummary.transfers;
  const currentTransfer = transfers[selectedTransferIndex] || transfers[0];

  const handleSettleUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTransfer) return;

    const now = new Date();
    onCreateSettlement({
      householdId: activeUser.householdId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      owedByUserId: currentTransfer.fromUserId,
      owedByUserName: currentTransfer.fromUserName,
      owedToUserId: currentTransfer.toUserId,
      owedToUserName: currentTransfer.toUserName,
      amount: currentTransfer.amount,
      status: 'settled',
      paymentMethod,
      notes: settleNotes || `Roommate balance settlement via ${paymentMethod}`,
      settledAt: now.toISOString()
    });

    setShowSettleModal(false);
    setSettleNotes('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-black tracking-tight">
            settlement calculator
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            automatic calculations based on itemized roommate splits
          </p>
        </div>

        {transfers.length > 0 && (
          <button
            onClick={() => setShowSettleModal(true)}
            className="mibu-pill-active px-4 py-2 text-xs font-bold flex items-center space-x-2 shadow-xs transition-transform active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>settle up now</span>
          </button>
        )}
      </div>

      {/* Main Settlement Status Cards */}
      <div className="space-y-6">
        
        {/* Outstanding Transfers Alert */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Calculated Net Settlement Transfers
          </h2>

          {transfers.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
              <h3 className="font-bold text-black text-sm">All Roommate Balances Are Fully Settled!</h3>
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
                    <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-black">
                      ₹
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black flex items-center space-x-2">
                        <span>{t.fromUserName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{t.toUserName}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {t.fromUserId === activeUser.id ? (
                          <span className="text-amber-700 font-semibold">You owe {t.toUserName}</span>
                        ) : t.toUserId === activeUser.id ? (
                          <span className="text-emerald-700 font-semibold">{t.fromUserName} owes you</span>
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
                    <button
                      onClick={() => {
                        setSelectedTransferIndex(idx);
                        setShowSettleModal(true);
                      }}
                      className="mibu-pill-active px-3.5 py-1.5 text-xs font-bold shadow-xs active:scale-95"
                    >
                      Settle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Roommate Breakdown Table */}
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
                        <span className="text-[10px] bg-neutral-100 text-black border border-neutral-200 px-2 py-0.2 rounded-full font-bold uppercase">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{currencySymbol}{rm.totalPaid.toFixed(2)}</td>
                    <td className="px-4 py-3">{currencySymbol}{rm.fairShareOwed.toFixed(2)}</td>
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
              className="text-xs font-bold text-black hover:underline flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>How is this math calculated?</span>
              {showMathExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMathExplanation && (
              <div className="mt-3 bg-neutral-50 p-4 rounded-2xl text-xs text-neutral-600 space-y-2 border border-neutral-200">
                <p className="font-bold text-black">Formula & Transparency Rules:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Out-of-Pocket Paid:</strong> The total sum of expenses swiped/paid directly by that roommate.</li>
                  <li><strong>Fair Share Owed:</strong> The sum of itemized split shares assigned to that roommate across every logged expense (respecting equal 50/50 splits or custom percentage overrides).</li>
                  <li><strong>Net Balance = Out-of-Pocket Paid - Fair Share Owed.</strong></li>
                  <li>A <strong>positive net balance</strong> means you fronted more cash for shared items and are owed a reimbursement.</li>
                  <li>A <strong>negative net balance</strong> means you owe your roommate to equalize the account.</li>
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Settlement History */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Settlement History
          </h2>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {settlements.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">No past settlements recorded.</p>
            ) : (
              settlements.map(s => (
                <div
                  key={s.id}
                  className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-2xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-black">{s.owedByUserName} → {s.owedToUserName}</span>
                    <span className="font-display font-bold text-black text-sm">{currencySymbol}{s.amount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="bg-white text-black px-2 py-0.2 rounded-full border border-neutral-200">
                      Via {s.paymentMethod || 'UPI'}
                    </span>
                    <span>{new Date(s.settledAt || s.createdAt).toLocaleDateString()}</span>
                  </div>

                  {s.notes && (
                    <p className="text-[11px] text-neutral-500 italic">"{s.notes}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Settle Up Interactive Modal */}
      {showSettleModal && currentTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                Record Roommate Settlement
              </h3>
              <button
                onClick={() => setShowSettleModal(false)}
                className="text-neutral-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleUp} className="space-y-4 text-xs">
              
              <div className="bg-neutral-50 p-4 rounded-2xl space-y-2 border border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Payer:</span>
                  <strong className="text-black">{currentTransfer.fromUserName}</strong>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Recipient:</span>
                  <strong className="text-black">{currentTransfer.toUserName}</strong>
                </div>
                <div className="flex justify-between text-neutral-600 pt-1 border-t border-neutral-200">
                  <span>Settlement Amount:</span>
                  <strong className="font-display font-bold text-base text-black">{currencySymbol}{currentTransfer.amount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700">Payment Channel / App (India)</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-full px-3.5 py-2 focus:outline-none focus:border-black"
                >
                  <option value="UPI (GPay / PhonePe / Paytm)">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                  <option value="Net Banking (IMPS / NEFT)">Net Banking (IMPS / NEFT)</option>
                  <option value="Paytm Wallet / Amazon Pay">Paytm Wallet / Amazon Pay</option>
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700">Settlement Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. July balancing transfer"
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black rounded-full px-3.5 py-2 focus:outline-none focus:border-black"
                />
              </div>

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
                  className="mibu-pill-active px-5 py-2 text-xs font-bold"
                >
                  Confirm Settlement
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
