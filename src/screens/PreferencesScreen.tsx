import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Globe2,
  Laptop,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { CURRENCY_RANGES, formatCurrencyValue } from '../data/rolesAndJobs';
import { CurrencyCode, JobType, WorkMode } from '../types/career';
import {
  Badge,
  Button,
  Card,
  Input,
  ScreenSkeleton,
  Select,
  useToast,
} from '../components/ui';

const ALL_JOB_TYPES: JobType[] = [
  'Full-time',
  'Graduate Trainee',
  'Internship',
  'Contract',
];

const WORK_MODE_CARDS: {
  mode: WorkMode;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
  {
    mode: 'Hybrid',
    subtitle: '2–3 days in office with flexible home focus days',
    icon: <Laptop className="w-4 h-4" aria-hidden="true" />,
  },
  {
    mode: 'Remote',
    subtitle: 'Work from anywhere across distributed engineering/product teams',
    icon: <Globe2 className="w-4 h-4" aria-hidden="true" />,
  },
  {
    mode: 'On-site',
    subtitle: 'In-person mentorship alongside campus or HQ teams',
    icon: <Building2 className="w-4 h-4" aria-hidden="true" />,
  },
];

const POPULAR_CITIES = [
  'Remote',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Dubai',
  'London',
];

/**
 * Preferences Screen (Step 3)
 * Configures Job Type, Work Mode, Locations, and Expected Salary Range Sliders.
 */
export const PreferencesScreen: React.FC = () => {
  const { state, isHydrating, updatePreferences, navigate } = useCareer();
  const { showToast } = useToast();

  const existing = state.preferences;
  const initialCurrency: CurrencyCode = existing?.currency || 'PKR';

  const [jobTypes, setJobTypes] = useState<JobType[]>(
    existing?.jobTypes || ['Full-time', 'Graduate Trainee']
  );
  const [workModes, setWorkModes] = useState<WorkMode[]>(
    existing?.workModes || ['Hybrid', 'Remote']
  );
  const [locations, setLocations] = useState<string[]>(
    existing?.locations || ['Lahore', 'Remote']
  );
  const [customCity, setCustomCity] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
  const [minSalary, setMinSalary] = useState<number>(
    existing?.minSalary ?? CURRENCY_RANGES[initialCurrency].defaultMin
  );
  const [maxSalary, setMaxSalary] = useState<number>(
    existing?.maxSalary ?? CURRENCY_RANGES[initialCurrency].defaultMax
  );
  const [formError, setFormError] = useState<string | null>(null);

  if (isHydrating) {
    return <ScreenSkeleton cards={2} />;
  }

  const rangeMeta = CURRENCY_RANGES[currency];

  const handleCurrencyChange = (nextCurr: CurrencyCode) => {
    setCurrency(nextCurr);
    setMinSalary(CURRENCY_RANGES[nextCurr].defaultMin);
    setMaxSalary(CURRENCY_RANGES[nextCurr].defaultMax);
  };

  const toggleJobType = (jt: JobType) => {
    setFormError(null);
    setJobTypes((prev) =>
      prev.includes(jt) ? prev.filter((item) => item !== jt) : [...prev, jt]
    );
  };

  const toggleWorkMode = (wm: WorkMode) => {
    setFormError(null);
    setWorkModes((prev) =>
      prev.includes(wm) ? prev.filter((item) => item !== wm) : [...prev, wm]
    );
  };

  const toggleCity = (city: string) => {
    setLocations((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const addCustomCity = () => {
    const clean = customCity.trim();
    if (!clean) return;
    if (!locations.some((l) => l.toLowerCase() === clean.toLowerCase())) {
      setLocations([...locations, clean]);
    }
    setCustomCity('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTypes.length === 0) {
      setFormError('Select at least one job type (e.g., Full-time or Internship).');
      return;
    }
    if (workModes.length === 0) {
      setFormError('Select at least one preferred work mode (Hybrid, Remote, or On-site).');
      return;
    }

    const finalLocations = locations.length > 0 ? locations : ['Remote'];
    updatePreferences({
      jobTypes,
      workModes,
      locations: finalLocations,
      currency,
      minSalary: Math.min(minSalary, maxSalary),
      maxSalary: Math.max(minSalary, maxSalary),
      updatedAt: new Date().toISOString(),
    });

    showToast({
      type: 'success',
      title: 'Preferences saved',
      description: 'Ranking matching entry-level jobs for your profile.',
    });
    navigate('jobs');
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Step 03 · Role Criteria
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Set your work & salary preferences
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Tell CareerPilot where and how you want to work so Job Results surface the
          highest-fit graduate roles first.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Job Type Multi-select */}
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Employment Type
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select all contract formats you are open to as a graduate.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {ALL_JOB_TYPES.map((jt) => {
              const selected = jobTypes.includes(jt);
              return (
                <button
                  key={jt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleJobType(jt)}
                  className={[
                    'min-h-[42px] px-4 py-2 rounded-xl border text-sm font-medium inline-flex items-center gap-2 transition-all cursor-pointer',
                    selected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
                  ].join(' ')}
                >
                  {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{jt}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Work Mode */}
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Work Mode
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your preferred workplace arrangement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {WORK_MODE_CARDS.map(({ mode, subtitle, icon }) => {
              const selected = workModes.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleWorkMode(mode)}
                  className={[
                    'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
                    selected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
                      {mode}
                    </span>
                    {selected && (
                      <Check
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Locations */}
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Preferred Cities & Hubs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Used both for ranking local matches and pre-filling LinkedIn / Indeed / Rozee searches.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((city) => {
              const active = locations.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCity(city)}
                  className={[
                    'min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer',
                    active
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300',
                  ].join(' ')}
                >
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  <span>{city}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Added Cities */}
          {locations.some((l) => !POPULAR_CITIES.includes(l)) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {locations
                .filter((l) => !POPULAR_CITIES.includes(l))
                .map((custom) => (
                  <Badge key={custom} variant="accent">
                    <span>{custom}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${custom}`}
                      onClick={() => toggleCity(custom)}
                      className="ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}

          <div className="flex items-center gap-2 max-w-sm">
            <Input
              label="Add custom city"
              hideLabel
              placeholder="Add another city (e.g., Berlin, Toronto)..."
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomCity();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
              onClick={addCustomCity}
            >
              Add
            </Button>
          </div>
        </Card>

        {/* Expected Salary Range Sliders */}
        <Card padding="lg" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Expected Compensation Range
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adjust minimum and target monthly graduate compensation ({rangeMeta.unitLabel}).
              </p>
            </div>

            <div className="w-36">
              <Select
                label="Currency"
                hideLabel
                options={[
                  { value: 'PKR', label: 'PKR (Rs)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'EUR', label: 'EUR (€)' },
                ]}
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Selected Target Band
            </span>
            <span className="font-mono-num text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrencyValue(Math.min(minSalary, maxSalary), currency)} –{' '}
              {formatCurrencyValue(Math.max(minSalary, maxSalary), currency)}{' '}
              <span className="text-xs font-normal text-slate-500">
                {rangeMeta.unitLabel}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="min-salary-slider"
                className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                <span>Minimum Acceptable</span>
                <span className="font-mono-num font-semibold">
                  {formatCurrencyValue(minSalary, currency)}
                </span>
              </label>
              <input
                id="min-salary-slider"
                type="range"
                min={rangeMeta.min}
                max={rangeMeta.max}
                step={rangeMeta.step}
                value={minSalary}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinSalary(val);
                  if (val > maxSalary) setMaxSalary(val);
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <label
                htmlFor="max-salary-slider"
                className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                <span>Ideal Target</span>
                <span className="font-mono-num font-semibold">
                  {formatCurrencyValue(maxSalary, currency)}
                </span>
              </label>
              <input
                id="max-salary-slider"
                type="range"
                min={rangeMeta.min}
                max={rangeMeta.max}
                step={rangeMeta.step}
                value={maxSalary}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxSalary(val);
                  if (val < minSalary) setMinSalary(val);
                }}
                className="w-full accent-violet-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
          >
            Save Preferences & Browse Jobs
          </Button>
        </div>
      </form>
    </div>
  );
};
