import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, triggerHaptic } from '../utils/formatters';
import { EMILoan, Subscription } from '../types';
import {
  CreditCard,
  Calculator,
  ShieldCheck,
  CloudCheck,
  Repeat,
  Tv,
  Percent,
  Landmark,
  ArrowRight,
  Plus,
  Trash2,
  Lock,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  HelpCircle,
  X,
} from 'lucide-react';

export const ToolsView: React.FC = () => {
  const {
    accounts,
    subscriptions,
    addSubscription,
    toggleSubscriptionStatus,
    deleteSubscription,
    emiLoans,
    addEMILoan,
    deleteEMILoan,
    settings,
    updateSettings,
    exportDataToJSON,
    importDataFromJSON,
    resetToDefaults,
  } = useFinance();

  const [activeSection, setActiveSection] = useState<
    'credit' | 'subscriptions' | 'calculators' | 'sync'
  >('credit');

  // New Subscription modal state
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCycle, setSubCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [subDate, setSubDate] = useState('2026-10-15');

  // New EMI modal state
  const [isAddEmiOpen, setIsAddEmiOpen] = useState(false);
  const [emiName, setEmiName] = useState('');
  const [emiLender, setEmiLender] = useState('');
  const [emiPrincipal, setEmiPrincipal] = useState('');
  const [emiRate, setEmiRate] = useState('6.5');
  const [emiTenure, setEmiTenure] = useState('36');

  // Fixed Deposit Calculator state
  const [fdPrincipal, setFdPrincipal] = useState(10000);
  const [fdRate, setFdRate] = useState(6.8);
  const [fdTenureYears, setFdTenureYears] = useState(3);

  // Tax Regime Comparison Calculator state
  const [annualIncome, setAnnualIncome] = useState(1200000);
  const [sec80CDeduction, setSec80CDeduction] = useState(150000);
  const [sec80DDeduction, setSec80DDeduction] = useState(25000);
  const [hraDeduction, setHraDeduction] = useState(120000);

  // Privacy Policy modal
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Filter credit card accounts
  const creditCards = accounts.filter((a) => a.type === 'Credit Card');

  // FD calculations (compounded quarterly)
  const n = 4;
  const fdMaturity =
    fdPrincipal * Math.pow(1 + fdRate / 100 / n, n * fdTenureYears);
  const fdInterestGained = fdMaturity - fdPrincipal;

  // Tax Regime Calculation (India simplified model)
  // New Regime 2026-27 (standard deduction 75,000, revised slabs)
  const newRegimeTaxable = Math.max(0, annualIncome - 75000);
  let newRegimeTax = 0;
  if (newRegimeTaxable > 1500000) {
    newRegimeTax = (newRegimeTaxable - 1500000) * 0.3 + 150000;
  } else if (newRegimeTaxable > 1200000) {
    newRegimeTax = (newRegimeTaxable - 1200000) * 0.2 + 90000;
  } else if (newRegimeTaxable > 900000) {
    newRegimeTax = (newRegimeTaxable - 900000) * 0.15 + 45000;
  } else if (newRegimeTaxable > 600000) {
    newRegimeTax = (newRegimeTaxable - 600000) * 0.1 + 15000;
  } else if (newRegimeTaxable > 300000) {
    newRegimeTax = (newRegimeTaxable - 300000) * 0.05;
  }
  // Surcharge/rebate
  if (newRegimeTaxable <= 700000) newRegimeTax = 0;

  // Old Regime (standard deduction 50,000 + 80C + 80D + HRA)
  const totalOldDeductions =
    50000 +
    Math.min(150000, sec80CDeduction) +
    Math.min(50000, sec80DDeduction) +
    hraDeduction;
  const oldRegimeTaxable = Math.max(0, annualIncome - totalOldDeductions);
  let oldRegimeTax = 0;
  if (oldRegimeTaxable > 1000000) {
    oldRegimeTax = (oldRegimeTaxable - 1000000) * 0.3 + 112500;
  } else if (oldRegimeTaxable > 500000) {
    oldRegimeTax = (oldRegimeTaxable - 500000) * 0.2 + 12500;
  } else if (oldRegimeTaxable > 250000) {
    oldRegimeTax = (oldRegimeTaxable - 250000) * 0.05;
  }
  if (oldRegimeTaxable <= 500000) oldRegimeTax = 0;

  const taxDifference = Math.abs(oldRegimeTax - newRegimeTax);
  const recommendedRegime =
    newRegimeTax <= oldRegimeTax ? 'New Tax Regime' : 'Old Tax Regime';

  // Subscriptions total burn rate
  const totalMonthlySubs = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => {
      return sum + (s.billingCycle === 'YEARLY' ? s.amount / 12 : s.amount);
    }, 0);

  // EMI submission
  const handleAddEMI = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(emiPrincipal);
    const r = parseFloat(emiRate) / 12 / 100;
    const t = parseInt(emiTenure);
    if (!p || !t || !emiName.trim()) return;

    // Monthly EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = r === 0 ? p / t : (p * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);

    addEMILoan({
      name: emiName.trim(),
      lender: emiLender.trim() || 'Bank Finance',
      principal: p,
      annualInterestRate: parseFloat(emiRate),
      tenureMonths: t,
      emiAmount: Math.round(emi * 100) / 100,
      startDate: new Date().toISOString().split('T')[0],
    });

    setEmiName('');
    setEmiPrincipal('');
    setIsAddEmiOpen(false);
  };

  // Subscription submission
  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(subAmount);
    if (!amt || !subName.trim()) return;

    addSubscription({
      name: subName.trim(),
      merchant: subName.trim(),
      amount: amt,
      currencyCode: settings.defaultCurrency.code,
      accountId: accounts[0]?.id || 'acc-1',
      billingCycle: subCycle,
      nextBillingDate: subDate,
      category: 'Entertainment',
      status: 'ACTIVE',
      reminderDaysBefore: 2,
    });

    setSubName('');
    setSubAmount('');
    setIsAddSubOpen(false);
  };

  // JSON Backup Import trigger
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      importDataFromJSON(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-3 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Tools & Credit</h2>
        <p className="text-xs text-zinc-400">
          Debt & credit monitoring, subscription audit, calculators, and vault sync
        </p>
      </div>

      {/* Section Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'credit', label: 'Credit & EMIs', icon: CreditCard },
          { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
          { id: 'calculators', label: 'Wealth Calculators', icon: Calculator },
          { id: 'sync', label: 'Cloud Sync & Privacy', icon: CloudCheck },
        ].map((sec) => {
          const Icon = sec.icon;
          const isSelected = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveSection(sec.id as any);
              }}
              className={`px-3.5 py-2 rounded-2xl font-bold transition shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Credit Cards & EMIs */}
      {activeSection === 'credit' && (
        <div className="space-y-5 animate-slide-up">
          {/* Credit Cards list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Credit Cards & Utilization
            </h3>

            {creditCards.length === 0 ? (
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
                No credit cards registered yet. Add one in the Accounts menu!
              </div>
            ) : (
              creditCards.map((card) => {
                const currentSpent = Math.abs(card.balance);
                const limit = card.creditLimit || 5000;
                const utilPercent = Math.min(100, Math.round((currentSpent / limit) * 100));
                const available = Math.max(0, limit - currentSpent);
                const isWarning = utilPercent > 30;
                const isAlert = utilPercent > 70;

                return (
                  <div
                    key={card.id}
                    className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                          style={{ backgroundColor: card.color }}
                        >
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{card.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            {card.accountNumberMasked || '•••• 4209'} • Statement Due:{' '}
                            {card.dueDate || 5}th
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isAlert
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {utilPercent}% Utilization
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAlert
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${utilPercent}%` }}
                      />
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                        <span className="text-[10px] uppercase text-zinc-500 block">Spent</span>
                        <span className="font-mono font-bold text-white">
                          ${currentSpent.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                        <span className="text-[10px] uppercase text-zinc-500 block">Available</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ${available.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850">
                        <span className="text-[10px] uppercase text-zinc-500 block">Credit Limit</span>
                        <span className="font-mono font-bold text-zinc-300">
                          ${limit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* EMI & Loans Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Loans & EMIs ({emiLoans.length})
              </h3>
              <button
                onClick={() => setIsAddEmiOpen(true)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Loan / EMI
              </button>
            </div>

            <div className="space-y-3">
              {emiLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{loan.name}</h4>
                      <p className="text-[11px] text-zinc-400">
                        {loan.lender} • {loan.annualInterestRate}% APR • {loan.tenureMonths} mo tenure
                      </p>
                    </div>

                    <button
                      onClick={() => deleteEMILoan(loan.id)}
                      className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850">
                      <span className="text-[10px] uppercase text-zinc-500 block">Monthly EMI</span>
                      <span className="text-base font-mono font-extrabold text-emerald-400">
                        ${loan.emiAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850">
                      <span className="text-[10px] uppercase text-zinc-500 block">Principal</span>
                      <span className="text-base font-mono font-bold text-white">
                        ${loan.principal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Subscriptions Manager */}
      {activeSection === 'subscriptions' && (
        <div className="space-y-5 animate-slide-up">
          {/* Subscriptions Hero */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/40 border border-zinc-800 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Monthly Recurring Burn
              </span>
              <h3 className="text-2xl font-mono font-extrabold text-white mt-1">
                ${totalMonthlySubs.toFixed(2)}/mo
              </h3>
              <p className="text-[11px] text-purple-300 mt-0.5">
                ${(totalMonthlySubs * 12).toFixed(2)} projected annual recurring spend
              </p>
            </div>

            <button
              onClick={() => setIsAddSubOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subscription
            </button>
          </div>

          {/* Subscriptions list */}
          <div className="divide-y divide-zinc-800/80 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
            {subscriptions.map((sub) => {
              const isPaused = sub.status === 'PAUSED';
              return (
                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-zinc-850/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        {sub.name}
                        {isPaused && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            Paused
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Renews {sub.nextBillingDate} • {sub.billingCycle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-white">
                        ${sub.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => toggleSubscriptionStatus(sub.id)}
                        className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 underline"
                      >
                        {isPaused ? 'Resume' : 'Pause / Audit'}
                      </button>
                    </div>

                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-1 rounded-lg text-zinc-600 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: Wealth & Tax Calculators */}
      {activeSection === 'calculators' && (
        <div className="space-y-6 animate-slide-up">
          {/* Fixed Deposit (FD) Calculator */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Fixed Deposit (FD) Calculator
                </h3>
                <p className="text-[11px] text-zinc-400">Calculate compound interest maturity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-zinc-400">Principal ($)</label>
                <input
                  type="number"
                  step="500"
                  value={fdPrincipal}
                  onChange={(e) => setFdPrincipal(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold text-zinc-400">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fdRate}
                  onChange={(e) => setFdRate(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold text-zinc-400">Tenure (Years)</label>
                <input
                  type="number"
                  value={fdTenureYears}
                  onChange={(e) => setFdTenureYears(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">Wealth Gained</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +${fdInterestGained.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block text-[10px] uppercase">Maturity Value</span>
                <span className="font-mono font-extrabold text-white text-base">
                  ${fdMaturity.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* New vs Old Tax Regime Calculator */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    New vs Old Tax Regime Comparison
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Compare deductions and see which saves more money
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Recommended: {recommendedRegime}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase text-zinc-400">Gross Annual Income</label>
                <input
                  type="number"
                  step="50000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-zinc-400">Section 80C (Max 1.5L)</label>
                <input
                  type="number"
                  step="10000"
                  value={sec80CDeduction}
                  onChange={(e) => setSec80CDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-zinc-400">Section 80D Health</label>
                <input
                  type="number"
                  step="5000"
                  value={sec80DDeduction}
                  onChange={(e) => setSec80DDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-zinc-400">HRA Exemption</label>
                <input
                  type="number"
                  step="10000"
                  value={hraDeduction}
                  onChange={(e) => setHraDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            {/* Comparison Results Card */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div
                className={`p-3 rounded-2xl border text-center ${
                  recommendedRegime === 'New Tax Regime'
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <span className="text-[11px] font-bold text-white block">New Tax Regime</span>
                <span className="text-sm font-mono font-extrabold text-emerald-400 mt-1 block">
                  ₹{newRegimeTax.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-zinc-400">Standard ₹75,000 deduction</span>
              </div>

              <div
                className={`p-3 rounded-2xl border text-center ${
                  recommendedRegime === 'Old Tax Regime'
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <span className="text-[11px] font-bold text-white block">Old Tax Regime</span>
                <span className="text-sm font-mono font-extrabold text-blue-400 mt-1 block">
                  ₹{oldRegimeTax.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-zinc-400">Includes 80C, 80D, HRA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Cloud Sync, Backup & Privacy */}
      {activeSection === 'sync' && (
        <div className="space-y-5 animate-slide-up">
          {/* Google Drive Sync Status */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CloudCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Google Drive Cloud Backup</h3>
                  <p className="text-[11px] text-zinc-400">
                    Encrypted multi-device sync • Last synced: {settings.lastSyncDate}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  const json = exportDataToJSON();
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Waufle_Wault_Backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="py-2.5 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export Encrypted JSON
              </button>

              <label className="py-2.5 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                Restore from JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Security & Biometrics */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Security & App Lock
            </h3>

            <div className="flex items-center justify-between py-2 border-b border-zinc-800">
              <div>
                <p className="text-xs font-bold text-white">Biometric / PIN Screen Lock</p>
                <p className="text-[11px] text-zinc-400">Require fingerprint or PIN to open app</p>
              </div>
              <input
                type="checkbox"
                checked={settings.biometricLockEnabled}
                onChange={(e) => updateSettings({ biometricLockEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-white">Privacy Policy & Local-First Charter</p>
                <p className="text-[11px] text-zinc-400">No third-party trackers, zero telemetry</p>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
              >
                Read Policy
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  if (confirm('Reset vault data to original demo state?')) {
                    resetToDefaults();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Vault to Sample Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {isAddSubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Add Subscription</h3>
              <button onClick={() => setIsAddSubOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Service Name</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Disney+, YouTube Premium"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  placeholder="14.99"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Cycle</label>
                  <select
                    value={subCycle}
                    onChange={(e) => setSubCycle(e.target.value as any)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-2 text-xs text-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Next Date</label>
                  <input
                    type="date"
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
              >
                Save Subscription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add EMI Loan Modal */}
      {isAddEmiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Register Loan / EMI</h3>
              <button onClick={() => setIsAddEmiOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEMI} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Loan Name</label>
                <input
                  type="text"
                  required
                  value={emiName}
                  onChange={(e) => setEmiName(e.target.value)}
                  placeholder="e.g. Home Renovation, Electric Scooter"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Principal ($)</label>
                <input
                  type="number"
                  required
                  value={emiPrincipal}
                  onChange={(e) => setEmiPrincipal(e.target.value)}
                  placeholder="12000"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Annual Interest %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={emiRate}
                    onChange={(e) => setEmiRate(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Tenure (Months)</label>
                  <input
                    type="number"
                    value={emiTenure}
                    onChange={(e) => setEmiTenure(e.target.value)}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg transition"
              >
                Register EMI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Privacy & Security Charter</h3>
              </div>
              <button onClick={() => setIsPrivacyOpen(false)} className="text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                <strong>Local-First Architecture:</strong> Waufle Wault stores your financial records
                encrypted on your device. Transactions, account numbers, and receipts remain strictly
                within your private control.
              </p>
              <p>
                <strong>Zero Telemetry:</strong> We do not track, profile, or sell your financial habits
                to advertisers or data brokers.
              </p>
              <p>
                <strong>Google Drive Sync:</strong> When cloud backup is enabled, data is stored in your
                personal Google Drive account and nowhere else.
              </p>
              <p>
                <strong>AI Processing:</strong> Receipt OCR, voice transcription, and statement parsing
                process documents solely to return structured transaction line items back to your device.
              </p>
            </div>

            <button
              onClick={() => setIsPrivacyOpen(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
