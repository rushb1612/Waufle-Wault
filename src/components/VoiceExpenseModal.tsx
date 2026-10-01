import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, triggerHaptic } from '../utils/formatters';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Volume2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VOICE_PRESETS = [
  'Paid thirty-five dollars for fresh groceries at Trader Joe’s',
  'Spent twelve dollars and fifty cents on iced latte and pastry at Blue Bottle',
  'Dinner with team for eighty-five dollars at Ippudo Ramen',
  'Uber ride to the airport for forty-two dollars charged on Chase card',
];

export const VoiceExpenseModal: React.FC<VoiceExpenseModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addTransaction, settings } = useFinance();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed confirmation
  const [parsedData, setParsedData] = useState<{
    merchant: string;
    amount: number;
    currency: string;
    date: string;
    type: 'EXPENSE' | 'INCOME';
    category: string;
    notes: string;
    targetAccountId: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setParsedData(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. You can click any voice preset below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        triggerHaptic('medium');
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        triggerHaptic('light');
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setError('Could not access microphone. Try clicking a preset phrase.');
    }
  };

  const handleParseVoiceText = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setParsedData({
          merchant: res.data.merchant || 'Voice Merchant',
          amount: typeof res.data.amount === 'number' ? res.data.amount : 20.0,
          currency: res.data.currency || settings.defaultCurrency.code,
          date: res.data.date || new Date().toISOString().split('T')[0],
          type: res.data.type || 'EXPENSE',
          category: res.data.category || 'Food & Dining',
          notes: res.data.notes || text,
          targetAccountId: accounts[0]?.id || 'acc-1',
        });
        triggerHaptic('success');
      } else {
        throw new Error(res.error || 'Failed to parse voice expense');
      }
    } catch (err: any) {
      console.error(err);
      setError('AI could not parse speech. Try again or edit manually.');
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
    setIsListening(false);
    setTranscript('');
    setParsedData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/30 flex items-center justify-center text-purple-400 border border-purple-500/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Voice Expense Note
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Speech AI
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Speak naturally to log an expense</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5">
          {!parsedData ? (
            <>
              {/* Animated Microphone Hero Button */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  onClick={startListening}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition shadow-2xl ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-105'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30'
                  }`}
                >
                  {isListening ? (
                    <div className="relative">
                      <span className="absolute -inset-3 rounded-full border-2 border-rose-400 animate-ping opacity-75" />
                      <MicOff className="w-10 h-10" />
                    </div>
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
                <p className="text-xs font-semibold mt-3 text-zinc-400">
                  {isListening ? 'Listening... Speak now' : 'Tap to start speaking'}
                </p>
              </div>

              {/* Transcript Display */}
              <div className="relative">
                <textarea
                  rows={2}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transcript will appear here... or type a phrase"
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition resize-none"
                />
                {transcript && (
                  <button
                    disabled={loading}
                    onClick={() => handleParseVoiceText(transcript)}
                    className="mt-2 w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 transition"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Parse Voice Note
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Presets */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Or Test with Sample Voice Notes:
                </p>
                <div className="space-y-1.5">
                  {VOICE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTranscript(preset);
                        handleParseVoiceText(preset);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-purple-500/40 text-xs text-zinc-300 hover:text-white transition flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">"{preset}"</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
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
            /* Voice Confirmation Screen */
            <div className="space-y-4 animate-slide-up">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-400" />
                <span>AI extracted the following transaction from your speech. Review and confirm:</span>
              </div>

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
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2 pl-7 pr-3 text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase">Category</label>
                    <select
                      value={parsedData.category}
                      onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                      className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Merchant</label>
                  <input
                    type="text"
                    value={parsedData.merchant}
                    onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm font-semibold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Account</label>
                  <select
                    value={parsedData.targetAccountId}
                    onChange={(e) => setParsedData({ ...parsedData, targetAccountId: e.target.value })}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>

          {parsedData && (
            <button
              onClick={handleConfirmSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
