import {
  CurrencyCode,
  JobListing,
  JobPreferences,
  RoleCategory,
} from '../types/career';

export interface RoleSuggestion {
  title: string;
  category: RoleCategory;
  categoryLabel: string;
  keywords: string[];
  description: string;
}

/**
 * Curated graduate role catalog.
 * Student maintainers can add new role chips simply by appending an object here.
 */
export const POPULAR_ROLES: RoleSuggestion[] = [
  {
    title: 'Junior Frontend Engineer',
    category: 'software',
    categoryLabel: 'Software Engineering',
    keywords: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML/CSS', 'Accessibility', 'Git', 'REST APIs'],
    description: 'Build responsive interfaces, reusable design systems, and accessible web experiences.',
  },
  {
    title: 'Graduate Full-Stack Developer',
    category: 'software',
    categoryLabel: 'Software Engineering',
    keywords: ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker', 'Git', 'Testing'],
    description: 'Ship end-to-end product features across client interfaces, APIs, and databases.',
  },
  {
    title: 'Associate Software Engineer (Backend)',
    category: 'software',
    categoryLabel: 'Software Engineering',
    keywords: ['Python', 'Java', 'Node.js', 'SQL', 'Microservices', 'Caching', 'Unit Testing', 'Cloud'],
    description: 'Design reliable backend services, database schemas, and scalable API endpoints.',
  },
  {
    title: 'Junior QA & Automation Engineer',
    category: 'software',
    categoryLabel: 'Software Engineering',
    keywords: ['Playwright', 'Cypress', 'Test Cases', 'Bug Triage', 'CI/CD', 'API Testing', 'JavaScript'],
    description: 'Safeguard product quality through automated end-to-end suites and structured test plans.',
  },
  {
    title: 'Junior Data Analyst',
    category: 'data',
    categoryLabel: 'Data & Analytics',
    keywords: ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'A/B Testing', 'Data Cleaning', 'Dashboards'],
    description: 'Turn raw product and business datasets into actionable dashboards and clear insights.',
  },
  {
    title: 'Graduate Machine Learning Engineer',
    category: 'data',
    categoryLabel: 'Data & Analytics',
    keywords: ['Python', 'PyTorch', 'Scikit-learn', 'SQL', 'Feature Engineering', 'Model Evaluation', 'NLP'],
    description: 'Train, evaluate, and deploy predictive and language models into real applications.',
  },
  {
    title: 'Business Intelligence Associate',
    category: 'data',
    categoryLabel: 'Data & Analytics',
    keywords: ['SQL', 'Power BI', 'ETL', 'KPIs', 'Data Modeling', 'Stakeholder Reporting', 'Spreadsheets'],
    description: 'Build automated reporting pipelines and executive KPI scorecards across teams.',
  },
  {
    title: 'Junior UI/UX Product Designer',
    category: 'design',
    categoryLabel: 'Product & Design',
    keywords: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing', 'Accessibility', 'User Flows'],
    description: 'Craft intuitive user flows, interactive Figma prototypes, and cohesive component libraries.',
  },
  {
    title: 'Associate Product Manager (APM)',
    category: 'product',
    categoryLabel: 'Product & Design',
    keywords: ['Roadmapping', 'User Stories', 'Prioritization', 'Analytics', 'Agile', 'User Research', 'Stakeholders'],
    description: 'Partner with engineering and design to scope problems, prioritize features, and measure outcomes.',
  },
  {
    title: 'Digital Marketing & Growth Associate',
    category: 'marketing',
    categoryLabel: 'Marketing & Growth',
    keywords: ['SEO', 'Google Analytics', 'Content Strategy', 'Conversion Funnel', 'Copywriting', 'CRM', 'Campaigns'],
    description: 'Run acquisition experiments, optimize landing page conversion, and analyze campaign ROI.',
  },
  {
    title: 'Graduate Financial & Business Analyst',
    category: 'finance',
    categoryLabel: 'Finance & Operations',
    keywords: ['Financial Modeling', 'Excel', 'Forecasting', 'Variance Analysis', 'SQL', 'Valuation', 'Reporting'],
    description: 'Support budgeting, unit-economics modeling, and strategic operational decisions.',
  },
  {
    title: 'Operations & Project Coordinator',
    category: 'finance',
    categoryLabel: 'Finance & Operations',
    keywords: ['Process Improvement', 'Project Tracking', 'SOPs', 'Cross-functional', 'Excel', 'Risk Management'],
    description: 'Streamline workflows, coordinate cross-team deliverables, and track operational SLAs.',
  },
];

/**
 * Infers a RoleCategory and relevant skill keywords for any custom job title.
 */
export function inferRoleMetadata(rawTitle: string): {
  category: RoleCategory;
  keywords: string[];
} {
  const exact = POPULAR_ROLES.find(
    (r) => r.title.toLowerCase() === rawTitle.trim().toLowerCase()
  );
  if (exact) {
    return { category: exact.category, keywords: exact.keywords };
  }

  const lower = rawTitle.toLowerCase();
  if (/(data|analytics|bi\b|machine learning|ml\b|ai\b|statistic)/.test(lower)) {
    return {
      category: 'data',
      keywords: ['SQL', 'Python', 'Dashboards', 'Data Cleaning', 'Power BI', 'Metrics', 'Reporting'],
    };
  }
  if (/(design|ux|ui|figma|visual|creative|brand)/.test(lower)) {
    return {
      category: 'design',
      keywords: ['Figma', 'Prototyping', 'Design Systems', 'User Research', 'Accessibility', 'Wireframing'],
    };
  }
  if (/(product manager|apm|scrum|agile|owner)/.test(lower)) {
    return {
      category: 'product',
      keywords: ['User Stories', 'Prioritization', 'Roadmapping', 'Analytics', 'Agile', 'User Research'],
    };
  }
  if (/(market|seo|growth|social|content|copy|sales|bd\b)/.test(lower)) {
    return {
      category: 'marketing',
      keywords: ['SEO', 'Analytics', 'Campaigns', 'Copywriting', 'Conversion', 'CRM', 'Funnel'],
    };
  }
  if (/(financ|account|audit|bank|operations|supply|hr|analyst)/.test(lower)) {
    return {
      category: 'finance',
      keywords: ['Excel', 'Financial Modeling', 'Forecasting', 'Reporting', 'Process Improvement', 'KPIs'],
    };
  }

  return {
    category: 'software',
    keywords: ['TypeScript', 'React', 'Python', 'Git', 'REST APIs', 'SQL', 'Testing'],
  };
}

/**
 * Realistic Graduate & Entry-Level Job Catalog
 * Note: Because no paid external job-scraping APIs are allowed, these curated
 * roles provide rich offline filtering while the "Apply" button launches real,
 * live searches on LinkedIn, Indeed, Glassdoor, and Rozee.pk.
 */
export const SAMPLE_JOBS: JobListing[] = [
  {
    id: 'job-sys-fe-01',
    title: 'Junior Frontend Engineer',
    company: 'Systems Limited',
    companyInitials: 'SL',
    companyHue: 'indigo',
    category: 'software',
    location: 'Lahore',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 135000,
    salaryMax: 175000,
    salaryLabel: 'PKR 135k – 175k / mo',
    postedDaysAgo: 1,
    postedLabel: '1d ago',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Accessibility', 'REST APIs'],
    summary: 'Join our enterprise digital product squad to build accessible React dashboards and component libraries for global clients.',
  },
  {
    id: 'job-arb-fs-02',
    title: 'Graduate Full-Stack Engineer',
    company: 'Arbisoft',
    companyInitials: 'AR',
    companyHue: 'violet',
    category: 'software',
    location: 'Lahore',
    workMode: 'Hybrid',
    jobType: 'Graduate Trainee',
    currency: 'PKR',
    salaryMin: 150000,
    salaryMax: 190000,
    salaryLabel: 'PKR 150k – 190k / mo',
    postedDaysAgo: 2,
    postedLabel: '2d ago',
    tags: ['Python', 'React', 'PostgreSQL', 'TypeScript', 'Git'],
    summary: 'Structured 6-month graduate engineering rotation shipping full-stack EdTech and SaaS web applications.',
  },
  {
    id: 'job-sp-be-03',
    title: 'Associate Backend Engineer',
    company: 'SadaPay',
    companyInitials: 'SP',
    companyHue: 'emerald',
    category: 'software',
    location: 'Islamabad',
    workMode: 'Remote',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 165000,
    salaryMax: 220000,
    salaryLabel: 'PKR 165k – 220k / mo',
    postedDaysAgo: 3,
    postedLabel: '3d ago',
    tags: ['Java', 'Node.js', 'Microservices', 'SQL', 'Unit Testing'],
    summary: 'Build high-reliability payment ledger microservices with automated test suites and clean observability.',
  },
  {
    id: 'job-10p-qa-04',
    title: 'Junior QA Automation Engineer',
    company: '10Pearls',
    companyInitials: '10P',
    companyHue: 'sky',
    category: 'software',
    location: 'Karachi',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 115000,
    salaryMax: 150000,
    salaryLabel: 'PKR 115k – 150k / mo',
    postedDaysAgo: 4,
    postedLabel: '4d ago',
    tags: ['Playwright', 'Cypress', 'API Testing', 'CI/CD', 'JavaScript'],
    summary: 'Design automated browser and API regression pipelines alongside cross-functional agile squads.',
  },
  {
    id: 'job-vrc-fe-05',
    title: 'Frontend Engineering Intern',
    company: 'MetricFlow Cloud',
    companyInitials: 'MF',
    companyHue: 'indigo',
    category: 'software',
    location: 'Remote',
    workMode: 'Remote',
    jobType: 'Internship',
    currency: 'USD',
    salaryMin: 1200,
    salaryMax: 1800,
    salaryLabel: 'USD 1.2k – 1.8k / mo',
    postedDaysAgo: 2,
    postedLabel: '2d ago',
    tags: ['React', 'TypeScript', 'Design Systems', 'HTML/CSS', 'Git'],
    summary: 'Paid remote graduate internship focused on interactive chart components and keyboard-first SaaS workflows.',
  },
  {
    id: 'job-em-da-06',
    title: 'Junior Data Analyst',
    company: 'Careem',
    companyInitials: 'CR',
    companyHue: 'emerald',
    category: 'data',
    location: 'Karachi',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 145000,
    salaryMax: 185000,
    salaryLabel: 'PKR 145k – 185k / mo',
    postedDaysAgo: 1,
    postedLabel: '1d ago',
    tags: ['SQL', 'Python', 'Tableau', 'A/B Testing', 'Dashboards'],
    summary: 'Analyze mobility and delivery funnel metrics, design cohort retention dashboards, and evaluate pricing experiments.',
  },
  {
    id: 'job-af-ml-07',
    title: 'Graduate Machine Learning Engineer',
    company: 'Afiniti',
    companyInitials: 'AF',
    companyHue: 'rose',
    category: 'data',
    location: 'Islamabad',
    workMode: 'On-site',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 175000,
    salaryMax: 230000,
    salaryLabel: 'PKR 175k – 230k / mo',
    postedDaysAgo: 5,
    postedLabel: '5d ago',
    tags: ['Python', 'Scikit-learn', 'PyTorch', 'SQL', 'Model Evaluation'],
    summary: 'Develop, validate, and monitor production pairing models over high-volume enterprise datasets.',
  },
  {
    id: 'job-dz-bi-08',
    title: 'Business Intelligence Associate',
    company: 'Daraz',
    companyInitials: 'DZ',
    companyHue: 'amber',
    category: 'data',
    location: 'Karachi',
    workMode: 'Hybrid',
    jobType: 'Graduate Trainee',
    currency: 'PKR',
    salaryMin: 125000,
    salaryMax: 160000,
    salaryLabel: 'PKR 125k – 160k / mo',
    postedDaysAgo: 3,
    postedLabel: '3d ago',
    tags: ['SQL', 'Power BI', 'Excel', 'KPIs', 'Data Modeling'],
    summary: 'Partner with marketplace category leads to automate GMV, fulfillment speed, and seller health reporting.',
  },
  {
    id: 'job-nx-ux-09',
    title: 'Junior UI/UX Product Designer',
    company: 'NayaPay',
    companyInitials: 'NP',
    companyHue: 'amber',
    category: 'design',
    location: 'Karachi',
    workMode: 'On-site',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 130000,
    salaryMax: 170000,
    salaryLabel: 'PKR 130k – 170k / mo',
    postedDaysAgo: 2,
    postedLabel: '2d ago',
    tags: ['Figma', 'Prototyping', 'Design Systems', 'Usability Testing', 'User Flows'],
    summary: 'Design consumer and merchant fintech flows from early wireframes through high-craft interactive Figma specs.',
  },
  {
    id: 'job-ln-ds-10',
    title: 'Product Design Intern (Design Systems)',
    company: 'Northstar Labs',
    companyInitials: 'NL',
    companyHue: 'violet',
    category: 'design',
    location: 'Remote',
    workMode: 'Remote',
    jobType: 'Internship',
    currency: 'USD',
    salaryMin: 1000,
    salaryMax: 1500,
    salaryLabel: 'USD 1.0k – 1.5k / mo',
    postedDaysAgo: 6,
    postedLabel: '6d ago',
    tags: ['Figma', 'Design Systems', 'Accessibility', 'Wireframing', 'Prototyping'],
    summary: 'Audit token contrast, document Figma variants, and collaborate closely with frontend engineers.',
  },
  {
    id: 'job-bz-pm-11',
    title: 'Associate Product Manager (APM)',
    company: 'Bazaar Technologies',
    companyInitials: 'BZ',
    companyHue: 'indigo',
    category: 'product',
    location: 'Karachi',
    workMode: 'Hybrid',
    jobType: 'Graduate Trainee',
    currency: 'PKR',
    salaryMin: 155000,
    salaryMax: 200000,
    salaryLabel: 'PKR 155k – 200k / mo',
    postedDaysAgo: 1,
    postedLabel: '1d ago',
    tags: ['User Stories', 'Prioritization', 'Analytics', 'User Research', 'Agile'],
    summary: '12-month APM track owning merchant onboarding metrics, field user interviews, and sprint delivery.',
  },
  {
    id: 'job- motive-pm-12',
    title: 'Junior Technical Product Specialist',
    company: 'Motive',
    companyInitials: 'MV',
    companyHue: 'slate',
    category: 'product',
    location: 'Islamabad',
    workMode: 'Remote',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 170000,
    salaryMax: 215000,
    salaryLabel: 'PKR 170k – 215k / mo',
    postedDaysAgo: 4,
    postedLabel: '4d ago',
    tags: ['Roadmapping', 'SQL', 'User Stories', 'Stakeholders', 'Agile'],
    summary: 'Bridge fleet hardware telemetry teams and customer workflows through crisp specs and usage analytics.',
  },
  {
    id: 'job-fp-mk-13',
    title: 'Growth & Performance Marketing Associate',
    company: 'foodpanda',
    companyInitials: 'FP',
    companyHue: 'rose',
    category: 'marketing',
    location: 'Lahore',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 110000,
    salaryMax: 145000,
    salaryLabel: 'PKR 110k – 145k / mo',
    postedDaysAgo: 2,
    postedLabel: '2d ago',
    tags: ['Google Analytics', 'Conversion Funnel', 'CRM', 'Campaigns', 'Copywriting'],
    summary: 'Execute lifecycle retention campaigns, A/B test push & email copy, and track cohort CAC/LTV.',
  },
  {
    id: 'job-cw-seo-14',
    title: 'Junior SEO & Content Strategist',
    company: 'Cloudways',
    companyInitials: 'CW',
    companyHue: 'sky',
    category: 'marketing',
    location: 'Remote',
    workMode: 'Remote',
    jobType: 'Full-time',
    currency: 'USD',
    salaryMin: 1100,
    salaryMax: 1600,
    salaryLabel: 'USD 1.1k – 1.6k / mo',
    postedDaysAgo: 5,
    postedLabel: '5d ago',
    tags: ['SEO', 'Content Strategy', 'Google Analytics', 'Copywriting', 'Conversion Funnel'],
    summary: 'Research technical developer search intent, optimize organic landing pages, and grow qualified signups.',
  },
  {
    id: 'job-eng-fin-15',
    title: 'Graduate Financial Analyst',
    company: 'Engro Corporation',
    companyInitials: 'EC',
    companyHue: 'emerald',
    category: 'finance',
    location: 'Karachi',
    workMode: 'On-site',
    jobType: 'Graduate Trainee',
    currency: 'PKR',
    salaryMin: 140000,
    salaryMax: 180000,
    salaryLabel: 'PKR 140k – 180k / mo',
    postedDaysAgo: 3,
    postedLabel: '3d ago',
    tags: ['Financial Modeling', 'Excel', 'Forecasting', 'Variance Analysis', 'Reporting'],
    summary: 'Support quarterly forecasting, capex evaluation models, and business unit variance commentary.',
  },
  {
    id: 'job-dv-ops-16',
    title: 'Operations & Strategy Associate',
    company: 'Devsinc',
    companyInitials: 'DV',
    companyHue: 'indigo',
    category: 'finance',
    location: 'Lahore',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    currency: 'PKR',
    salaryMin: 120000,
    salaryMax: 155000,
    salaryLabel: 'PKR 120k – 155k / mo',
    postedDaysAgo: 4,
    postedLabel: '4d ago',
    tags: ['Process Improvement', 'Project Tracking', 'Excel', 'KPIs', 'Cross-functional'],
    summary: 'Coordinate delivery resource planning, track operational KPIs, and standardize client onboarding SOPs.',
  },
  {
    id: 'job-lon-swe-17',
    title: 'Graduate Software Engineer',
    company: 'Monzo Tech Grad',
    companyInitials: 'MZ',
    companyHue: 'rose',
    category: 'software',
    location: 'London',
    workMode: 'Hybrid',
    jobType: 'Graduate Trainee',
    currency: 'GBP',
    salaryMin: 3800,
    salaryMax: 4500,
    salaryLabel: 'GBP 3.8k – 4.5k / mo',
    postedDaysAgo: 2,
    postedLabel: '2d ago',
    tags: ['TypeScript', 'React', 'Go', 'REST APIs', 'Testing'],
    summary: 'Rotate across consumer banking squads building resilient backend services and accessible mobile/web tooling.',
  },
  {
    id: 'job-dxb-da-18',
    title: 'Junior Product Data Analyst',
    company: 'Noon',
    companyInitials: 'NN',
    companyHue: 'amber',
    category: 'data',
    location: 'Dubai',
    workMode: 'On-site',
    jobType: 'Full-time',
    currency: 'USD',
    salaryMin: 2400,
    salaryMax: 3200,
    salaryLabel: 'USD 2.4k – 3.2k / mo',
    postedDaysAgo: 3,
    postedLabel: '3d ago',
    tags: ['SQL', 'Python', 'Dashboards', 'Excel', 'A/B Testing'],
    summary: 'Deliver daily checkout conversion insights and fulfillment latency analyses across MENA e-commerce.',
  },
];

/**
 * Computes a 0–99% match score between a JobListing and the user's profile
 * (target role, CV skills, and preferences).
 */
export function computeJobMatchScore(
  job: JobListing,
  targetRoleTitle: string | undefined,
  targetCategory: RoleCategory | undefined,
  userSkills: string[],
  prefs: JobPreferences | null
): number {
  let score = 52;

  if (targetCategory && job.category === targetCategory) {
    score += 20;
  }

  if (targetRoleTitle) {
    const titleWords = targetRoleTitle
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const jobTitleLower = job.title.toLowerCase();
    const wordHits = titleWords.filter((w) => jobTitleLower.includes(w)).length;
    score += Math.min(12, wordHits * 5);
  }

  if (userSkills.length > 0) {
    const lowerSkills = new Set(userSkills.map((s) => s.toLowerCase()));
    const skillHits = job.tags.filter((t) => lowerSkills.has(t.toLowerCase())).length;
    score += Math.min(12, skillHits * 3);
  }

  if (prefs) {
    if (prefs.workModes.includes(job.workMode)) score += 3;
    if (prefs.jobTypes.includes(job.jobType)) score += 3;
    if (
      prefs.locations.some(
        (loc) => loc.toLowerCase() === job.location.toLowerCase()
      )
    ) {
      score += 4;
    }
  }

  return Math.max(45, Math.min(98, score));
}

/**
 * Generates real external job board search URLs for LinkedIn, Indeed,
 * Glassdoor, and Rozee.pk so graduates can apply on live portals immediately.
 */
export interface ExternalBoardLink {
  id: 'linkedin' | 'indeed' | 'glassdoor' | 'rozee';
  name: string;
  subtitle: string;
  url: string;
}

export function buildExternalJobBoardLinks(
  jobTitle: string,
  location: string,
  company?: string
): ExternalBoardLink[] {
  const queryWithCompany = company ? `${jobTitle} ${company}` : jobTitle;
  const q = encodeURIComponent(queryWithCompany.trim());
  const roleOnly = encodeURIComponent(jobTitle.trim());
  const loc = encodeURIComponent(location === 'Remote' ? '' : location.trim());

  return [
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs',
      subtitle: 'Global & regional verified company listings',
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}${loc ? `&location=${loc}` : ''}`,
    },
    {
      id: 'indeed',
      name: 'Indeed',
      subtitle: 'Direct employer & graduate role aggregator',
      url: `https://www.indeed.com/jobs?q=${q}${loc ? `&l=${loc}` : ''}`,
    },
    {
      id: 'glassdoor',
      name: 'Glassdoor',
      subtitle: 'Listings paired with company reviews & salaries',
      url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`,
    },
    {
      id: 'rozee',
      name: 'Rozee.pk',
      subtitle: 'Leading graduate & tech job portal in Pakistan',
      url: `https://www.rozee.pk/job/jsearch/q/${roleOnly}`,
    },
  ];
}

export const CURRENCY_RANGES: Record<
  CurrencyCode,
  { min: number; max: number; step: number; defaultMin: number; defaultMax: number; unitLabel: string }
> = {
  PKR: {
    min: 50000,
    max: 350000,
    step: 5000,
    defaultMin: 110000,
    defaultMax: 185000,
    unitLabel: 'per month',
  },
  USD: {
    min: 600,
    max: 8000,
    step: 100,
    defaultMin: 1200,
    defaultMax: 2800,
    unitLabel: 'per month',
  },
  GBP: {
    min: 1800,
    max: 6500,
    step: 100,
    defaultMin: 2600,
    defaultMax: 4200,
    unitLabel: 'per month',
  },
  EUR: {
    min: 1800,
    max: 6500,
    step: 100,
    defaultMin: 2500,
    defaultMax: 4000,
    unitLabel: 'per month',
  },
};

export function formatCurrencyValue(amount: number, currency: CurrencyCode): string {
  if (currency === 'PKR') {
    return `PKR ${Math.round(amount / 1000)}k`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}
