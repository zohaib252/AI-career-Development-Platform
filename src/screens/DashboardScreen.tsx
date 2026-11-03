import React from 'react';
import {
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Kanban,
  Mic,
  RotateCcw,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { ScreenId } from '../types/career';
import { scoreCVData } from '../utils/scoringEngine';
import {
  Button,
  Card,
  EmptyState,
  ProgressBar,
  ScreenSkeleton,
  useToast,
} from '../components/ui';

function getTimeGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelativeTime(isoString: string): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

/**
 * Dashboard Screen
 * Displays personalized greeting, interactive 7-step journey stepper,
 * "Continue where you left off" action card, 3 KPI stat cards, and recent activity.
 */
export const DashboardScreen: React.FC = () => {
  const { state, isHydrating, navigate, resetWorkspace } = useCareer();
  const { showToast } = useToast();

  if (isHydrating) {
    return <ScreenSkeleton cards={3} />;
  }

  const firstName = state.user?.fullName.split(' ')[0] || 'Graduate';

  const journeySteps: {
    id: ScreenId;
    label: string;
    done: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'job-title',
      label: 'Job Title',
      done: Boolean(state.targetRole),
      icon: <Compass className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'cv',
      label: 'CV Studio',
      done: Boolean(state.cv),
      icon: <FileText className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'preferences',
      label: 'Preferences',
      done: Boolean(state.preferences),
      icon: <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'jobs',
      label: 'Job Results',
      done: state.savedJobs.length > 0,
      icon: <Briefcase className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'saved-jobs',
      label: 'Saved Board',
      done: state.savedJobs.length > 0,
      icon: <Kanban className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'interview',
      label: 'Mock Interview',
      done: state.reports.length > 0,
      icon: <Mic className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'report',
      label: 'Final Report',
      done: state.reports.length > 0,
      icon: <Trophy className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  // Determine "Continue where you left off" card details
  const determineNextStep = (): {
    stepTag: string;
    title: string;
    description: string;
    ctaLabel: string;
    target: ScreenId;
  } => {
    if (!state.targetRole) {
      return {
        stepTag: 'Step 1 of 7',
        title: 'Choose the graduate role you are aiming for',
        description:
          'Picking your target job title tailors CV keyword checks, job match scores, and mock interview questions.',
        ctaLabel: 'Select Target Role',
        target: 'job-title',
      };
    }
    if (!state.cv) {
      return {
        stepTag: 'Step 2 of 7',
        title: `Build or upload your CV for ${state.targetRole.title}`,
        description:
          'Use our 4-step template builder or drop an existing resume to get an instant rule-based readiness score.',
        ctaLabel: 'Open CV Studio',
        target: 'cv',
      };
    }
    if (!state.preferences) {
      return {
        stepTag: 'Step 3 of 7',
        title: 'Set your work mode, cities, and salary range',
        description:
          'Define whether you want Hybrid, Remote, or On-site opportunities and set your expected compensation.',
        ctaLabel: 'Configure Preferences',
        target: 'preferences',
      };
    }
    if (state.savedJobs.length === 0) {
      return {
        stepTag: 'Step 4 of 7',
        title: `Explore matched ${state.targetRole.title} openings`,
        description:
          'Shortlist roles onto your Kanban board or launch live applications on LinkedIn, Indeed, Glassdoor, and Rozee.',
        ctaLabel: 'View Job Matches',
        target: 'jobs',
      };
    }
    if (state.reports.length === 0) {
      return {
        stepTag: 'Step 6 of 7',
        title: `Practice a voice mock interview for ${state.savedJobs[0].company}`,
        description:
          'Answer spoken interview questions aloud (or by typing) and receive transparent STAR & keyword feedback.',
        ctaLabel: 'Start Mock Interview',
        target: 'interview',
      };
    }
    return {
      stepTag: 'Journey Complete · Keep Practicing',
      title: 'Review your latest Interview Readiness Report',
      description:
        'Inspect per-question STAR breakdowns, track your score trend, or run another mock session to push past 90%.',
      ctaLabel: 'Open Final Report',
      target: 'report',
    };
  };

  const nextMilestone = determineNextStep();

  // Metrics
  const savedCount = state.savedJobs.length;
  const appliedOrFurtherCount = state.savedJobs.filter((j) => j.stage !== 'Saved').length;
  const interviewsCount = state.reports.length;
  const avgInterviewScore =
    interviewsCount > 0
      ? Math.round(
          state.reports.reduce((acc, r) => acc + r.overallScore, 0) / interviewsCount
        )
      : null;

  const cvScore = state.cv
    ? scoreCVData(state.cv, state.targetRole?.keywords || []).overallScore
    : null;

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getTimeGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {state.targetRole
              ? `Targeting ${state.targetRole.title} · ${state.user?.university || 'Graduate Workspace'}`
              : `${state.user?.university || 'Graduate Workspace'} · Let’s map out your first career move`}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />}
          onClick={() => {
            resetWorkspace();
            showToast({
              type: 'info',
              title: 'Workspace reset',
              description: 'All local progress was cleared so you can test a fresh flow.',
            });
          }}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* ====================================================================
          JOURNEY PROGRESS STEPPER
          ==================================================================== */}
      <Card padding="md">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Your 7-Step Career Launchpad
          </h2>
          <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
            {journeySteps.filter((s) => s.done).length} of {journeySteps.length} completed
          </span>
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {journeySteps.map((step, index) => {
            const isNext = step.id === nextMilestone.target && !step.done;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => navigate(step.id)}
                  className={[
                    'w-full min-h-[68px] p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer',
                    step.done
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/70 text-emerald-900 dark:text-emerald-200 hover:border-emerald-300'
                      : isNext
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono-num text-[11px] opacity-75">
                      0{index + 1}
                    </span>
                    {step.done ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                        aria-label="Completed"
                      />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="mt-2 text-xs font-semibold truncate w-full">
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* ====================================================================
          CONTINUE WHERE YOU LEFT OFF HERO CARD
          ==================================================================== */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-indigo-100">{nextMilestone.stepTag}</p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-balance">
            {nextMilestone.title}
          </h2>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            {nextMilestone.description}
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate(nextMilestone.target)}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm inline-flex items-center gap-2 shadow-sm hover:bg-indigo-50 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{nextMilestone.ctaLabel}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ====================================================================
          STAT CARDS (Jobs Saved, Interviews Done, Average Score)
          ==================================================================== */}
      <section aria-label="Key Progress Metrics" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card interactive onClick={() => navigate('saved-jobs')} className="cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Jobs Saved & Tracked</span>
            <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono-num text-3xl font-bold text-slate-900 dark:text-white">
            {savedCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {savedCount === 0
              ? 'No jobs shortlisted yet · Browse openings'
              : `${appliedOrFurtherCount} moved to Applied / Interview stage`}
          </p>
        </Card>

        <Card interactive onClick={() => navigate('interview')} className="cursor-pointer">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Mock Interviews Completed</span>
            <Mic className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
          </div>
          <p className="mt-3 font-mono-num text-3xl font-bold text-slate-900 dark:text-white">
            {interviewsCount}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {interviewsCount === 0
              ? 'Practice aloud with live speech transcription'
              : `Latest: ${state.reports[interviewsCount - 1].company}`}
          </p>
        </Card>

        <Card
          interactive
          onClick={() => navigate(interviewsCount > 0 ? 'report' : 'cv')}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Average Interview Score</span>
            <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-mono-num text-3xl font-bold text-slate-900 dark:text-white">
              {avgInterviewScore !== null ? `${avgInterviewScore}%` : '—'}
            </p>
            {cvScore !== null && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                CV Score: {cvScore}%
              </span>
            )}
          </div>
          {avgInterviewScore !== null ? (
            <ProgressBar
              value={avgInterviewScore}
              tone={avgInterviewScore >= 75 ? 'success' : 'accent'}
              size="sm"
              className="mt-2.5"
            />
          ) : (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Complete 1 mock interview to calculate readiness
            </p>
          )}
        </Card>
      </section>

      {/* ====================================================================
          RECENT ACTIVITY FEED
          ==================================================================== */}
      <section aria-label="Recent Activity">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          {state.activities.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Stored locally in browser
            </span>
          )}
        </div>

        {state.activities.length === 0 ? (
          <EmptyState
            icon={<Clock className="w-5 h-5" aria-hidden="true" />}
            title="No career milestones logged yet"
            description="Select your target graduate role or create your CV to begin tracking progress here."
            actionLabel="Choose Target Role"
            onAction={() => navigate('job-title')}
          />
        ) : (
          <Card padding="none" className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {state.activities.slice(0, 6).map((act) => (
              <div
                key={act.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {act.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {act.detail}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono-num text-slate-400 dark:text-slate-500">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                  {act.screenTarget && (
                    <button
                      type="button"
                      onClick={() => navigate(act.screenTarget!)}
                      aria-label={`Open ${act.title}`}
                      className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
};
