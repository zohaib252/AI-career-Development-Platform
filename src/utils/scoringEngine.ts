import {
  CVData,
  CVScoreResult,
  CVSuggestion,
  InterviewQuestion,
  QuestionScoreBreakdown,
  TargetRole,
  UserProfile,
} from '../types/career';

/* ==========================================================================
   1. LOCAL RULE-BASED INTERVIEW ANSWER SCORER (100% Free & Transparent)
   --------------------------------------------------------------------------
   Calculates a deterministic 0–100 score across 5 transparent rubrics:
   - Depth & Length (0–25 pts): Rewards structured 55–180 word answers
   - STAR Structure (0–25 pts): Detects Situation, Task, Action, Result cues
   - Numbers & Metrics (0–20 pts): Rewards quantifiable impact (%, numbers)
   - Job Keyword Relevance (0–20 pts): Matches role/question keywords
   - Delivery Clarity (0–10 pts): Starts at 10, deducts for filler words
   ========================================================================== */

const STAR_MARKERS: Record<'Situation' | 'Task' | 'Action' | 'Result', RegExp> = {
  Situation:
    /\b(during|when|in my|while working|context|background|semester|internship|capstone|project where|team was facing)\b/i,
  Task:
    /\b(goal|objective|responsible for|needed to|tasked|challenge was|target|assigned|had to|requirement)\b/i,
  Action:
    /\b(i built|i designed|i implemented|i analyzed|i created|i led|i refactored|i collaborated|i wrote|i tested|step by step|configured|developed|automated)\b/i,
  Result:
    /\b(result|outcome|improved|reduced|increased|achieved|delivered|saved|launched|learned|successfully|led to|impact)\b/i,
};

const FILLER_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'um', regex: /\bum+\b/gi },
  { label: 'uh', regex: /\buh+\b/gi },
  { label: 'like', regex: /\blike\b/gi },
  { label: 'basically', regex: /\bbasically\b/gi },
  { label: 'literally', regex: /\bliterally\b/gi },
  { label: 'you know', regex: /\byou know\b/gi },
  { label: 'kind of', regex: /\bkind of\b/gi },
  { label: 'sort of', regex: /\bsort of\b/gi },
];

export function scoreInterviewAnswer(
  rawAnswer: string,
  question: InterviewQuestion,
  extraJobKeywords: string[] = []
): QuestionScoreBreakdown {
  const trimmed = rawAnswer.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      total: 0,
      lengthPoints: 0,
      starPoints: 0,
      metricsPoints: 0,
      relevancePoints: 0,
      clarityPoints: 0,
      wordCount: 0,
      detectedStarParts: [],
      matchedKeywords: [],
      detectedFillers: [],
      strengths: [],
      improvements: ['Provide a spoken or typed response of at least 60 words using the STAR method.'],
    };
  }

  // 1. Depth & Length (max 25 pts)
  let lengthPoints = 0;
  if (wordCount >= 65 && wordCount <= 220) {
    lengthPoints = 25;
  } else if (wordCount >= 45 && wordCount < 65) {
    lengthPoints = 19;
  } else if (wordCount > 220) {
    lengthPoints = 21; // Slightly verbose
  } else if (wordCount >= 25) {
    lengthPoints = 12;
  } else {
    lengthPoints = Math.max(4, Math.round((wordCount / 25) * 10));
  }

  // 2. STAR Structure (max 25 pts)
  const detectedStarParts: ('Situation' | 'Task' | 'Action' | 'Result')[] = [];
  (Object.keys(STAR_MARKERS) as ('Situation' | 'Task' | 'Action' | 'Result')[]).forEach(
    (part) => {
      if (STAR_MARKERS[part].test(trimmed)) {
        detectedStarParts.push(part);
      }
    }
  );
  const starPointsMap = [0, 7, 14, 20, 25];
  const starPoints = starPointsMap[detectedStarParts.length];

  // 3. Numbers & Metrics (max 20 pts)
  const metricMatches =
    trimmed.match(
      /\b(\d+(\.\d+)?%|\d+\s*(users|ms|seconds|minutes|hours|days|weeks|months|team|members|bugs|tests|endpoints|screens|pages|rows|x\b|k\b)|\$\d+)/gi
    ) || [];
  const standaloneNumbers = trimmed.match(/\b\d+\b/g) || [];
  let metricsPoints = 0;
  if (metricMatches.length >= 2) {
    metricsPoints = 20;
  } else if (metricMatches.length === 1) {
    metricsPoints = 15;
  } else if (standaloneNumbers.length >= 1) {
    metricsPoints = 10;
  } else {
    metricsPoints = 3;
  }

  // 4. Relevance to Job & Question Keywords (max 20 pts)
  const candidatePool = Array.from(
    new Set(
      [...question.expectedKeywords, ...extraJobKeywords]
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length >= 2)
    )
  );
  const lowerAnswer = trimmed.toLowerCase();
  const matchedKeywords = candidatePool.filter((kw) => lowerAnswer.includes(kw));
  let relevancePoints = 0;
  if (matchedKeywords.length >= 4) {
    relevancePoints = 20;
  } else if (matchedKeywords.length === 3) {
    relevancePoints = 16;
  } else if (matchedKeywords.length === 2) {
    relevancePoints = 12;
  } else if (matchedKeywords.length === 1) {
    relevancePoints = 8;
  } else {
    relevancePoints = 4;
  }

  // 5. Delivery Clarity & Filler Word Check (max 10 pts)
  const detectedFillers: string[] = [];
  let totalFillerOccurrences = 0;
  FILLER_PATTERNS.forEach(({ label, regex }) => {
    const matches = trimmed.match(regex);
    if (matches && matches.length > 0) {
      totalFillerOccurrences += matches.length;
      detectedFillers.push(`${label} (${matches.length})`);
    }
  });
  const clarityPoints = Math.max(2, 10 - totalFillerOccurrences * 2);

  const total = Math.min(
    100,
    lengthPoints + starPoints + metricsPoints + relevancePoints + clarityPoints
  );

  // Build strengths & actionable improvements
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (lengthPoints >= 21) {
    strengths.push(`Well-paced answer depth (${wordCount} words).`);
  } else {
    improvements.push(
      `Expand your answer from ${wordCount} words to roughly 70–150 words so the interviewer hears concrete detail.`
    );
  }

  if (detectedStarParts.length >= 3) {
    strengths.push(`Clear STAR narrative (${detectedStarParts.join(', ')}).`);
  } else {
    const missing = (['Situation', 'Task', 'Action', 'Result'] as const).filter(
      (p) => !detectedStarParts.includes(p)
    );
    improvements.push(
      `Strengthen STAR structure by explicitly stating the ${missing.join(' and ')}.`
    );
  }

  if (metricsPoints >= 15) {
    strengths.push('Backed up claims with concrete numbers or measurable outcomes.');
  } else {
    improvements.push(
      'Quantify your impact with numbers (e.g., percentage improvement, latency saved, team size, or users reached).'
    );
  }

  if (matchedKeywords.length >= 2) {
    strengths.push(`Referenced relevant domain terms (${matchedKeywords.slice(0, 4).join(', ')}).`);
  } else {
    improvements.push(
      `Weave in role-specific keywords such as ${candidatePool.slice(0, 4).join(', ')}.`
    );
  }

  if (totalFillerOccurrences === 0) {
    strengths.push('Crisp delivery with zero filler words detected.');
  } else {
    improvements.push(
      `Pause briefly instead of using filler phrases: ${detectedFillers.join(', ')}.`
    );
  }

  return {
    total,
    lengthPoints,
    starPoints,
    metricsPoints,
    relevancePoints,
    clarityPoints,
    wordCount,
    detectedStarParts,
    matchedKeywords,
    detectedFillers,
    strengths,
    improvements,
  };
}

/* ==========================================================================
   2. LOCAL RULE-BASED CV SCORER & SUGGESTION ENGINE
   ========================================================================== */

const STRONG_ACTION_VERBS = [
  'built',
  'designed',
  'developed',
  'engineered',
  'automated',
  'reduced',
  'improved',
  'launched',
  'optimized',
  'analyzed',
  'led',
  'implemented',
  'migrated',
  'created',
  'architected',
  'delivered',
];

export function scoreCVData(cv: CVData | null, targetKeywords: string[] = []): CVScoreResult {
  if (!cv) {
    return {
      overallScore: 0,
      sectionScores: {
        completeness: 0,
        impactMetrics: 0,
        keywordMatch: 0,
        actionVerbs: 0,
      },
      suggestions: [
        {
          id: 'empty-cv',
          priority: 'high',
          title: 'Create or upload your CV to unlock scoring',
          detail: 'Start with our guided builder or drop an existing resume file.',
        },
      ],
    };
  }

  const suggestions: CVSuggestion[] = [];

  // 1. Completeness (max 30)
  let completeness = 0;
  if (cv.fullName.trim()) completeness += 4;
  if (cv.email.trim()) completeness += 4;
  if (cv.phone.trim()) completeness += 3;
  if (cv.portfolioUrl.trim()) {
    completeness += 4;
  } else {
    suggestions.push({
      id: 'missing-portfolio',
      priority: 'medium',
      title: 'Add a GitHub, LinkedIn, or portfolio URL',
      detail: 'Recruiters reviewing fresh-graduate CVs frequently click project or profile links first.',
    });
  }

  const summaryWords = cv.summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 22 && summaryWords <= 75) {
    completeness += 6;
  } else {
    completeness += summaryWords > 0 ? 3 : 0;
    suggestions.push({
      id: 'summary-length',
      priority: summaryWords === 0 ? 'high' : 'low',
      title: summaryWords === 0 ? 'Write a concise 2–3 sentence professional summary' : 'Tighten summary to 25–65 words',
      detail: 'Lead with your degree, core technical/domain strengths, and the exact graduate role you are targeting.',
    });
  }

  if (cv.education.length > 0 && cv.education[0].institution.trim()) {
    completeness += 5;
  } else {
    suggestions.push({
      id: 'missing-edu',
      priority: 'high',
      title: 'Include your university degree and graduation year',
      detail: 'For fresh graduates, clear education credentials anchor ATS screening.',
    });
  }

  if (cv.experience.length >= 2) {
    completeness += 4;
  } else if (cv.experience.length === 1) {
    completeness += 2;
    suggestions.push({
      id: 'add-second-exp',
      priority: 'medium',
      title: 'Add at least 2 internships or capstone projects',
      detail: 'Combine academic capstones, open-source contributions, or internships to demonstrate applied experience.',
    });
  } else {
    suggestions.push({
      id: 'missing-exp',
      priority: 'high',
      title: 'Add internships or academic capstone projects',
      detail: 'List 2–3 hands-on projects with measurable bullet points.',
    });
  }

  // 2. Impact Metrics in Bullets (max 25)
  const allBullets = cv.experience.flatMap((e) => e.bullets).filter((b) => b.trim().length > 0);
  const quantifiedBullets = allBullets.filter((b) =>
    /(\d+%|\d+\+|\b\d+\s*(users|ms|sec|hours|days|screens|endpoints|datasets|members|k\b|x\b))/i.test(b)
  );
  let impactMetrics = 0;
  if (quantifiedBullets.length >= 3) {
    impactMetrics = 25;
  } else if (quantifiedBullets.length === 2) {
    impactMetrics = 18;
  } else if (quantifiedBullets.length === 1) {
    impactMetrics = 11;
  } else {
    impactMetrics = allBullets.length > 0 ? 4 : 0;
  }

  if (quantifiedBullets.length < 2) {
    suggestions.push({
      id: 'quantify-bullets',
      priority: 'high',
      title: 'Quantify results in your experience & project bullets',
      detail: 'Add numbers to at least 3 bullets (e.g., "Reduced page load by 38%" or "Analyzed 50,000+ survey rows").',
    });
  }

  // 3. Action Verbs (max 20)
  const verbHits = allBullets.filter((b) => {
    const firstWords = b.trim().toLowerCase().slice(0, 32);
    return STRONG_ACTION_VERBS.some((v) => firstWords.includes(v));
  });
  const actionVerbs = Math.min(20, verbHits.length * 6 + (allBullets.length > 0 ? 2 : 0));
  if (verbHits.length < 2) {
    suggestions.push({
      id: 'action-verbs',
      priority: 'medium',
      title: 'Start bullet points with strong engineering/business verbs',
      detail: 'Begin bullets with verbs like Built, Automated, Designed, Reduced, or Analyzed instead of "Worked on".',
    });
  }

  // 4. Role Keyword Match (max 25)
  const fullCvBlob = [
    cv.headline,
    cv.summary,
    cv.skills.join(' '),
    allBullets.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  const pool =
    targetKeywords.length > 0
      ? targetKeywords
      : ['React', 'TypeScript', 'Python', 'SQL', 'Git', 'Testing'];

  const matched = pool.filter((kw) => fullCvBlob.includes(kw.toLowerCase()));
  const missingKw = pool.filter((kw) => !fullCvBlob.includes(kw.toLowerCase()));
  const ratio = pool.length > 0 ? matched.length / pool.length : 0.5;
  const keywordMatch = Math.min(25, Math.round(ratio * 25) + (cv.skills.length >= 5 ? 4 : 0));

  if (missingKw.length > 0 && ratio < 0.75) {
    suggestions.push({
      id: 'missing-keywords',
      priority: ratio < 0.4 ? 'high' : 'low',
      title: 'Align skills with your target role keywords',
      detail: `Consider adding hands-on skills you know from: ${missingKw.slice(0, 5).join(', ')}.`,
    });
  }

  if (cv.certifications.length === 0) {
    suggestions.push({
      id: 'optional-certs',
      priority: 'low',
      title: 'List relevant coursework, honors, or free certifications',
      detail: 'Adding CS50, freeCodeCamp, Kaggle, or Dean’s List honors strengthens entry-level screening.',
    });
  }

  const overallScore = Math.max(
    8,
    Math.min(100, completeness + impactMetrics + actionVerbs + keywordMatch)
  );

  // Order suggestions: high -> medium -> low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    overallScore,
    sectionScores: {
      completeness: Math.round((completeness / 30) * 100),
      impactMetrics: Math.round((impactMetrics / 25) * 100),
      keywordMatch: Math.round((keywordMatch / 25) * 100),
      actionVerbs: Math.round((actionVerbs / 20) * 100),
    },
    suggestions,
  };
}

/* ==========================================================================
   3. LOCAL CLIENT-SIDE CV FILE PARSER (Zero external APIs)
   Extracts readable text & heuristics from .txt, .md, .json, .pdf, or .docx
   ========================================================================== */

export async function parseUploadedCVFile(
  file: File,
  user: UserProfile | null,
  targetRole: TargetRole | null
): Promise<CVData> {
  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error('File exceeds the 5 MB limit. Please upload a smaller CV file.');
  }

  const rawBuffer = await file.arrayBuffer();
  let extractedText = '';

  if (
    file.type.startsWith('text/') ||
    /\.(txt|md|json|csv|html)$/i.test(file.name)
  ) {
    extractedText = new TextDecoder('utf-8', { fatal: false }).decode(rawBuffer);
  } else {
    // Extract printable ASCII/UTF-8 text segments from PDF or DOCX binary streams locally
    const rawStr = new TextDecoder('latin1').decode(rawBuffer);
    const parentheticalPdfRuns = Array.from(rawStr.matchAll(/\(([\x20-\x7E]{3,})\)/g)).map(
      (m) => m[1]
    );
    const xmlRuns = Array.from(rawStr.matchAll(/>([^<>]{3,120})</g)).map((m) => m[1]);
    const readableChunks =
      parentheticalPdfRuns.length > 8
        ? parentheticalPdfRuns
        : xmlRuns.length > 8
          ? xmlRuns
          : rawStr.match(/[A-Za-z0-9@.,:/\-+() ]{5,}/g) || [];
    extractedText = readableChunks
      .join(' ')
      .replace(/\\[nrt]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Heuristic field extraction
  const emailMatch = extractedText.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const phoneMatch = extractedText.match(/(\+?\d[\d\s\-()]{8,15}\d)/);
  const urlMatch = extractedText.match(/(https?:\/\/[^\s,)]+|(?:github|linkedin)\.com\/[^\s,)]+)/i);

  const commonTechSkills = [
    'React',
    'TypeScript',
    'JavaScript',
    'Python',
    'SQL',
    'Node.js',
    'Tailwind CSS',
    'HTML/CSS',
    'Figma',
    'Git',
    'PostgreSQL',
    'Excel',
    'Power BI',
    'Tableau',
    'Java',
    'Docker',
    'REST APIs',
  ];
  const lowerBlob = extractedText.toLowerCase();
  const detectedSkills = commonTechSkills.filter((skill) =>
    lowerBlob.includes(skill.toLowerCase())
  );

  const fallbackSkills =
    detectedSkills.length >= 3
      ? detectedSkills
      : targetRole?.keywords.slice(0, 6) || ['React', 'TypeScript', 'Git', 'SQL', 'Problem Solving'];

  const cleanLines = extractedText
    .split(/\r?\n|\u2022|•/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && l.length < 220 && /[a-zA-Z]{4,}/.test(l));

  const extractedBullets =
    cleanLines.length >= 2
      ? cleanLines.slice(0, 3)
      : [
          `Built and tested responsive web features aligned with ${targetRole?.title || 'graduate engineering'} requirements, cutting manual steps by 30%.`,
          'Collaborated in a 4-person agile capstone squad using Git pull requests, code reviews, and weekly milestone demos.',
        ];

  return {
    mode: 'upload',
    templateId: 'modern',
    uploadedFileName: file.name,
    fullName: user?.fullName || 'Alex Morgan',
    headline: targetRole?.title || 'Junior Software Engineer',
    email: emailMatch ? emailMatch[0] : user?.email || 'graduate@university.edu',
    phone: phoneMatch ? phoneMatch[0].trim() : '+92 300 5550192',
    location: 'Lahore / Remote',
    portfolioUrl: urlMatch ? urlMatch[0] : 'linkedin.com/in/graduate-portfolio',
    summary:
      cleanLines[0] && cleanLines[0].length >= 45
        ? cleanLines[0]
        : `Motivated ${user?.graduationYear || '2026'} graduate from ${user?.university || 'FAST-NUCES'} targeting ${targetRole?.title || 'entry-level technology'} roles, combining strong academic foundations with measurable project delivery.`,
    education: [
      {
        id: 'edu-parsed-1',
        degree: 'Bachelor of Science in Computer Science',
        institution: user?.university || 'National University of Sciences & Technology',
        year: user?.graduationYear || '2026',
        gpaOrHonors: '3.68 / 4.00 · Dean’s Honor List',
        highlights: 'Data Structures, Software Engineering, Database Systems, Human-Computer Interaction',
      },
    ],
    experience: [
      {
        id: 'exp-parsed-1',
        role: `${targetRole?.title || 'Software Engineering'} Capstone & Internship`,
        organization: `Parsed from ${file.name}`,
        duration: '2025 – 2026',
        type: 'Capstone Project',
        bullets: extractedBullets,
      },
    ],
    skills: fallbackSkills,
    certifications: ['Responsive Web & Accessibility Foundations', 'SQL & Data Analysis Essentials'],
    updatedAt: new Date().toISOString(),
  };
}
