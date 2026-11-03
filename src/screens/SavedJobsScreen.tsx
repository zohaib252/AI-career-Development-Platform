import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Kanban,
  List,
  Mic,
  Trash2,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { buildExternalJobBoardLinks } from '../data/rolesAndJobs';
import { ApplicationStage, SavedJob } from '../types/career';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ScreenSkeleton,
  Select,
  Tabs,
  useToast,
} from '../components/ui';

type BoardViewMode = 'kanban' | 'list';

const STAGES: {
  id: ApplicationStage;
  title: string;
  badgeVariant: 'neutral' | 'accent' | 'warning' | 'success';
}[] = [
  { id: 'Saved', title: 'Saved', badgeVariant: 'neutral' },
  { id: 'Applied', title: 'Applied', badgeVariant: 'accent' },
  { id: 'Interview', title: 'Interview', badgeVariant: 'warning' },
  { id: 'Offer', title: 'Offer', badgeVariant: 'success' },
];

/**
 * Saved Jobs Screen (Step 5)
 * Kanban board (Saved / Applied / Interview / Offer) with HTML5 drag-and-drop,
 * keyboard/mobile stage controls, plus a high-density List View toggle.
 */
export const SavedJobsScreen: React.FC = () => {
  const {
    state,
    isHydrating,
    updateSavedJobStage,
    deleteSavedJob,
    setSelectedInterviewJobId,
    navigate,
  } = useCareer();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<BoardViewMode>('kanban');
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStage | null>(null);

  if (isHydrating) {
    return <ScreenSkeleton cards={4} />;
  }

  const handlePracticeInterview = (job: SavedJob) => {
    setSelectedInterviewJobId(job.id);
    navigate('interview');
  };

  const handleStageStep = (job: SavedJob, direction: -1 | 1) => {
    const idx = STAGES.findIndex((s) => s.id === job.stage);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= STAGES.length) return;
    const nextStage = STAGES[nextIdx].id;
    updateSavedJobStage(job.id, nextStage);
    showToast({
      type: 'info',
      title: `Moved to ${nextStage}`,
      description: `${job.title} · ${job.company}`,
    });
  };

  const handleDropOnStage = (e: React.DragEvent, targetStage: ApplicationStage) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    setDragOverStage(null);
    setDraggedJobId(null);

    if (!jobId) return;
    const existing = state.savedJobs.find((j) => j.id === jobId);
    if (!existing || existing.stage === targetStage) return;

    updateSavedJobStage(jobId, targetStage);
    showToast({
      type: 'success',
      title: `Moved to ${targetStage}`,
      description: `${existing.title} · ${existing.company}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step 05 · Application Pipeline
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Saved Jobs Board
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Drag cards across stages—or use stage controls—and launch a targeted Mock
            Interview for any shortlisted role.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Tabs<BoardViewMode>
            tabs={[
              {
                id: 'kanban',
                label: 'Kanban',
                icon: <Kanban className="w-3.5 h-3.5" aria-hidden="true" />,
              },
              {
                id: 'list',
                label: 'List View',
                icon: <List className="w-3.5 h-3.5" aria-hidden="true" />,
              },
            ]}
            activeTab={viewMode}
            onChange={setViewMode}
            ariaLabel="Switch board layout"
          />

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Briefcase className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={() => navigate('jobs')}
          >
            Find More Jobs
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {state.savedJobs.length === 0 ? (
        <EmptyState
          icon={<Kanban className="w-5 h-5" aria-hidden="true" />}
          title="Your application board is empty"
          description="Save or apply to roles on the Job Results screen to track them from Saved through Offer and rehearse tailored mock interviews."
          actionLabel="Browse Matched Jobs"
          onAction={() => navigate('jobs')}
        />
      ) : viewMode === 'kanban' ? (
        /* ==================================================================
           KANBAN BOARD VIEW (4 Drag-and-Drop Columns)
           ================================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {STAGES.map((col) => {
            const items = state.savedJobs.filter((j) => j.stage === col.id);
            const isOver = dragOverStage === col.id;

            return (
              <section
                key={col.id}
                aria-label={`${col.title} column`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverStage !== col.id) setDragOverStage(col.id);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDropOnStage(e, col.id)}
                className={[
                  'rounded-2xl p-3.5 min-h-[340px] border transition-colors duration-150 flex flex-col gap-3',
                  isOver
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500'
                    : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800',
                ].join(' ')}
              >
                {/* Column Header */}
                <div className="px-1 py-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {col.title}
                    </h2>
                    <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Cards inside Column */}
                {items.length === 0 ? (
                  <div className="flex-1 rounded-xl border border-dashed border-slate-300/80 dark:border-slate-800 flex items-center justify-center p-6 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Drop job card here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((job) => {
                      const stageIdx = STAGES.findIndex((s) => s.id === job.stage);
                      const linkedinUrl = buildExternalJobBoardLinks(
                        job.title,
                        job.location,
                        job.company
                      )[0].url;

                      return (
                        <div
                          key={job.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', job.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedJobId(job.id);
                          }}
                          onDragEnd={() => {
                            setDraggedJobId(null);
                            setDragOverStage(null);
                          }}
                          className={[
                            'p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs cursor-grab active:cursor-grabbing transition-all',
                            draggedJobId === job.id ? 'opacity-50 scale-[0.98]' : 'hover:border-slate-300 dark:hover:border-slate-700',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                                {job.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                {job.company}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                deleteSavedJob(job.id);
                                showToast({
                                  type: 'info',
                                  title: 'Removed job from board',
                                  description: job.title,
                                });
                              }}
                              aria-label={`Remove ${job.title}`}
                              className="min-h-[32px] min-w-[32px] -mr-1 -mt-1 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {job.location} · {job.workMode} ·{' '}
                            <span className="font-mono-num">{job.salaryLabel}</span>
                          </p>

                          {job.appliedVia && (
                            <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                              Applied via {job.appliedVia}
                            </p>
                          )}

                          {/* Primary Card Action: Practice Interview */}
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handlePracticeInterview(job)}
                              className="min-h-[34px] px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Practice</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Search ${job.title} on LinkedIn`}
                                title="Open live LinkedIn search"
                                className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </a>
                              <button
                                type="button"
                                disabled={stageIdx === 0}
                                onClick={() => handleStageStep(job, -1)}
                                aria-label={`Move ${job.title} to previous stage`}
                                className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                disabled={stageIdx === STAGES.length - 1}
                                onClick={() => handleStageStep(job, 1)}
                                aria-label={`Move ${job.title} to next stage`}
                                className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        /* ==================================================================
           HIGH-DENSITY SAAS LIST VIEW
           ================================================================== */
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Location & Mode</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {state.savedJobs.map((job) => {
                  const stageMeta = STAGES.find((s) => s.id === job.stage)!;
                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {job.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {job.company}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {job.location} · {job.workMode}
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-xs text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {job.salaryLabel}
                      </td>
                      <td className="py-3.5 px-4 w-44">
                        <div className="flex items-center gap-2">
                          <Select
                            label={`Update stage for ${job.title}`}
                            hideLabel
                            options={STAGES.map((s) => ({
                              value: s.id,
                              label: s.title,
                            }))}
                            value={job.stage}
                            onChange={(e) =>
                              updateSavedJobStage(
                                job.id,
                                e.target.value as ApplicationStage
                              )
                            }
                            className="min-h-[36px] py-1.5 text-xs"
                          />
                          <span className="sr-only">
                            <Badge variant={stageMeta.badgeVariant}>{job.stage}</Badge>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Mic className="w-3.5 h-3.5" aria-hidden="true" />}
                            onClick={() => handlePracticeInterview(job)}
                          >
                            Interview
                          </Button>
                          <button
                            type="button"
                            onClick={() => deleteSavedJob(job.id)}
                            aria-label={`Delete ${job.title}`}
                            className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
