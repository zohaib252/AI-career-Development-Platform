import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Moon,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import graduatePortraitUrl from '../assets/images/avatar_graduate_portrait_1793719449408.jpg';
import { useCareer } from '../context/CareerContext';
import { Button, Input, Select, useToast } from '../components/ui';

const GRAD_YEARS = [
  { value: '2027', label: 'Class of 2027 (Final Year)' },
  { value: '2026', label: 'Class of 2026 (Fresh Graduate)' },
  { value: '2025', label: 'Class of 2025' },
  { value: '2024', label: 'Class of 2024' },
];

const JOURNEY_HIGHLIGHTS = [
  'ATS-ready CV builder & drag-and-drop parser with instant priority scoring',
  'Tailored graduate job matches with direct LinkedIn, Indeed, Glassdoor & Rozee links',
  'Live Web Speech voice mock interviews with transparent STAR & filler-word scoring',
];

/**
 * Split-Layout Sign-Up Screen
 * Left: Brand showcase, graduate roadmap, and attributable student testimonial.
 * Right: Live-validated registration form with Show/Hide password & 1-click Demo mode.
 */
export const SignUpScreen: React.FC = () => {
  const { registerAccount, loadDemoAccount, theme, toggleTheme } = useCareer();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Live validation rules
  const validateName = (v: string) =>
    v.trim().length < 2 ? 'Enter your full name (at least 2 characters).' : '';

  const validateEmail = (v: string) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? 'Enter a valid university or personal email address.'
      : '';

  const validateUniversity = (v: string) =>
    v.trim().length < 2 ? 'Enter your university or degree program.' : '';

  const validatePassword = (v: string) => {
    if (v.length < 8) return 'Password must be at least 8 characters long.';
    if (!/\d/.test(v)) return 'Include at least one number for security.';
    return '';
  };

  const nameError = (touched.fullName || submitAttempted) ? validateName(fullName) : '';
  const emailError = (touched.email || submitAttempted) ? validateEmail(email) : '';
  const uniError = (touched.university || submitAttempted) ? validateUniversity(university) : '';
  const passError = (touched.password || submitAttempted) ? validatePassword(password) : '';

  const getPasswordStrength = (pw: string): { score: number; label: string } => {
    if (!pw) return { score: 0, label: 'Enter 8+ characters with a number' };
    let pts = 0;
    if (pw.length >= 8) pts += 1;
    if (pw.length >= 12) pts += 1;
    if (/\d/.test(pw)) pts += 1;
    if (/[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) pts += 1;
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Strong'];
    return { score: Math.max(1, pts), label: labels[pts] };
  };

  const pwStrength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const hasErrors =
      Boolean(validateName(fullName)) ||
      Boolean(validateEmail(email)) ||
      Boolean(validateUniversity(university)) ||
      Boolean(validatePassword(password));

    if (hasErrors) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      registerAccount(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          university: university.trim(),
          graduationYear,
        },
        password
      );
      setIsSubmitting(false);
      showToast({
        type: 'success',
        title: 'Welcome to CareerPilot',
        description: 'Step 1: Let’s pick the graduate role you are targeting.',
      });
    }, 200);
  };

  const handleDemoStart = () => {
    loadDemoAccount();
    showToast({
      type: 'info',
      title: 'Loaded Demo Graduate Workspace',
      description: 'Explore Zara’s CV, Kanban board, mock interview, and final report.',
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 items-stretch bg-white dark:bg-[#090d16]">
      {/* ====================================================================
          LEFT: BRAND & SOCIAL PROOF PANEL (5 columns on desktop)
          ==================================================================== */}
      <section
        aria-label="About CareerPilot"
        className="lg:col-span-5 relative overflow-hidden bg-slate-900 dark:bg-slate-950 text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800"
      >
        {/* Subtle ambient gradient wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">CareerPilot</span>
          </div>

          <h1 className="mt-10 text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-balance max-w-md">
            From graduation to your first offer, structured step by step.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
            Built for fresh graduates who want real preparation—not guesswork. Craft an
            ATS-ready CV, track real job applications, and rehearse interviews aloud.
          </p>

          <ul className="mt-8 space-y-3.5">
            {JOURNEY_HIGHLIGHTS.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                <CheckCircle2
                  className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Attributable Graduate Testimonial */}
        <figure className="relative z-10 mt-10 pt-8 border-t border-slate-800/90">
          <blockquote className="text-sm text-slate-200 leading-relaxed">
            “Practicing my capstone stories with CareerPilot’s voice interviewer and STAR
            rubric raised my mock clarity score from 64% to 88% in four evenings—and helped
            me land my first frontend offer.”
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3.5">
            {!imgFailed ? (
              <img
                src={graduatePortraitUrl}
                alt="Portrait of Amina Tariq, Junior Frontend Engineer"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0"
              >
                AT
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">Amina Tariq</p>
              <p className="text-xs text-slate-400">
                BS Computer Science ’25 · Junior Frontend Engineer at Systems Limited
              </p>
            </div>
          </figcaption>
        </figure>
      </section>

      {/* ====================================================================
          RIGHT: REGISTRATION FORM PANEL (7 columns on desktop)
          ==================================================================== */}
      <main className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dark mode</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-md mx-auto my-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your free workspace
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              100% free and private—your CV and interview transcripts stay in your browser.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <Input
              label="Full name"
              placeholder="e.g., Zara Siddiqui"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              error={nameError}
              leftAdornment={<User className="w-4 h-4" aria-hidden="true" />}
              required
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={emailError}
              leftAdornment={<Mail className="w-4 h-4" aria-hidden="true" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7">
                <Input
                  label="University or program"
                  placeholder="e.g., NUST · BS CS"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, university: true }))}
                  error={uniError}
                  leftAdornment={<GraduationCap className="w-4 h-4" aria-hidden="true" />}
                  required
                />
              </div>
              <div className="sm:col-span-5">
                <Select
                  label="Graduation"
                  options={GRAD_YEARS}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters + 1 number"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                error={passError}
                leftAdornment={<Lock className="w-4 h-4" aria-hidden="true" />}
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                }
                required
              />

              {/* Live Password Strength Meter */}
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex-1 grid grid-cols-4 gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={[
                        'h-1 rounded-full transition-colors duration-150',
                        pwStrength.score >= bar
                          ? pwStrength.score >= 3
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                          : 'bg-slate-200 dark:bg-slate-800',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {pwStrength.label}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
              >
                Start Career Journey
              </Button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="shrink-0 px-3 text-xs text-slate-400 dark:text-slate-500">
                  or preview everything instantly
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleDemoStart}
              >
                Load Sample Graduate Profile
              </Button>
            </div>
          </form>
        </div>

        <footer className="text-center text-xs text-slate-400 dark:text-slate-500">
          CareerPilot · Built for university graduates · No API keys or subscriptions required
        </footer>
      </main>
    </div>
  );
};
