import { InterviewQuestion, RoleCategory, SavedJob } from '../types/career';

/**
 * ============================================================================
 * CAREERPILOT LOCAL INTERVIEW QUESTION BANK
 * ============================================================================
 * HOW TO EXTEND THIS BANK (for student maintainers):
 * 1. Find the `RoleCategory` array below (`software`, `data`, `design`,
 *    `product`, `marketing`, `finance`, or `general`).
 * 2. Append a new `InterviewQuestion` object with:
 *    - `id`: unique string ID
 *    - `category`: matching category key
 *    - `prompt`: exact question spoken by the Web Speech interviewer
 *    - `focusArea`: short label shown in the interview & report UI
 *    - `expectedKeywords`: keywords rewarded by the local scoring engine
 *    - `sampleTip`: actionable coaching tip displayed in the Final Report
 * ============================================================================
 */

export const QUESTION_BANK: Record<RoleCategory | 'general', InterviewQuestion[]> = {
  general: [
    {
      id: 'gen-1',
      category: 'general',
      prompt:
        'Tell me about a challenging university project or internship deadline where things did not go according to plan. How did you handle it and what was the outcome?',
      focusArea: 'Adaptability & STAR Execution',
      expectedKeywords: ['deadline', 'prioritized', 'team', 'delivered', 'learned', 'result'],
      sampleTip:
        'Frame your story clearly with Situation, Task, Action, and Result, and quantify how much time you saved or what grade/milestone you achieved.',
    },
    {
      id: 'gen-2',
      category: 'general',
      prompt:
        'Describe a time when you had to quickly learn an unfamiliar tool or concept to complete a deliverable. Walk me through your approach.',
      focusArea: 'Fast Learning & Initiative',
      expectedKeywords: ['documentation', 'built', 'prototype', 'tested', 'applied', 'days'],
      sampleTip:
        'Highlight your structured learning workflow (documentation, small prototype, peer feedback) and the tangible artifact you shipped.',
    },
  ],
  software: [
    {
      id: 'sw-1',
      category: 'software',
      prompt:
        'Walk me through a technical project you built from scratch. What architectural trade-offs did you make, and how did you verify code quality?',
      focusArea: 'System Design & Code Quality',
      expectedKeywords: ['architecture', 'api', 'state', 'testing', 'performance', 'components', 'database'],
      sampleTip:
        'Mention why you picked your stack over an alternative, how you handled error states, and cite a concrete metric like bundle size, latency, or test coverage.',
    },
    {
      id: 'sw-2',
      category: 'software',
      prompt:
        'Tell me about a tricky bug or performance bottleneck you diagnosed. How did you isolate the root cause and prevent it from recurring?',
      focusArea: 'Debugging & Root-Cause Analysis',
      expectedKeywords: ['reproduced', 'logs', 'profiler', 'root cause', 'fixed', 'test', 'reduced'],
      sampleTip:
        'Interviewers love systematic debugging: explain how you reproduced the issue, inspected DevTools or logs, shipped the fix, and added a regression test.',
    },
    {
      id: 'sw-3',
      category: 'software',
      prompt:
        'How do you ensure a web application you build is accessible, responsive across mobile and desktop, and maintainable for teammates?',
      focusArea: 'Frontend Craft & Accessibility',
      expectedKeywords: ['keyboard', 'aria', 'contrast', 'responsive', 'reusable', 'components', 'typescript'],
      sampleTip:
        'Reference WCAG contrast, keyboard navigation, semantic HTML, reusable components, and clear TypeScript interfaces.',
    },
  ],
  data: [
    {
      id: 'da-1',
      category: 'data',
      prompt:
        'Tell me about a messy dataset you analyzed. How did you clean and validate the data, and what actionable insight did you uncover?',
      focusArea: 'Data Wrangling & Business Impact',
      expectedKeywords: ['sql', 'python', 'missing', 'outliers', 'validated', 'insight', 'dashboard'],
      sampleTip:
        'Specify row volume, how you handled nulls or duplicates, and the exact percentage or business recommendation that came out of your analysis.',
    },
    {
      id: 'da-2',
      category: 'data',
      prompt:
        'Imagine a key product metric suddenly drops by 15 percent week over week. How would you investigate the root cause step by step?',
      focusArea: 'Structured Metric Investigation',
      expectedKeywords: ['segment', 'funnel', 'cohort', 'pipeline', 'tracking', 'hypothesis', 'compare'],
      sampleTip:
        'First verify data pipeline integrity, then segment by platform, geography, user cohort, and funnel stage before proposing hypotheses.',
    },
    {
      id: 'da-3',
      category: 'data',
      prompt:
        'Describe a dashboard or model you presented to non-technical stakeholders. How did you translate numbers into a clear decision?',
      focusArea: 'Data Storytelling',
      expectedKeywords: ['kpi', 'visualization', 'stakeholders', 'decision', 'trend', 'metric'],
      sampleTip:
        'Focus on how you simplified complex metrics into 2–3 clear KPIs tied directly to an action the team could take.',
    },
  ],
  design: [
    {
      id: 'ds-1',
      category: 'design',
      prompt:
        'Walk me through a UX flow you redesigned or created from scratch. How did user research or usability testing change your initial wireframes?',
      focusArea: 'User-Centered Iteration',
      expectedKeywords: ['figma', 'wireframe', 'usability', 'users', 'feedback', 'iteration', 'flow'],
      sampleTip:
        'Contrast your V1 assumption with what real users struggled with during testing, and state how V2 improved task completion.',
    },
    {
      id: 'ds-2',
      category: 'design',
      prompt:
        'How do you organize design tokens and reusable components in Figma so engineers can implement them accurately including dark mode and mobile states?',
      focusArea: 'Design Systems & Handoff',
      expectedKeywords: ['tokens', 'spacing', 'contrast', 'components', 'states', 'accessibility', 'responsive'],
      sampleTip:
        'Mention empty/loading/error states, WCAG contrast verification, and spacing/radius scales shared with engineering.',
    },
  ],
  product: [
    {
      id: 'pm-1',
      category: 'product',
      prompt:
        'Tell me about a time you had multiple feature ideas competing for limited time. How did you prioritize what to build first?',
      focusArea: 'Prioritization & Trade-offs',
      expectedKeywords: ['impact', 'effort', 'users', 'metric', 'roadmap', 'scope', 'mvp'],
      sampleTip:
        'Explain the framework you used (e.g., impact vs. effort), what you intentionally cut from the MVP, and how you measured post-launch success.',
    },
    {
      id: 'pm-2',
      category: 'product',
      prompt:
        'How would you improve onboarding conversion for a product aimed at university graduates? What metrics would you track?',
      focusArea: 'Product Sense & Metrics',
      expectedKeywords: ['activation', 'funnel', 'drop-off', 'experiment', 'onboarding', 'retention'],
      sampleTip:
        'Identify the core "aha moment", pinpoint friction steps in the funnel, propose 1–2 focused experiments, and define primary + guardrail metrics.',
    },
  ],
  marketing: [
    {
      id: 'mk-1',
      category: 'marketing',
      prompt:
        'Tell me about a campaign, content series, or growth experiment you ran. How did you measure performance and optimize results?',
      focusArea: 'Growth Experimentation & ROI',
      expectedKeywords: ['conversion', 'ctr', 'analytics', 'audience', 'copy', 'experiment', 'channel'],
      sampleTip:
        'Share baseline vs. final metrics (CTR, conversion rate, signups) and explain what audience insight drove the improvement.',
    },
    {
      id: 'mk-2',
      category: 'marketing',
      prompt:
        'If you had zero paid ad budget for the first 60 days, how would you acquire the first 500 targeted users for a new product?',
      focusArea: 'Organic Acquisition Strategy',
      expectedKeywords: ['seo', 'community', 'content', 'referral', 'funnel', 'landing page'],
      sampleTip:
        'Combine 2 repeatable organic channels (e.g., high-intent SEO guides + university partnerships) with clear weekly conversion targets.',
    },
  ],
  finance: [
    {
      id: 'fn-1',
      category: 'finance',
      prompt:
        'Walk me through a financial model, budget forecast, or operational analysis you built. How did you check your assumptions for accuracy?',
      focusArea: 'Analytical Rigor & Validation',
      expectedKeywords: ['excel', 'model', 'assumptions', 'variance', 'sensitivity', 'forecast', 'accuracy'],
      sampleTip:
        'Explain how you structured inputs separately from formulas, ran sensitivity scenarios, and reconciled totals against historical actuals.',
    },
    {
      id: 'fn-2',
      category: 'finance',
      prompt:
        'Describe a process bottleneck you noticed in a team or student organization and how you improved efficiency.',
      focusArea: 'Operational Improvement',
      expectedKeywords: ['process', 'automated', 'template', 'hours', 'reduced', 'tracking'],
      sampleTip:
        'Quantify the before-and-after impact (e.g., cutting weekly reporting time from 4 hours to 45 minutes).',
    },
  ],
};

/**
 * Builds a tailored interview question list for a chosen SavedJob:
 * Combines role-category questions from `QUESTION_BANK` with dynamic questions
 * generated directly from the saved job's title, company, and skill tags.
 */
export function generateInterviewQuestions(
  job: SavedJob,
  count = 5
): InterviewQuestion[] {
  const categoryQuestions = QUESTION_BANK[job.category] || QUESTION_BANK.software;
  const generalQuestions = QUESTION_BANK.general;

  const topSkills = job.tags.slice(0, 3);
  const skillsPhrase = topSkills.length > 0 ? topSkills.join(', ') : 'core domain fundamentals';

  const dynamicRoleQuestions: InterviewQuestion[] = [
    {
      id: `dyn-why-${job.id}`,
      category: job.category,
      prompt: `Why are you applying for the ${job.title} role at ${job.company}, and which of your hands-on projects best demonstrates ${topSkills[0] || 'your readiness'}?`,
      focusArea: `Role Fit — ${job.company}`,
      expectedKeywords: [
        ...job.tags.map((t) => t.toLowerCase()),
        job.company.toLowerCase().split(' ')[0],
        'project',
        'impact',
      ],
      sampleTip: `Connect a specific project where you used ${skillsPhrase} directly to ${job.company}'s product domain, and back it up with a measurable result.`,
    },
    {
      id: `dyn-skills-${job.id}`,
      category: job.category,
      prompt: `This ${job.title} position highlights ${skillsPhrase}. Tell me about a concrete problem you solved using one or more of these skills and the result you achieved.`,
      focusArea: `Applied Skills (${topSkills.slice(0, 2).join(' & ') || 'Core Stack'})`,
      expectedKeywords: [
        ...job.tags.map((t) => t.toLowerCase()),
        'built',
        'solved',
        'improved',
        'measured',
      ],
      sampleTip: `Mention the exact technical or operational steps you took with ${skillsPhrase}, avoid filler words, and state the final outcome clearly.`,
    },
  ];

  const combined: InterviewQuestion[] = [
    dynamicRoleQuestions[0],
    ...categoryQuestions.slice(0, 2),
    dynamicRoleQuestions[1],
    ...generalQuestions,
    ...categoryQuestions.slice(2),
  ];

  return combined.slice(0, Math.max(3, Math.min(count, combined.length)));
}
