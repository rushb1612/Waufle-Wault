export type AccountType = 
  | 'Cash' 
  | 'Bank' 
  | 'Credit Card' 
  | 'Savings' 
  | 'Investment' 
  | 'Crypto' 
  | 'Wallet';

export interface Currency {
  code: string; // e.g. 'USD', 'INR', 'EUR', 'GBP'
  symbol: string; // '$', '₹', '€', '£'
  name: string;
  flag: string; // '🇺🇸', '🇮🇳', '🇪🇺', '🇬🇧'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color: string; // hex color for card/icon
  iconName: string;
  isArchived?: boolean;
  creditLimit?: number; // for Credit Card
  statementDay?: number; // e.g. 15th of month
  dueDate?: number; // e.g. 5th of next month
  apr?: number; // interest rate
  accountNumberMasked?: string; // e.g. '•••• 4821'
  profileId?: string; // scoped to specific profile (or global)
  connectedBank?: string; // e.g. 'Chase Open Banking API'
  lastBankSync?: string;
}

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string; // if transfer
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  tags?: string[];
  splitGroupId?: string;
  splitExpenseId?: string;
  profileId?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string; // 'ALL' or specific category
  limitAmount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  alertThreshold: number; // e.g. 0.8 for 80%
  profileId?: string;
}

export interface SplitMember {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  upiIdOrHandle?: string; // for QR settlement
}

export interface SplitExpense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
  shares: Record<string, number>; // memberId -> share amount or ratio
  date: string;
  notes?: string;
}

export interface SplitSettlement {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  method?: string; // 'UPI', 'Cash', 'Bank Transfer', 'PayPal'
}

export interface SplitGroup {
  id: string;
  name: string;
  description: string;
  avatarColor: string;
  members: SplitMember[];
  expenses: SplitExpense[];
  settlements: SplitSettlement[];
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  merchant: string;
  amount: number;
  currencyCode: string;
  accountId: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'QUARTERLY';
  nextBillingDate: string; // YYYY-MM-DD
  category: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  reminderDaysBefore: number;
  iconName?: string;
  profileId?: string;
}

export interface EMILoan {
  id: string;
  name: string;
  lender: string;
  principal: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureMonths: number;
  emiAmount: number;
  startDate: string; // YYYY-MM-DD
  category?: 'Home Loan' | 'Car Loan' | 'Personal Loan' | 'Education Loan' | 'Gadget EMI';
  profileId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  type: 'PERSONAL' | 'BUSINESS' | 'FAMILY' | 'FREELANCE';
  avatarUrl?: string;
  avatarColor: string;
  email?: string;
  isPrimary?: boolean;
}

export type ThemeStyle = 
  | 'clear-glass' // Volumetric glassmorphism, continuous curvature squircle, frosted glass, 3D refraction glow
  | 'emerald'     // Material You Emerald
  | 'cyberpunk'   // Neon Matrix
  | 'aurora'      // Aurora Borealis
  | 'sunset'      // Sunset Horizon
  | 'obsidian'    // AMOLED Pure Black
  | 'custom';     // Custom Color Wheel + Custom Background Image

export interface ThemeConfig {
  style: ThemeStyle;
  customPrimaryColor?: string; // Hex color from color wheel
  customAccentColor?: string;  // Hex color
  customBackgroundImage?: string; // Base64 or URL
  backgroundBlur: number; // 0 to 48px
  glassOpacity?: number; // 0.05 to 0.8
  refractionIndex?: number; // 1.0 to 1.6
  glassRefractionEnabled: boolean;
  crazyAnimations: boolean;
}

export interface NotificationSettings {
  paymentRemindersEnabled: boolean;
  upcomingSubscriptionAlerts: boolean;
  dailyVelocityDigest: boolean;
  budgetThresholdAlerts: boolean;
  creditCardDueAlerts: boolean;
  hapticFeedbackEnabled: boolean;
}

export interface UserSettings {
  defaultCurrency: Currency;
  theme: 'dark' | 'light' | 'system';
  themeConfig: ThemeConfig;
  biometricLockEnabled: boolean;
  pinCode?: string;
  autoLockMinutes: number;
  driveSyncEnabled: boolean;
  lastSyncDate?: string;
  userName: string;
  userEmail: string;
  connectedGoogleAccount: string;
  hideBalancesOnLaunch: boolean;
  notifications: NotificationSettings;
}

export interface ScannedReceiptData {
  merchant: string;
  amount: number;
  currency: string;
  date: string;
  suggestedCategory: string;
  items?: Array<{ name: string; price: number; qty?: number }>;
  tax?: number;
  paymentMethod?: string;
  confidence?: number;
  notes?: string;
}

export interface AIHabitObservation {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  type: 'warning' | 'positive' | 'neutral';
  description: string;
  actionableTip: string;
}
