import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic,
  Moon,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trophy,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useCareer } from '../../context/CareerContext';
import { ScreenId } from '../../types/career';
import { Button } from '../ui';

interface NavEntry {
  id: ScreenId;
  label: string;
  shortLabel: string;
  stepNumber?: number;
  icon: React.ReactNode;
  isComplete?: (ctx: ReturnType<typeof useCareer>['state']) => boolean;
}

const NAV_ITEMS: NavEntry[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
  },
  {
    id: 'job-title',
    label: 'Target Role',
    shortLabel: 'Role',
    stepNumber: 1,
    icon: <Compass className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => Boolean(s.targetRole?.title),
  },
  {
    id: 'cv',
    label: 'CV Studio',
    shortLabel: 'CV',
    stepNumber: 2,
    icon: <FileText className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => Boolean(s.cv),
  },
  {
    id: 'preferences',
    label: 'Preferences',
    shortLabel: 'Prefs',
    stepNumber: 3,
    icon: <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => Boolean(s.preferences),
  },
  {
    id: 'jobs',
    label: 'Job Results',
    shortLabel: 'Jobs',
    stepNumber: 4,
    icon: <Briefcase className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => s.savedJobs.length > 0,
  },
  {
    id: 'saved-jobs',
    label: 'Saved Board',
    shortLabel: 'Board',
    stepNumber: 5,
    icon: <Kanban className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => s.savedJobs.length > 0,
  },
  {
    id: 'interview',
    label: 'Mock Interview',
    shortLabel: 'Interview',
    stepNumber: 6,
    icon: <Mic className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => s.reports.length > 0,
  },
  {
    id: 'report',
    label: 'Final Report',
    shortLabel: 'Report',
    stepNumber: 7,
    icon: <Trophy className="w-4 h-4" aria-hidden="true" />,
    isComplete: (s) => s.reports.length > 0,
  },
];

// Mobile bottom bar shows 5 primary destinations + "More" trigger in mobile header
const MOBILE_TABS: ScreenId[] = ['dashboard', 'cv', 'jobs', 'saved-jobs', 'interview'];

/**
 * Responsive Application Shell
 * - Desktop: Left 256px sidebar + contextual top bar
 * - Mobile: Compact 52px top bar + 60px bottom navigation bar (<=15% sticky height cap)
 * - Print: Marked `.no-print` so CV and Report PDFs print cleanly without chrome
 */
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    state,
    theme,
    toggleTheme,
    activeScreen,
    navigate,
    signOut,
    storageError,
    clearStorageError,
  } = useCareer();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const completedSteps = NAV_ITEMS.filter(
    (item) => item.stepNumber && item.isComplete?.(state)
  ).length;
  const totalSteps = 7;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const currentNav = NAV_ITEMS.find((n) => n.id === activeScreen) || NAV_ITEMS[0];

  const getNextRecommendedAction = (): { label: string; target: ScreenId } => {
    if (!state.targetRole) return { label: 'Choose Target Role', target: 'job-title' };
    if (!state.cv) return { label: 'Build Your CV', target: 'cv' };
    if (!state.preferences) return { label: 'Set Preferences', target: 'preferences' };
    if (state.savedJobs.length === 0) return { label: 'Browse Jobs', target: 'jobs' };
    if (state.reports.length === 0) return { label: 'Start Mock Interview', target: 'interview' };
    return { label: 'View Final Report', target: 'report' };
  };

  const nextAction = getNextRecommendedAction();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-indigo-600 focus:text-white no-print"
      >
        Skip to main content
      </a>

      {/* ====================================================================
          DESKTOP SIDEBAR (md and up)
          ==================================================================== */}
      <aside
        aria-label="Primary Sidebar Navigation"
        className="hidden md:flex md:w-64 lg:w-68 shrink-0 flex-col border-r border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/95 sticky top-0 h-screen no-print"
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              CareerPilot
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Graduate Journey Progress Summary */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Career Readiness
            </span>
            <span className="font-mono-num font-semibold text-indigo-600 dark:text-indigo-400">
              {completedSteps}/{totalSteps}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ transform: `scaleX(${progressPercent / 100})` }}
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            const done = item.isComplete?.(state);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'w-full min-h-[42px] px-3 py-2 rounded-xl flex items-center justify-between gap-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer',
                  isActive
                    ? 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
                ].join(' ')}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className={
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 shrink-0'
                        : 'text-slate-400 dark:text-slate-500 shrink-0'
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </span>

                {item.id === 'saved-jobs' && state.savedJobs.length > 0 ? (
                  <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
                    {state.savedJobs.length}
                  </span>
                ) : done ? (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-label="Completed"
                  />
                ) : item.stepNumber ? (
                  <span className="font-mono-num text-[11px] text-slate-400 dark:text-slate-600">
                    0{item.stepNumber}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {state.user?.fullName || 'Graduate'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {state.targetRole?.title || state.user?.university || 'Class of 2026'}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MOBILE TOP BAR (< md, height 52px)
          ==================================================================== */}
      <header className="md:hidden sticky top-0 z-30 h-[52px] px-4 flex items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            CareerPilot
          </span>
        </button>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {currentNav.label}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open full navigation menu"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT AREA + DESKTOP CONTEXTUAL TOP BAR
          ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="hidden md:flex h-16 px-8 items-center justify-between gap-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-20 no-print">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Workspace
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {currentNav.label}
            </span>
            {state.targetRole && (
              <>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {state.targetRole.title}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeScreen !== nextAction.target && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(nextAction.target)}
              >
                {nextAction.label}
              </Button>
            )}
          </div>
        </header>

        {/* Storage Error Recovery Banner (if localStorage reported an issue) */}
        {storageError && (
          <div
            role="alert"
            className="mx-4 sm:mx-8 mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 no-print"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>{storageError}</span>
            </div>
            <button
              type="button"
              onClick={clearStorageError}
              className="font-semibold underline whitespace-nowrap cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Screen Viewport */}
        <main
          id="main-workspace"
          className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 print-container"
        >
          {children}
        </main>
      </div>

      {/* ====================================================================
          MOBILE BOTTOM NAVIGATION BAR (< md, height 60px)
          ==================================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[60px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center px-1 no-print"
      >
        {MOBILE_TABS.map((tabId) => {
          const entry = NAV_ITEMS.find((n) => n.id === tabId)!;
          const isActive = activeScreen === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => navigate(entry.id)}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400',
              ].join(' ')}
            >
              {entry.icon}
              <span className="text-[10px] leading-tight whitespace-nowrap">
                {entry.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ====================================================================
          MOBILE FULL JOURNEY DRAWER (Action Sheet)
          ==================================================================== */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All CareerPilot Screens"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end no-print"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Graduate Journey ({completedSteps}/{totalSteps})
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Jump directly to any CareerPilot step
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = activeScreen === item.id;
                const done = item.isComplete?.(state);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigate(item.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={[
                      'min-h-[46px] px-4 py-2.5 rounded-xl flex items-center justify-between text-sm font-medium cursor-pointer',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    {done && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                        aria-label="Completed"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Signed in as {state.user?.fullName}
              </span>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => {
                  setMobileDrawerOpen(false);
                  signOut();
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
