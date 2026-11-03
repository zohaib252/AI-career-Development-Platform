import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Mic,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  ProgressRing,
  ScreenSkeleton,
  Select,
  useToast,
} from '../components/ui';

/**
 * Final Report Screen (Step 7)
 * - Overall Pass-Chance Ring & Readiness Summary
 * - Aggregated Strengths & Improvements
 * - Score History SVG Chart across past interview sessions
 * - Per-question expandable feedback showing EXACT rule-based scoring breakdown
 * - Print-optimized layout for "Download PDF"
 */
export const ReportScreen: React.FC = () => {
  const {
    state,
    isHydrating,
    selectedReportId,
    setSelectedReportId,
    navigate,
  } = useCareer();
  const { showToast } = useToast();

  const reports = state.reports;
  const latestReport = reports[reports.length - 1];
  const activeReport =
    reports.find((r) => r.id === selectedReportId) || latestReport || null;

  // Track expanded question IDs (first question open by default)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const firstId = activeReport?.answers[0]?.questionId;
    return firstId ? { [firstId]: true } : {};
  });

  if (isHydrating) {
    return <ScreenSkeleton cards={3} />;
  }

  if (!activeReport) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step 07 · Readiness Analytics
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Final Interview Report
          </h1>
        </div>
        <EmptyState
          icon={<Trophy className="w-5 h-5" aria-hidden="true" />}
          title="No interview reports yet"
          description="Complete a 3- or 5-question Mock Interview session to unlock your pass-chance ring, STAR breakdown, and PDF report."
          actionLabel="Start Mock Interview"
          onAction={() => navigate('interview')}
        />
      </div>
    );
  }

  const toggleExpand = (qid: string) => {
    setExpandedIds((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  const expandAllAndPrint = () => {
    const allOpen: Record<string, boolean> = {};
    activeReport.answers.forEach((a) => {
      allOpen[a.questionId] = true;
    });
    setExpandedIds(allOpen);

    // Allow React to render expanded accordions before opening print dialog
    window.setTimeout(() => {
      try {
        window.print();
      } catch {
        showToast({
          type: 'info',
          title: 'Use browser Print to Save as PDF',
          description: 'Press Ctrl+P (or Cmd+P) and choose "Save as PDF".',
        });
      }
    }, 120);
  };

  const readinessTier =
    activeReport.passChance >= 80
      ? { label: 'Strong Hire Readiness', variant: 'success' as const }
      : activeReport.passChance >= 60
        ? { label: 'Competitive Graduate', variant: 'accent' as const }
        : { label: 'Needs Structured Practice', variant: 'warning' as const };

  return (
    <div className="space-y-8 print-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step 07 · Readiness Report
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activeReport.jobTitle} — {activeReport.company}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Completed on{' '}
            {new Date(activeReport.completedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            · {activeReport.answers.length} questions ·{' '}
            <span className="font-mono-num">
              {Math.round(activeReport.totalDurationSeconds / 60)}m{' '}
              {activeReport.totalDurationSeconds % 60}s
            </span>{' '}
            total speaking/response time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          {reports.length > 1 && (
            <div className="w-full sm:w-60">
              <Select
                label="Switch interview session"
                hideLabel
                options={reports
                  .slice()
                  .reverse()
                  .map((r, idx) => ({
                    value: r.id,
                    label: `${r.company} (${r.overallScore}%) · #${reports.length - idx}`,
                  }))}
                value={activeReport.id}
                onChange={(e) => setSelectedReportId(e.target.value)}
              />
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Mic className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={() => navigate('interview')}
          >
            Practice Again
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={expandAllAndPrint}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* ====================================================================
          TOP SUMMARY: PASS-CHANCE RING + STRENGTHS & IMPROVEMENTS
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <Card
          padding="lg"
          className="lg:col-span-4 flex flex-col items-center justify-center text-center gap-3 print-avoid-break"
        >
          <ProgressRing
            value={activeReport.passChance}
            size={148}
            strokeWidth={11}
            label="Pass Chance"
            sublabel={`Avg Score ${activeReport.overallScore}/100`}
          />
          <Badge variant={readinessTier.variant}>{readinessTier.label}</Badge>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Calculated locally from your STAR framing, quantified metrics, role keyword
            alignment, and filler-word clarity.
          </p>
        </Card>

        <Card padding="lg" className="lg:col-span-4 space-y-3 print-avoid-break">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Key Strengths Demonstrated
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeReport.topStrengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">·</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg" className="lg:col-span-4 space-y-3 print-avoid-break">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Priority Areas to Improve
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeReport.keyImprovements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold">·</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ====================================================================
          SCORE HISTORY CHART (SVG Trend Line + Session Bars)
          ==================================================================== */}
      <Card padding="lg" className="space-y-4 print-avoid-break">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Interview Score Progression
            </h2>
          </div>
          <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
            {reports.length} {reports.length === 1 ? 'session recorded' : 'sessions recorded'}
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 640 180"
            role="img"
            aria-label="Mock interview score progression chart"
            className="w-full min-w-[440px] h-44"
          >
            {/* Horizontal grid lines */}
            {[25, 50, 75, 100].map((val) => {
              const y = 145 - (val / 100) * 120;
              return (
                <g key={val}>
                  <line
                    x1={44}
                    x2={615}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <text
                    x={34}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Connecting Polyline if 2+ sessions */}
            {reports.length > 1 && (
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={reports
                  .slice(-8)
                  .map((rep, idx, arr) => {
                    const x =
                      arr.length === 1
                        ? 330
                        : 85 + (idx / (arr.length - 1)) * 490;
                    const y = 145 - (rep.overallScore / 100) * 120;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Data Points */}
            {reports.slice(-8).map((rep, idx, arr) => {
              const x =
                arr.length === 1
                  ? 330
                  : 85 + (idx / (arr.length - 1)) * 490;
              const y = 145 - (rep.overallScore / 100) * 120;
              const isSelected = rep.id === activeReport.id;

              return (
                <g
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 7 : 5}
                    className={
                      isSelected
                        ? 'fill-violet-600 stroke-white dark:stroke-slate-900 stroke-2'
                        : 'fill-indigo-500'
                    }
                  />
                  <text
                    x={x}
                    y={y - 11}
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-200 text-[11px] font-bold font-mono"
                  >
                    {rep.overallScore}%
                  </text>
                  <text
                    x={x}
                    y={166}
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400 text-[10px]"
                  >
                    #{idx + 1} · {rep.company.slice(0, 12)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* ====================================================================
          PER-QUESTION EXPANDABLE FEEDBACK & TRANSPARENT RUBRIC CALCULATION
          ==================================================================== */}
      <section aria-label="Per-Question Feedback" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Question-by-Question Breakdown & Score Calculation
          </h2>
          <button
            type="button"
            onClick={() => {
              const anyClosed = activeReport.answers.some(
                (a) => !expandedIds[a.questionId]
              );
              const next: Record<string, boolean> = {};
              activeReport.answers.forEach((a) => {
                next[a.questionId] = anyClosed;
              });
              setExpandedIds(next);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer no-print"
          >
            Expand / Collapse All
          </button>
        </div>

        <div className="space-y-3">
          {activeReport.answers.map((ans, index) => {
            const isOpen = Boolean(expandedIds[ans.questionId]);
            const b = ans.breakdown;

            return (
              <Card
                key={ans.questionId}
                padding="none"
                className="overflow-hidden print-avoid-break"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleExpand(ans.questionId)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Question 0{index + 1} · {ans.focusArea} ·{' '}
                      {ans.inputMethod === 'voice' ? 'Voice transcript' : 'Typed response'}
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                      {ans.questionPrompt}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={[
                        'font-mono-num text-sm font-bold',
                        b.total >= 75
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : b.total >= 55
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-amber-600 dark:text-amber-400',
                      ].join(' ')}
                    >
                      {b.total}/100
                    </span>
                    <span className="no-print text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      )}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-5">
                    {/* Candidate Transcript */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        Your Answer ({b.wordCount} words · {ans.durationSeconds}s)
                      </p>
                      <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {ans.answerText}
                      </p>
                    </div>

                    {/* Transparent Score Calculation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2.5">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          How this {b.total}/100 score was calculated:
                        </p>
                        <ProgressBar
                          label="1. Answer Depth & Length (65–220 words)"
                          value={b.lengthPoints}
                          max={25}
                          showValue
                          size="sm"
                        />
                        <ProgressBar
                          label={`2. STAR Structure (${b.detectedStarParts.join(', ') || 'None detected'})`}
                          value={b.starPoints}
                          max={25}
                          showValue
                          size="sm"
                        />
                        <ProgressBar
                          label="3. Numbers & Quantified Impact"
                          value={b.metricsPoints}
                          max={20}
                          showValue
                          size="sm"
                          tone={b.metricsPoints >= 15 ? 'success' : 'warning'}
                        />
                        <ProgressBar
                          label="4. Job & Domain Keyword Relevance"
                          value={b.relevancePoints}
                          max={20}
                          showValue
                          size="sm"
                        />
                        <ProgressBar
                          label={
                            b.detectedFillers.length === 0
                              ? '5. Clarity (0 filler words)'
                              : `5. Clarity — Fillers: ${b.detectedFillers.join(', ')}`
                          }
                          value={b.clarityPoints}
                          max={10}
                          showValue
                          size="sm"
                          tone={b.clarityPoints >= 8 ? 'success' : 'warning'}
                        />
                      </div>

                      {/* Coaching Notes & Matched Keywords */}
                      <div className="space-y-3 text-xs">
                        {b.matchedKeywords.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1.5">
                              Matched Keywords
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {b.matchedKeywords.map((kw) => (
                                <Badge key={kw} variant="accent">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {b.improvements.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">
                              Targeted Improvements
                            </p>
                            <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-4">
                              {b.improvements.map((imp, idx) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 leading-relaxed">
                          <span className="font-semibold">Interviewer Coaching Tip: </span>
                          {ans.sampleTip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
