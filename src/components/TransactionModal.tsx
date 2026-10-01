import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, triggerHaptic } from '../utils/formatters';
import { TransactionType } from '../types';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Tag,
  Repeat,
  FileText,
  Check,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'EXPENSE',
}) => {
  const { accounts, activeAccountId, addTransaction, settings } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [accountId, setAccountId] = useState<string>(
    activeAccountId !== 'ALL' ? activeAccountId : accounts[0]?.id || 'acc-1'
  );
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || 'acc-2');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    triggerHaptic('light');
    if (val === 'back') {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (val === '.' && amount.includes('.')) return;
    if (amount.length > 8) return;
    setAmount((prev) => prev + val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!merchant.trim() && type !== 'TRANSFER') return;

    triggerHaptic('success');

    addTransaction({
      accountId,
      toAccountId: type === 'TRANSFER' ? toAccountId : undefined,
      amount: parsedAmount,
      type,
      category: type === 'TRANSFER' ? 'Transfer' : category,
      merchant: type === 'TRANSFER' ? 'Account Transfer' : merchant.trim(),
      date,
      notes,
      isRecurring,
    });

    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setMerchant('');
    setNotes('');
    setIsRecurring(false);
    onClose();
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          {/* Segmented Type Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                triggerHaptic('light');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                triggerHaptic('light');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType('TRANSFER');
                triggerHaptic('light');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                type === 'TRANSFER'
                  ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Transfer
            </button>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Big Amount Display */}
          <div className="text-center py-2">
            <span className="text-xs uppercase font-semibold text-zinc-500 block mb-1">
              Enter Amount ({settings.defaultCurrency.symbol})
            </span>
            <div className="flex items-center justify-center gap-1 text-4xl sm:text-5xl font-mono font-extrabold tracking-tight">
              <span
                className={
                  type === 'INCOME'
                    ? 'text-emerald-400'
                    : type === 'TRANSFER'
                    ? 'text-sky-400'
                    : 'text-rose-400'
                }
              >
                {settings.defaultCurrency.symbol}
              </span>
              <input
                type="text"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`bg-transparent text-center focus:outline-none w-48 sm:w-60 ${
                  type === 'INCOME'
                    ? 'text-emerald-400'
                    : type === 'TRANSFER'
                    ? 'text-sky-400'
                    : 'text-rose-400'
                }`}
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setAmount(q.toString());
                    triggerHaptic('light');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs font-mono font-semibold text-zinc-300 hover:text-white border border-zinc-700/50"
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Accounts or Single Account */}
          {type === 'TRANSFER' ? (
            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
              <div>
                <label className="text-[10px] font-semibold uppercase text-zinc-500">From Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-2.5 text-xs text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, a.currency)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-zinc-500">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-2.5 text-xs text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, a.currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase text-zinc-400">
                  {type === 'INCOME' ? 'Source / Payer' : 'Merchant / Payee'}
                </label>
                <input
                  type="text"
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder={type === 'INCOME' ? 'e.g. Acme Corp Salary' : 'e.g. Starbucks, Uber, Apple'}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2.5 px-3 text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-400">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-400">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid (if not transfer) */}
          {type !== 'TRANSFER' && (
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-400 block mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.name);
                        triggerHaptic('light');
                      }}
                      className={`p-2 rounded-xl text-left border transition flex flex-col items-start gap-1 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[11px] truncate w-full">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note and Recurring switch */}
          <div className="space-y-2 pt-1">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional memo, tags (#lunch, #work)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-0"
              />
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-zinc-500" />
                Recurring transaction (monthly subscription / bill)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || (!merchant.trim() && type !== 'TRANSFER')}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                type === 'INCOME'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25'
                  : type === 'TRANSFER'
                  ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 shadow-sky-500/25'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
              } disabled:opacity-40`}
            >
              <Check className="w-4 h-4" />
              Save {type === 'INCOME' ? 'Income' : type === 'TRANSFER' ? 'Transfer' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
