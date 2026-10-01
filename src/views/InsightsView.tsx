import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, formatCurrency, triggerHaptic } from '../utils/formatters';
import { AIHabitObservation } from '../types';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Flame,
  AlertTriangle,
  Lightbulb,
  FileText,
  Send,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const {
    transactions,
    accounts,
    budgets,
    settings,
    totalMonthlyExpenses,
    totalMonthlyIncome,
  } = useFinance();

  // Habit analysis state
  const [habitLoading, setHabitLoading] = useState(false);
  const [habits, setHabits] = useState<AIHabitObservation[]>([
    {
      title: 'Dining Out Outpaced Home Cooking',
      impact: 'High',
      type: 'warning',
      description: 'You spent 36% more on restaurants and deliveries than on grocery supplies this month.',
      actionableTip: 'Preparing dinner at home 2 extra nights could preserve an estimated $140/mo.',
    },
    {
      title: 'Active Subscription Hygiene',
      impact: 'Medium',
      type: 'neutral',
      description: '4 recurring entertainment subscriptions identified totaling $57.97/month.',
      actionableTip: 'Audit un-watched streaming tiers to shave up to $22.99/mo instantly.',
    },
    {
      title: 'Positive Net Savings Buffer',
      impact: 'Low',
      type: 'positive',
      description: 'Your monthly cash inflow exceeded outflows with a 62% surplus cushion.',
      actionableTip: 'Sweep surplus capital into your high-yield vault before discretionary drift.',
    },
  ]);
  const [smartTip, setSmartTip] = useState(
    'Mid-week days show your highest financial discipline. Consolidate discretionary purchases on planned budget days.'
  );

  // Copilot Natural Language Query state
  const [query, setQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState<string | null>(null);

  // Monthly Report state
  const [reportLoading, setReportLoading] = useState(false);
  const [executiveReport, setExecutiveReport] = useState<{
    executiveSummary: string;
    topCategory: string;
    savingsRate: number;
    highlights: string[];
    recommendations: string[];
  } | null>(null);

  // Fetch Habit Analysis from Gemini
  const refreshHabits = async () => {
    setHabitLoading(true);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/habit-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, accounts, budgets }),
      });

      const res = await response.json();
      if (res.success && res.habits) {
        setHabits(res.habits);
        if (res.smartTip) setSmartTip(res.smartTip);
        triggerHaptic('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHabitLoading(false);
    }
  };

  // Ask Waufle AI (Strict plain string / raw data without markdown or asterisks)
  const handleAskWaufleAI = async (qText: string) => {
    if (!qText.trim()) return;
    setQueryLoading(true);
    setQueryResponse(null);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/financial-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: qText,
          transactions: transactions.slice(0, 60),
          accounts,
        }),
      });

      const res = await response.json();
      if (res.success && res.answer) {
        // Strip any asterisks or markdown characters completely
        const cleanAnswer = String(res.answer)
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/^#+\s*/gm, '')
          .replace(/^[-•*]\s*/gm, '')
          .replace(/[`_~]/g, '')
          .trim();
        setQueryResponse(cleanAnswer);
        triggerHaptic('success');
      } else {
        setQueryResponse(res.error || 'Unable to retrieve answer.');
      }
    } catch (e) {
      setQueryResponse('Error connecting to Waufle AI. Please try again.');
    } finally {
      setQueryLoading(false);
    }
  };

  // Generate Monthly AI Report
  const handleGenerateReport = async () => {
    setReportLoading(true);
    triggerHaptic('medium');

    try {
      const response = await fetch('/api/ai/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          accounts,
          monthName: 'October 2026',
        }),
      });

      const res = await response.json();
      if (res.success) {
        setExecutiveReport(res);
        triggerHaptic('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  // Compute category spending for the interactive breakdown
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const quickQuestions = [
    'How much did I spend on Food & Dining this month?',
    'What is my single largest expense recorded?',
    'Can I afford to save $400 this month?',
  ];

  return (
    <div className="space-y-6 pb-36 max-w-4xl mx-auto px-4 pt-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AI Financial Insights
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Gemini 3.8 Flash
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Personalized habit analysis, visual charts, and executive reporting
          </p>
        </div>

        <button
          onClick={refreshHabits}
          disabled={habitLoading}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition active:scale-95"
          title="Refresh Analysis"
        >
          <RefreshCw className={`w-4 h-4 ${habitLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* 1. Natural Language Waufle AI Prompt */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              ASK WAUFLE AI
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Ask natural language questions about your transactions, budgets, or savings capacity
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskWaufleAI(query)}
            placeholder="Ask Waufle AI anything e.g. How much did I spend on food and dining this month?"
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl py-2.5 pl-3.5 pr-11 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            disabled={!query.trim() || queryLoading}
            onClick={() => handleAskWaufleAI(query)}
            className="absolute right-2 top-2 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleAskWaufleAI(q);
              }}
              className="px-2.5 py-1 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* WAUFLE AI IS THINKING glowing state */}
        {queryLoading && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-indigo-500/40 flex items-center justify-between text-xs text-indigo-300 animate-pulse shadow-[0_0_25px_rgba(99,102,241,0.2)]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-indigo-500 animate-ping opacity-60" />
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-extrabold tracking-wider text-white text-xs font-mono">
                  WAUFLE AI IS THINKING...
                </p>
                <p className="text-[10px] text-zinc-400">
                  Analyzing transactions, accounts & budget trajectories in real-time
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Answer display */}
        {queryResponse && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-indigo-500/30 text-xs text-zinc-200 space-y-2 animate-slide-up shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-[11px] uppercase font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> WAUFLE AI REPORT:
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Real-time Verified</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-zinc-100">{queryResponse}</p>
          </div>
        )}
      </div>

      {/* 2. Visual Analytics: Category Breakdown Donut / Progress visual */}
      <div className="rounded-3xl p-5 bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Spending Breakdown by Category
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-white">
            Total: {formatCurrency(totalExpense, settings.defaultCurrency)}
          </span>
        </div>

        {/* Segmented Stacked Bar Visual */}
        <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex border border-zinc-800">
          {sortedCategories.map(([catName, amt]) => {
            const pct = (amt / totalExpense) * 100;
            const categoryObj = CATEGORIES.find((c) => c.name === catName);
            return (
              <div
                key={catName}
                style={{
                  width: `${pct}%`,
                  backgroundColor: categoryObj?.color || '#3b82f6',
                }}
                title={`${catName}: ${pct.toFixed(1)}%`}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              />
            );
          })}
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {sortedCategories.slice(0, 6).map(([catName, amt]) => {
            const pct = Math.round((amt / totalExpense) * 100);
            const categoryObj = CATEGORIES.find((c) => c.name === catName);

            return (
              <div
                key={catName}
                className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: categoryObj?.color || '#3b82f6' }}
                  />
                  <span className="text-xs font-medium text-zinc-200">{catName}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white">
                    {formatCurrency(amt, settings.defaultCurrency)}
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-1.5 font-mono">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI Habit Analysis Cards (Gemini) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            AI Habit Analysis & Observations
          </h3>
          <span className="text-[11px] text-zinc-400">Updated today</span>
        </div>

        {/* Tip banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
          <Flame className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-snug">{smartTip}</p>
        </div>

        {/* Habit cards */}
        <div className="grid grid-cols-1 gap-3">
          {habits.map((habit, idx) => {
            const isWarning = habit.type === 'warning';
            const isPositive = habit.type === 'positive';

            return (
              <div
                key={idx}
                className={`p-4 rounded-3xl border transition shadow-lg ${
                  isWarning
                    ? 'bg-zinc-900 border-rose-500/30'
                    : isPositive
                    ? 'bg-zinc-900 border-emerald-500/30'
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {habit.title}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWarning
                        ? 'bg-rose-500/20 text-rose-300'
                        : isPositive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {habit.impact} Impact
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {habit.description}
                </p>

                <div className="p-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-bold shrink-0">💡 Action:</span>
                  <span className="text-zinc-300">{habit.actionableTip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Monthly Executive AI Report Generation */}
      <div className="rounded-3xl p-5 bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Monthly Executive AI Report
              </h3>
              <p className="text-[11px] text-zinc-400">Comprehensive end-of-month breakdown</p>
            </div>
          </div>

          <button
            disabled={reportLoading}
            onClick={handleGenerateReport}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition active:scale-95"
          >
            {reportLoading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </>
            )}
          </button>
        </div>

        {executiveReport && (
          <div className="space-y-3 pt-2 border-t border-zinc-800 animate-slide-up">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-purple-500/30 text-xs text-zinc-300 space-y-2">
              <p className="font-bold text-white text-sm">
                Executive Overview — October 2026
              </p>
              <p className="leading-relaxed">{executiveReport.executiveSummary}</p>
              <div className="flex items-center gap-4 text-xs font-mono pt-1 text-purple-300">
                <span>Top Category: {executiveReport.topCategory}</span>
                <span>•</span>
                <span>Savings Rate: {executiveReport.savingsRate}%</span>
              </div>
            </div>

            {executiveReport.recommendations && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase text-zinc-400">
                  Key Recommendations for Next Month:
                </span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {executiveReport.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
