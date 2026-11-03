import React, { useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hideLabel?: boolean;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

/**
 * Accessible native Select component styled consistently with Input.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hideLabel = false,
      options,
      helperText,
      error,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const descriptionId = `${selectId}-desc`;

    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className={
            hideLabel
              ? 'sr-only'
              : 'block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5'
          }
        >
          {label}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={error || helperText ? descriptionId : undefined}
            className={[
              'w-full min-h-[44px] appearance-none rounded-xl pl-3.5 pr-10 py-2.5 text-sm cursor-pointer',
              'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100',
              'border transition-colors duration-150',
              error
                ? 'border-rose-500 dark:border-rose-400'
                : 'border-slate-200 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>

        {error ? (
          <p
            id={descriptionId}
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
