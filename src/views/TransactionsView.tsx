import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, formatDateRelative, triggerHaptic } from '../utils/formatters';
import {
  Search,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Calendar,
  X,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionsViewProps {
  onOpenManualTx: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenManualTx }) => {
  const {
    transactions,
    accounts,
    deleteTransaction,
    exportToCSV,
    hideBalances,
    settings,
    activeAccountId,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (selectedType !== 'ALL' && t.type !== selectedType) return false;
      // Category filter
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesMerchant = t.merchant.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesAmount = t.amount.toString().includes(query);
        if (!matchesMerchant && !matchesNotes && !matchesCategory && !matchesAmount) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, selectedType, selectedCategory, searchQuery]);

  // Aggregate metrics
  const totalInflow = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalInflow - totalOutflow;

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    for (const t of filteredTransactions) {
      const dateKey = t.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTransactions]);

  const handleDelete = (id: string) => {
    triggerHaptic('medium');
    deleteTransaction(id);
    setSelectedTx(null);
  };

  return (
    <div className="space-y-5 pb-36 max-w-4xl mx-auto px-4 pt-3 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Transactions</h2>
          <p className="text-xs text-zinc-400">
            {filteredTransactions.length} records • {activeAccountId === 'ALL' ? 'Global Vault' : 'Scoped View'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(false)}
            title="Export CSV"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenManualTx}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
        <div>
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Total Inflow</span>
          <p className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
            +{hideBalances ? '••••' : formatCurrency(totalInflow, settings.defaultCurrency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-rose-400 block">Total Outflow</span>
          <p className="text-xs sm:text-sm font-bold font-mono text-rose-400">
            -{hideBalances ? '••••' : formatCurrency(totalOutflow, settings.defaultCurrency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Net Flow</span>
          <p
            className={`text-xs sm:text-sm font-bold font-mono ${
              netCashflow >= 0 ? 'text-zinc-100' : 'text-rose-400'
            }`}
          >
            {hideBalances ? '••••' : formatCurrency(netCashflow, settings.defaultCurrency)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, notes, tags or amount..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                triggerHaptic('light');
                setSelectedType(type);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                selectedType === type
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
            </button>
          ))}

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none shrink-0"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Transactions List */}
      {groupedTransactions.length === 0 ? (
        <div className="py-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-2">
          <p className="text-sm font-semibold text-zinc-300">No transactions found</p>
          <p className="text-xs text-zinc-500">
            Try adjusting your search criteria or log a new transaction.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map(([dateKey, txs]) => (
            <div key={dateKey} className="space-y-1.5">
              <div className="px-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>{formatDateRelative(dateKey)}</span>
                <span className="text-[10px] font-mono text-zinc-400">{dateKey}</span>
              </div>

              <div className="divide-y divide-zinc-800/80 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
                {txs.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isTransfer = tx.type === 'TRANSFER';
                  const account = accounts.find((a) => a.id === tx.accountId);

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="p-3.5 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : isTransfer
                              ? 'bg-sky-500/15 text-sky-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : isTransfer ? (
                            <ArrowLeftRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                            {tx.merchant}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                            <span className="font-medium">{tx.category}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{account?.name || 'Account'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs sm:text-sm font-mono font-bold ${
                            isIncome
                              ? 'text-emerald-400'
                              : isTransfer
                              ? 'text-sky-400'
                              : 'text-zinc-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {hideBalances
                            ? '••••'
                            : formatCurrency(tx.amount, account?.currency || settings.defaultCurrency)}
                        </p>
                        {tx.notes && (
                          <p className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail & Delete Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Transaction Details
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <p className="text-xs text-zinc-400 uppercase">{selectedTx.merchant}</p>
              <h3
                className={`text-3xl font-mono font-extrabold mt-1 ${
                  selectedTx.type === 'INCOME' ? 'text-emerald-400' : 'text-white'
                }`}
              >
                {selectedTx.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(selectedTx.amount, settings.defaultCurrency)}
              </h3>
            </div>

            <div className="space-y-2 text-xs bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
              <div className="flex justify-between py-1 border-b border-zinc-850">
                <span className="text-zinc-500">Category</span>
                <span className="font-semibold text-white">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-850">
                <span className="text-zinc-500">Date</span>
                <span className="font-semibold text-white">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-850">
                <span className="text-zinc-500">Account</span>
                <span className="font-semibold text-white">
                  {accounts.find((a) => a.id === selectedTx.accountId)?.name || 'Default'}
                </span>
              </div>
              {selectedTx.notes && (
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Memo</span>
                  <span className="font-semibold text-zinc-300">{selectedTx.notes}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => handleDelete(selectedTx.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Entry
              </button>

              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
