import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, triggerHaptic } from '../utils/formatters';
import {
  Wallet,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  CloudCheck,
  Plus,
  Landmark,
  CreditCard,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { AccountType } from '../types';

interface TopAppBarProps {
  onOpenNewAccount: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onOpenNewAccount }) => {
  const {
    accounts,
    activeAccountId,
    setActiveAccountId,
    activeAccount,
    totalNetWorth,
    hideBalances,
    toggleHideBalances,
    lockApp,
    settings,
  } = useFinance();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3 select-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left: Account Switcher Chip */}
          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsSwitcherOpen((prev) => !prev);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition active:scale-95 text-left group"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{
                  backgroundColor:
                    activeAccountId === 'ALL' ? '#10b981' : activeAccount?.color || '#3b82f6',
                }}
              >
                {activeAccountId === 'ALL' ? '🌐' : activeAccount?.name.charAt(0) || 'A'}
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white leading-tight flex items-center gap-1 group-hover:text-emerald-400 transition">
                  {activeAccountId === 'ALL' ? 'All Accounts (Net Worth)' : activeAccount?.name}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
                </span>
                <span className="text-[10px] text-zinc-400 leading-tight">
                  {hideBalances
                    ? '••••••'
                    : formatCurrency(
                        activeAccountId === 'ALL' ? totalNetWorth : activeAccount?.balance || 0,
                        activeAccount?.currency || settings.defaultCurrency
                      )}
                </span>
              </div>
            </button>

            {/* Account Switcher Dropdown */}
            {isSwitcherOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-2 z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Select Account Scope
                  </span>
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      onOpenNewAccount();
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> New
                  </button>
                </div>

                <div className="py-1 space-y-1 max-h-64 overflow-y-auto">
                  {/* All Accounts Option */}
                  <button
                    onClick={() => {
                      setActiveAccountId('ALL');
                      setIsSwitcherOpen(false);
                      triggerHaptic('light');
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition text-left ${
                      activeAccountId === 'ALL'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                        : 'hover:bg-zinc-800/70 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                        🌐
                      </div>
                      <div>
                        <p className="text-xs font-bold">All Accounts (Net Worth)</p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {hideBalances ? '••••••' : formatCurrency(totalNetWorth, settings.defaultCurrency)}
                        </p>
                      </div>
                    </div>
                    {activeAccountId === 'ALL' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                  {/* Individual accounts */}
                  {accounts.map((acc) => {
                    const IconComp = getAccountIcon(acc.type);
                    const isSelected = activeAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setActiveAccountId(acc.id);
                          setIsSwitcherOpen(false);
                          triggerHaptic('light');
                        }}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition text-left ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                            : 'hover:bg-zinc-800/70 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: acc.color }}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold truncate max-w-[140px]">{acc.name}</p>
                            <p className="text-[11px] text-zinc-400 font-mono">
                              {hideBalances ? '••••••' : formatCurrency(acc.balance, acc.currency)}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Privacy, Cloud Sync & Lock controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Drive Backup Status Indicator */}
            <div
              title="Google Drive Encrypted Sync Active"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Drive Sync</span>
            </div>

            {/* Toggle Hide Balances */}
            <button
              onClick={toggleHideBalances}
              title={hideBalances ? 'Show Balances' : 'Hide Balances'}
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition active:scale-95"
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Biometric Quick Lock */}
            <button
              onClick={lockApp}
              title="Lock Vault"
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition active:scale-95"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay to close switcher */}
      {isSwitcherOpen && (
        <div
          onClick={() => setIsSwitcherOpen(false)}
          className="fixed inset-0 z-20 bg-transparent"
        />
      )}
    </>
  );
};
