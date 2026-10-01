import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { ThemeStyle, UserProfile } from '../types';
import { triggerHaptic } from '../utils/formatters';
import { FluidMorphToggle } from '../components/FluidMorphToggle';
import confetti from 'canvas-confetti';
import {
  User,
  Users,
  Palette,
  Bell,
  Lock,
  Smartphone,
  HelpCircle,
  Sparkles,
  Download,
  Upload,
  Share2,
  Cpu,
  ShieldCheck,
  FileText,
  LogOut,
  Plus,
  ChevronRight,
  Check,
  Image as ImageIcon,
  Sliders,
  X,
  CreditCard,
  Building,
  KeyRound,
  Eye,
  RefreshCw,
  Layers,
  SunMedium,
  Compass,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profiles,
    activeProfileId,
    activeProfile,
    addProfile,
    editProfile,
    deleteProfile,
    switchProfile,
    settings,
    updateSettings,
    updateThemeConfig,
    exportToCSV,
    exportDataToJSON,
    importDataFromJSON,
    lockApp,
    showToast,
  } = useFinance();

  // Modals state
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAppLockModalOpen, setIsAppLockModalOpen] = useState(false);
  const [isSupportedAppsOpen, setIsSupportedAppsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isAiProcessingOpen, setIsAiProcessingOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Edit / Add Profile Form state
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileType, setNewProfileType] = useState<'PERSONAL' | 'BUSINESS' | 'FAMILY' | 'FREELANCE'>('PERSONAL');
  const [newProfileColor, setNewProfileColor] = useState('#10b981');

  // Themes state
  const theme = settings.themeConfig;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3D Tilt interactive preview state
  const [tiltPos, setTiltPos] = useState({ x: 0, y: 0 });

  // App Lock PIN input state
  const [tempPin, setTempPin] = useState(settings.pinCode || '1234');

  const handleShareWithFriends = async () => {
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Waufle Wault - Smart Personal Finance',
          text: 'Manage money, scan receipts with Gemini AI, split bills, and track bank accounts locally with Waufle Wault!',
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard! Share it with your friends.');
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateThemeConfig({
        style: 'custom',
        customBackgroundImage: base64,
      });
      triggerHaptic('success');
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      importDataFromJSON(text);
    };
    reader.readAsText(file);
  };

  // Interactive 3D tilt tracking for showcase
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltPos({ x: x * 18, y: -y * 18 });
  };

  const handleMouseLeave = () => {
    setTiltPos({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6 pb-36 max-w-4xl mx-auto px-4 pt-3 select-none">
      {/* 1. Header & User Identity Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Settings & Identity</h2>
          <p className="text-xs text-zinc-400">
            Account profiles, Clear Glass themes, security, and cloud vault
          </p>
        </div>

        <button
          onClick={lockApp}
          className="px-3.5 py-1.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition active:scale-95"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          Lock Vault
        </button>
      </div>

      {/* 2. Connected Google Account & Active Profile Hero Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            Connected Primary Account (Google Identity)
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Synced & Verified
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
            style={{ backgroundColor: activeProfile.avatarColor }}
          >
            {activeProfile.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate flex items-center gap-2">
              {activeProfile.name}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {activeProfile.type}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 truncate">
              {settings.connectedGoogleAccount}
            </p>
            <p className="text-[11px] text-indigo-400 font-medium mt-0.5">
              Current Active Identity • Scopes transactions & accounts
            </p>
          </div>

          <button
            onClick={() => setIsProfilesModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition active:scale-95 border border-zinc-700/60"
          >
            Switch / Edit
          </button>
        </div>
      </div>

      {/* 3. Settings Navigation Menu Grid */}
      <div className="space-y-4">
        {/* Group A: Customization & Appearance */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Appearance & Look
          </span>
          <div className="divide-y divide-zinc-800/80 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
            {/* Themes Item */}
            <div
              onClick={() => setIsThemeModalOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    Themes & Volumetric Glassmorphism
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {theme.style === 'clear-glass' ? 'Clear Glass 3D' : theme.style}
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Adjust frosted glass layer, blur density, alpha transparency & light refraction
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Dark / Light Mode Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Theme Mode</p>
                  <p className="text-[11px] text-zinc-400">Choose system, dark, or light theme</p>
                </div>
              </div>

              <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                {(['dark', 'light', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSettings({ theme: mode })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                      settings.theme === mode
                        ? 'bg-zinc-850 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Group B: Alerts & Security with Fluid Morphing Toggles */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Reminders & App Security
          </span>
          <div className="divide-y divide-zinc-800/80 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
            {/* Payment Reminders & Notifications */}
            <div
              onClick={() => setIsNotificationsModalOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Payment Reminders & Notifications</p>
                  <p className="text-[11px] text-zinc-400">
                    Bill due dates, subscription renewal alerts, budget velocity digests
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* App Lock & Biometrics Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div
                onClick={() => setIsAppLockModalOpen(true)}
                className="flex items-center gap-3.5 cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    App Lock & Biometrics
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        settings.biometricLockEnabled
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {settings.biometricLockEnabled ? 'PIN: ' + (settings.pinCode || '1234') : 'Off'}
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Organic morphing toggle • Hardware fingerprint & 4-digit PIN
                  </p>
                </div>
              </div>

              {/* Fluid Morphing Toggle with Spring Jelly Physics */}
              <FluidMorphToggle
                checked={settings.biometricLockEnabled}
                onChange={(checked) => updateSettings({ biometricLockEnabled: checked })}
                activeColor="#10b981"
                ariaLabel="App Lock Toggle"
              />
            </div>
          </div>
        </div>

        {/* Group C: Data & Backups */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Data, Exports & Cloud
          </span>
          <div className="divide-y divide-zinc-800/80 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
            {/* Export This Month CSV */}
            <div
              onClick={() => exportToCSV(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Export This Month CSV</p>
                  <p className="text-[11px] text-zinc-400">
                    1-tap spreadsheet export of current month's transactions
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                Export <Download className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Backup My Data */}
            <div
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
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Backup My Data</p>
                  <p className="text-[11px] text-zinc-400">
                    Generate encrypted JSON snapshot of accounts, budgets, and bills
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">JSON Backup</span>
            </div>

            {/* Restore from Backup */}
            <label className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Restore from a Backup</p>
                  <p className="text-[11px] text-zinc-400">
                    Import an existing JSON vault file with auto-verification
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-400">Choose File</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Group D: Ecosystem & Knowledge */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Ecosystem & Knowledge
          </span>
          <div className="divide-y divide-zinc-800/80 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
            {/* Supported Apps */}
            <div
              onClick={() => setIsSupportedAppsOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Supported Apps</p>
                  <p className="text-[11px] text-zinc-400">
                    Google Pay, PhonePe, Paytm, Chase, Apple Pay, Monzo, Revolut, etc.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* How Waufle Wault Works */}
            <div
              onClick={() => setIsHowItWorksOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">How Waufle Wault Works</p>
                  <p className="text-[11px] text-zinc-400">
                    Guides for Share-to-Track, AI Scanner, and SplitMoney
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* What's New */}
            <div
              onClick={() => setIsWhatsNewOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    What's New
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">
                      v2.4
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Clear Glass theme, Multi-profile support, Floating Dock
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Share with Friends */}
            <div
              onClick={handleShareWithFriends}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Share with Friends</p>
                  <p className="text-[11px] text-zinc-400">Invite roommates, travel buddies & family</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-400">Share App</span>
            </div>

            {/* AI Processing */}
            <div
              onClick={() => setIsAiProcessingOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">AI Processing (Waufle AI)</p>
                  <p className="text-[11px] text-zinc-400">
                    Gemini 3.8 Flash multimodal engine & zero-training privacy guarantee
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Privacy Policy */}
            <div
              onClick={() => setIsPrivacyPolicyOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Privacy Policy</p>
                  <p className="text-[11px] text-zinc-400">
                    Hardware encryption at rest, local-first data ownership
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Terms of Use */}
            <div
              onClick={() => setIsTermsOpen(true)}
              className="p-4 flex items-center justify-between hover:bg-zinc-850/60 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Terms of Use</p>
                  <p className="text-[11px] text-zinc-400">License, financial disclaimer, and rights</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition" />
            </div>

            {/* Log Out */}
            <div
              onClick={() => {
                if (confirm('Lock and disconnect your current active session?')) {
                  lockApp();
                }
              }}
              className="p-4 flex items-center justify-between hover:bg-rose-500/10 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-400">Log Out & Lock Session</p>
                  <p className="text-[11px] text-zinc-500">
                    Disconnect {settings.connectedGoogleAccount} on this device
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SUB-MODALS & MATERIAL LABORATORY                                  */}
      {/* ================================================================= */}

      {/* 1. Themes & Volumetric Glass Material Lab Modal */}
      {isThemeModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-zinc-100 flex flex-col max-h-[88vh] overflow-hidden animate-modal-enter">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 pb-3 border-b border-zinc-800 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    Volumetric Glassmorphism & Themes
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Octane 3D material depth, variable frost density, and refraction control
                  </p>
                </div>
                <button onClick={() => setIsThemeModalOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                {/* Interactive 3D Backplate Text Readability Showcase */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Live Material Readability & Refraction Showcase
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Move mouse for 3D tilt</span>
                  </div>

                  {/* Showcase Panel with Gradient Backplate and Frosted Foreground Layer */}
                  <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      perspective: '1000px',
                    }}
                    className="relative h-44 rounded-3xl overflow-hidden p-4 flex flex-col justify-between border border-white/20 select-none shadow-2xl"
                  >
                    {/* Backplate Colorful Texture & Shapes */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-500 opacity-90" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-400 rounded-full blur-2xl" />

                    {/* Backplate High-Contrast Typography to demonstrate transparency */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-center pointer-events-none opacity-40">
                      <span className="font-mono text-3xl font-black text-black/50 tracking-tighter">
                        WAUFLE VAULT 8K
                      </span>
                      <span className="font-mono text-xs text-white/70">
                        LATENCY: 0.12ms • ISO 20022 COMPLIANT • HARDWARE ENCLAVE
                      </span>
                    </div>

                    {/* Frosted Glass Layer over the backplate: low-frost shifting into dense milky diffusion */}
                    <div
                      style={{
                        backdropFilter: `blur(${theme.backgroundBlur}px) saturate(200%)`,
                        WebkitBackdropFilter: `blur(${theme.backgroundBlur}px) saturate(200%)`,
                        backgroundColor: `rgba(255, 255, 255, ${theme.glassOpacity || 0.15})`,
                        transform: `rotateX(${tiltPos.y}deg) rotateY(${tiltPos.x}deg)`,
                        transition: 'transform 0.12s ease-out',
                        boxShadow: `inset 0 1.5px 2px rgba(255,255,255,${(theme.refractionIndex || 1.3) * 0.4}), 0 16px 36px rgba(0,0,0,0.5)`,
                      }}
                      className="relative z-10 w-full h-full rounded-2xl p-4 flex flex-col justify-between border border-white/30 text-white"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-md border border-white/30">
                          Frosted Dispersion Index: {(theme.refractionIndex || 1.3).toFixed(2)}
                        </span>
                        <span className="text-[11px] font-extrabold font-mono text-white drop-shadow">
                          Blur: {theme.backgroundBlur}px
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          Razor-Sharp Typography Through Volumetric Glass
                        </h4>
                        <p className="text-[11px] text-white/95 font-medium drop-shadow leading-snug">
                          High-legibility typography tested through variable milky diffusion and ambient reflections.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Material Adjustment Sliders */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Physical Material Sliders
                  </span>

                  {/* Variable Blur Density */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-semibold">Frosted Blur Density</span>
                      <span className="font-mono text-indigo-400 font-bold">{theme.backgroundBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={theme.backgroundBlur}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateThemeConfig({ backgroundBlur: val });
                      }}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>0px (Crystal Clear Glass)</span>
                      <span>20px (Balanced)</span>
                      <span>40px (Dense Milky)</span>
                    </div>
                  </div>

                  {/* Translucency / Opacity Slider (Adjusts glass transparency across all cards and dock) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-semibold">Frosted Glass Translucency & Solidness</span>
                      <span className="font-mono text-indigo-400 font-bold">
                        {Math.round((theme.glassOpacity !== undefined ? theme.glassOpacity : 0.62) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.08"
                      max="0.98"
                      step="0.01"
                      value={theme.glassOpacity !== undefined ? theme.glassOpacity : 0.62}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateThemeConfig({ glassOpacity: val });
                      }}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
                      <span>8% (Translucent • See Under Dock)</span>
                      <span>50% (Balanced)</span>
                      <span>98% (Solid / High Contrast)</span>
                    </div>
                  </div>

                  {/* Refraction Index */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-semibold">Specular Light Refraction Index</span>
                      <span className="font-mono text-indigo-400 font-bold">
                        {(theme.refractionIndex || 1.3).toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="1.6"
                      step="0.02"
                      value={theme.refractionIndex || 1.3}
                      onChange={(e) => updateThemeConfig({ refractionIndex: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-zinc-400">Theme Presets</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'clear-glass',
                        name: 'Clear Glass',
                        badge: 'Volumetric Octane',
                        desc: 'Frosted glassmorphism, continuous squircle, light refraction & soft shadows',
                      },
                      {
                        id: 'emerald',
                        name: 'Emerald Vault',
                        badge: 'Material You',
                        desc: 'Clean Android Material 3 dynamic emerald palette with high contrast',
                      },
                      {
                        id: 'cyberpunk',
                        name: 'Cyberpunk Neon',
                        badge: 'Vibrant Matrix',
                        desc: 'High-voltage fuchsia and cyan accents with high-glow edges',
                      },
                      {
                        id: 'sunset',
                        name: 'Sunset Horizon',
                        badge: 'Warm Ember',
                        desc: 'Deep warm amber, coral and terracotta tones with radiant gradients',
                      },
                      {
                        id: 'obsidian',
                        name: 'Obsidian Pure',
                        badge: 'AMOLED Black',
                        desc: 'Pitch black #000000 true AMOLED surfaces with titanium borders & zero battery drain',
                      },
                    ].map((th) => {
                      const isSelected = theme.style === th.id;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => {
                            const newStyle = th.id as ThemeStyle;
                            updateThemeConfig({ style: newStyle });
                            updateSettings({ themeConfig: { ...theme, style: newStyle } });
                            triggerHaptic('medium');
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden active:scale-95 ${
                            isSelected
                              ? 'bg-zinc-800 border-indigo-400 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-400'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{th.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                          </div>
                          <span className="text-[10px] font-mono text-indigo-300 block mb-1">
                            {th.badge}
                          </span>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {th.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Theme: Color Wheel & Custom Background Image */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      Color Wheel & Photo Wallpaper
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateThemeConfig({ style: 'custom' });
                        updateSettings({ themeConfig: { ...theme, style: 'custom' } });
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        theme.style === 'custom'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      Activate Custom
                    </button>
                  </div>

                  {/* Color Wheel picker */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                        Custom Color Wheel
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.customPrimaryColor || '#10b981'}
                          onChange={(e) => {
                            updateThemeConfig({
                              style: 'custom',
                              customPrimaryColor: e.target.value,
                            });
                          }}
                          className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <span className="font-mono text-zinc-300 text-xs">
                          {theme.customPrimaryColor || '#10b981'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">
                        Upload Photo Wallpaper
                      </label>
                      <label className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 text-xs text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Choose Picture</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Crazy Animations switch with Fluid Morph Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                    <div>
                      <p className="text-xs font-bold text-white">Crazy UI Animations</p>
                      <p className="text-[10px] text-zinc-400">
                        60fps spring jelly motion, refraction shimmers, 3D tilt
                      </p>
                    </div>
                    <FluidMorphToggle
                      checked={theme.crazyAnimations}
                      onChange={(checked) => updateThemeConfig({ crazyAnimations: checked })}
                      activeColor="#6366f1"
                      ariaLabel="Crazy Animations Toggle"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Modal Footer: Above everything with z-30 inside portal z-[100] */}
              <div className="sticky bottom-0 p-4 border-t border-zinc-800 bg-zinc-900/98 backdrop-blur-2xl shrink-0 z-30 flex items-center justify-between gap-3 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setIsThemeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({
                      themeConfig: { ...theme },
                    });
                    triggerHaptic('success');
                    try {
                      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
                    } catch (e) {}
                    showToast('Theme preferences successfully saved and applied!');
                    setIsThemeModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save & Apply Theme
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2. Profiles Modal */}
      {isProfilesModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[90vh] overflow-y-auto animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-white">Account Profiles</h3>
                  <p className="text-xs text-zinc-400">
                    Switch or create personas for Personal, Business, Family
                  </p>
                </div>
                <button onClick={() => setIsProfilesModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profiles list */}
              <div className="space-y-2">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfileId;
                  return (
                    <div
                      key={prof.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                        isActive
                          ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        onClick={() => switchProfile(prof.id)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-sm"
                          style={{ backgroundColor: prof.avatarColor }}
                        >
                          {prof.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            {prof.name}
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                Active
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {prof.type} • {prof.email || settings.connectedGoogleAccount}
                          </p>
                        </div>
                      </div>

                      {profiles.length > 1 && !prof.isPrimary && (
                        <button
                          onClick={() => deleteProfile(prof.id)}
                          className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Create New Profile */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase text-zinc-400">Create New Profile Persona</span>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="e.g. Freelance Design, Vacation Fund"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newProfileType}
                      onChange={(e) => setNewProfileType(e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-2.5 text-xs text-white"
                    >
                      <option value="PERSONAL">Personal</option>
                      <option value="BUSINESS">Business</option>
                      <option value="FAMILY">Family</option>
                      <option value="FREELANCE">Freelance</option>
                    </select>

                    <div className="flex items-center gap-1.5 px-2">
                      {['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewProfileColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-6 h-6 rounded-full transition ${
                            newProfileColor === col ? 'ring-2 ring-white scale-110' : 'opacity-60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!newProfileName.trim()}
                    onClick={() => {
                      addProfile({
                        name: newProfileName.trim(),
                        type: newProfileType,
                        avatarColor: newProfileColor,
                        email: settings.connectedGoogleAccount,
                      });
                      setNewProfileName('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Profile
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 3. Notifications & Payment Reminders Modal with Fluid Morph Toggles */}
      {isNotificationsModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Payment Reminders & Alerts
                </h3>
                <button onClick={() => setIsNotificationsModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'paymentRemindersEnabled',
                    label: 'Payment Reminders',
                    desc: 'Notify 2 days before bills & loan EMIs are due',
                  },
                  {
                    key: 'upcomingSubscriptionAlerts',
                    label: 'Upcoming Subscription Renewals',
                    desc: 'Alerts before recurring streaming and software subscriptions renew',
                  },
                  {
                    key: 'budgetThresholdAlerts',
                    label: 'Budget Overrun Alerts',
                    desc: 'Real-time alert when category spending reaches 80% and 100%',
                  },
                  {
                    key: 'creditCardDueAlerts',
                    label: 'Credit Card Due Alerts',
                    desc: 'Notifications on statement cycle closure and payment deadline',
                  },
                  {
                    key: 'hapticFeedbackEnabled',
                    label: 'Tactile Haptic Feedback',
                    desc: 'Subtle device vibration pulses on button presses and transactions',
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <div className="pr-3">
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-400">{item.desc}</p>
                    </div>
                    <FluidMorphToggle
                      checked={(settings.notifications as any)[item.key]}
                      onChange={(checked) => {
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            [item.key]: checked,
                          },
                        });
                      }}
                      activeColor="#f59e0b"
                      ariaLabel={item.label}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsNotificationsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition active:scale-95"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 4. App Lock & Biometrics Modal */}
      {isAppLockModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  App Lock & Security
                </h3>
                <button onClick={() => setIsAppLockModalOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div>
                    <p className="text-xs font-bold text-white">Biometric / PIN Screen Lock</p>
                    <p className="text-[10px] text-zinc-400">Require fingerprint or PIN to open app</p>
                  </div>
                  <FluidMorphToggle
                    checked={settings.biometricLockEnabled}
                    onChange={(checked) => updateSettings({ biometricLockEnabled: checked })}
                    activeColor="#10b981"
                    ariaLabel="App Lock Toggle"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">
                    4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={tempPin}
                    onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-sm font-mono text-center tracking-widest text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">
                    Auto-Lock Inactivity Timeout
                  </label>
                  <select
                    value={settings.autoLockMinutes}
                    onChange={(e) => updateSettings({ autoLockMinutes: parseInt(e.target.value) })}
                    className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-white"
                  >
                    <option value={1}>Immediately (1 minute)</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (tempPin.length === 4) {
                    updateSettings({ pinCode: tempPin });
                    triggerHaptic('success');
                  }
                  setIsAppLockModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg transition active:scale-95"
              >
                Save Security Settings
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 5. Supported Apps Modal */}
      {isSupportedAppsOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[85vh] overflow-y-auto animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  Supported Apps & Share Intent
                </h3>
                <button onClick={() => setIsSupportedAppsOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Waufle Wault integrates with your favorite banking and payment apps via Android Share
                Intent, screenshot OCR, and SMS text copy:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Google Pay (UPI / NFC)', region: 'Global / India' },
                  { name: 'PhonePe & Paytm', region: 'India (UPI)' },
                  { name: 'Apple Pay & Wallet', region: 'Global' },
                  { name: 'Chase Mobile & SMS', region: 'United States' },
                  { name: 'Monzo & Revolut', region: 'UK / Europe' },
                  { name: 'CashApp & Venmo', region: 'United States' },
                  { name: 'HDFC, ICICI & SBI', region: 'India' },
                  { name: 'American Express & Citi', region: 'Global' },
                ].map((app, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <p className="font-bold text-white">{app.name}</p>
                    <p className="text-[10px] text-zinc-500">{app.region}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300">
                💡 <strong>Pro Tip:</strong> After paying, tap <em>Share Receipt</em> in any payment
                app and select <strong>Waufle Wault</strong> to extract details in 0.5s!
              </div>

              <button
                onClick={() => setIsSupportedAppsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition active:scale-95"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 6. How Waufle Wault Works Modal */}
      {isHowItWorksOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[85vh] overflow-y-auto animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  How Waufle Wault Works
                </h3>
                <button onClick={() => setIsHowItWorksOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <h4 className="font-bold text-white text-sm mb-1">1. Share-to-Track</h4>
                  <p>
                    Got a payment confirmation notification or screenshot? Share it into Waufle Wault.
                    Our AI extracts merchant, amount, category, and date. You review and confirm with one tap.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <h4 className="font-bold text-white text-sm mb-1">2. Multimodal Receipt OCR</h4>
                  <p>
                    Snap a photo of physical restaurant bills, supermarket receipts, or PDF statements.
                    Gemini 2.5 Flash extracts itemized line items, taxes, and suggested categories.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <h4 className="font-bold text-white text-sm mb-1">3. SplitMoney with QR Settlement</h4>
                  <p>
                    Create group bills, split equally or by percentage, and generate real payment QR codes
                    (UPI/PayPal) so friends can pay you back instantly.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <h4 className="font-bold text-white text-sm mb-1">4. Local-First Hardware Security</h4>
                  <p>
                    All transactions and balances stay on your phone, encrypted at rest. Cloud sync to Google
                    Drive is 100% user-controlled and optional.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs shadow-lg transition active:scale-95"
              >
                Got It!
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 7. What's New Modal */}
      {isWhatsNewOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[85vh] overflow-y-auto animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  What's New in v2.4
                </h3>
                <button onClick={() => setIsWhatsNewOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-pink-500/30">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">New Feature</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">Volumetric Clear Glass Theme & Lab</h4>
                  <p className="text-zinc-400 mt-1">
                    High-fidelity 3D frosted glass, realistic light refraction highlights, soft ambient
                    shadows, and live backplate text readability showcase.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">New Feature</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">Fluid Morphing Toggles</h4>
                  <p className="text-zinc-400 mt-1">
                    Spring-physics motion with organic horizontal stretching handles and 60fps micro-interactions.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Upgrade</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">Floating Navigation Dock</h4>
                  <p className="text-zinc-400 mt-1">
                    Replaced standard bottom dock with an elevated, squircle frosted glass capsule dock.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWhatsNewOpen(false)}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
              >
                Awesome!
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 8. AI Processing & Privacy Modal */}
      {isAiProcessingOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  AI Processing (Waufle AI)
                </h3>
                <button onClick={() => setIsAiProcessingOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <p>
                  <strong>Multimodal Engine:</strong> Waufle Wault leverages the high-speed Gemini AI
                  model to extract structured transactions from images, statement tables, and speech transcripts.
                </p>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  🔒 <strong>Zero Training Guarantee:</strong> Your financial data, receipts, and account balances
                  are processed strictly at runtime and are <strong>NEVER used to train models</strong>.
                </div>
                <p>
                  <strong>Server-Side Proxy:</strong> All AI requests are handled securely via backend proxy
                  endpoints with no API keys exposed to the client.
                </p>
              </div>

              <button
                onClick={() => setIsAiProcessingOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition active:scale-95"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 9. Privacy Policy Modal */}
      {isPrivacyPolicyOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[85vh] overflow-y-auto animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Privacy Policy & Local-First Charter
                </h3>
                <button onClick={() => setIsPrivacyPolicyOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. Data Sovereignty:</strong> You own your data. Waufle Wault is architected local-first.
                  All records, accounts, and budgets are stored in your encrypted browser/device sandbox.
                </p>
                <p>
                  <strong>2. No Third-Party Telemetry:</strong> We do not deploy third-party trackers, ad cookies,
                  or user behavior analytics.
                </p>
                <p>
                  <strong>3. Cloud Sync:</strong> Google Drive sync is completely optional and user-controlled.
                  Backup archives are stored solely in your personal Google Drive account.
                </p>
              </div>

              <button
                onClick={() => setIsPrivacyPolicyOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition active:scale-95"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* 10. Terms of Use Modal */}
      {isTermsOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-100 space-y-4 max-h-[85vh] overflow-y-auto animate-modal-enter">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-400" />
                  Terms of Use
                </h3>
                <button onClick={() => setIsTermsOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. Financial Disclaimer:</strong> Waufle Wault is a personal bookkeeping and financial
                  productivity tool. It does not provide certified financial, legal, or investment advice.
                </p>
                <p>
                  <strong>2. User Responsibility:</strong> Users are responsible for verifying transactions,
                  splits, and settlements before initiating payments through external banking apps.
                </p>
                <p>
                  <strong>3. Service Availability:</strong> Waufle Wault functions fully offline. AI features
                  depend on network access and Gemini API availability.
                </p>
              </div>

              <button
                onClick={() => setIsTermsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition active:scale-95"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
