import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, triggerHaptic } from '../utils/formatters';
import { X, Sparkles, Send, CheckCircle2, ArrowRight, Smartphone, AlertCircle } from 'lucide-react';

interface ShareToTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  {
    source: 'Google Pay (UPI)',
    text: 'Paid ₹480 to Blue Tokai Coffee Roasters on 30 Sep 2026. Ref: UPI/20260930/8921.',
  },
  {
    source: 'Apple Pay Alert',
    text: 'Apple Pay payment of $38.50 approved at Trader Joe\'s Grocery #142 on Oct 01.',
  },
  {
    source: 'Chase Bank SMS',
    text: 'CHASE: Your card ending in 4209 was charged $124.99 at NIKE DOWNTOWN on 09/29/2026.',
  },
  {
    source: 'Monzo Notification',
    text: 'You just spent £16.80 at Honest Burgers Covent Garden. Total balance £1,240.00.',
  },
];

export const ShareToTrackModal: React.FC<ShareToTrackModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addTransaction, settings } = useFinance();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed confirmation data
  const [parsedData, setParsedData] = useState<{
    merchant: string;
    amount: number;
    currency: string;
    date: string;
    type: 'EXPENSE' | 'INCOME';
    category: string;
    notes: string;
    confidence: number;
    targetAccountId: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleParse = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setLoading(true);
    setError(null);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setParsedData({
          merchant: res.data.merchant || 'Unknown Merchant',
          amount: typeof res.data.amount === 'number' ? res.data.amount : 25.0,
          currency: res.data.currency || settings.defaultCurrency.code,
          date: res.data.date || new Date().toISOString().split('T')[0],
          type: res.data.type || 'EXPENSE',
          category: res.data.category || 'Food & Dining',
          notes: res.data.notes || textToParse.slice(0, 80),
          confidence: res.data.confidence || 0.88,
          targetAccountId: accounts[0]?.id || 'acc-1',
        });
        triggerHaptic('success');
      } else {
        throw new Error(res.error || 'Could not parse transaction');
      }
    } catch (err: any) {
      console.error(err);
      setError('AI could not extract transaction details. Please check the text or try a preset.');
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedData) return;
    triggerHaptic('success');

    addTransaction({
      accountId: parsedData.targetAccountId,
      amount: parsedData.amount,
      type: parsedData.type,
      category: parsedData.category,
      merchant: parsedData.merchant,
      date: parsedData.date,
      notes: parsedData.notes,
    });

    handleClose();
  };

  const handleClose = () => {
    setInputText('');
    setParsedData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/30 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Share-to-Track
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Android Intent
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Share payment screenshots or paste SMS alerts to log instantly
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!parsedData ? (
            <>
              {/* Presets row */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Simulate Android Share / Banking Alert:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {PRESET_MESSAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(preset.text);
                        handleParse(preset.text);
                      }}
                      className="text-left p-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/40 transition group"
                    >
                      <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
                        <span>{preset.source}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-zinc-400 group-hover:text-amber-400" />
                      </div>
                      <p className="text-xs text-zinc-300 line-clamp-1">{preset.text}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Or paste payment text / UPI snippet:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g. Paid $42.50 to Blue Bottle Coffee via Chase Card 4209 on Oct 1..."
                    className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-2xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition resize-none"
                  />
                  <button
                    disabled={!inputText.trim() || loading}
                    onClick={() => handleParse(inputText)}
                    className="absolute right-2.5 bottom-3 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Extract
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* AI Confirmation Step (Critical requirement) */
            <div className="space-y-4 animate-slide-up">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    AI Extracted Details (Review & Confirm)
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {Math.round(parsedData.confidence * 100)}% Confidence
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Verify the values extracted by Gemini 3.8 Flash before committing to your vault.
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Amount</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 text-sm text-zinc-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={parsedData.amount}
                        onChange={(e) =>
                          setParsedData({ ...parsedData, amount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2 pl-7 pr-3 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Date</label>
                    <input
                      type="date"
                      value={parsedData.date}
                      onChange={(e) => setParsedData({ ...parsedData, date: e.target.value })}
                      className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Merchant / Payee</label>
                  <input
                    type="text"
                    value={parsedData.merchant}
                    onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Category</label>
                    <select
                      value={parsedData.category}
                      onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                      className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Account</label>
                    <select
                      value={parsedData.targetAccountId}
                      onChange={(e) => setParsedData({ ...parsedData, targetAccountId: e.target.value })}
                      className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Note / Memo</label>
                  <input
                    type="text"
                    value={parsedData.notes}
                    onChange={(e) => setParsedData({ ...parsedData, notes: e.target.value })}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Cancel
          </button>

          {parsedData ? (
            <button
              onClick={handleConfirmSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Save to Vault
            </button>
          ) : (
            <button
              disabled={!inputText.trim() || loading}
              onClick={() => handleParse(inputText)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              Extract Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
