import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { TopAppBar } from './components/TopAppBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { SpeedDialFAB } from './components/SpeedDialFAB';
import { HomeView } from './views/HomeView';
import { TransactionsView } from './views/TransactionsView';
import { SplitView } from './views/SplitView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { ShareToTrackModal } from './components/ShareToTrackModal';
import { VoiceExpenseModal } from './components/VoiceExpenseModal';
import { StatementBatchModal } from './components/StatementBatchModal';
import { AccountModal } from './components/AccountModal';
import { BiometricLockScreen } from './components/BiometricLockScreen';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from './types';

// Theme-Matching Toast Notification with Exit Animation
interface ToastItemProps {
  toast: ToastMessage;
  themeStyle: string;
  customColor?: string;
  isLight: boolean;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  themeStyle,
  customColor,
  isLight,
  onDismiss,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3400);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 360);
  };

  // Determine styling based on theme
  const getThemeToastClass = () => {
    if (isLight) {
      if (toast.type === 'warning') return 'bg-white/95 text-amber-900 border-amber-300 shadow-xl backdrop-blur-xl';
      if (toast.type === 'info') return 'bg-white/95 text-sky-900 border-sky-300 shadow-xl backdrop-blur-xl';
      return 'bg-white/95 text-slate-800 border-slate-200/90 shadow-xl backdrop-blur-xl';
    }

    if (themeStyle === 'clear-glass') {
      if (toast.type === 'warning')
        return 'bg-amber-950/75 text-amber-200 border-amber-500/40 backdrop-blur-2xl shadow-[0_0_24px_rgba(245,158,11,0.25)]';
      if (toast.type === 'info')
        return 'bg-sky-950/75 text-sky-200 border-sky-500/40 backdrop-blur-2xl shadow-[0_0_24px_rgba(14,165,233,0.25)]';
      return 'clear-glass-card text-emerald-300 border-white/35 backdrop-blur-2xl shadow-[0_0_30px_rgba(99,102,241,0.32)]';
    }

    if (themeStyle === 'cyberpunk') {
      return 'bg-zinc-950/95 text-fuchsia-300 border-fuchsia-500/60 shadow-[0_0_26px_rgba(236,72,153,0.4)] backdrop-blur-xl';
    }

    if (themeStyle === 'sunset') {
      return 'bg-zinc-950/95 text-amber-300 border-amber-500/60 shadow-[0_0_26px_rgba(245,158,11,0.4)] backdrop-blur-xl';
    }

    if (themeStyle === 'obsidian') {
      return 'bg-black text-zinc-100 border-zinc-700/80 shadow-2xl shadow-black';
    }

    if (themeStyle === 'custom' && customColor) {
      return 'bg-zinc-900/95 text-zinc-100 backdrop-blur-xl shadow-xl';
    }

    // Emerald / Default
    if (toast.type === 'warning') return 'bg-amber-950/90 text-amber-200 border-amber-600/40';
    if (toast.type === 'info') return 'bg-sky-950/90 text-sky-200 border-sky-600/40';
    return 'bg-zinc-900/95 text-emerald-300 border-emerald-500/45 shadow-[0_0_24px_rgba(16,185,129,0.3)]';
  };

  return (
    <div
      style={{
        borderColor:
          themeStyle === 'custom' && customColor
            ? customColor + '90'
            : undefined,
        boxShadow:
          themeStyle === 'custom' && customColor
            ? `0 0 25px 2px ${customColor}40`
            : undefined,
      }}
      className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold backdrop-blur-xl transition-all duration-300 ${
        isLeaving ? 'animate-toast-exit' : 'animate-slide-up'
      } ${getThemeToastClass()}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        {toast.type === 'warning' ? (
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
        ) : toast.type === 'info' ? (
          <Info className="w-4 h-4 shrink-0 text-sky-400" />
        ) : (
          <CheckCircle2
            className="w-4 h-4 shrink-0 text-emerald-400"
            style={{
              color:
                themeStyle === 'custom' && customColor
                  ? customColor
                  : undefined,
            }}
          />
        )}
        <span className="truncate">{toast.message}</span>
      </div>
      <button
        onClick={handleClose}
        className="p-1 rounded-lg text-zinc-400 hover:text-white shrink-0 transition active:scale-90"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { toasts, removeToast, settings, resolvedTheme } = useFinance();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const theme = settings.themeConfig;

  // Modal open states
  const [isManualTxOpen, setIsManualTxOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isShareToTrackOpen, setIsShareToTrackOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isStatementBatchOpen, setIsStatementBatchOpen] = useState(false);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);

  const isGlass = theme.style === 'clear-glass' || theme.style === 'custom';
  const isLight = resolvedTheme === 'light';

  return (
    <div
      style={{
        ['--glass-blur' as any]: `${theme.backgroundBlur}px`,
        ['--glass-opacity' as any]:
          theme.glassOpacity !== undefined ? theme.glassOpacity : 0.62,
        ['--glass-refraction' as any]: theme.glassRefractionEnabled ? '1.5px' : '0px',
      }}
      className={`relative min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-300 overflow-x-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-slate-100 text-slate-900 theme-light'
          : 'bg-zinc-950 text-zinc-100 theme-dark'
      } ${isGlass ? 'theme-clear-glass' : `theme-${theme.style}`}`}
    >
      {/* Dynamic Custom Background Image (if set by user) */}
      {theme.customBackgroundImage && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url(${theme.customBackgroundImage})`,
            filter: `blur(${theme.backgroundBlur}px) brightness(${isLight ? 0.9 : 0.6})`,
            transform: 'scale(1.08)',
          }}
        />
      )}

      {/* Volumetric Refraction Gradient Blobs for Clear Glass 3D Octane look */}
      {(theme.style === 'clear-glass' || theme.style === 'custom') && !isLight && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-35">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-emerald-600/25 rounded-full blur-[90px]" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-600/25 rounded-full blur-[90px]" />
        </div>
      )}

      {/* 1. Biometric Lock Screen */}
      <BiometricLockScreen />

      {/* 2. Top Android App Bar */}
      <div className="relative z-30">
        <TopAppBar onOpenNewAccount={() => setIsNewAccountOpen(true)} />
      </div>

      {/* 3. Main Views Content with smooth tab navigation entrance */}
      <main className="flex-1 w-full overflow-y-auto">
        <div key={activeTab} className="animate-tab-enter">
          {activeTab === 'home' && (
            <HomeView
              onOpenManualTx={() => setIsManualTxOpen(true)}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenShareToTrack={() => setIsShareToTrackOpen(true)}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView onOpenManualTx={() => setIsManualTxOpen(true)} />
          )}

          {activeTab === 'split' && <SplitView />}

          {activeTab === 'insights' && <InsightsView />}

          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* 4. Speed Dial FAB (Cleanly elevated above the floating navigation dock) */}
      <SpeedDialFAB
        onOpenManual={() => setIsManualTxOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenShareToTrack={() => setIsShareToTrackOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenStatementBatch={() => setIsStatementBatchOpen(true)}
        onOpenSplitBill={() => {
          setActiveTab('split');
        }}
      />

      {/* 5. Floating Navigation Dock (Pinned and always visible) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* 6. Modals */}
      <TransactionModal
        isOpen={isManualTxOpen}
        onClose={() => setIsManualTxOpen(false)}
      />

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <ShareToTrackModal
        isOpen={isShareToTrackOpen}
        onClose={() => setIsShareToTrackOpen(false)}
      />

      <VoiceExpenseModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <StatementBatchModal
        isOpen={isStatementBatchOpen}
        onClose={() => setIsStatementBatchOpen(false)}
      />

      <AccountModal
        isOpen={isNewAccountOpen}
        onClose={() => setIsNewAccountOpen(false)}
      />

      {/* 7. Theme-Matching Toast Notifications with exit animations */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            themeStyle={theme.style}
            customColor={theme.customPrimaryColor}
            isLight={isLight}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
