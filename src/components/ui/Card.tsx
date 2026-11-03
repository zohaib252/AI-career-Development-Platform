import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * Single-elevation SaaS surface Card.
 * Uses subtle 1px hairline border and optional hover lift (compositor-only transform).
 */
export const Card: React.FC<CardProps> = ({
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={[
        'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800',
        interactive
          ? 'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md motion-reduce:transition-none motion-reduce:transform-none'
          : '',
        paddingMap[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};
