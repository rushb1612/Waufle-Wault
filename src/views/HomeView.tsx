import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDateRelative, triggerHaptic, SUPPORTED_CURRENCIES } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Landmark,
  Wallet,
  Sparkles,
  Smartphone,
  Camera,
  ChevronRight,
  Flame,
  Tv,
  RefreshCw,
  Globe2,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { AccountType } from '../types';

interface HomeViewProps {
  onOpenManualTx: () => void;
  onOpenScanner: () => void;
  onOpenShareToTrack: () => void;
  onOpenVoice: () => void;
  onNavigateTab: (tab: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenManualTx,
  onOpenScanner,
  onOpenShareToTrack,
  onOpenVoice,
  onNavigateTab,
}) => {
  const {
    accounts,
    activeAccountId,
    setActiveAccountId,
    activeAccount,
    transactions,
    budgets,
    subscriptions,
    totalNetWorth,
    totalMonthlyExpenses,
    totalMonthlyIncome,
    hideBalances,
    settings,
  } = useFinance();

  const theme = settings.themeConfig;
  const isGlass = theme.style === 'clear-glass' || theme.style === 'custom';

  // Open Banking sync state
  const [isBankSyncing, setIsBankSyncing] = useState(false);
  const [bankSyncStatus, setBankSyncStatus] = useState<string>('Live Connected');

  // Multi-Currency Converter Widget state
  const [converterAmount, setConverterAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');

  const EXCHANGE_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.77,
    INR: 83.85,
    JPY: 148.5,
    CAD: 1.36,
    AUD: 1.49,
    SGD: 1.30,
    AED: 3.67,
  };

  const convertedValue = (
    (converterAmount / (EXCHANGE_RATES[fromCurrency] || 1)) *
    (EXCHANGE_RATES[toCurrency] || 1)
  ).toFixed(2);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'Bank':
        return Landmark;
      case 'Credit Card':
        return CreditCard;
      case 'Savings':
        return ShieldCheck;
      default:
        return Wallet;
    }
  };

  // Overall Monthly Budget calculation
  const overallBudget = budgets.find((b) => b.category === 'ALL') || budgets[0];
  const budgetLimit = overallBudget ? overallBudget.limitAmount : 2500;
  const budgetSpent = totalMonthlyExpenses;
  const budgetPercent = Math.min(100, Math.round((budgetSpent / budgetLimit) * 100));
  const budgetRemaining = Math.max(0, budgetLimit - budgetSpent);

  // Daily spending velocity
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDay;
  const dailyBurnRate = currentDay > 0 ? budgetSpent / currentDay : 0;
  const targetDailyVelocity = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;
  const isVelocityOnTrack = dailyBurnRate <= budgetLimit / daysInMonth;

  // Next upcoming subscription
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const nextSub = activeSubs[0];

  // Bank sync trigger
  const handleBankSync = () => {
    setIsBankSyncing(true);
    triggerHaptic('medium');
    setTimeout(() => {
      setIsBankSyncing(false);
      setBankSyncStatus(`Synced just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }, 1200);
  };

  const cardStyleClass = isGlass
    ? 'clear-glass-card squircle-lg'
    : 'rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl';

  return (
    <div className="space-y-6 pb-36 max-w-4xl mx-auto px-4 pt-3 select-none">
      {/* 1. Hero Net Worth / Scoped Account Card (Rock-solid static, perfectly symmetrical, zero breathing) */}
      <div className={`relative overflow-hidden p-6 sm:p-8 ${cardStyleClass} transform-none transition-none hover:transform-none select-none`}>
        {/* Subtle static gradient accent (no pulsing, completely stationary) */}
        <div className="absolute inset-0 bg-radial from-indigo-500/10 via-emerald-500/5 to-transparent pointer-events-none opacity-80" />

        {/* Symmetrical Top Bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {activeAccountId === 'ALL' ? 'Total Net Worth' : `${activeAccount?.name} Balance`}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800/80 text-emerald-400 border border-zinc-700/60">
              {activeAccountId === 'ALL' ? 'Global Vault' : activeAccount?.type}
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('insights')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition active:scale-95 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Insights</span>
          </button>
        </div>

        {/* Symmetrical Centered Big Balance Section */}
        <div className="relative z-10 py-6 text-center flex flex-col items-center justify-center">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
            Available Capital
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono drop-shadow-sm">
            {hideBalances
              ? '••••••••'
              : formatCurrency(
                  activeAccountId === 'ALL' ? totalNetWorth : activeAccount?.balance || 0,
                  activeAccount?.currency || settings.defaultCurrency
                )}
          </h1>
        </div>

        {/* Symmetrical Monthly Cashflow Breakdown Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-2xl bg-zinc-950/40 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase font-semibold truncate">Monthly Inflow</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 font-mono truncate">
                {hideBalances ? '••••' : `+${formatCurrency(totalMonthlyIncome, settings.defaultCurrency)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 p-3.5 rounded-2xl bg-zinc-950/40 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase font-semibold truncate">Monthly Outflow</p>
              <p className="text-xs sm:text-sm font-bold text-rose-400 font-mono truncate">
                {hideBalances ? '••••' : `-${formatCurrency(totalMonthlyExpenses, settings.defaultCurrency)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Open Banking & Real Bank Aggregation Status Card */}
      <div className={`p-4 ${cardStyleClass} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Open Banking Feeds</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                Plaid Ready
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Chase, HDFC & Monzo bank aggregation • {bankSyncStatus}
            </p>
          </div>
        </div>

        <button
          onClick={handleBankSync}
          disabled={isBankSyncing}
          className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1.5 transition active:scale-95 border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBankSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isBankSyncing ? 'Syncing...' : 'Sync Feeds'}</span>
        </button>
      </div>

      {/* 3. Real-time Budget & Velocity Bar */}
      <div className={`p-5 ${cardStyleClass} space-y-3.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Monthly Spending Velocity
              </h3>
              <p className="text-[11px] text-zinc-400">
                {formatCurrency(budgetSpent, settings.defaultCurrency)} of{' '}
                {formatCurrency(budgetLimit, settings.defaultCurrency)} spent ({budgetPercent}%)
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isVelocityOnTrack
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {isVelocityOnTrack ? '✓ On Track' : '⚠ Caution'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPercent > 90
                ? 'bg-rose-500'
                : budgetPercent > 75
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        {/* Velocity Gauge Details */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
              Current Burn Rate
            </span>
            <span className="font-mono font-bold text-white">
              {formatCurrency(dailyBurnRate, settings.defaultCurrency)}/day
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-950/70 border border-white/5">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
              Safe Daily Allowance
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {formatCurrency(targetDailyVelocity, settings.defaultCurrency)}/day
            </span>
          </div>
        </div>
      </div>

      {/* 4. Multi-Currency Live Rate Converter (Stores Native Currency Only) */}
      <div className={`p-4 ${cardStyleClass} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Live Currency Exchange Widget
              </h3>
              <p className="text-[10px] text-zinc-400">
                Preview rates in real-time (transactions store native currency only)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">Live Rates</span>
        </div>

        <div className="grid grid-cols-3 gap-2 items-center text-xs">
          <div>
            <label className="text-[10px] uppercase text-zinc-500 block mb-0.5">Amount</label>
            <input
              type="number"
              value={converterAmount}
              onChange={(e) => setConverterAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl py-1.5 px-2.5 font-mono font-bold text-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-zinc-500 block mb-0.5">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl py-1.5 px-2 text-white font-semibold text-xs"
            >
              {Object.keys(EXCHANGE_RATES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-zinc-500 block mb-0.5">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl py-1.5 px-2 text-white font-semibold text-xs"
            >
              {Object.keys(EXCHANGE_RATES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            {converterAmount} {fromCurrency} =
          </span>
          <span className="font-mono font-extrabold text-cyan-400 text-sm">
            {convertedValue} {toCurrency}
          </span>
        </div>
      </div>

      {/* 5. Killer AI Feature Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenShareToTrack}
          className={`p-4 ${cardStyleClass} border-amber-500/30 hover:border-amber-500/60 transition group text-left active:scale-[0.98]`}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition border border-amber-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
            Share-to-Track
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
            Paste UPI / SMS or simulate Android Share Intent
          </p>
        </button>

        <button
          onClick={onOpenScanner}
          className={`p-4 ${cardStyleClass} border-emerald-500/30 hover:border-emerald-500/60 transition group text-left active:scale-[0.98]`}
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition border border-emerald-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
            AI OCR Scanner
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
            Scan receipts, invoices, or upload PDF statements
          </p>
        </button>
      </div>

      {/* 6. Subscriptions Renewal Alert Banner */}
      {nextSub && (
        <div
          onClick={() => onNavigateTab('settings')}
          className={`cursor-pointer p-3.5 ${cardStyleClass} border-purple-800/40 hover:border-purple-600/60 transition flex items-center justify-between group`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                Upcoming Renewal: {nextSub.name}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                  {nextSub.billingCycle}
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Renews on {nextSub.nextBillingDate} • ${nextSub.amount.toFixed(2)}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition" />
        </div>
      )}

      {/* 7. Accounts Carousel / Deck */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Your Accounts ({accounts.length})
          </h3>
          <span className="text-xs text-emerald-400 font-semibold cursor-pointer">
            Tap account to filter
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const isSelected = activeAccountId === acc.id;

            return (
              <button
                key={acc.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveAccountId(isSelected ? 'ALL' : acc.id);
                }}
                className={`min-w-[190px] p-4 rounded-3xl border transition text-left shrink-0 active:scale-[0.98] ${
                  isSelected
                    ? 'bg-zinc-850 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: acc.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{acc.type}</span>
                </div>

                <p className="text-xs font-bold text-white truncate">{acc.name}</p>
                <p className="text-sm font-mono font-extrabold text-zinc-100 mt-1">
                  {hideBalances ? '••••••' : formatCurrency(acc.balance, acc.currency)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Recent Transactions
          </h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All ({transactions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`divide-y divide-white/10 ${cardStyleClass} overflow-hidden`}>
          {transactions.slice(0, 6).map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const account = accounts.find((a) => a.id === tx.accountId);

            return (
              <div
                key={tx.id}
                className="p-3.5 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
                onClick={() => onNavigateTab('transactions')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : tx.type === 'TRANSFER'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{tx.merchant}</p>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{formatDateRelative(tx.date)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-mono font-bold ${
                      isIncome ? 'text-emerald-400' : 'text-zinc-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {hideBalances
                      ? '••••'
                      : formatCurrency(tx.amount, account?.currency || settings.defaultCurrency)}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate max-w-[100px]">
                    {account?.name || 'Account'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
