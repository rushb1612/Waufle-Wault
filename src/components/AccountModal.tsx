import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SUPPORTED_CURRENCIES, triggerHaptic } from '../utils/formatters';
import { AccountType, Currency } from '../types';
import { X, Landmark, CreditCard, ShieldCheck, Wallet, Check, Sparkles } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PALETTE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ef4444', // rose
];

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, settings } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Bank');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.defaultCurrency);
  const [color, setColor] = useState(PALETTE_COLORS[0]);
  const [creditLimit, setCreditLimit] = useState('');
  const [statementDay, setStatementDay] = useState('15');
  const [dueDate, setDueDate] = useState('5');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic('success');
    addAccount({
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      currency,
      color,
      iconName: type === 'Credit Card' ? 'CreditCard' : type === 'Savings' ? 'ShieldCheck' : 'Landmark',
      creditLimit: type === 'Credit Card' ? parseFloat(creditLimit) || 3000 : undefined,
      statementDay: type === 'Credit Card' ? parseInt(statementDay) || 15 : undefined,
      dueDate: type === 'Credit Card' ? parseInt(dueDate) || 5 : undefined,
      accountNumberMasked: accountNumberMasked ? `•••• ${accountNumberMasked.slice(-4)}` : undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setBalance('');
    setCreditLimit('');
    setAccountNumberMasked('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Account</h2>
              <p className="text-xs text-zinc-400">Add bank, credit card, cash or wallet</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase">Account Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chase Sapphire Checking, HDFC Salary"
              className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Bank">Bank Account</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Savings">High Yield Savings</option>
                <option value="Cash">Cash Wallet</option>
                <option value="Investment">Investment Brokerage</option>
                <option value="Crypto">Crypto Wallet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase">Currency</label>
              <select
                value={currency.code}
                onChange={(e) => {
                  const curr = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                  if (curr) setCurrency(curr);
                }}
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase">
              {type === 'Credit Card' ? 'Current Outstanding Balance' : 'Initial Balance'}
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-sm text-zinc-400 font-bold">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2 pl-7 pr-3 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Credit Card Specific Fields */}
          {type === 'Credit Card' && (
            <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-[11px] font-semibold uppercase text-emerald-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Credit Card Details
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-500">Credit Limit</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="5000"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl py-1.5 px-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-semibold text-zinc-500">Due Day (of month)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl py-1.5 px-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Color palette */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-40"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
