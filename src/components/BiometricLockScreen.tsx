import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { triggerHaptic } from '../utils/formatters';
import { ShieldCheck, Fingerprint, Lock, Delete, KeyRound, Sparkles } from 'lucide-react';

export const BiometricLockScreen: React.FC = () => {
  const { isLocked, unlockApp, settings } = useFinance();
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    triggerHaptic('light');
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    triggerHaptic('light');
    setPin((prev) => prev.slice(0, -1));
  };

  const verify = (enteredPin: string) => {
    const success = unlockApp(enteredPin);
    if (!success) {
      setErrorShake(true);
      triggerHaptic('warning');
      setTimeout(() => {
        setPin('');
        setErrorShake(false);
      }, 500);
    }
  };

  const handleBiometricTap = () => {
    triggerHaptic('medium');
    // Simulate Android Biometric Prompt
    setTimeout(() => {
      unlockApp(settings.pinCode || '1234');
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-between p-6 select-none animate-fadeIn">
      {/* Top Branding */}
      <div className="w-full pt-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-2xl mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Waufle Wault</h1>
        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          Hardware-Encrypted Secure Vault
        </p>
      </div>

      {/* Center PIN Indicators & Biometric Sensor */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-6">
        {/* Biometric Icon Sensor */}
        <button
          onClick={handleBiometricTap}
          className="relative group p-4 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 transition shadow-2xl shadow-emerald-500/10 active:scale-95"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-30" />
          <Fingerprint className="w-12 h-12 text-emerald-400 group-hover:scale-105 transition" />
        </button>

        <p className="text-xs text-zinc-400 font-medium">
          Touch sensor or enter 4-digit PIN
        </p>

        {/* 4-digit PIN Dots */}
        <div className={`flex items-center justify-center gap-4 ${errorShake ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-400/50'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs pb-6">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 active:bg-zinc-800 border border-zinc-800/80 text-xl font-bold font-mono text-zinc-100 flex items-center justify-center transition active:scale-95"
            >
              {digit}
            </button>
          ))}

          <button
            onClick={handleBiometricTap}
            className="h-16 rounded-2xl bg-zinc-900/40 hover:bg-zinc-850 active:bg-zinc-800 text-emerald-400 flex items-center justify-center transition"
            title="Biometric Fingerprint"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-zinc-900/80 hover:bg-zinc-850 active:bg-zinc-800 border border-zinc-800/80 text-xl font-bold font-mono text-zinc-100 flex items-center justify-center transition active:scale-95"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-zinc-900/40 hover:bg-zinc-850 active:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            Demo default PIN: <span className="font-mono text-zinc-400 font-bold">1234</span>
          </p>
        </div>
      </div>
    </div>
  );
};
