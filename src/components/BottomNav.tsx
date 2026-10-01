import React from 'react';
import { triggerHaptic } from '../utils/formatters';
import {
  Home,
  ReceiptText,
  Users,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export type NavTab = 'home' | 'transactions' | 'split' | 'insights' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { settings } = useFinance();
  const theme = settings.themeConfig;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Ledger', icon: ReceiptText },
    { id: 'split', label: 'SplitMoney', icon: Users },
    { id: 'insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Dynamic glow color based on theme
  const getGlowColor = () => {
    if (theme.style === 'clear-glass') return 'rgba(99, 102, 241, 0.25)';
    if (theme.style === 'cyberpunk') return 'rgba(236, 72, 153, 0.35)';
    if (theme.style === 'aurora') return 'rgba(6, 182, 212, 0.35)';
    if (theme.style === 'sunset') return 'rgba(249, 115, 22, 0.35)';
    if (theme.style === 'custom' && theme.customPrimaryColor) return theme.customPrimaryColor + '40';
    return 'rgba(16, 185, 129, 0.3)';
  };

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-40 px-3 flex justify-center pointer-events-none select-none">
      {/* Floating Navigation Dock Capsule (Always pinned and visible on screen) */}
      <nav
        style={{
          boxShadow: `0 20px 45px -8px rgba(0, 0, 0, 0.75), 0 0 35px 2px ${getGlowColor()}, inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)`,
          backgroundColor:
            theme.style === 'clear-glass' || theme.style === 'custom'
              ? `rgba(12, 16, 28, ${theme.glassOpacity !== undefined ? Math.max(0.08, theme.glassOpacity) : 0.75})`
              : undefined,
          backdropFilter: `blur(${theme.backgroundBlur ?? 30}px) saturate(220%)`,
          WebkitBackdropFilter: `blur(${theme.backgroundBlur ?? 30}px) saturate(220%)`,
        }}
        className={`pointer-events-auto max-w-md w-full px-2.5 py-1.5 rounded-full flex items-center justify-around transition-all duration-300 transform ${
          theme.style === 'clear-glass' || theme.style === 'custom'
            ? 'floating-glass-dock'
            : 'bg-zinc-900/85 backdrop-blur-2xl border border-white/20'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onChangeTab(tab.id as NavTab);
              }}
              className="relative flex-1 flex flex-col items-center justify-center py-1 transition group active:scale-90"
            >
              {/* Active Pill Indicator with Volumetric Refraction */}
              <div
                className={`relative px-4 py-1.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-tr from-white/20 to-white/5 text-white shadow-inner border border-white/30 scale-105'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : ''
                  }`}
                  style={{
                    color: isActive
                      ? theme.style === 'custom' && theme.customPrimaryColor
                        ? theme.customPrimaryColor
                        : theme.style === 'clear-glass'
                        ? '#38bdf8'
                        : undefined
                      : undefined,
                  }}
                />

                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                )}
              </div>

              <span
                className={`text-[9px] font-semibold mt-0.5 tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-white font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
