import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  ApplicationStage,
  CareerPilotState,
  CVData,
  InterviewReport,
  JobListing,
  JobPreferences,
  SavedJob,
  ScreenId,
  TargetRole,
  ThemeMode,
  UserProfile,
} from '../types/career';
import {
  buildDemoGraduateState,
  clearCareerState,
  EMPTY_CAREER_STATE,
  loadCareerState,
  loadThemeMode,
  prependActivity,
  saveCareerState,
  saveThemeMode,
} from '../storage/careerStorage';

interface CareerContextValue {
  state: CareerPilotState;
  isHydrating: boolean;
  storageError: string | null;
  clearStorageError: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  activeScreen: ScreenId;
  navigate: (screen: ScreenId) => void;
  selectedInterviewJobId: string | null;
  setSelectedInterviewJobId: (id: string | null) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  // Actions
  registerAccount: (profile: Omit<UserProfile, 'id' | 'createdAt'>, password: string) => void;
  loadDemoAccount: () => void;
  signOut: () => void;
  resetWorkspace: () => void;
  updateTargetRole: (role: TargetRole) => void;
  updateCV: (cv: CVData) => void;
  updatePreferences: (prefs: JobPreferences) => void;
  toggleSaveJob: (job: JobListing) => boolean; // returns true if newly saved, false if removed
  markJobApplied: (job: JobListing, portalName: string) => void;
  updateSavedJobStage: (jobId: string, stage: ApplicationStage) => void;
  deleteSavedJob: (jobId: string) => void;
  recordInterviewReport: (report: InterviewReport) => void;
}

const CareerContext = createContext<CareerContextValue | null>(null);

export const useCareer = (): CareerContextValue => {
  const ctx = useContext(CareerContext);
  if (!ctx) {
    throw new Error('useCareer must be used inside CareerProvider');
  }
  return ctx;
};

export const CareerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CareerPilotState>(EMPTY_CAREER_STATE);
  const [isHydrating, setIsHydrating] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => loadThemeMode());
  const [activeScreen, setActiveScreen] = useState<ScreenId>('signup');
  const [selectedInterviewJobId, setSelectedInterviewJobId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Sync `.dark` class onto <html> for Tailwind v4 `@custom-variant dark`
  // Also temporarily remove `.dark` during window.print() so PDFs always render dark ink on white paper
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemeMode(theme);

    const handleBeforePrint = () => {
      root.classList.remove('dark');
    };
    const handleAfterPrint = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [theme]);

  // Initial hydration from localStorage via careerStorage module
  useEffect(() => {
    const { state: loaded, error } = loadCareerState();
    setState(loaded);
    if (error) setStorageError(error);
    if (loaded.user) {
      setActiveScreen('dashboard');
    } else {
      setActiveScreen('signup');
    }
    const timer = window.setTimeout(() => setIsHydrating(false), 160);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = useCallback((next: CareerPilotState) => {
    setState(next);
    const res = saveCareerState(next);
    if (!res.ok && res.error) {
      setStorageError(res.error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const navigate = useCallback((screen: ScreenId) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearStorageError = useCallback(() => setStorageError(null), []);

  const registerAccount = useCallback(
    (profile: Omit<UserProfile, 'id' | 'createdAt'>, password: string) => {
      const now = new Date().toISOString();
      const user: UserProfile = {
        id: `usr-${Date.now()}`,
        createdAt: now,
        ...profile,
      };
      const next: CareerPilotState = {
        ...EMPTY_CAREER_STATE,
        user,
        passwordHash: btoa(encodeURIComponent(password)).slice(0, 24),
        activities: prependActivity([], {
          title: 'Created CareerPilot workspace',
          detail: `${user.fullName} · Class of ${user.graduationYear}`,
          screenTarget: 'job-title',
        }),
      };
      persist(next);
      setActiveScreen('job-title');
    },
    [persist]
  );

  const loadDemoAccount = useCallback(() => {
    const demo = buildDemoGraduateState();
    persist(demo);
    setSelectedInterviewJobId(demo.savedJobs[0]?.id ?? null);
    setSelectedReportId(demo.reports[demo.reports.length - 1]?.id ?? null);
    setActiveScreen('dashboard');
  }, [persist]);

  const signOut = useCallback(() => {
    clearCareerState();
    setState(EMPTY_CAREER_STATE);
    setSelectedInterviewJobId(null);
    setSelectedReportId(null);
    setActiveScreen('signup');
  }, []);

  const resetWorkspace = useCallback(() => {
    clearCareerState();
    setState(EMPTY_CAREER_STATE);
    setStorageError(null);
    setActiveScreen('signup');
  }, []);

  const updateTargetRole = useCallback(
    (role: TargetRole) => {
      const next: CareerPilotState = {
        ...state,
        targetRole: role,
        activities: prependActivity(state.activities, {
          title: `Selected target role: ${role.title}`,
          detail: `${role.keywords.slice(0, 4).join(', ')}`,
          screenTarget: 'job-title',
        }),
      };
      persist(next);
    },
    [state, persist]
  );

  const updateCV = useCallback(
    (cv: CVData) => {
      const next: CareerPilotState = {
        ...state,
        cv,
        activities: prependActivity(state.activities, {
          title: cv.mode === 'upload' ? 'Uploaded & parsed CV' : 'Saved CV in builder',
          detail: `${cv.headline || 'Graduate CV'} · ${cv.templateId} template`,
          screenTarget: 'cv',
        }),
      };
      persist(next);
    },
    [state, persist]
  );

  const updatePreferences = useCallback(
    (prefs: JobPreferences) => {
      const next: CareerPilotState = {
        ...state,
        preferences: prefs,
        activities: prependActivity(state.activities, {
          title: 'Updated job preferences',
          detail: `${prefs.workModes.join(', ')} · ${prefs.locations.slice(0, 3).join(', ')}`,
          screenTarget: 'preferences',
        }),
      };
      persist(next);
    },
    [state, persist]
  );

  const toggleSaveJob = useCallback(
    (job: JobListing): boolean => {
      const exists = state.savedJobs.find((s) => s.id === job.id);
      if (exists) {
        const nextSaved = state.savedJobs.filter((s) => s.id !== job.id);
        persist({ ...state, savedJobs: nextSaved });
        return false;
      }
      const now = new Date().toISOString();
      const newSaved: SavedJob = {
        ...job,
        stage: 'Saved',
        savedAt: now,
        updatedAt: now,
      };
      const next: CareerPilotState = {
        ...state,
        savedJobs: [newSaved, ...state.savedJobs],
        activities: prependActivity(state.activities, {
          title: `Saved ${job.title}`,
          detail: `${job.company} · ${job.location}`,
          screenTarget: 'saved-jobs',
        }),
      };
      persist(next);
      return true;
    },
    [state, persist]
  );

  const markJobApplied = useCallback(
    (job: JobListing, portalName: string) => {
      const now = new Date().toISOString();
      const existing = state.savedJobs.find((s) => s.id === job.id);
      let nextSaved: SavedJob[];
      if (existing) {
        nextSaved = state.savedJobs.map((s) =>
          s.id === job.id
            ? {
                ...s,
                stage: s.stage === 'Saved' ? 'Applied' : s.stage,
                updatedAt: now,
                appliedVia: portalName,
              }
            : s
        );
      } else {
        nextSaved = [
          {
            ...job,
            stage: 'Applied',
            savedAt: now,
            updatedAt: now,
            appliedVia: portalName,
          },
          ...state.savedJobs,
        ];
      }
      const next: CareerPilotState = {
        ...state,
        savedJobs: nextSaved,
        activities: prependActivity(state.activities, {
          title: `Applied to ${job.title}`,
          detail: `${job.company} via ${portalName}`,
          screenTarget: 'saved-jobs',
        }),
      };
      persist(next);
    },
    [state, persist]
  );

  const updateSavedJobStage = useCallback(
    (jobId: string, stage: ApplicationStage) => {
      const target = state.savedJobs.find((j) => j.id === jobId);
      if (!target || target.stage === stage) return;
      const now = new Date().toISOString();
      const nextSaved = state.savedJobs.map((j) =>
        j.id === jobId ? { ...j, stage, updatedAt: now } : j
      );
      const next: CareerPilotState = {
        ...state,
        savedJobs: nextSaved,
        activities: prependActivity(state.activities, {
          title: `Moved ${target.title} to ${stage}`,
          detail: target.company,
          screenTarget: 'saved-jobs',
        }),
      };
      persist(next);
    },
    [state, persist]
  );

  const deleteSavedJob = useCallback(
    (jobId: string) => {
      const nextSaved = state.savedJobs.filter((j) => j.id !== jobId);
      persist({ ...state, savedJobs: nextSaved });
    },
    [state, persist]
  );

  const recordInterviewReport = useCallback(
    (report: InterviewReport) => {
      const nextReports = [...state.reports, report];
      // Automatically promote Saved/Applied job to Interview stage if still earlier
      const nextSaved = state.savedJobs.map((j) =>
        j.id === report.jobId && (j.stage === 'Saved' || j.stage === 'Applied')
          ? { ...j, stage: 'Interview' as const, updatedAt: report.completedAt }
          : j
      );
      const next: CareerPilotState = {
        ...state,
        savedJobs: nextSaved,
        reports: nextReports,
        activities: prependActivity(state.activities, {
          title: `Completed Mock Interview (${report.overallScore}%)`,
          detail: `${report.jobTitle} · ${report.company}`,
          screenTarget: 'report',
        }),
      };
      persist(next);
      setSelectedReportId(report.id);
    },
    [state, persist]
  );

  return (
    <CareerContext.Provider
      value={{
        state,
        isHydrating,
        storageError,
        clearStorageError,
        theme,
        toggleTheme,
        activeScreen,
        navigate,
        selectedInterviewJobId,
        setSelectedInterviewJobId,
        selectedReportId,
        setSelectedReportId,
        registerAccount,
        loadDemoAccount,
        signOut,
        resetWorkspace,
        updateTargetRole,
        updateCV,
        updatePreferences,
        toggleSaveJob,
        markJobApplied,
        updateSavedJobStage,
        deleteSavedJob,
        recordInterviewReport,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};
