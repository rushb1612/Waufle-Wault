import React, { useState } from 'react';
import { triggerHaptic } from '../utils/formatters';

interface FluidMorphToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export const FluidMorphToggle: React.FC<FluidMorphToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  activeColor = '#10b981', // emerald default
  size = 'md',
  ariaLabel = 'Toggle setting',
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);

  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('light');
    setIsMorphing(true);
    onChange(!checked);
    setTimeout(() => {
      setIsMorphing(false);
    }, 380);
  };

  // Dimensions based on size
  const dimensions = {
    sm: { track: 'w-10 h-6 p-0.5', thumb: 'w-5 h-5', translate: 'translate-x-4' },
    md: { track: 'w-12 h-7 p-1', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-8 p-1', thumb: 'w-6 h-6', translate: 'translate-x-6' },
  }[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleToggle}
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      onMouseLeave={() => setIsPressing(false)}
      onTouchStart={() => setIsPressing(true)}
      onTouchEnd={() => setIsPressing(false)}
      style={{
        backgroundColor: checked ? activeColor : 'rgba(39, 39, 42, 0.9)',
        boxShadow: checked
          ? `0 0 16px -2px ${activeColor}80, inset 0 1px 1px rgba(255,255,255,0.4)`
          : 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(255,255,255,0.06)',
      }}
      className={`relative inline-flex items-center rounded-full transition-colors duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer select-none border border-white/10 ${
        dimensions.track
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
    >
      {/* Dynamic stretch morphing handle */}
      <span
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
        className={`inline-block rounded-full bg-white transition-all duration-350 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform ${
          dimensions.thumb
        } ${checked ? dimensions.translate : 'translate-x-0'} ${
          isMorphing
            ? 'scale-x-[1.45] scale-y-[0.82] rounded-[14px]'
            : isPressing
            ? 'scale-x-[1.25] scale-y-[0.9]'
            : 'scale-100'
        }`}
      />
    </button>
  );
};
