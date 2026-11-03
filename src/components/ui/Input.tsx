import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

/**
 * Accessible Input field with required label, helper text, and icon-paired error state
 * (never relies on red border color alone for accessibility).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hideLabel = false,
      helperText,
      error,
      leftAdornment,
      rightAdornment,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const descriptionId = `${inputId}-desc`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={
            hideLabel
              ? 'sr-only'
              : 'block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5'
          }
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {leftAdornment && (
            <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center">
              {leftAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error || helperText ? descriptionId : undefined}
            className={[
              'w-full min-h-[44px] rounded-xl px-3.5 py-2.5 text-sm',
              'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'border transition-colors duration-150',
              error
                ? 'border-rose-500 dark:border-rose-400 focus:border-rose-500'
                : 'border-slate-200 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400',
              leftAdornment ? 'pl-10' : '',
              rightAdornment ? 'pr-11' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {rightAdornment && (
            <div className="absolute right-2 flex items-center">{rightAdornment}</div>
          )}
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

Input.displayName = 'Input';
