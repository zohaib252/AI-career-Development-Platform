import {
  ActivityItem,
  CareerPilotState,
  ThemeMode,
} from '../types/career';
import { SAMPLE_JOBS } from '../data/rolesAndJobs';

/**
 * ============================================================================
 * CAREERPILOT STORAGE MODULE (`careerStorage.ts`)
 * ============================================================================
 * ARCHITECTURE NOTE FOR MAINTAINERS:
 * All persistence goes through this single module. Today it stores JSON inside
 * `window.localStorage` so the app runs 100% free in any browser.
 *
 * When migrating to a real backend (Express / PostgreSQL / Supabase):
 * Replace `loadCareerState` and `saveCareerState` with `fetch('/api/state')`
 * calls — zero screen components need to be rewritten!
 * ============================================================================
 */

const STATE_STORAGE_KEY = 'careerpilot_state_v1';
const THEME_STORAGE_KEY = 'careerpilot_theme_v1';

export const EMPTY_CAREER_STATE: CareerPilotState = {
  version: 1,
  user: null,
  targetRole: null,
  cv: null,
  preferences: null,
  savedJobs: [],
  reports: [],
  activities: [],
};

export interface StorageLoadResult {
  state: CareerPilotState;
  error: string | null;
}

/**
 * Reads CareerPilot state safely from localStorage.
 */
export function loadCareerState(): StorageLoadResult {
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) {
      return { state: EMPTY_CAREER_STATE, error: null };
    }
    const parsed = JSON.parse(raw) as Partial<CareerPilotState>;
    return {
      state: {
        version: 1,
        user: parsed.user ?? null,
        passwordHash: parsed.passwordHash,
        targetRole: parsed.targetRole ?? null,
        cv: parsed.cv ?? null,
        preferences: parsed.preferences ?? null,
        savedJobs: Array.isArray(parsed.savedJobs) ? parsed.savedJobs : [],
        reports: Array.isArray(parsed.reports) ? parsed.reports : [],
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      },
      error: null,
    };
  } catch (err) {
    console.warn('CareerPilot storage parse error:', err);
    return {
      state: EMPTY_CAREER_STATE,
      error: 'Saved browser data appeared corrupted and was safely reset to a clean state.',
    };
  }
}

/**
 * Persists CareerPilot state into localStorage.
 */
export function saveCareerState(state: CareerPilotState): { ok: boolean; error?: string } {
  try {
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    console.warn('CareerPilot storage write error:', err);
    return {
      ok: false,
      error: 'Unable to save changes to localStorage (storage may be full or disabled).',
    };
  }
}

/**
 * Clears all stored CareerPilot data.
 */
export function clearCareerState(): void {
  try {
    window.localStorage.removeItem(STATE_STORAGE_KEY);
  } catch {
    // Ignore if storage restricted
  }
}

/**
 * Theme preference persistence (`light` | `dark`)
 */
export function loadThemeMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Fallback to light
  }
  return 'light';
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Helper to prepend a timestamped activity entry (keeps latest 20 items).
 */
export function prependActivity(
  existing: ActivityItem[],
  item: Omit<ActivityItem, 'id' | 'timestamp'>
): ActivityItem[] {
  const entry: ActivityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...item,
  };
  return [entry, ...existing].slice(0, 20);
}

/**
 * Generates a realistic pre-populated Demo Graduate profile so students or
 * evaluators can explore every screen (CV, Kanban, Mock Interview, Report) immediately.
 */
export function buildDemoGraduateState(): CareerPilotState {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 1 * 86400000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 3600000).toISOString();

  const demoSavedJobs = [
    {
      ...SAMPLE_JOBS[0],
      stage: 'Interview' as const,
      savedAt: twoDaysAgo,
      updatedAt: twoHoursAgo,
      appliedVia: 'LinkedIn Jobs',
    },
    {
      ...SAMPLE_JOBS[1],
      stage: 'Applied' as const,
      savedAt: twoDaysAgo,
      updatedAt: oneDayAgo,
      appliedVia: 'Rozee.pk',
    },
    {
      ...SAMPLE_JOBS[4],
      stage: 'Saved' as const,
      savedAt: oneDayAgo,
      updatedAt: oneDayAgo,
    },
  ];

  return {
    version: 1,
    user: {
      id: 'usr-demo-grad',
      fullName: 'Zara Siddiqui',
      email: 'zara.siddiqui@grad.edu.pk',
      university: 'LUMS — BS Computer Science',
      graduationYear: '2026',
      createdAt: twoDaysAgo,
    },
    passwordHash: 'demo-pass',
    targetRole: {
      title: 'Junior Frontend Engineer',
      category: 'software',
      keywords: [
        'React',
        'TypeScript',
        'JavaScript',
        'Tailwind CSS',
        'HTML/CSS',
        'Accessibility',
        'Git',
        'REST APIs',
      ],
      updatedAt: twoDaysAgo,
    },
    cv: {
      mode: 'create',
      templateId: 'modern',
      fullName: 'Zara Siddiqui',
      headline: 'Junior Frontend Engineer · React & TypeScript',
      email: 'zara.siddiqui@grad.edu.pk',
      phone: '+92 321 4829104',
      location: 'Lahore, Pakistan (Open to Hybrid & Remote)',
      portfolioUrl: 'github.com/zarasiddiqui-dev',
      summary:
        '2026 Computer Science graduate specializing in accessible React and TypeScript web applications. Built a university course-planning platform serving 1,400+ students and completed a summer frontend engineering internship cutting dashboard load time by 42%.',
      education: [
        {
          id: 'edu-1',
          degree: 'BS Computer Science',
          institution: 'Lahore University of Management Sciences (LUMS)',
          year: '2022 – 2026',
          gpaOrHonors: '3.74 / 4.00 · Dean’s Honor List',
          highlights: 'Software Engineering, Web Systems, Algorithms, Human-Computer Interaction',
        },
      ],
      experience: [
        {
          id: 'exp-1',
          role: 'Frontend Engineering Intern',
          organization: 'FinBridge Studio',
          duration: 'Jun 2025 – Sep 2025',
          type: 'Internship',
          bullets: [
            'Built 14 reusable React and TypeScript design-system components with WCAG AA contrast and full keyboard navigation.',
            'Reduced merchant analytics table render latency by 42% (from 680ms to 390ms) by virtualizing rows and memoizing filters.',
            'Automated 28 end-to-end Playwright checkout tests integrated into GitHub Actions CI.',
          ],
        },
        {
          id: 'exp-2',
          role: 'Lead Developer — CampusFlow Capstone',
          organization: 'Senior Year Capstone Project',
          duration: 'Sep 2025 – Apr 2026',
          type: 'Capstone Project',
          bullets: [
            'Designed and launched a degree-audit and timetable web app adopted by 1,400+ undergraduate students during enrollment week.',
            'Implemented REST API caching and optimistic UI updates, achieving a 96 Lighthouse performance & accessibility score.',
          ],
        },
      ],
      skills: [
        'React',
        'TypeScript',
        'JavaScript',
        'Tailwind CSS',
        'HTML/CSS',
        'Accessibility',
        'REST APIs',
        'Git',
        'Playwright',
        'SQL',
      ],
      certifications: [
        'Meta Frontend Developer Certificate',
        'W3C Web Accessibility Introduction (WAI)',
      ],
      updatedAt: oneDayAgo,
    },
    preferences: {
      jobTypes: ['Full-time', 'Graduate Trainee'],
      workModes: ['Hybrid', 'Remote'],
      locations: ['Lahore', 'Islamabad', 'Remote'],
      currency: 'PKR',
      minSalary: 125000,
      maxSalary: 195000,
      updatedAt: oneDayAgo,
    },
    savedJobs: demoSavedJobs,
    reports: [
      {
        id: 'rep-demo-01',
        jobId: SAMPLE_JOBS[0].id,
        jobTitle: SAMPLE_JOBS[0].title,
        company: SAMPLE_JOBS[0].company,
        completedAt: twoDaysAgo,
        overallScore: 68,
        passChance: 66,
        totalDurationSeconds: 235,
        topStrengths: [
          'Referenced relevant domain terms (react, typescript, components).',
          'Included initial project context clearly.',
        ],
        keyImprovements: [
          'Quantify your impact with numbers (e.g., percentage improvement or users reached).',
          'Pause briefly instead of using filler phrases: like (2), um (1).',
        ],
        answers: [
          {
            questionId: 'sw-1',
            questionPrompt:
              'Walk me through a technical project you built from scratch. What architectural trade-offs did you make, and how did you verify code quality?',
            focusArea: 'System Design & Code Quality',
            sampleTip:
              'Mention why you picked your stack over an alternative and cite a concrete metric.',
            answerText:
              'During my senior year capstone, our team needed to build a timetable planner for students. I implemented the frontend in React and TypeScript with reusable components and like tested the API integration manually and with unit tests so enrollment week went smoothly.',
            durationSeconds: 74,
            inputMethod: 'voice',
            breakdown: {
              total: 68,
              lengthPoints: 19,
              starPoints: 20,
              metricsPoints: 3,
              relevancePoints: 18,
              clarityPoints: 8,
              wordCount: 44,
              detectedStarParts: ['Situation', 'Task', 'Action'],
              matchedKeywords: ['react', 'typescript', 'components', 'api', 'test'],
              detectedFillers: ['like (1)'],
              strengths: ['Clear STAR narrative (Situation, Task, Action).'],
              improvements: [
                'Quantify your impact with numbers (e.g., percentage improvement, latency saved, or users reached).',
              ],
            },
          },
        ],
      },
      {
        id: 'rep-demo-02',
        jobId: SAMPLE_JOBS[0].id,
        jobTitle: SAMPLE_JOBS[0].title,
        company: SAMPLE_JOBS[0].company,
        completedAt: twoHoursAgo,
        overallScore: 86,
        passChance: 85,
        totalDurationSeconds: 268,
        topStrengths: [
          'Clear STAR narrative (Situation, Task, Action, Result).',
          'Backed up claims with concrete numbers or measurable outcomes.',
          'Crisp delivery with zero filler words detected.',
        ],
        keyImprovements: [
          'Weave in 1–2 additional architectural trade-off comparisons on backend caching.',
        ],
        answers: [
          {
            questionId: 'dyn-why-job-sys-fe-01',
            questionPrompt:
              'Why are you applying for the Junior Frontend Engineer role at Systems Limited, and which of your hands-on projects best demonstrates React?',
            focusArea: 'Role Fit — Systems Limited',
            sampleTip:
              'Connect a specific project where you used React, TypeScript, Tailwind CSS directly to Systems Limited.',
            answerText:
              'During my senior capstone at LUMS, our goal was to eliminate course registration crashes for students. I built the frontend in React, TypeScript, and Tailwind CSS with strict accessibility focus rings and keyboard support. As a result, over 1,400 students planned schedules in the first week and we achieved a 96 Lighthouse score, which directly aligns with building enterprise interfaces at Systems Limited.',
            durationSeconds: 88,
            inputMethod: 'voice',
            breakdown: {
              total: 92,
              lengthPoints: 25,
              starPoints: 25,
              metricsPoints: 20,
              relevancePoints: 12,
              clarityPoints: 10,
              wordCount: 66,
              detectedStarParts: ['Situation', 'Task', 'Action', 'Result'],
              matchedKeywords: ['react', 'typescript', 'tailwind css', 'accessibility', 'systems'],
              detectedFillers: [],
              strengths: [
                'Well-paced answer depth (66 words).',
                'Clear STAR narrative (Situation, Task, Action, Result).',
                'Backed up claims with concrete numbers or measurable outcomes.',
                'Crisp delivery with zero filler words detected.',
              ],
              improvements: [],
            },
          },
          {
            questionId: 'sw-2',
            questionPrompt:
              'Tell me about a tricky bug or performance bottleneck you diagnosed. How did you isolate the root cause and prevent it from recurring?',
            focusArea: 'Debugging & Root-Cause Analysis',
            sampleTip:
              'Explain how you reproduced the issue, inspected DevTools or logs, shipped the fix, and added a regression test.',
            answerText:
              'During my summer internship, our merchant analytics table froze whenever a client filtered more than 2,000 rows. My task was to bring filter latency below 400ms. I reproduced the bottleneck in Chrome DevTools profiler, found redundant re-renders on every keystroke, implemented debounced state and row virtualization, and added a Playwright test. That reduced render time by 42 percent down to 390ms.',
            durationSeconds: 92,
            inputMethod: 'voice',
            breakdown: {
              total: 88,
              lengthPoints: 22,
              starPoints: 25,
              metricsPoints: 20,
              relevancePoints: 11,
              clarityPoints: 10,
              wordCount: 63,
              detectedStarParts: ['Situation', 'Task', 'Action', 'Result'],
              matchedKeywords: ['reproduced', 'profiler', 'test', 'reduced'],
              detectedFillers: [],
              strengths: [
                'Clear STAR narrative (Situation, Task, Action, Result).',
                'Backed up claims with concrete numbers or measurable outcomes.',
              ],
              improvements: ['Expand slightly by 5–10 words on how monitoring alerted the team.'],
            },
          },
        ],
      },
    ],
    activities: [
      {
        id: 'act-demo-1',
        title: 'Completed Mock Interview (86%)',
        detail: 'Junior Frontend Engineer · Systems Limited',
        timestamp: twoHoursAgo,
        screenTarget: 'report',
      },
      {
        id: 'act-demo-2',
        title: 'Applied to Graduate Full-Stack Engineer',
        detail: 'Arbisoft · Tracked in Applied column',
        timestamp: oneDayAgo,
        screenTarget: 'saved-jobs',
      },
      {
        id: 'act-demo-3',
        title: 'Updated CV (Modern Minimal template)',
        detail: 'CV Readiness Score reached 92%',
        timestamp: oneDayAgo,
        screenTarget: 'cv',
      },
    ],
  };
}
