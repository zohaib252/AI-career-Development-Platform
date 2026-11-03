import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  Kanban,
  Search,
  X,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import {
  buildExternalJobBoardLinks,
  computeJobMatchScore,
  SAMPLE_JOBS,
} from '../data/rolesAndJobs';
import { JobListing } from '../types/career';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  ScreenSkeleton,
  Select,
  Tabs,
  useToast,
} from '../components/ui';

type QuickFilter = 'all' | 'top-match' | 'Remote' | 'Hybrid' | 'On-site' | 'Internship';
type SortOption = 'match' | 'recent' | 'salary';

const AVATAR_HUES: Record<JobListing['companyHue'], string> = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  slate: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
};

/**
 * Job Results Screen (Step 4)
 * Filter chips, sort dropdown, polished company cards with unboxed metadata (`·`),
 * Save toggle, and real external Apply links (LinkedIn, Indeed, Glassdoor, Rozee)
 * that automatically save the job with status "Applied".
 */
export const JobResultsScreen: React.FC = () => {
  const {
    state,
    isHydrating,
    toggleSaveJob,
    markJobApplied,
    navigate,
  } = useCareer();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);

  const userSkills = state.cv?.skills || state.targetRole?.keywords || [];

  // Score and enrich jobs; also synthesize a custom role listing if user typed a unique title
  const scoredJobs = useMemo(() => {
    const baseList = [...SAMPLE_JOBS];
    const customTitle = state.targetRole?.title;
    if (
      customTitle &&
      !baseList.some((j) => j.title.toLowerCase() === customTitle.toLowerCase())
    ) {
      baseList.unshift({
        id: `job-custom-${customTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: customTitle,
        company: 'VentureGrad Partners',
        companyInitials: 'VG',
        companyHue: 'indigo',
        category: state.targetRole?.category || 'software',
        location: state.preferences?.locations[0] || 'Lahore',
        workMode: state.preferences?.workModes[0] || 'Hybrid',
        jobType: state.preferences?.jobTypes[0] || 'Full-time',
        currency: 'PKR',
        salaryMin: 140000,
        salaryMax: 185000,
        salaryLabel: 'PKR 140k – 185k / mo',
        postedDaysAgo: 1,
        postedLabel: 'Today',
        tags: (state.targetRole?.keywords || ['Problem Solving', 'Git', 'Teamwork']).slice(
          0,
          5
        ),
        summary: `Entry-level ${customTitle} opportunity tailored for recent university graduates ready to ship real impact with mentorship.`,
      });
    }

    return baseList.map((job) => ({
      job,
      matchScore: computeJobMatchScore(
        job,
        state.targetRole?.title,
        state.targetRole?.category,
        userSkills,
        state.preferences
      ),
    }));
  }, [state.targetRole, state.preferences, userSkills]);

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoredJobs
      .filter(({ job, matchScore }) => {
        if (quickFilter === 'top-match' && matchScore < 75) return false;
        if (
          (quickFilter === 'Remote' ||
            quickFilter === 'Hybrid' ||
            quickFilter === 'On-site') &&
          job.workMode !== quickFilter
        ) {
          return false;
        }
        if (quickFilter === 'Internship' && job.jobType !== 'Internship') {
          return false;
        }

        if (!q) return true;
        return (
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'recent') return a.job.postedDaysAgo - b.job.postedDaysAgo;
        // Normalize USD/GBP/EUR roughly for cross-currency salary sort
        const norm = (j: JobListing) =>
          j.currency === 'PKR' ? j.salaryMax : j.salaryMax * 280;
        return norm(b.job) - norm(a.job);
      });
  }, [scoredJobs, query, quickFilter, sortBy]);

  if (isHydrating) {
    return <ScreenSkeleton cards={4} />;
  }

  const handleOpenApplyModal = (job: JobListing) => {
    setApplyModalJob(job);
  };

  const handleExternalPortalClick = (job: JobListing, portalName: string) => {
    markJobApplied(job, portalName);
    showToast({
      type: 'success',
      title: `Marked "${job.title}" as Applied`,
      description: `Saved to your Kanban board under Applied (${portalName}).`,
    });
  };

  const quickBoardLinks = buildExternalJobBoardLinks(
    state.targetRole?.title || 'Graduate Software Engineer',
    state.preferences?.locations[0] || 'Lahore'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step 04 · Matched Opportunities
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Graduate Job Results
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ranked by alignment with{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {state.targetRole?.title || 'your graduate profile'}
            </span>
            . Applying opens real listings on LinkedIn, Indeed, Glassdoor, or Rozee and
            logs status as Applied.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Kanban className="w-4 h-4" aria-hidden="true" />}
          onClick={() => navigate('saved-jobs')}
        >
          Saved Board ({state.savedJobs.length})
        </Button>
      </div>

      {/* Direct Live Job Portal Bar */}
      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Search live portals for{' '}
          <strong className="text-slate-900 dark:text-white">
            {state.targetRole?.title || 'Graduate Roles'}
          </strong>
          :
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {quickBoardLinks.map((b) => (
            <a
              key={b.id}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[34px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
            >
              <span>{b.name}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </Card>

      {/* Search, Filter Chips & Sort Controls */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              label="Search jobs by role, company, city, or skill"
              hideLabel
              placeholder="Search role, company, city, or skill (e.g., React, SQL, Karachi)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftAdornment={<Search className="w-4 h-4" aria-hidden="true" />}
              rightAdornment={
                query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : undefined
              }
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              label="Sort job results"
              hideLabel
              options={[
                { value: 'match', label: 'Sort: Best Profile Match' },
                { value: 'recent', label: 'Sort: Most Recent' },
                { value: 'salary', label: 'Sort: Highest Compensation' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            />
          </div>
        </div>

        <Tabs<QuickFilter>
          tabs={[
            { id: 'all', label: 'All Roles', count: scoredJobs.length },
            {
              id: 'top-match',
              label: 'Top Match (75%+)',
              count: scoredJobs.filter((s) => s.matchScore >= 75).length,
            },
            { id: 'Hybrid', label: 'Hybrid' },
            { id: 'Remote', label: 'Remote' },
            { id: 'On-site', label: 'On-site' },
            { id: 'Internship', label: 'Internships' },
          ]}
          activeTab={quickFilter}
          onChange={setQuickFilter}
          ariaLabel="Filter job listings"
        />
      </div>

      {/* Results List */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
          title="No jobs match your current filters"
          description="Clear your search keyword or switch back to All Roles to view available graduate opportunities."
          actionLabel="Reset Filters"
          onAction={() => {
            setQuery('');
            setQuickFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSorted.map(({ job, matchScore }) => {
            const savedRecord = state.savedJobs.find((s) => s.id === job.id);
            const isSaved = Boolean(savedRecord);
            const isApplied =
              savedRecord && savedRecord.stage !== 'Saved';

            return (
              <Card
                key={job.id}
                interactive
                padding="md"
                className="flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top Row: Company Monogram + Title + Match % */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        aria-hidden="true"
                        className={[
                          'w-11 h-11 rounded-xl font-bold text-sm flex items-center justify-center shrink-0',
                          AVATAR_HUES[job.companyHue],
                        ].join(' ')}
                      >
                        {job.companyInitials}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                          {job.title}
                        </h2>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono-num text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {matchScore}% match
                    </span>
                  </div>

                  {/* Clean Unboxed Metadata Row (`·` separators, zero pill clutter) */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{job.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.workMode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.jobType}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num font-medium text-slate-700 dark:text-slate-200">
                      {job.salaryLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{job.postedLabel}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {job.summary}
                  </p>

                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map((tag) => {
                      const matched = userSkills.some(
                        (s) => s.toLowerCase() === tag.toLowerCase()
                      );
                      return (
                        <Badge
                          key={tag}
                          variant={matched ? 'accent' : 'neutral'}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Card Actions: Save & Apply */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Button
                    variant={isSaved ? 'outline' : 'ghost'}
                    size="sm"
                    leftIcon={
                      isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      ) : (
                        <Bookmark className="w-4 h-4" aria-hidden="true" />
                      )
                    }
                    onClick={() => {
                      const added = toggleSaveJob(job);
                      showToast({
                        type: 'info',
                        title: added ? 'Saved to Kanban board' : 'Removed from Saved Jobs',
                        description: `${job.title} · ${job.company}`,
                      });
                    }}
                  >
                    {savedRecord ? savedRecord.stage : 'Save'}
                  </Button>

                  <Button
                    variant={isApplied ? 'outline' : 'primary'}
                    size="sm"
                    rightIcon={<ArrowUpRight className="w-4 h-4" aria-hidden="true" />}
                    leftIcon={
                      isApplied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : undefined
                    }
                    onClick={() => handleOpenApplyModal(job)}
                  >
                    {isApplied ? 'Applied · Open Portals' : 'Apply Now'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ====================================================================
          APPLY ON REAL PORTALS MODAL (LinkedIn, Indeed, Glassdoor, Rozee)
          ==================================================================== */}
      <Modal
        isOpen={Boolean(applyModalJob)}
        onClose={() => setApplyModalJob(null)}
        title={applyModalJob ? `Apply for ${applyModalJob.title}` : 'Apply'}
        description={
          applyModalJob
            ? `${applyModalJob.company} · ${applyModalJob.location}. Choosing any job board below opens a live search in a new tab and saves this job with status "Applied".`
            : undefined
        }
      >
        {applyModalJob && (
          <div className="space-y-3">
            {buildExternalJobBoardLinks(
              applyModalJob.title,
              applyModalJob.location,
              applyModalJob.company
            ).map((portal) => (
              <a
                key={portal.id}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleExternalPortalClick(applyModalJob, portal.name);
                  setApplyModalJob(null);
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center justify-between gap-4 transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Continue on {portal.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {portal.subtitle}
                  </p>
                </div>
                <ArrowUpRight
                  className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0"
                  aria-hidden="true"
                />
              </a>
            ))}

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Already submitted directly on the company site?</span>
              <button
                type="button"
                onClick={() => {
                  handleExternalPortalClick(applyModalJob, 'Company Website');
                  setApplyModalJob(null);
                }}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Mark as Applied without opening link
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
