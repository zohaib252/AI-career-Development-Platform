/**
 * CareerPilot Data Models & Types
 * --------------------------------------------------------------------------
 * All screens and the storage module share these interfaces so maintainers
 * can easily trace data from Sign-Up through the Final Report.
 */

export type ScreenId =
  | 'signup'
  | 'dashboard'
  | 'job-title'
  | 'cv'
  | 'preferences'
  | 'jobs'
  | 'saved-jobs'
  | 'interview'
  | 'report';

export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  university: string;
  graduationYear: string;
  createdAt: string;
}

export type RoleCategory =
  | 'software'
  | 'data'
  | 'design'
  | 'product'
  | 'marketing'
  | 'finance';

export interface TargetRole {
  title: string;
  category: RoleCategory;
  keywords: string[];
  updatedAt: string;
}

export type CVTemplateId = 'modern' | 'classic' | 'compact';

export interface CVEducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpaOrHonors: string;
  highlights: string;
}

export interface CVExperienceItem {
  id: string;
  role: string;
  organization: string;
  duration: string;
  type: 'Internship' | 'Capstone Project' | 'Part-time' | 'Leadership';
  bullets: string[];
}

export interface CVData {
  mode: 'create' | 'upload';
  templateId: CVTemplateId;
  uploadedFileName?: string;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  summary: string;
  education: CVEducationItem[];
  experience: CVExperienceItem[];
  skills: string[];
  certifications: string[];
  updatedAt: string;
}

export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface CVSuggestion {
  id: string;
  priority: SuggestionPriority;
  title: string;
  detail: string;
}

export interface CVScoreResult {
  overallScore: number; // 0–100
  sectionScores: {
    completeness: number;
    impactMetrics: number;
    keywordMatch: number;
    actionVerbs: number;
  };
  suggestions: CVSuggestion[];
}

export type JobType = 'Full-time' | 'Internship' | 'Graduate Trainee' | 'Contract';
export type WorkMode = 'Hybrid' | 'Remote' | 'On-site';
export type CurrencyCode = 'PKR' | 'USD' | 'GBP' | 'EUR';

export interface JobPreferences {
  jobTypes: JobType[];
  workModes: WorkMode[];
  locations: string[];
  currency: CurrencyCode;
  minSalary: number;
  maxSalary: number;
  updatedAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  companyHue: 'indigo' | 'violet' | 'emerald' | 'sky' | 'amber' | 'rose' | 'slate';
  category: RoleCategory;
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  currency: CurrencyCode;
  salaryMin: number;
  salaryMax: number;
  salaryLabel: string;
  postedDaysAgo: number;
  postedLabel: string;
  tags: string[];
  summary: string;
}

export type ApplicationStage = 'Saved' | 'Applied' | 'Interview' | 'Offer';

export interface SavedJob extends JobListing {
  stage: ApplicationStage;
  savedAt: string;
  updatedAt: string;
  appliedVia?: string;
  notes?: string;
}

export interface InterviewQuestion {
  id: string;
  category: RoleCategory | 'general';
  prompt: string;
  focusArea: string;
  expectedKeywords: string[];
  sampleTip: string;
}

export interface QuestionScoreBreakdown {
  total: number; // 0–100
  lengthPoints: number; // max 25
  starPoints: number; // max 25
  metricsPoints: number; // max 20
  relevancePoints: number; // max 20
  clarityPoints: number; // max 10 (deducts for filler words)
  wordCount: number;
  detectedStarParts: ('Situation' | 'Task' | 'Action' | 'Result')[];
  matchedKeywords: string[];
  detectedFillers: string[];
  strengths: string[];
  improvements: string[];
}

export interface QuestionAnswerRecord {
  questionId: string;
  questionPrompt: string;
  focusArea: string;
  sampleTip: string;
  answerText: string;
  durationSeconds: number;
  inputMethod: 'voice' | 'typed';
  breakdown: QuestionScoreBreakdown;
}

export interface InterviewReport {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  completedAt: string;
  overallScore: number; // 0–100 average
  passChance: number; // 0–100 calculated readiness probability
  totalDurationSeconds: number;
  topStrengths: string[];
  keyImprovements: string[];
  answers: QuestionAnswerRecord[];
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  screenTarget?: ScreenId;
}

export interface CareerPilotState {
  version: number;
  user: UserProfile | null;
  passwordHash?: string; // Local-only obfuscated demo credential check
  targetRole: TargetRole | null;
  cv: CVData | null;
  preferences: JobPreferences | null;
  savedJobs: SavedJob[];
  reports: InterviewReport[];
  activities: ActivityItem[];
}
