import React from 'react';
import { CVData, CVTemplateId } from '../../types/career';
import { Mail, MapPin, Phone, Globe } from 'lucide-react';

/**
 * ============================================================================
 * CAREERPILOT CV TEMPLATES (`CVTemplates.tsx`)
 * ============================================================================
 * HOW TO ADD A NEW CV TEMPLATE (for student maintainers):
 * 1. Add the new template ID to `CVTemplateId` in `src/types/career.ts`.
 * 2. Append metadata to `CV_TEMPLATE_OPTIONS` below.
 * 3. Add a layout branch inside `CVDocumentPreview` using semantic HTML so
 *    `window.print()` exports a crisp formatted A4 PDF automatically!
 * ============================================================================
 */

export const CV_TEMPLATE_OPTIONS: {
  id: CVTemplateId;
  name: string;
  subtitle: string;
}[] = [
  {
    id: 'modern',
    name: 'Modern Minimal',
    subtitle: 'Clean SaaS typography with subtle indigo section accents',
  },
  {
    id: 'classic',
    name: 'Executive Classic',
    subtitle: 'ATS-standard single-column layout with crisp horizontal rules',
  },
  {
    id: 'compact',
    name: 'Compact Tech',
    subtitle: 'Two-column split emphasizing technical skills & coursework',
  },
];

interface CVDocumentPreviewProps {
  cv: CVData;
}

/**
 * Renders the live CV document and serves as the print target for "Download PDF".
 * Uses explicit high-contrast print/paper styling so the PDF looks crisp in both
 * light and dark UI modes.
 */
export const CVDocumentPreview: React.FC<CVDocumentPreviewProps> = ({ cv }) => {
  const { templateId } = cv;

  if (templateId === 'compact') {
    return (
      <article
        aria-label="CV Document Preview — Compact Tech Template"
        className="bg-white text-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 sm:p-8 print-container"
      >
        {/* Top Header */}
        <header className="pb-5 border-b-2 border-indigo-600 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {cv.fullName || 'Your Full Name'}
            </h1>
            <p className="text-sm font-semibold text-indigo-600 mt-0.5">
              {cv.headline || 'Target Graduate Role'}
            </p>
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 sm:text-right">
            {cv.email && <p>{cv.email}</p>}
            {cv.phone && <p>{cv.phone}</p>}
            {cv.location && <p>{cv.location}</p>}
            {cv.portfolioUrl && <p className="font-medium text-indigo-700">{cv.portfolioUrl}</p>}
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Left Column: Skills, Education, Certs */}
          <div className="sm:col-span-4 space-y-5 sm:border-r sm:border-slate-200 sm:pr-5">
            {cv.skills.length > 0 && (
              <section className="print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  Core Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {cv.education.length > 0 && (
              <section className="print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  Education
                </h2>
                <div className="space-y-3">
                  {cv.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-slate-700">{edu.institution}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {edu.year} {edu.gpaOrHonors ? `· ${edu.gpaOrHonors}` : ''}
                      </p>
                      {edu.highlights && (
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {edu.highlights}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cv.certifications.length > 0 && (
              <section className="print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  Certifications
                </h2>
                <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                  {cv.certifications.map((cert, i) => (
                    <li key={i}>{cert}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Column: Summary & Experience */}
          <div className="sm:col-span-8 space-y-5">
            {cv.summary && (
              <section className="print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5">
                  Profile Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">{cv.summary}</p>
              </section>
            )}

            {cv.experience.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2.5">
                  Experience & Projects
                </h2>
                <div className="space-y-4">
                  {cv.experience.map((exp) => (
                    <div key={exp.id} className="print-avoid-break">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-[11px] font-mono-num text-slate-500 shrink-0">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        {exp.organization} · {exp.type}
                      </p>
                      <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-4 leading-relaxed">
                        {exp.bullets.filter(Boolean).map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (templateId === 'classic') {
    return (
      <article
        aria-label="CV Document Preview — Executive Classic Template"
        className="bg-white text-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 sm:p-8 print-container"
      >
        <header className="text-center pb-4 border-b border-slate-900">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {cv.fullName || 'Your Full Name'}
          </h1>
          <p className="text-xs font-medium text-slate-700 mt-1">
            {[cv.headline, cv.location].filter(Boolean).join(' · ')}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {[cv.email, cv.phone, cv.portfolioUrl].filter(Boolean).join('  |  ')}
          </p>
        </header>

        <div className="mt-4 space-y-4">
          {cv.summary && (
            <section className="print-avoid-break">
              <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900">
                Professional Summary
              </h2>
              <p className="text-xs text-slate-800 leading-relaxed">{cv.summary}</p>
            </section>
          )}

          {cv.education.length > 0 && (
            <section className="print-avoid-break">
              <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900">
                Education
              </h2>
              {cv.education.map((edu) => (
                <div key={edu.id} className="mb-2 last:mb-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      {edu.institution} — {edu.degree}
                    </p>
                    <span className="text-xs font-mono-num text-slate-600">{edu.year}</span>
                  </div>
                  {edu.gpaOrHonors && (
                    <p className="text-xs text-slate-700">{edu.gpaOrHonors}</p>
                  )}
                  {edu.highlights && (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Relevant Coursework: {edu.highlights}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {cv.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900">
                Experience & Academic Projects
              </h2>
              <div className="space-y-3.5">
                {cv.experience.map((exp) => (
                  <div key={exp.id} className="print-avoid-break">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">
                        {exp.role} · <span className="font-medium">{exp.organization}</span>
                      </p>
                      <span className="text-xs font-mono-num text-slate-600 shrink-0">
                        {exp.duration}
                      </span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-slate-800 list-disc pl-4 leading-relaxed">
                      {exp.bullets.filter(Boolean).map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(cv.skills.length > 0 || cv.certifications.length > 0) && (
            <section className="print-avoid-break">
              <h2 className="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-900">
                Skills & Certifications
              </h2>
              {cv.skills.length > 0 && (
                <p className="text-xs text-slate-800">
                  <span className="font-bold">Skills: </span>
                  {cv.skills.join(', ')}
                </p>
              )}
              {cv.certifications.length > 0 && (
                <p className="text-xs text-slate-800 mt-1">
                  <span className="font-bold">Certifications & Honors: </span>
                  {cv.certifications.join(' · ')}
                </p>
              )}
            </section>
          )}
        </div>
      </article>
    );
  }

  // Default: 'modern' template
  return (
    <article
      aria-label="CV Document Preview — Modern Minimal Template"
      className="bg-white text-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 sm:p-8 print-container"
    >
      <header className="pb-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {cv.fullName || 'Your Full Name'}
            </h1>
            <p className="text-sm font-semibold text-indigo-600 mt-0.5">
              {cv.headline || 'Target Graduate Role'}
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-col sm:items-end gap-x-4 gap-y-1 text-xs text-slate-600">
            {cv.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                {cv.email}
              </span>
            )}
            {cv.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                {cv.phone}
              </span>
            )}
            {cv.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                {cv.location}
              </span>
            )}
            {cv.portfolioUrl && (
              <span className="inline-flex items-center gap-1.5 font-medium text-indigo-700">
                <Globe className="w-3 h-3 text-indigo-600" aria-hidden="true" />
                {cv.portfolioUrl}
              </span>
            )}
          </div>
        </div>

        {cv.summary && (
          <p className="mt-4 text-xs text-slate-700 leading-relaxed">{cv.summary}</p>
        )}
      </header>

      <div className="mt-5 space-y-5">
        {cv.experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-600 mb-3">
              Experience & Key Projects
            </h2>
            <div className="space-y-4">
              {cv.experience.map((exp) => (
                <div key={exp.id} className="print-avoid-break">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {exp.role}{' '}
                      <span className="font-normal text-slate-500">· {exp.organization}</span>
                    </h3>
                    <span className="text-xs font-mono-num text-slate-500 shrink-0">
                      {exp.duration}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700 list-disc pl-4 leading-relaxed">
                    {exp.bullets.filter(Boolean).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {cv.education.length > 0 && (
          <section className="print-avoid-break">
            <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-600 mb-2.5">
              Education
            </h2>
            <div className="space-y-2.5">
              {cv.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                    <span className="text-xs font-mono-num text-slate-500">{edu.year}</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    {edu.institution}
                    {edu.gpaOrHonors ? ` · ${edu.gpaOrHonors}` : ''}
                  </p>
                  {edu.highlights && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Coursework: {edu.highlights}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(cv.skills.length > 0 || cv.certifications.length > 0) && (
          <section className="print-avoid-break pt-1 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cv.skills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-600 mb-2">
                  Skills & Tools
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {cv.skills.join(' · ')}
                </p>
              </div>
            )}
            {cv.certifications.length > 0 && (
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-600 mb-2">
                  Certifications & Honors
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {cv.certifications.join(' · ')}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </article>
  );
};
