import React, { useId } from 'react';

export interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

const barToneMap = {
  accent: 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500',
  success: 'bg-emerald-600 dark:bg-emerald-500',
  warning: 'bg-amber-500 dark:bg-amber-400',
  error: 'bg-rose-600 dark:bg-rose-500',
};

/**
 * Animated Horizontal Score / Progress Bar
 * Uses scaleX transform for smooth compositor-friendly animation.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  tone = 'accent',
  size = 'md',
  className = '',
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
          {label && (
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
          )}
          {showValue && (
            <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        className={[
          'w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        ].join(' ')}
      >
        <div
          style={{ transform: `scaleX(${pct / 100})` }}
          className={[
            'h-full w-full origin-left rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none',
            barToneMap[tone],
          ].join(' ')}
        />
      </div>
    </div>
  );
};

export interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

/**
 * Animated SVG Circular Progress Ring
 * Used for CV Score Ring and Final Interview Pass-Chance Ring.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 132,
  strokeWidth = 10,
  label,
  sublabel,
  className = '',
}) => {
  const gradId = useId();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  const getToneColors = () => {
    if (clamped >= 75) return { start: '#4f46e5', end: '#10b981' };
    if (clamped >= 50) return { start: '#4f46e5', end: '#7c3aed' };
    return { start: '#d97706', end: '#e11d48' };
  };

  const colors = getToneColors();

  return (
    <div
      className={['relative inline-flex items-center justify-center shrink-0', className].join(' ')}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Score'}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="font-mono-num text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-none">
          {clamped}%
        </span>
        {label && (
          <span className="mt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{sublabel}</span>
        )}
      </div>
    </div>
  );
};
