import React, { useState, useMemo, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileCheck2,
  FileUp,
  Info,
  PenLine,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { CVData, CVExperienceItem, CVTemplateId, SuggestionPriority } from '../types/career';
import { parseUploadedCVFile, scoreCVData } from '../utils/scoringEngine';
import { CV_TEMPLATE_OPTIONS, CVDocumentPreview } from '../components/cv/CVTemplates';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  ProgressBar,
  ProgressRing,
  ScreenSkeleton,
  Select,
  Tabs,
  useToast,
} from '../components/ui';

type CVMode = 'create' | 'upload';
type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS: { id: WizardStep; title: string }[] = [
  { id: 1, title: 'Profile & Summary' },
  { id: 2, title: 'Education' },
  { id: 3, title: 'Projects & Internships' },
  { id: 4, title: 'Skills & Template' },
];

function createDefaultCV(
  fullName = '',
  email = '',
  university = '',
  gradYear = '2026',
  targetTitle = 'Junior Software Engineer',
  keywords: string[] = []
): CVData {
  return {
    mode: 'create',
    templateId: 'modern',
    fullName,
    headline: targetTitle,
    email,
    phone: '',
    location: 'Lahore · Open to Hybrid & Remote',
    portfolioUrl: '',
    summary: '',
    education: [
      {
        id: 'edu-init-1',
        degree: 'Bachelor of Science',
        institution: university,
        year: gradYear,
        gpaOrHonors: '',
        highlights: '',
      },
    ],
    experience: [
      {
        id: 'exp-init-1',
        role: `${targetTitle} Capstone Project`,
        organization: university || 'University Senior Project',
        duration: `${Number(gradYear) - 1 || '2025'} – ${gradYear}`,
        type: 'Capstone Project',
        bullets: [''],
      },
    ],
    skills: keywords.slice(0, 6),
    certifications: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * CV Studio Screen (Step 2)
 * - Upload Mode: Drag & drop file parser (.pdf, .docx, .txt, .md) with editable parsed preview
 * - Create Mode: 4-step guided form with 3 selectable templates
 * - Live CV Score Ring & Suggestions grouped by High / Medium / Quick-Win priority
 * - Formatted PDF export via print stylesheet (`window.print()`)
 */
export const CVScreen: React.FC = () => {
  const { state, isHydrating, updateCV, navigate } = useCareer();
  const { showToast } = useToast();

  const initialDraft = useMemo(
    () =>
      state.cv ||
      createDefaultCV(
        state.user?.fullName,
        state.user?.email,
        state.user?.university,
        state.user?.graduationYear,
        state.targetRole?.title || 'Junior Frontend Engineer',
        state.targetRole?.keywords || ['React', 'TypeScript', 'Git', 'SQL']
      ),
    [state.cv, state.user, state.targetRole]
  );

  const [mode, setMode] = useState<CVMode>(state.cv?.mode || 'create');
  const [draft, setDraft] = useState<CVData>(initialDraft);
  const [step, setStep] = useState<WizardStep>(1);

  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const targetKeywords = state.targetRole?.keywords || [];
  const scoreResult = useMemo(
    () => scoreCVData(draft, targetKeywords),
    [draft, targetKeywords]
  );

  if (isHydrating) {
    return <ScreenSkeleton cards={2} />;
  }

  const groupedSuggestions: Record<SuggestionPriority, typeof scoreResult.suggestions> = {
    high: scoreResult.suggestions.filter((s) => s.priority === 'high'),
    medium: scoreResult.suggestions.filter((s) => s.priority === 'medium'),
    low: scoreResult.suggestions.filter((s) => s.priority === 'low'),
  };

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    setIsParsing(true);
    try {
      const parsed = await parseUploadedCVFile(file, state.user, state.targetRole);
      setDraft(parsed);
      updateCV(parsed);
      showToast({
        type: 'success',
        title: 'CV parsed locally',
        description: `Extracted sections from ${file.name}. Review or customize below.`,
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Could not parse uploaded CV file.'
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSampleCV = () => {
    const sample: CVData = {
      mode,
      templateId: draft.templateId,
      uploadedFileName: mode === 'upload' ? 'Graduate_CV_2026.pdf' : undefined,
      fullName: state.user?.fullName || 'Zara Siddiqui',
      headline: state.targetRole?.title || 'Junior Frontend Engineer',
      email: state.user?.email || 'zara.siddiqui@grad.edu.pk',
      phone: '+92 321 4829104',
      location: 'Lahore · Hybrid / Remote',
      portfolioUrl: 'github.com/graduate-portfolio',
      summary: `Detail-oriented ${state.user?.graduationYear || '2026'} graduate targeting ${state.targetRole?.title || 'Frontend Engineering'} roles. Built accessible web interfaces serving 1,200+ campus users and reduced API table render times by 38% during summer internship.`,
      education: [
        {
          id: 'edu-sample-1',
          degree: 'BS Computer Science',
          institution: state.user?.university || 'FAST-NUCES',
          year: `2022 – ${state.user?.graduationYear || '2026'}`,
          gpaOrHonors: '3.72 / 4.00 · Dean’s List',
          highlights: 'Software Engineering, Web Systems, Databases, Algorithms',
        },
      ],
      experience: [
        {
          id: 'exp-sample-1',
          role: 'Software Engineering Intern',
          organization: 'CloudScale Studio',
          duration: 'Jun 2025 – Sep 2025',
          type: 'Internship',
          bullets: [
            'Built 12 reusable TypeScript & React UI components with WCAG AA contrast and keyboard support.',
            'Reduced analytics dashboard load time by 38% by optimizing bundle splits and caching.',
          ],
        },
        {
          id: 'exp-sample-2',
          role: 'Capstone Lead — SmartGrad Portal',
          organization: 'Final Year University Project',
          duration: 'Sep 2025 – Apr 2026',
          type: 'Capstone Project',
          bullets: [
            'Designed and launched an academic advising portal used by 1,200+ students across 4 departments.',
            'Automated 24 end-to-end regression test flows to prevent deployment regressions.',
          ],
        },
      ],
      skills:
        targetKeywords.length >= 4
          ? targetKeywords
          : ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'SQL', 'Git', 'REST APIs'],
      certifications: ['Meta Frontend Developer Certificate', 'SQL & Analytics Foundations'],
      updatedAt: new Date().toISOString(),
    };
    setDraft(sample);
    updateCV(sample);
    showToast({
      type: 'info',
      title: 'Sample CV populated',
      description: 'Notice how quantified bullets boost your CV Readiness Ring.',
    });
  };

  const handleSaveCV = (goNextScreen = false) => {
    const updated: CVData = {
      ...draft,
      mode,
      updatedAt: new Date().toISOString(),
    };
    setDraft(updated);
    updateCV(updated);
    showToast({
      type: 'success',
      title: 'CV saved to workspace',
      description: `Readiness score: ${scoreResult.overallScore}%.`,
    });
    if (goNextScreen) {
      navigate('preferences');
    }
  };

  const handlePrintPDF = () => {
    handleSaveCV(false);
    try {
      window.print();
    } catch {
      showToast({
        type: 'info',
        title: 'Use browser Print to Save as PDF',
        description: 'Press Ctrl+P (or Cmd+P) and choose "Save as PDF".',
      });
    }
  };

  const updateExperienceItem = (
    expId: string,
    updater: (item: CVExperienceItem) => CVExperienceItem
  ) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === expId ? updater(e) : e)),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Screen Header (Hidden when printing PDF) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 no-print">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step 02 · ATS-Ready Resume
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            CV Studio & Score Analyzer
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Build a structured graduate CV across 3 clean templates or drop an existing file
            to parse locally. Click Download PDF to export via print formatting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={handleLoadSampleCV}
          >
            Fill Sample CV
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={handlePrintPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={() => handleSaveCV(true)}
          >
            Save & Set Preferences
          </Button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <Tabs<CVMode>
          tabs={[
            {
              id: 'create',
              label: 'Create Step-by-Step',
              icon: <PenLine className="w-3.5 h-3.5" aria-hidden="true" />,
            },
            {
              id: 'upload',
              label: 'Upload Existing CV',
              icon: <FileUp className="w-3.5 h-3.5" aria-hidden="true" />,
            },
          ]}
          activeTab={mode}
          onChange={(m) => setMode(m)}
          ariaLabel="Choose CV creation method"
        />

        {/* Template Selector */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Template:
          </span>
          <Tabs<CVTemplateId>
            tabs={CV_TEMPLATE_OPTIONS.map((t) => ({ id: t.id, label: t.name }))}
            activeTab={draft.templateId}
            onChange={(tpl) => setDraft((d) => ({ ...d, templateId: tpl }))}
            ariaLabel="Choose CV visual template"
          />
        </div>
      </div>

      {/* ====================================================================
          MAIN TWO-COLUMN WORKSPACE (Editor/Upload + Score & Live Preview)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
        {/* LEFT COLUMN: Upload Zone OR 4-Step Builder (Hidden on Print) */}
        <div className="lg:col-span-6 space-y-6 no-print">
          {mode === 'upload' ? (
            <Card padding="lg" className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Upload & Parse Your Resume
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Supports .pdf, .docx, .txt, or .md up to 5 MB. Parsing runs 100% locally in
                  your browser.
                </p>
              </div>

              {uploadError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) handleFileProcess(dropped);
                }}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Drop CV file here or click to browse"
                className={[
                  'p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-150',
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/30',
                ].join(' ')}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) handleFileProcess(selected);
                  }}
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100/80 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {isParsing
                    ? 'Extracting resume sections...'
                    : 'Drag & drop your CV here, or click to browse'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PDF, DOCX, TXT, or Markdown · Max 5 MB
                </p>
              </div>

              {/* Parsed Preview Quick Editor */}
              {draft.uploadedFileName ? (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <FileCheck2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">Parsed: {draft.uploadedFileName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMode('create')}
                    >
                      Edit All Sections
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Parsed Full Name"
                      value={draft.fullName}
                      onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    />
                    <Input
                      label="Target Headline"
                      value={draft.headline}
                      onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="parsed-summary"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                    >
                      Parsed Summary
                    </label>
                    <textarea
                      id="parsed-summary"
                      rows={3}
                      value={draft.summary}
                      onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<FileUp className="w-5 h-5" aria-hidden="true" />}
                  title="No resume file uploaded yet"
                  description="Drop any resume file above to inspect the parsed preview, or switch to the step-by-step builder."
                  actionLabel="Load Sample Uploaded CV"
                  onAction={handleLoadSampleCV}
                />
              )}
            </Card>
          ) : (
            /* STEP-BY-STEP CREATE WIZARD */
            <Card padding="lg" className="space-y-6">
              {/* Step Indicator Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WIZARD_STEPS.map((ws) => {
                  const active = step === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => setStep(ws.id)}
                      className={[
                        'min-h-[40px] px-3 py-2 rounded-xl text-left border text-xs font-semibold transition-colors cursor-pointer',
                        active
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                      ].join(' ')}
                    >
                      <span className="block font-mono-num text-[10px] opacity-70">
                        0{ws.id}
                      </span>
                      <span className="truncate block">{ws.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* STEP 1: Profile & Summary */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full name"
                      value={draft.fullName}
                      placeholder="Zara Siddiqui"
                      onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    />
                    <Input
                      label="Target headline"
                      value={draft.headline}
                      placeholder="Junior Frontend Engineer"
                      onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={draft.email}
                      placeholder="you@university.edu"
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      value={draft.phone}
                      placeholder="+92 300 1234567"
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Location"
                      value={draft.location}
                      placeholder="Lahore · Open to Remote"
                      onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    />
                    <Input
                      label="GitHub / LinkedIn / Portfolio URL"
                      value={draft.portfolioUrl}
                      placeholder="github.com/yourhandle"
                      onChange={(e) => setDraft({ ...draft, portfolioUrl: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cv-summary-textarea"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
                    >
                      Professional summary (aim for 25–65 words)
                    </label>
                    <textarea
                      id="cv-summary-textarea"
                      rows={4}
                      placeholder="2026 Computer Science graduate specializing in React and TypeScript. Built a university portal serving 1,200+ students..."
                      value={draft.summary}
                      onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Education */}
              {step === 2 && (
                <div className="space-y-5">
                  {draft.education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Education #{idx + 1}
                        </h3>
                        {draft.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                education: draft.education.filter((e) => e.id !== edu.id),
                              })
                            }
                            aria-label="Remove education entry"
                            className="text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Degree / Major"
                          placeholder="BS Computer Science"
                          value={edu.degree}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              education: draft.education.map((item) =>
                                item.id === edu.id ? { ...item, degree: e.target.value } : item
                              ),
                            })
                          }
                        />
                        <Input
                          label="University / Institution"
                          placeholder="LUMS / NUST / FAST"
                          value={edu.institution}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              education: draft.education.map((item) =>
                                item.id === edu.id
                                  ? { ...item, institution: e.target.value }
                                  : item
                              ),
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Graduation Year"
                          placeholder="2022 – 2026"
                          value={edu.year}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              education: draft.education.map((item) =>
                                item.id === edu.id ? { ...item, year: e.target.value } : item
                              ),
                            })
                          }
                        />
                        <Input
                          label="GPA or Honors"
                          placeholder="3.70 / 4.00 · Dean’s List"
                          value={edu.gpaOrHonors}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              education: draft.education.map((item) =>
                                item.id === edu.id
                                  ? { ...item, gpaOrHonors: e.target.value }
                                  : item
                              ),
                            })
                          }
                        />
                      </div>

                      <Input
                        label="Relevant Coursework"
                        placeholder="Software Engineering, Databases, Operating Systems"
                        value={edu.highlights}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            education: draft.education.map((item) =>
                              item.id === edu.id
                                ? { ...item, highlights: e.target.value }
                                : item
                            ),
                          })
                        }
                      />
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" aria-hidden="true" />}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        education: [
                          ...draft.education,
                          {
                            id: `edu-${Date.now()}`,
                            degree: '',
                            institution: '',
                            year: '2026',
                            gpaOrHonors: '',
                            highlights: '',
                          },
                        ],
                      })
                    }
                  >
                    Add Another Degree
                  </Button>
                </div>
              )}

              {/* STEP 3: Experience & Capstone Projects */}
              {step === 3 && (
                <div className="space-y-6">
                  {draft.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Entry #{idx + 1}
                        </h3>
                        {draft.experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                experience: draft.experience.filter((e) => e.id !== exp.id),
                              })
                            }
                            aria-label="Remove experience entry"
                            className="text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Role or Project Title"
                          placeholder="Frontend Engineering Intern"
                          value={exp.role}
                          onChange={(e) =>
                            updateExperienceItem(exp.id, (it) => ({
                              ...it,
                              role: e.target.value,
                            }))
                          }
                        />
                        <Input
                          label="Company or University Lab"
                          placeholder="Systems Limited / Senior Capstone"
                          value={exp.organization}
                          onChange={(e) =>
                            updateExperienceItem(exp.id, (it) => ({
                              ...it,
                              organization: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Dates"
                          placeholder="Jun 2025 – Sep 2025"
                          value={exp.duration}
                          onChange={(e) =>
                            updateExperienceItem(exp.id, (it) => ({
                              ...it,
                              duration: e.target.value,
                            }))
                          }
                        />
                        <Select
                          label="Type"
                          options={[
                            { value: 'Internship', label: 'Internship' },
                            { value: 'Capstone Project', label: 'Capstone Project' },
                            { value: 'Part-time', label: 'Part-time' },
                            { value: 'Leadership', label: 'Student Leadership' },
                          ]}
                          value={exp.type}
                          onChange={(e) =>
                            updateExperienceItem(exp.id, (it) => ({
                              ...it,
                              type: e.target.value as CVExperienceItem['type'],
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Impact bullet points (start with Built / Reduced / Automated + numbers)
                        </p>
                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <Input
                              label={`Bullet ${bIdx + 1}`}
                              hideLabel
                              placeholder="Built reusable React components, reducing page load time by 35%..."
                              value={bullet}
                              onChange={(e) => {
                                const copy = [...exp.bullets];
                                copy[bIdx] = e.target.value;
                                updateExperienceItem(exp.id, (it) => ({
                                  ...it,
                                  bullets: copy,
                                }));
                              }}
                            />
                            {exp.bullets.length > 1 && (
                              <button
                                type="button"
                                aria-label="Remove bullet"
                                onClick={() =>
                                  updateExperienceItem(exp.id, (it) => ({
                                    ...it,
                                    bullets: it.bullets.filter((_, i) => i !== bIdx),
                                  }))
                                }
                                className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-4 h-4" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Plus className="w-3.5 h-3.5" aria-hidden="true" />}
                          onClick={() =>
                            updateExperienceItem(exp.id, (it) => ({
                              ...it,
                              bullets: [...it.bullets, ''],
                            }))
                          }
                        >
                          Add Bullet Point
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" aria-hidden="true" />}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        experience: [
                          ...draft.experience,
                          {
                            id: `exp-${Date.now()}`,
                            role: '',
                            organization: '',
                            duration: '2025 – 2026',
                            type: 'Capstone Project',
                            bullets: [''],
                          },
                        ],
                      })
                    }
                  >
                    Add Internship or Project
                  </Button>
                </div>
              )}

              {/* STEP 4: Skills, Certifications & Template */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Skills ({draft.skills.length})
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {draft.skills.map((sk) => (
                        <Badge key={sk} variant="accent">
                          <span>{sk}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${sk}`}
                            onClick={() =>
                              setDraft({
                                ...draft,
                                skills: draft.skills.filter((s) => s !== sk),
                              })
                            }
                            className="ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        label="Add skill"
                        hideLabel
                        placeholder="Add skill (e.g., TypeScript, SQL, Figma)..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && skillInput.trim()) {
                            e.preventDefault();
                            if (!draft.skills.includes(skillInput.trim())) {
                              setDraft({
                                ...draft,
                                skills: [...draft.skills, skillInput.trim()],
                              });
                            }
                            setSkillInput('');
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (skillInput.trim() && !draft.skills.includes(skillInput.trim())) {
                            setDraft({
                              ...draft,
                              skills: [...draft.skills, skillInput.trim()],
                            });
                            setSkillInput('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    {/* Suggested keywords from Target Role */}
                    {targetKeywords.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                          Suggested for {state.targetRole?.title}:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {targetKeywords
                            .filter((kw) => !draft.skills.includes(kw))
                            .map((kw) => (
                              <button
                                key={kw}
                                type="button"
                                onClick={() =>
                                  setDraft({ ...draft, skills: [...draft.skills, kw] })
                                }
                                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer inline-flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" aria-hidden="true" />
                                {kw}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Certifications & Honors
                    </p>
                    <div className="space-y-1.5 mb-3">
                      {draft.certifications.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                        >
                          <span>{c}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${c}`}
                            onClick={() =>
                              setDraft({
                                ...draft,
                                certifications: draft.certifications.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        label="Add certification"
                        hideLabel
                        placeholder="e.g., CS50x, Dean’s Honor List..."
                        value={certInput}
                        onChange={(e) => setCertInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && certInput.trim()) {
                            e.preventDefault();
                            setDraft({
                              ...draft,
                              certifications: [...draft.certifications, certInput.trim()],
                            });
                            setCertInput('');
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (certInput.trim()) {
                            setDraft({
                              ...draft,
                              certifications: [...draft.certifications, certInput.trim()],
                            });
                            setCertInput('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Step Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={step === 1}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => setStep((s) => Math.max(1, s - 1) as WizardStep)}
                >
                  Previous
                </Button>

                {step < 4 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
                    onClick={() => setStep((s) => Math.min(4, s + 1) as WizardStep)}
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveCV(true)}
                  >
                    Save CV & Continue
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* ================================================================
              CV SCORE RING & PRIORITY SUGGESTIONS PANEL (Hidden on Print)
              ================================================================ */}
          <Card padding="lg" className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProgressRing
                value={scoreResult.overallScore}
                size={124}
                label="CV Score"
                sublabel="ATS Rubric"
              />
              <div className="flex-1 w-full space-y-2.5">
                <ProgressBar
                  label="Section Completeness"
                  value={scoreResult.sectionScores.completeness}
                  showValue
                  size="sm"
                />
                <ProgressBar
                  label="Quantified Metrics (%, #)"
                  value={scoreResult.sectionScores.impactMetrics}
                  showValue
                  size="sm"
                  tone={scoreResult.sectionScores.impactMetrics >= 70 ? 'success' : 'warning'}
                />
                <ProgressBar
                  label="Target Role Keywords"
                  value={scoreResult.sectionScores.keywordMatch}
                  showValue
                  size="sm"
                />
                <ProgressBar
                  label="Strong Action Verbs"
                  value={scoreResult.sectionScores.actionVerbs}
                  showValue
                  size="sm"
                />
              </div>
            </div>

            {/* Priority-Grouped Suggestions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Actionable Improvements by Priority
              </h3>

              {scoreResult.suggestions.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Outstanding! Your CV hits every graduate screening benchmark.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(['high', 'medium', 'low'] as SuggestionPriority[]).map((prio) =>
                    groupedSuggestions[prio].map((sug) => (
                      <div
                        key={sug.id}
                        className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3"
                      >
                        {prio === 'high' ? (
                          <AlertCircle
                            className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : prio === 'medium' ? (
                          <AlertTriangle
                            className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <Info
                            className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {sug.title}
                            </p>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              ·{' '}
                              {prio === 'high'
                                ? 'High priority'
                                : prio === 'medium'
                                  ? 'Medium priority'
                                  : 'Quick win'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {sug.detail}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE PRINT-FORMATTED CV DOCUMENT PREVIEW */}
        <div className="lg:col-span-6 lg:sticky lg:top-22 print:static print:w-full print-container">
          <div className="flex items-center justify-between mb-2.5 no-print">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Live Formatted Preview ({CV_TEMPLATE_OPTIONS.find((t) => t.id === draft.templateId)?.name})
            </span>
            <button
              type="button"
              onClick={handlePrintPDF}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Print / Save as PDF
            </button>
          </div>

          <CVDocumentPreview cv={draft} />
        </div>
      </div>
    </div>
  );
};
