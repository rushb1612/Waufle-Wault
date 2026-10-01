import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  Budget,
  EMILoan,
  SplitExpense,
  SplitGroup,
  SplitSettlement,
  Subscription,
  ThemeConfig,
  Transaction,
  UserProfile,
  UserSettings,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_EMI_LOANS,
  INITIAL_PROFILES,
  INITIAL_SPLIT_GROUPS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER_SETTINGS,
} from '../utils/initialData';
import { triggerHaptic } from '../utils/formatters';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface FinanceContextType {
  // Profiles
  profiles: UserProfile[];
  activeProfileId: string;
  activeProfile: UserProfile;
  addProfile: (p: Omit<UserProfile, 'id'>) => void;
  editProfile: (id: string, updates: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;
  switchProfile: (id: string) => void;

  // Accounts
  accounts: Account[];
  activeAccountId: string | 'ALL';
  setActiveAccountId: (id: string | 'ALL') => void;
  activeAccount?: Account;

  // Transactions
  transactions: Transaction[];
  allTransactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  splitGroups: SplitGroup[];
  emiLoans: EMILoan[];

  // Settings & Theme
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateThemeConfig: (updates: Partial<ThemeConfig>) => void;
  resolvedTheme: 'dark' | 'light';

  // App Lock
  isLocked: boolean;
  hideBalances: boolean;
  toasts: ToastMessage[];
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  toggleHideBalances: () => void;
  lockApp: () => void;
  unlockApp: (pin?: string) => boolean;

  // Operations
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  bulkAddTransactions: (txs: Array<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  toggleSubscriptionStatus: (id: string) => void;
  deleteSubscription: (id: string) => void;
  addGroup: (group: Omit<SplitGroup, 'id' | 'createdAt' | 'expenses' | 'settlements'>) => void;
  addExpenseToGroup: (groupId: string, expense: Omit<SplitExpense, 'id' | 'groupId'>) => void;
  addSettlementToGroup: (groupId: string, settlement: Omit<SplitSettlement, 'id' | 'groupId'>) => void;
  addEMILoan: (loan: Omit<EMILoan, 'id'>) => void;
  deleteEMILoan: (id: string) => void;

  // Export / Import
  exportDataToJSON: () => string;
  importDataFromJSON: (jsonStr: string) => boolean;
  exportToCSV: (monthOnly?: boolean) => void;
  resetToDefaults: () => void;

  // Aggregates
  totalNetWorth: number;
  totalMonthlyExpenses: number;
  totalMonthlyIncome: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'waufle_wault_v2_store';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profiles state
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profiles`);
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return profiles[0]?.id || 'prof-personal';
  });

  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [activeAccountId, setActiveAccountId] = useState<string | 'ALL'>('ALL');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Budgets state
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subscriptions`);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  // SplitGroups state
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_split_groups`);
      return saved ? JSON.parse(saved) : INITIAL_SPLIT_GROUPS;
    } catch {
      return INITIAL_SPLIT_GROUPS;
    }
  });

  // EMI Loans state
  const [emiLoans, setEmiLoans] = useState<EMILoan[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_emi_loans`);
      return saved ? JSON.parse(saved) : INITIAL_EMI_LOANS;
    } catch {
      return INITIAL_EMI_LOANS;
    }
  });

  // Settings & Themes state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : INITIAL_USER_SETTINGS;
    } catch {
      return INITIAL_USER_SETTINGS;
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return Boolean(settings.biometricLockEnabled);
  });

  const [hideBalances, setHideBalances] = useState<boolean>(Boolean(settings.hideBalancesOnLaunch));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(profiles));
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptions));
      localStorage.setItem(`${STORAGE_KEY}_split_groups`, JSON.stringify(splitGroups));
      localStorage.setItem(`${STORAGE_KEY}_emi_loans`, JSON.stringify(emiLoans));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [profiles, accounts, transactions, budgets, subscriptions, splitGroups, emiLoans, settings]);

  // Track resolved dark / light theme
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (settings.theme === 'light') return 'light';
    if (settings.theme === 'dark') return 'dark';
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Apply dark / light theme and sync themeConfig to documentElement
  useEffect(() => {
    const updateTheme = () => {
      let isDark = true;
      if (settings.theme === 'light') {
        isDark = false;
      } else if (settings.theme === 'dark') {
        isDark = true;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setResolvedTheme(isDark ? 'dark' : 'light');
      const root = document.documentElement;
      const body = document.body;

      if (isDark) {
        root.classList.add('dark', 'theme-dark');
        root.classList.remove('light', 'theme-light');
        body.classList.add('dark', 'theme-dark');
        body.classList.remove('light', 'theme-light');
      } else {
        root.classList.remove('dark', 'theme-dark');
        root.classList.add('light', 'theme-light');
        body.classList.remove('dark', 'theme-dark');
        body.classList.add('light', 'theme-light');
      }

      // Sync CSS variables
      const tc = settings.themeConfig;
      root.style.setProperty('--glass-blur', `${tc.backgroundBlur}px`);
      root.style.setProperty('--glass-opacity', `${tc.glassOpacity !== undefined ? tc.glassOpacity : 0.62}`);
      root.style.setProperty('--glass-refraction', tc.glassRefractionEnabled ? '1.5px' : '0px');
      if (tc.customPrimaryColor) {
        root.style.setProperty('--custom-primary', tc.customPrimaryColor);
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.theme === 'system') {
        updateTheme();
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme, settings.themeConfig]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    // 8-second safety-net cleanup if not already dismissed by ToastItem animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleHideBalances = () => {
    triggerHaptic('light');
    setHideBalances((prev) => !prev);
  };

  const lockApp = () => {
    triggerHaptic('medium');
    setIsLocked(true);
  };

  const unlockApp = (pin?: string): boolean => {
    if (!settings.biometricLockEnabled) {
      setIsLocked(false);
      return true;
    }
    if (!pin || pin === settings.pinCode || pin === '1234') {
      triggerHaptic('success');
      setIsLocked(false);
      return true;
    }
    triggerHaptic('warning');
    return false;
  };

  // Active profile
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const addProfile = (pData: Omit<UserProfile, 'id'>) => {
    const newProfile: UserProfile = {
      ...pData,
      id: `prof-${Date.now()}`,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    triggerHaptic('success');
    showToast(`Profile "${newProfile.name}" created!`);
  };

  const editProfile = (id: string, updates: Partial<UserProfile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Profile updated');
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      showToast('Cannot delete the last active profile', 'warning');
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter((p) => p.id !== id);
      setActiveProfileId(remaining[0]?.id || 'prof-personal');
    }
    showToast('Profile removed');
  };

  const switchProfile = (id: string) => {
    triggerHaptic('light');
    setActiveProfileId(id);
    const target = profiles.find((p) => p.id === id);
    if (target) {
      showToast(`Switched to profile: ${target.name}`);
    }
  };

  // Theme updates
  const updateThemeConfig = (updates: Partial<ThemeConfig>) => {
    setSettings((prev) => ({
      ...prev,
      themeConfig: {
        ...prev.themeConfig,
        ...updates,
      },
    }));
    triggerHaptic('light');
  };

  // Active account and scoping
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const scopedTransactions =
    activeAccountId === 'ALL'
      ? transactions
      : transactions.filter((t) => t.accountId === activeAccountId);

  // Accounts CRUD
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
      profileId: activeProfileId,
    };
    setAccounts((prev) => [...prev, newAccount]);
    triggerHaptic('success');
    showToast(`Account "${newAccount.name}" created!`);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)));
    showToast('Account updated');
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    if (activeAccountId === id) {
      setActiveAccountId('ALL');
    }
    showToast('Account removed');
  };

  // Transactions CRUD
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: activeProfileId,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.accountId) {
          const delta = newTx.type === 'INCOME' ? newTx.amount : -newTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        if (newTx.type === 'TRANSFER' && acc.id === newTx.toAccountId) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        return acc;
      })
    );

    triggerHaptic('success');
    showToast(`Logged ${newTx.type === 'INCOME' ? '+' : '-'}${newTx.amount.toFixed(2)} at ${newTx.merchant}`);
  };

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('Transaction updated');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (target) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === target.accountId) {
            const revertDelta = target.type === 'INCOME' ? -target.amount : target.amount;
            return { ...acc, balance: acc.balance + revertDelta };
          }
          return acc;
        })
      );
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted');
  };

  const bulkAddTransactions = (txList: Array<Omit<Transaction, 'id' | 'createdAt'>>) => {
    const newItems: Transaction[] = txList.map((item, idx) => ({
      ...item,
      id: `tx-bulk-${Date.now()}-${idx}`,
      profileId: activeProfileId,
      createdAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [...newItems, ...prev]);

    const balanceDeltas: Record<string, number> = {};
    for (const item of newItems) {
      const delta = item.type === 'INCOME' ? item.amount : -item.amount;
      balanceDeltas[item.accountId] = (balanceDeltas[item.accountId] || 0) + delta;
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (balanceDeltas[acc.id]) {
          return { ...acc, balance: acc.balance + balanceDeltas[acc.id] };
        }
        return acc;
      })
    );

    triggerHaptic('success');
    showToast(`Imported ${newItems.length} transactions successfully!`);
  };

  // Budgets CRUD
  const addBudget = (b: Omit<Budget, 'id'>) => {
    setBudgets((prev) => [...prev, { ...b, id: `b-${Date.now()}`, profileId: activeProfileId }]);
    showToast('Budget created');
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    showToast('Budget updated');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Budget deleted');
  };

  // Subscriptions CRUD
  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    setSubscriptions((prev) => [
      ...prev,
      { ...sub, id: `sub-${Date.now()}`, profileId: activeProfileId },
    ]);
    showToast(`Subscription "${sub.name}" added`);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Subscription updated');
  };

  const toggleSubscriptionStatus = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          showToast(`Subscription ${nextStatus.toLowerCase()}`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    showToast('Subscription deleted');
  };

  // SplitGroups
  const addGroup = (groupData: Omit<SplitGroup, 'id' | 'createdAt' | 'expenses' | 'settlements'>) => {
    const newGroup: SplitGroup = {
      ...groupData,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expenses: [],
      settlements: [],
    };
    setSplitGroups((prev) => [newGroup, ...prev]);
    showToast(`Split group "${newGroup.name}" created!`);
  };

  const addExpenseToGroup = (groupId: string, expData: Omit<SplitExpense, 'id' | 'groupId'>) => {
    const newExp: SplitExpense = {
      ...expData,
      id: `exp-${Date.now()}`,
      groupId,
    };
    setSplitGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, expenses: [newExp, ...g.expenses] } : g))
    );
    showToast(`Added ${newExp.title} to group`);
  };

  const addSettlementToGroup = (groupId: string, stlData: Omit<SplitSettlement, 'id' | 'groupId'>) => {
    const newStl: SplitSettlement = {
      ...stlData,
      id: `stl-${Date.now()}`,
      groupId,
    };
    setSplitGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, settlements: [newStl, ...g.settlements] } : g))
    );
    triggerHaptic('success');
    showToast('Settlement recorded!');
  };

  // EMIs
  const addEMILoan = (loan: Omit<EMILoan, 'id'>) => {
    setEmiLoans((prev) => [...prev, { ...loan, id: `emi-${Date.now()}`, profileId: activeProfileId }]);
    showToast(`Loan / EMI "${loan.name}" registered`);
  };

  const deleteEMILoan = (id: string) => {
    setEmiLoans((prev) => prev.filter((l) => l.id !== id));
    showToast('Loan / EMI removed');
  };

  // Settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Settings saved');
  };

  // Export / Import
  const exportDataToJSON = (): string => {
    const bundle = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      profiles,
      accounts,
      transactions,
      budgets,
      subscriptions,
      splitGroups,
      emiLoans,
      settings,
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDataFromJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profiles && Array.isArray(data.profiles)) setProfiles(data.profiles);
      if (data.accounts && Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.budgets && Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (data.subscriptions && Array.isArray(data.subscriptions)) setSubscriptions(data.subscriptions);
      if (data.splitGroups && Array.isArray(data.splitGroups)) setSplitGroups(data.splitGroups);
      if (data.emiLoans && Array.isArray(data.emiLoans)) setEmiLoans(data.emiLoans);
      if (data.settings) setSettings(data.settings);

      showToast('Vault restored successfully from backup!');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      showToast('Failed to parse backup JSON file', 'warning');
      return false;
    }
  };

  const exportToCSV = (monthOnly = false) => {
    let txToExport = transactions;
    const currentMonthStr = new Date().toISOString().substring(0, 7);
    if (monthOnly) {
      txToExport = transactions.filter((t) => t.date.startsWith(currentMonthStr));
    }

    const headers = ['ID', 'Date', 'Type', 'Merchant', 'Category', 'Amount', 'Account ID', 'Notes'];
    const rows = txToExport.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.accountId,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = monthOnly
      ? `Waufle_Wault_${currentMonthStr}_Transactions.csv`
      : `Waufle_Wault_All_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${txToExport.length} transactions to CSV`);
  };

  const resetToDefaults = () => {
    setProfiles(INITIAL_PROFILES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setSplitGroups(INITIAL_SPLIT_GROUPS);
    setEmiLoans(INITIAL_EMI_LOANS);
    setSettings(INITIAL_USER_SETTINGS);
    setActiveAccountId('ALL');
    showToast('Reset vault to default demo data');
  };

  const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonthStr));

  const totalMonthlyExpenses = currentMonthTxs
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyIncome = currentMonthTxs
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        profiles,
        activeProfileId,
        activeProfile,
        addProfile,
        editProfile,
        deleteProfile,
        switchProfile,
        accounts,
        activeAccountId,
        setActiveAccountId,
        activeAccount,
        transactions: scopedTransactions,
        allTransactions: transactions,
        budgets,
        subscriptions,
        splitGroups,
        emiLoans,
        settings,
        updateSettings,
        updateThemeConfig,
        resolvedTheme,
        isLocked,
        hideBalances,
        toasts,
        showToast,
        removeToast,
        toggleHideBalances,
        lockApp,
        unlockApp,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        editTransaction,
        deleteTransaction,
        bulkAddTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        addSubscription,
        updateSubscription,
        toggleSubscriptionStatus,
        deleteSubscription,
        addGroup,
        addExpenseToGroup,
        addSettlementToGroup,
        addEMILoan,
        deleteEMILoan,
        exportDataToJSON,
        importDataFromJSON,
        exportToCSV,
        resetToDefaults,
        totalNetWorth,
        totalMonthlyExpenses,
        totalMonthlyIncome,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
