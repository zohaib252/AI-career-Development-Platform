import React from 'react';

export interface SkeletonProps {
  className?: string;
}

/**
 * Accessible Skeleton Loader block for smooth loading states across screens.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse motion-reduce:animate-none rounded-xl bg-slate-200/80 dark:bg-slate-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
};

export const ScreenSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
  return (
    <div role="status" aria-label="Loading content" className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
          >
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-28 mt-2" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
