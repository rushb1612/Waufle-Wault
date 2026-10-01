import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, triggerHaptic } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  X,
  FileSpreadsheet,
  Upload,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
} from 'lucide-react';

interface StatementBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStatementTx {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  selected: boolean;
}

const SAMPLE_STATEMENT_TEXT = `CHASE BANK STATEMENT - ACCOUNT # ****8912
PERIOD: SEP 01, 2026 TO SEP 30, 2026

09/02/2026  TRADER JOES #142 SOMA SAN FRANCISCO CA    -$46.80
09/05/2026  UBER TRIP HELP.UBER.COM                   -$28.40
09/08/2026  BLUE BOTTLE COFFEE HAYES VALLEY            -$9.50
09/12/2026  PG&E UTILITIES WEB PAYMENT                -$115.00
09/15/2026  DIRECT DEP STRIPE PAYROLL CORP           +$3,850.00
09/18/2026  EQUINOX GYM CLUB MONTHLY DUES             -$165.00
09/22/2026  WHOLE FOODS SOMA SAN FRANCISCO CA         -$82.15
09/25/2026  NETFLIX.COM STREAMING SUBSCRIPTION         -$22.99
09/28/2026  SHELL OIL PETROL PUMP #4912                -$54.00
09/30/2026  APPLE STORE UNION SQUARE                  -$149.00
TOTAL DEBITS: -$672.84  |  TOTAL CREDITS: +$3,850.00`;

export const StatementBatchModal: React.FC<StatementBatchModalProps> = ({ isOpen, onClose }) => {
  const { accounts, bulkAddTransactions } = useFinance();
  const [statementText, setStatementText] = useState(SAMPLE_STATEMENT_TEXT);
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parsedRows, setParsedRows] = useState<ParsedStatementTx[] | null>(null);

  if (!isOpen) return null;

  const handleParseStatement = async () => {
    if (!statementText.trim()) return;
    setLoading(true);
    setError(null);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/parse-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: statementText }),
      });

      const res = await response.json();
      if (res.success && res.transactions) {
        const rows: ParsedStatementTx[] = res.transactions.map((tx: any) => ({
          date: tx.date || '2026-09-15',
          description: tx.description || tx.merchant || 'Statement Entry',
          merchant: tx.merchant || tx.description || 'Unknown Merchant',
          amount: Math.abs(tx.amount) || 0,
          type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
          category: tx.category || 'Other',
          selected: true,
        }));

        setParsedRows(rows);
        triggerHaptic('success');
      } else {
        throw new Error(res.error || 'Failed to parse statement');
      }
    } catch (err: any) {
      console.error(err);
      setError('AI could not parse statement table. Please verify format.');
      triggerHaptic('warning');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectRow = (index: number) => {
    if (!parsedRows) return;
    setParsedRows((prev) =>
      prev ? prev.map((row, i) => (i === index ? { ...row, selected: !row.selected } : row)) : null
    );
  };

  const toggleSelectAll = () => {
    if (!parsedRows) return;
    const allSelected = parsedRows.every((r) => r.selected);
    setParsedRows((prev) => (prev ? prev.map((r) => ({ ...r, selected: !allSelected })) : null));
  };

  const handleImportBatch = () => {
    if (!parsedRows) return;
    const selected = parsedRows.filter((r) => r.selected);
    if (selected.length === 0) return;

    triggerHaptic('success');
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // ignore
    }

    bulkAddTransactions(
      selected.map((r) => ({
        accountId: targetAccountId,
        amount: r.amount,
        type: r.type,
        category: r.category,
        merchant: r.merchant,
        date: r.date,
        notes: `Imported from statement: ${r.description}`,
      }))
    );

    handleClose();
  };

  const handleClose = () => {
    setParsedRows(null);
    setError(null);
    onClose();
  };

  const selectedCount = parsedRows?.filter((r) => r.selected).length || 0;
  const totalSelectedDebits = parsedRows
    ?.filter((r) => r.selected && r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalSelectedCredits = parsedRows
    ?.filter((r) => r.selected && r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/30 flex items-center justify-center text-sky-400 border border-sky-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Statement Batch Processing
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  PDF & CSV Parser
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Parse full-month bank statements & bulk import with auto-categorization
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
          {!parsedRows ? (
            <>
              {/* Target Account selector */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Target Account for Imported Transactions:
                </label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Statement Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Bank / Credit Card Statement Text (or sample):
                  </label>
                  <button
                    onClick={() => setStatementText(SAMPLE_STATEMENT_TEXT)}
                    className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                  >
                    Reset to Chase Sample
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={statementText}
                  onChange={(e) => setStatementText(e.target.value)}
                  placeholder="Paste monthly bank statement lines, credit card logs, or CSV data..."
                  className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition resize-none leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* Parsed Batch Table View */
            <div className="space-y-3 animate-slide-up">
              {/* Batch Summary Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-500">Selected</span>
                  <p className="text-sm font-bold text-white font-mono">{selectedCount} txs</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-rose-400 flex items-center justify-center gap-1">
                    <ArrowDownLeft className="w-3 h-3" /> Debits
                  </span>
                  <p className="text-sm font-bold text-rose-400 font-mono">
                    -${totalSelectedDebits.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> Credits
                  </span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    +${totalSelectedCredits.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
                >
                  {parsedRows.every((r) => r.selected) ? (
                    <>
                      <CheckSquare className="w-4 h-4" /> Unselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" /> Select All ({parsedRows.length})
                    </>
                  )}
                </button>
                <span className="text-xs text-zinc-400">
                  Review & tweak category before importing
                </span>
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl bg-zinc-950/60 overflow-hidden max-h-72 overflow-y-auto">
                {parsedRows.map((row, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleSelectRow(idx)}
                    className={`p-3 flex items-center gap-3 cursor-pointer transition select-none ${
                      row.selected ? 'bg-zinc-850/40' : 'opacity-40 hover:opacity-75'
                    }`}
                  >
                    <div className="shrink-0 text-sky-400">
                      {row.selected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>

                    <div className="min-w-[70px] text-xs font-mono text-zinc-400">{row.date}</div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{row.merchant}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{row.description}</p>
                    </div>

                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={row.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setParsedRows((prev) =>
                            prev
                              ? prev.map((r, i) => (i === idx ? { ...r, category: val } : r))
                              : null
                          );
                        }}
                        className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="shrink-0 text-right min-w-[70px]">
                      <span
                        className={`text-xs font-mono font-bold ${
                          row.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-200'
                        }`}
                      >
                        {row.type === 'INCOME' ? '+' : '-'}${row.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          {parsedRows ? (
            <button
              onClick={() => setParsedRows(null)}
              className="text-xs text-zinc-400 hover:text-white transition underline"
            >
              Back to statement text
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

            {parsedRows ? (
              <button
                disabled={selectedCount === 0}
                onClick={handleImportBatch}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition"
              >
                <Database className="w-4 h-4" />
                Import {selectedCount} Transactions
              </button>
            ) : (
              <button
                disabled={!statementText.trim() || loading}
                onClick={handleParseStatement}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Process Statement
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
