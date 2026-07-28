import React from 'react';
import { X, Download, ZoomIn, ZoomOut, ExternalLink, Calendar, User, Tag, CreditCard } from 'lucide-react';
import { Expense } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
  expense?: Expense | null;
  currencySymbol?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  expense,
  currencySymbol = '₹'
}) => {
  const [zoom, setZoom] = React.useState<number>(1);

  if (!isOpen || !receiptUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt-${expense?.title || 'expense'}-${expense?.date || 'photo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold flex-shrink-0">
              🧾
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {expense ? expense.title : 'Receipt Image Preview'}
              </h3>
              {expense && (
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{expense.categoryName}</span>
                  <span>•</span>
                  <span>{expense.date}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{currencySymbol}{expense.amount.toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.25, 2.5))}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.75))}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-slate-800 transition-colors"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Image Display Area */}
        <div className="flex-1 bg-slate-950/60 p-4 sm:p-6 overflow-auto flex items-center justify-center min-h-[300px] max-h-[65vh]">
          <div 
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={receiptUrl}
              alt="Receipt Preview"
              className="max-w-full max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-2xl"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 flex-shrink-0">
          {expense ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>Paid by: <strong className="text-slate-200">{expense.paidByUserName}</strong></span>
              {expense.paymentMethod && (
                <>
                  <span>•</span>
                  <span>Method: <strong className="text-slate-200">{expense.paymentMethod}</strong></span>
                </>
              )}
              {expense.specificUsage && (
                <>
                  <span>•</span>
                  <span>Usage: <strong className="text-slate-200">{expense.specificUsage}</strong></span>
                </>
              )}
            </div>
          ) : (
            <span>Receipt Photo</span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors ml-auto"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
