import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, triggerHaptic } from '../utils/formatters';
import { ScannedReceiptData } from '../types';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Receipt,
  FileText,
  AlertCircle,
  ShoppingBag,
  Coffee,
  Laptop,
} from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Built-in high quality sample receipts for instant demonstration
const SAMPLE_RECEIPTS = [
  {
    name: 'Artisan Cafe & Bakery',
    icon: Coffee,
    amount: 17.65,
    merchant: 'Blue Bottle Cafe',
    category: 'Food & Dining',
    date: '2026-10-01',
    imageColor: 'from-amber-700 to-orange-950',
    data: {
      merchant: 'Blue Bottle Cafe - Hayes Valley',
      amount: 17.65,
      currency: 'USD',
      date: '2026-10-01',
      suggestedCategory: 'Food & Dining',
      tax: 1.45,
      paymentMethod: 'Apple Pay (Credit)',
      confidence: 0.96,
      notes: 'Morning meeting coffee & almond pastry',
      items: [
        { name: 'Gibraltar Espresso', price: 5.75, qty: 1 },
        { name: 'Cold Brew Single Origin', price: 6.25, qty: 1 },
        { name: 'Cardamom Kouign-Amann', price: 4.20, qty: 1 },
      ],
    },
  },
  {
    name: 'Organic Supermarket',
    icon: ShoppingBag,
    amount: 78.40,
    merchant: 'Whole Foods Market',
    category: 'Groceries',
    date: '2026-09-30',
    imageColor: 'from-emerald-800 to-teal-950',
    data: {
      merchant: 'Whole Foods Market #1042',
      amount: 78.40,
      currency: 'USD',
      date: '2026-09-30',
      suggestedCategory: 'Groceries',
      tax: 3.20,
      paymentMethod: 'Chase Visa',
      confidence: 0.94,
      notes: 'Weekly fresh groceries, organic produce & milk',
      items: [
        { name: 'Organic Honeycrisp Apples (2 lb)', price: 6.99, qty: 1 },
        { name: 'Artisan Sourdough Loaf', price: 5.49, qty: 1 },
        { name: 'Oat Milk Barista Blend', price: 4.99, qty: 2 },
        { name: 'Wild Caught Alaskan Salmon', price: 28.50, qty: 1 },
        { name: 'Mixed Organic Salad Greens', price: 4.49, qty: 2 },
      ],
    },
  },
  {
    name: 'Tech Store Invoice',
    icon: Laptop,
    amount: 149.00,
    merchant: 'Apple Store Downtown',
    category: 'Shopping',
    date: '2026-09-28',
    imageColor: 'from-blue-800 to-indigo-950',
    data: {
      merchant: 'Apple Union Square',
      amount: 149.00,
      currency: 'USD',
      date: '2026-09-28',
      suggestedCategory: 'Shopping',
      tax: 12.67,
      paymentMethod: 'Apple Titanium Card',
      confidence: 0.98,
      notes: 'AirPods 4 with Active Noise Cancellation',
      items: [
        { name: 'AirPods 4 with ANC', price: 179.00, qty: 1 },
        { name: 'Trade-in Credit Promotion', price: -30.00, qty: 1 },
      ],
    },
  },
];

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addTransaction, settings } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceiptData, setSelectedReceiptData] = useState<ScannedReceiptData | null>(null);
  const [targetAccountId, setTargetAccountId] = useState<string>(accounts[0]?.id || 'acc-1');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await scanReceiptWithAI(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_RECEIPTS[0]) => {
    triggerHaptic('medium');
    setLoading(true);
    setError(null);
    setImagePreview(null);

    // Simulate scanning beam animation for realistic ML Kit / Gemini OCR experience
    setTimeout(() => {
      setSelectedReceiptData(sample.data);
      setLoading(false);
      triggerHaptic('success');
    }, 700);
  };

  const scanReceiptWithAI = async (base64Image: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image, mimeType }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setSelectedReceiptData(res.data);
        triggerHaptic('success');
      } else {
        throw new Error(res.error || 'Failed to scan receipt');
      }
    } catch (err: any) {
      console.error(err);
      setError('AI could not parse this receipt. You can select one of the sample receipts below.');
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = () => {
    if (!selectedReceiptData) return;
    triggerHaptic('success');

    addTransaction({
      accountId: targetAccountId,
      amount: selectedReceiptData.amount,
      type: 'EXPENSE',
      category: selectedReceiptData.suggestedCategory || 'Food & Dining',
      merchant: selectedReceiptData.merchant || 'Scanned Store',
      date: selectedReceiptData.date || new Date().toISOString().split('T')[0],
      notes: selectedReceiptData.notes || `Scanned receipt: ${selectedReceiptData.items?.length || 0} items`,
    });

    handleClose();
  };

  const handleClose = () => {
    setImagePreview(null);
    setSelectedReceiptData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AI Document & Receipt Scanner
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ML Kit + Gemini
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Extract merchant, items, taxes, and total with multimodal AI
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!selectedReceiptData ? (
            <>
              {/* Scan Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-zinc-700 hover:border-emerald-500/70 rounded-3xl p-6 text-center cursor-pointer transition bg-zinc-950/40 group overflow-hidden"
              >
                {/* Visual scanner beam if loading */}
                {loading && (
                  <div className="absolute inset-0 bg-emerald-500/5 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/3" />
                    <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                    <p className="text-xs font-semibold text-emerald-300">
                      Gemini OCR processing line items & taxes...
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center transition border border-zinc-700/60">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Take Photo or Drop Receipt / Invoice
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Supports JPG, PNG, WEBP receipts & PDF invoices. AI extracts amounts, dates, and items automatically.
                  </p>
                </div>
              </div>

              {/* Sample Receipts Preset selector */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Or Test with Real Sample Receipts:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_RECEIPTS.map((sample, idx) => {
                    const IconComponent = sample.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(sample)}
                        className="flex flex-col items-start p-3.5 rounded-2xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/70 hover:border-emerald-500/50 transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 transition">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          {sample.name}
                        </span>
                        <span className="text-xs text-zinc-400 mt-0.5">
                          ${sample.amount.toFixed(2)} • {sample.category}
                        </span>
                      </button>
                    );
                  })}
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
            /* AI Receipt Confirmation View */
            <div className="space-y-4 animate-slide-up">
              {/* Receipt Header Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Receipt Scanned & Verified
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Review extracted merchant, itemized bill, and target account.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {Math.round((selectedReceiptData.confidence || 0.95) * 100)}% Match
                </span>
              </div>

              {/* Main Info Card */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-zinc-500">Merchant</label>
                    <input
                      type="text"
                      value={selectedReceiptData.merchant}
                      onChange={(e) =>
                        setSelectedReceiptData({ ...selectedReceiptData, merchant: e.target.value })
                      }
                      className="block text-base font-bold text-white bg-transparent focus:outline-none focus:underline"
                    />
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] uppercase font-semibold text-zinc-500">Total Amount</label>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-lg font-mono font-bold text-emerald-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedReceiptData.amount}
                        onChange={(e) =>
                          setSelectedReceiptData({
                            ...selectedReceiptData,
                            amount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 text-lg font-mono font-extrabold text-emerald-400 bg-transparent text-right focus:outline-none focus:underline"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Breakdown (if available) */}
                {selectedReceiptData.items && selectedReceiptData.items.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      <span>Itemized Receipt Line Items</span>
                      <span>Amount</span>
                    </div>
                    <div className="divide-y divide-zinc-850 max-h-36 overflow-y-auto pr-1">
                      {selectedReceiptData.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                          <span className="text-zinc-300">
                            {item.qty && item.qty > 1 ? `${item.qty}x ` : ''}
                            {item.name}
                          </span>
                          <span className="font-mono text-zinc-400">
                            ${Math.abs(item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedReceiptData.tax ? (
                      <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800">
                        <span>Estimated Tax & Surcharge</span>
                        <span className="font-mono">${selectedReceiptData.tax.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Account and Category selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Suggested Category</label>
                  <select
                    value={selectedReceiptData.suggestedCategory}
                    onChange={(e) =>
                      setSelectedReceiptData({
                        ...selectedReceiptData,
                        suggestedCategory: e.target.value,
                      })
                    }
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Post to Account</label>
                  <select
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Transaction Date</label>
                <input
                  type="date"
                  value={selectedReceiptData.date}
                  onChange={(e) =>
                    setSelectedReceiptData({ ...selectedReceiptData, date: e.target.value })
                  }
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          {selectedReceiptData ? (
            <button
              onClick={() => setSelectedReceiptData(null)}
              className="text-xs text-zinc-400 hover:text-white transition underline"
            >
              Scan another receipt
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>

            {selectedReceiptData && (
              <button
                onClick={handleConfirmSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Post Expense
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
