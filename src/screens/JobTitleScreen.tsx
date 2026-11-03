import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Check,
  Compass,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { inferRoleMetadata, POPULAR_ROLES, RoleSuggestion } from '../data/rolesAndJobs';
import { RoleCategory } from '../types/career';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  ScreenSkeleton,
  Tabs,
  useToast,
} from '../components/ui';

type DisciplineFilter = 'all' | RoleCategory;

const DISCIPLINE_TABS: { id: DisciplineFilter; label: string }[] = [
  { id: 'all', label: 'All Roles' },
  { id: 'software', label: 'Software' },
  { id: 'data', label: 'Data & AI' },
  { id: 'design', label: 'Design' },
  { id: 'product', label: 'Product' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'finance', label: 'Finance & Ops' },
];

/**
 * Job Title Screen (Step 1)
 * Free-text input with keyboard-accessible autocomplete suggestions,
 * popular graduate role chips, and editable target keywords.
 */
export const JobTitleScreen: React.FC = () => {
  const { state, isHydrating, updateTargetRole, navigate } = useCareer();
  const { showToast } = useToast();

  const [roleInput, setRoleInput] = useState(state.targetRole?.title || '');
  const [discipline, setDiscipline] = useState<DisciplineFilter>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [customKeywords, setCustomKeywords] = useState<string[]>(
    state.targetRole?.keywords || []
  );
  const [newKeyword, setNewKeyword] = useState('');
  const [validationError, setValidationError] = useState('');

  const inferred = useMemo(() => inferRoleMetadata(roleInput), [roleInput]);
  const activeKeywords =
    customKeywords.length > 0 ? customKeywords : roleInput.trim() ? inferred.keywords : [];

  const autocompleteMatches = useMemo(() => {
    const q = roleInput.trim().toLowerCase();
    if (!q) return POPULAR_ROLES.slice(0, 6);
    return POPULAR_ROLES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.keywords.some((k) => k.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [roleInput]);

  const filteredChips = useMemo(() => {
    if (discipline === 'all') return POPULAR_ROLES;
    return POPULAR_ROLES.filter((r) => r.category === discipline);
  }, [discipline]);

  if (isHydrating) {
    return <ScreenSkeleton cards={3} />;
  }

  const selectRoleSuggestion = (role: RoleSuggestion) => {
    setRoleInput(role.title);
    setCustomKeywords(role.keywords);
    setValidationError('');
    setShowDropdown(false);
    setHighlightedIdx(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || autocompleteMatches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((prev) => (prev + 1) % autocompleteMatches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((prev) =>
        prev <= 0 ? autocompleteMatches.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && highlightedIdx >= 0) {
      e.preventDefault();
      selectRoleSuggestion(autocompleteMatches[highlightedIdx]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleAddKeyword = () => {
    const clean = newKeyword.trim();
    if (!clean) return;
    if (!activeKeywords.some((k) => k.toLowerCase() === clean.toLowerCase())) {
      setCustomKeywords([...activeKeywords, clean]);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setCustomKeywords(activeKeywords.filter((k) => k !== kw));
  };

  const handleSaveAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = roleInput.trim();
    if (cleanTitle.length < 3) {
      setValidationError('Enter a target job title (at least 3 characters) or pick a popular role below.');
      return;
    }

    const meta = inferRoleMetadata(cleanTitle);
    const finalKeywords = activeKeywords.length > 0 ? activeKeywords : meta.keywords;

    updateTargetRole({
      title: cleanTitle,
      category: meta.category,
      keywords: finalKeywords,
      updatedAt: new Date().toISOString(),
    });

    showToast({
      type: 'success',
      title: 'Target role saved',
      description: `CV scoring and job matches are now calibrated for ${cleanTitle}.`,
    });
    navigate('cv');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Step 01 · Career Direction
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          What graduate role are you aiming for?
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Type any role title or select a popular entry-level track below. CareerPilot uses
          this role to evaluate your CV keywords, rank job listings, and tailor mock interview
          questions.
        </p>
      </div>

      {/* Autocomplete Input Card */}
      <Card padding="lg">
        <form onSubmit={handleSaveAndContinue} className="space-y-6">
          <div className="relative">
            <Input
              label="Target job title"
              placeholder="e.g., Junior Frontend Engineer, Data Analyst, Associate Product Manager..."
              value={roleInput}
              error={validationError}
              leftAdornment={<Search className="w-4 h-4" aria-hidden="true" />}
              rightAdornment={
                roleInput ? (
                  <button
                    type="button"
                    aria-label="Clear job title"
                    onClick={() => {
                      setRoleInput('');
                      setCustomKeywords([]);
                      setValidationError('');
                    }}
                    className="min-h-[34px] min-w-[34px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : undefined
              }
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Delay closing slightly so option clicks register cleanly
                window.setTimeout(() => setShowDropdown(false), 160);
              }}
              onChange={(e) => {
                const val = e.target.value;
                setRoleInput(val);
                setValidationError('');
                setShowDropdown(true);
                setHighlightedIdx(-1);
                // Reset custom override if typing fresh
                const exact = POPULAR_ROLES.find(
                  (r) => r.title.toLowerCase() === val.trim().toLowerCase()
                );
                if (exact) setCustomKeywords(exact.keywords);
              }}
              onKeyDown={handleInputKeyDown}
              role="combobox"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="role-suggestions-listbox"
            />

            {/* Autocomplete Suggestions Dropdown */}
            {showDropdown && autocompleteMatches.length > 0 && (
              <ul
                id="role-suggestions-listbox"
                role="listbox"
                className="absolute z-20 mt-1.5 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 max-h-68 overflow-y-auto"
              >
                {autocompleteMatches.map((item, idx) => {
                  const isHighlighted = idx === highlightedIdx;
                  return (
                    <li
                      key={item.title}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectRoleSuggestion(item);
                      }}
                      className={[
                        'px-4 py-2.5 cursor-pointer flex items-center justify-between gap-3 text-sm',
                        isHighlighted
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-200'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70',
                      ].join(' ')}
                    >
                      <span className="font-medium truncate">{item.title}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                        {item.categoryLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Matched Role Keywords Preview & Customizer */}
          {roleInput.trim().length >= 2 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Target Skills & ATS Keywords
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Used to evaluate your CV and interview relevance. Add or remove any skill.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeKeywords.map((kw) => (
                  <Badge key={kw} variant="accent">
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      aria-label={`Remove ${kw} keyword`}
                      className="ml-1 hover:text-indigo-950 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm pt-1">
                <Input
                  label="Add custom skill keyword"
                  hideLabel
                  placeholder="Add a skill (e.g., GraphQL, Figma)..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
                  onClick={handleAddKeyword}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
            >
              Save Role & Continue to CV
            </Button>
          </div>
        </form>
      </Card>

      {/* Popular Graduate Role Chips & Cards */}
      <section aria-label="Popular Graduate Roles" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Popular Fresh-Graduate Roles
          </h2>
          <Tabs
            tabs={DISCIPLINE_TABS}
            activeTab={discipline}
            onChange={setDiscipline}
            ariaLabel="Filter roles by discipline"
          />
        </div>

        {filteredChips.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-5 h-5" aria-hidden="true" />}
            title="No roles in this category"
            description="Switch back to All Roles or type any custom job title above."
            actionLabel="Show All Roles"
            onAction={() => setDiscipline('all')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChips.map((role) => {
              const isSelected =
                roleInput.trim().toLowerCase() === role.title.toLowerCase();
              return (
                <button
                  key={role.title}
                  type="button"
                  onClick={() => selectRoleSuggestion(role)}
                  className={[
                    'p-5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3',
                    'hover:-translate-y-0.5 motion-reduce:transform-none',
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                  ].join(' ')}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {role.categoryLabel}
                      </span>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                          aria-label="Selected"
                        />
                      )}
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                      {role.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {role.keywords.slice(0, 4).join(' · ')}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
