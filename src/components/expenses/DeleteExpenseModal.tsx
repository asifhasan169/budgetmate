import React, { useState } from 'react';
import { Expense, UserProfile, Settlement } from '../../types';
import { AlertTriangle, Trash2, MessageSquare, Send, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DeleteExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  activeUser: UserProfile;
  settlements: Settlement[];
  currencySymbol?: string;
  onRequestDeletion: (id: string, reason: string, comment: string) => void;
  onConfirmDeletion: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onCancelDeletion: (id: string) => void;
}

export const DeleteExpenseModal: React.FC<DeleteExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  activeUser,
  settlements,
  currencySymbol = '₹',
  onRequestDeletion,
  onConfirmDeletion,
  onAddComment,
  onCancelDeletion
}) => {
  if (!isOpen || !expense) return null;

  const isCreator = expense.createdBy === activeUser.id;
  const isDeletionPending = expense.isDeletionPending && expense.deletionReasonInfo;

  // Check if household has settled payments affecting accounts
  const isSettled = settlements.some(s => s.status === 'settled');

  const [selectedReason, setSelectedReason] = useState('Wrong entry / Duplicate');
  const [reasonComment, setReasonComment] = useState('');
  const [newRoommateComment, setNewRoommateComment] = useState('');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestDeletion(expense.id, selectedReason, reasonComment);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoommateComment.trim()) return;
    onAddComment(expense.id, newRoommateComment.trim());
    setNewRoommateComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto space-y-0">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black">
                {isDeletionPending ? 'Roommate Deletion Request' : 'Delete Expense Entry'}
              </h2>
              <p className="text-xs text-neutral-500">{expense.title} ({currencySymbol}{expense.amount.toFixed(2)})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-xs">

          {/* Settled Account Alert Warning Banner */}
          {isSettled && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2 text-amber-900">
              <div className="flex items-center space-x-2 font-bold text-amber-900 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Alert to Roommates: Entry is Already Settled</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                This expense entry is already included in roommate settlements. Deleting this entry will recalculate balances and send a deletion reason alert to your roommates.
              </p>
            </div>
          )}

          {/* If Deletion Request is already active */}
          {isDeletionPending ? (
            <div className="space-y-4">
              
              {/* Reason Details Card */}
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-black">Reason for Deletion:</span>
                  <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    {expense.deletionReasonInfo?.reason}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  Requested by <strong className="text-black">{expense.deletionReasonInfo?.requestedByUserName}</strong> on {new Date(expense.deletionReasonInfo?.requestedAt || '').toLocaleDateString()}
                </p>
                {expense.deletionReasonInfo?.comment && (
                  <p className="text-xs text-neutral-700 italic bg-white p-3 rounded-xl border border-neutral-200 mt-2">
                    "{expense.deletionReasonInfo.comment}"
                  </p>
                )}
              </div>

              {/* Roommate Discussion / Comments List */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-black flex items-center gap-1.5 text-xs">
                  <MessageSquare className="w-4 h-4 text-black" />
                  <span>Roommate Comments & Feedback</span>
                </h3>

                {(!expense.deletionReasonInfo?.roommateComments || expense.deletionReasonInfo.roommateComments.length === 0) ? (
                  <p className="text-neutral-400 italic text-[11px]">No roommate comments yet. Leave feedback below.</p>
                ) : (
                  <div className="space-y-2">
                    {expense.deletionReasonInfo.roommateComments.map(c => (
                      <div key={c.id} className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between text-neutral-500 text-[10px]">
                          <strong className="text-black font-bold">{c.userName}</strong>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-neutral-800">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddCommentSubmit} className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Comment on this deletion request..."
                    value={newRoommateComment}
                    onChange={e => setNewRoommateComment(e.target.value)}
                    className="flex-1 bg-neutral-50 border border-neutral-200 text-black text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                </form>
              </div>

              {/* Action Buttons for Pending Deletion */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => onCancelDeletion(expense.id)}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black transition-colors cursor-pointer"
                >
                  Cancel Deletion Request
                </button>

                <button
                  type="button"
                  onClick={() => onConfirmDeletion(expense.id)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-transform active:scale-95 cursor-pointer"
                >
                  Confirm & Delete Entry Permanently
                </button>
              </div>

            </div>
          ) : (
            /* New Deletion Request Form */
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="font-bold text-black block">Select Reason for Deleting Entry:</label>
                <select
                  value={selectedReason}
                  onChange={e => setSelectedReason(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-black font-semibold"
                >
                  <option value="Wrong entry / Duplicate">Wrong entry / Duplicate expense</option>
                  <option value="Incorrect amount or split ratio">Incorrect amount or split ratio</option>
                  <option value="Canceled purchase / Refunded">Canceled purchase / Refunded</option>
                  <option value="Entered under wrong roommate">Entered under wrong roommate</option>
                  <option value="Other reason">Other reason (specify below)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-black block">Additional Comment / Explanation for Roommates:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this entry should be removed (visible to all roommates)..."
                  value={reasonComment}
                  onChange={e => setReasonComment(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-black text-xs rounded-xl p-3 focus:outline-none focus:border-black"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-neutral-500 hover:text-black text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Submit Deletion Request</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
