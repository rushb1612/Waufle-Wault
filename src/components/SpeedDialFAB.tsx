import React, { useState } from 'react';
import { triggerHaptic } from '../utils/formatters';
import {
  Plus,
  X,
  Camera,
  Smartphone,
  Mic,
  FileSpreadsheet,
  Users,
  Edit3,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface SpeedDialFABProps {
  onOpenManual: () => void;
  onOpenScanner: () => void;
  onOpenShareToTrack: () => void;
  onOpenVoice: () => void;
  onOpenStatementBatch: () => void;
  onOpenSplitBill: () => void;
}

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({
  onOpenManual,
  onOpenScanner,
  onOpenShareToTrack,
  onOpenVoice,
  onOpenStatementBatch,
  onOpenSplitBill,
}) => {
  const { settings } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const theme = settings.themeConfig;
  const isGlass = theme.style === 'clear-glass' || theme.style === 'custom';

  const toggleOpen = () => {
    triggerHaptic('medium');
    setIsOpen((prev) => !prev);
  };

  const handleAction = (callback: () => void) => {
    triggerHaptic('light');
    setIsOpen(false);
    callback();
  };

  const actions = [
    {
      label: 'Manual Entry',
      icon: Edit3,
      color: 'bg-zinc-800/90 text-white hover:bg-zinc-700',
      action: onOpenManual,
    },
    {
      label: 'AI Receipt Scanner',
      icon: Camera,
      color: 'bg-emerald-600/90 text-white hover:bg-emerald-500 shadow-emerald-500/25',
      action: onOpenScanner,
    },
    {
      label: 'Share-to-Track',
      icon: Smartphone,
      color: 'bg-amber-600/90 text-white hover:bg-amber-500 shadow-amber-500/25',
      action: onOpenShareToTrack,
    },
    {
      label: 'Voice Note',
      icon: Mic,
      color: 'bg-purple-600/90 text-white hover:bg-purple-500 shadow-purple-500/25',
      action: onOpenVoice,
    },
    {
      label: 'Statement Batch',
      icon: FileSpreadsheet,
      color: 'bg-sky-600/90 text-white hover:bg-sky-500 shadow-sky-500/25',
      action: onOpenStatementBatch,
    },
    {
      label: 'Split Bill',
      icon: Users,
      color: 'bg-indigo-600/90 text-white hover:bg-indigo-500 shadow-indigo-500/25',
      action: onOpenSplitBill,
    },
  ];

  return (
    <>
      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs animate-fadeIn"
        />
      )}

      {/* Speed Dial Menu Container: Positioned safely and cleanly above the floating nav dock with zero hit-box interference */}
      <div className="fixed bottom-[88px] right-4 sm:bottom-24 sm:right-8 z-50 flex flex-col items-end select-none pointer-events-none">
        {/* Expanded Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-3 pointer-events-auto animate-slide-up">
            {actions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAction(item.action)}
                  className="flex items-center gap-3 group active:scale-95 transition"
                >
                  <span className="px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 backdrop-blur-2xl border border-white/20 text-xs font-semibold text-zinc-100 shadow-2xl">
                    {item.label}
                  </span>
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xl border border-white/30 backdrop-blur-2xl transition-all duration-300 group-hover:scale-110 ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Floating Trigger Button: True Frosted Glass Themed with Volumetric Refraction & Continuous Squircle */}
        <button
          onClick={toggleOpen}
          aria-label="Add transaction or action"
          className={`pointer-events-auto w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 border backdrop-blur-2xl shadow-2xl ${
            isOpen
              ? 'glass-fab-btn-open text-zinc-100 rotate-90 scale-95 border-white/40'
              : 'glass-fab-btn text-white hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          )}
        </button>
      </div>
    </>
  );
};
