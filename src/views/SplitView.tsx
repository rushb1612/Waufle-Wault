import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, generateQRSVG, triggerHaptic } from '../utils/formatters';
import { SplitGroup, SplitMember } from '../types';
import confetti from 'canvas-confetti';
import {
  Users,
  Plus,
  QrCode,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  DollarSign,
  Share2,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const SplitView: React.FC = () => {
  const { splitGroups, addGroup, addExpenseToGroup, addSettlementToGroup, settings } = useFinance();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(splitGroups[0]?.id || '');
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [settlementModalData, setSettlementModalData] = useState<{
    member: SplitMember;
    amount: number;
    group: SplitGroup;
  } | null>(null);

  // New Group state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newMembersText, setNewMembersText] = useState('Alex, Sam, Jordan');

  // Add Expense state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [paidBy, setPaidBy] = useState('mem-me');

  const selectedGroup = splitGroups.find((g) => g.id === selectedGroupId) || splitGroups[0];

  // Calculate member balances for the selected group
  // Net balance = (total paid for group) - (total share of expenses) + (settlements received) - (settlements paid)
  const calculateBalances = (group: SplitGroup) => {
    if (!group) return {};
    const balances: Record<string, number> = {};
    group.members.forEach((m) => (balances[m.id] = 0));

    // Factor expenses
    for (const exp of group.expenses) {
      // Who paid gets credited
      balances[exp.paidByMemberId] = (balances[exp.paidByMemberId] || 0) + exp.amount;

      // Deduct each member's share
      const memberCount = group.members.length;
      const equalShare = exp.amount / memberCount;

      group.members.forEach((m) => {
        const share = exp.shares[m.id] !== undefined ? exp.shares[m.id] : equalShare;
        balances[m.id] = (balances[m.id] || 0) - share;
      });
    }

    // Factor settlements
    for (const stl of group.settlements) {
      balances[stl.fromMemberId] = (balances[stl.fromMemberId] || 0) + stl.amount;
      balances[stl.toMemberId] = (balances[stl.toMemberId] || 0) - stl.amount;
    }

    return balances;
  };

  const currentBalances = selectedGroup ? calculateBalances(selectedGroup) : {};
  const myBalance = currentBalances['mem-me'] || 0;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    triggerHaptic('success');
    const membersList: SplitMember[] = [
      { id: 'mem-me', name: 'You (Host)', avatarColor: '#3b82f6', upiIdOrHandle: 'vault.user@okhdfcbank' },
      ...newMembersText
        .split(',')
        .map((name, i) => ({
          id: `mem-${Date.now()}-${i}`,
          name: name.trim(),
          avatarColor: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 4],
          upiIdOrHandle: `${name.trim().toLowerCase().replace(/\s+/g, '')}@upi`,
        }))
        .filter((m) => m.name.length > 0),
    ];

    addGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Shared Group',
      avatarColor: '#10b981',
      members: membersList,
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setIsNewGroupModalOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!amount || !expenseTitle.trim() || !selectedGroup) return;

    triggerHaptic('success');
    const sharePerMember = amount / selectedGroup.members.length;
    const shares: Record<string, number> = {};
    selectedGroup.members.forEach((m) => {
      shares[m.id] = sharePerMember;
    });

    addExpenseToGroup(selectedGroup.id, {
      title: expenseTitle.trim(),
      amount,
      paidByMemberId: paidBy,
      splitType: 'EQUAL',
      shares,
      date: new Date().toISOString().split('T')[0],
    });

    setExpenseTitle('');
    setExpenseAmount('');
    setIsAddExpenseModalOpen(false);
  };

  const handleSettleUp = (member: SplitMember, amount: number) => {
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    addSettlementToGroup(selectedGroup.id, {
      fromMemberId: member.id,
      toMemberId: 'mem-me',
      amount: Math.abs(amount),
      date: new Date().toISOString().split('T')[0],
      method: 'UPI / QR Scan',
    });

    setSettlementModalData(null);
  };

  return (
    <div className="space-y-6 pb-36 max-w-4xl mx-auto px-4 pt-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            SplitMoney
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Bill Split & Friends
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Share expenses, split bills equally or by shares & settle with QR code
          </p>
        </div>

        <button
          onClick={() => setIsNewGroupModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          New Group
        </button>
      </div>

      {/* Net Balance Hero Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Your Split Status in "{selectedGroup?.name || 'Group'}"
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              myBalance > 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : myBalance < 0
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {myBalance > 0 ? 'You are owed' : myBalance < 0 ? 'You owe' : 'Settled'}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <h3
            className={`text-3xl font-extrabold font-mono ${
              myBalance > 0
                ? 'text-emerald-400'
                : myBalance < 0
                ? 'text-rose-400'
                : 'text-zinc-300'
            }`}
          >
            {myBalance >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(myBalance), settings.defaultCurrency)}
          </h3>
        </div>
      </div>

      {/* Group Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {splitGroups.map((group) => {
          const isSelected = selectedGroup?.id === group.id;
          return (
            <button
              key={group.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedGroupId(group.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {group.name}
            </button>
          );
        })}
      </div>

      {/* Group Detail Section */}
      {selectedGroup && (
        <div className="space-y-4">
          {/* Member Balance Ledger */}
          <div className="rounded-3xl p-5 bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Members & Settlement Matrix ({selectedGroup.members.length})
              </h3>
              <button
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bill Split
              </button>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {selectedGroup.members.map((member) => {
                const bal = currentBalances[member.id] || 0;
                const isMe = member.id === 'mem-me';

                return (
                  <div key={member.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {member.name}
                          {isMe && (
                            <span className="text-[10px] text-zinc-500 font-normal">(You)</span>
                          )}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {bal > 0.01
                            ? `Gets back ${formatCurrency(bal, settings.defaultCurrency)}`
                            : bal < -0.01
                            ? `Owes ${formatCurrency(Math.abs(bal), settings.defaultCurrency)}`
                            : 'Fully Settled'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Settle / QR button */}
                    {!isMe && Math.abs(bal) > 0.01 && (
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setSettlementModalData({
                            member,
                            amount: bal,
                            group: selectedGroup,
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-indigo-300 flex items-center gap-1.5 transition active:scale-95 border border-zinc-700/60"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Settle Up
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Expenses History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Group Activity & History ({selectedGroup.expenses.length} bills,{' '}
              {selectedGroup.settlements.length} settlements)
            </h3>

            <div className="divide-y divide-zinc-800/80 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
              {selectedGroup.expenses.map((exp) => {
                const paidByMember = selectedGroup.members.find((m) => m.id === exp.paidByMemberId);
                return (
                  <div key={exp.id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                        🧾
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{exp.title}</p>
                        <p className="text-[11px] text-zinc-400">
                          Paid by {paidByMember?.name || 'Someone'} • {exp.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">
                      ${exp.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}

              {selectedGroup.settlements.map((stl) => {
                const fromMem = selectedGroup.members.find((m) => m.id === stl.fromMemberId);
                const toMem = selectedGroup.members.find((m) => m.id === stl.toMemberId);
                return (
                  <div key={stl.id} className="p-3.5 flex items-center justify-between bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-300">
                          {fromMem?.name} settled with {toMem?.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">{stl.date} • via {stl.method}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${stl.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settle Up QR Code Modal */}
      {settlementModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 flex flex-col items-center text-center space-y-4">
            <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Payment & Settlement QR
              </span>
              <button
                onClick={() => setSettlementModalData(null)}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Settle with {settlementModalData.member.name}
              </h3>
              <p className="text-xs text-zinc-400">
                Amount to settle:
              </p>
              <p className="text-2xl font-mono font-extrabold text-emerald-400">
                ${Math.abs(settlementModalData.amount).toFixed(2)}
              </p>
            </div>

            {/* Generated QR Code SVG */}
            <div className="p-4 bg-white rounded-3xl shadow-xl flex items-center justify-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: generateQRSVG(
                    `upi://pay?pa=${settlementModalData.member.upiIdOrHandle || 'settle@upi'}&am=${Math.abs(
                      settlementModalData.amount
                    )}&pn=${encodeURIComponent(settlementModalData.member.name)}`,
                    180
                  ),
                }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 max-w-xs font-mono">
              Scan with GPay, PhonePe, Paytm, CashApp or UPI to settle
            </p>

            <button
              onClick={() => handleSettleUp(settlementModalData.member, settlementModalData.amount)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Settled (Celebration 🎉)
            </button>
          </div>
        </div>
      )}

      {/* Add Split Bill Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Add Split Expense</h3>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Title / What for</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Dinner at Dishoom, Airbnb Cabin"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                >
                  {selectedGroup.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                Split equally among all {selectedGroup.members.length} members (
                {expenseAmount
                  ? `$${(parseFloat(expenseAmount) / selectedGroup.members.length).toFixed(2)} each`
                  : 'calculated automatically'}
                ).
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
              >
                Save Group Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Create New Split Group</h3>
              <button
                onClick={() => setIsNewGroupModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Kyoto Trip, Apartment 4B"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Description</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Shared expenses for hotel & food"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Friend Names (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMembersText}
                  onChange={(e) => setNewMembersText(e.target.value)}
                  placeholder="Liam, Maya, David"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
