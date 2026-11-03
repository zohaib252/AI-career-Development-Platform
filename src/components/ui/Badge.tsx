import React from 'react';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'error';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const badgeStyles: Record<BadgeVariant, string> = {
  neutral:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  accent:
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  success:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  warning:
    'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
  error:
    'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
};

/**
 * Refined status & skill Badge.
 * Designed with quiet Notion/Linear surface tints and WCAG AA text contrast.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0',
        badgeStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && <span className="shrink-0 inline-flex">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
