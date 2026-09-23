'use client';

import { useMemo } from 'react';
import type { ResumeData, WizardStep } from '@/types/resume';
import { computeATSCompatibility } from '@/lib/atsScorer';
import { useResume } from '@/context/ResumeContext';

interface ATSCompatibilityCardProps {
  data: ResumeData;
}

export default function ATSCompatibilityCard({ data }: ATSCompatibilityCardProps) {
  const { dispatch, goToStep } = useResume();
  const result = useMemo(() => computeATSCompatibility(data), [data]);

  const color = result.totalScore >= 80 ? '#15803D' : result.totalScore >= 60 ? '#ca8a04' : '#B91C1C';
  const grade = result.totalScore >= 80 ? 'Good' : result.totalScore >= 60 ? 'Fair' : 'Poor';

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (result.totalScore / 100) * circumference;

  const allFailedChecks = [
    ...result.categories.parseability.failedChecks,
    ...result.categories.keywordMatch.failedChecks,
    ...result.categories.contentQuality.failedChecks,
    ...result.categories.structure.failedChecks,
  ];

  const handleFixAction = (action?: { type: string; target: string }) => {
    if (!action) return;

    if (action.type === 'navigate') {
      if (action.target === 'settings.template') {
        // Handled by scrolling to template selector in parent usually, or we can just emit an event
        document.getElementById('template-selector-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Map target to step
        const stepMap: Record<string, WizardStep> = {
          'personal': 1,
          'links': 2,
          'education': 3,
          'certifications': 4,
          'projects': 5,
          'skills': 6
        };
        const step = stepMap[action.target];
        if (step) goToStep(step);
      }
    } else if (action.type === 'toggle') {
      if (action.target === 'settings.showPhoto') {
        dispatch({ type: 'SET_SETTINGS', payload: { showPhoto: false } });
      }
    } else if (action.type === 'highlight') {
      if (action.target === 'jobDescription') {
         document.getElementById('job-description-input')?.focus();
      }
    }
  };

  return (
    <div id="ats-compatibility-card" className="rounded-[8px] border border-[#E4E4DF] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E4E4DF] bg-[#33415C]/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#33415C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-[#1C1C1A]">ATS Compatibility</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#E4E4DF]">
        {/* Score Gauge Area */}
        <div className="p-6 flex flex-col items-center justify-center md:w-1/3 bg-[#FAFAF9]">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#E4E4DF" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color, fontFamily: 'var(--font-plex-sans)' }}>
                {result.totalScore}
              </span>
              <span className="text-[10px] font-medium text-[#6B6B63] uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>
          <span className="mt-3 text-sm font-semibold uppercase tracking-wider" style={{ color }}>
            {grade}
          </span>
          <p className="text-xs text-center text-[#6B6B63] mt-2 max-w-[200px]">
            Based on parseability, keywords, and content quality.
          </p>
        </div>

        {/* Fix It Panel */}
        <div className="p-6 md:w-2/3 flex flex-col h-full">
          <h4 className="text-sm font-semibold text-[#1C1C1A] mb-4 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Fix It Checklist
          </h4>
          
          {allFailedChecks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <svg className="w-8 h-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-green-800">Perfect! Your resume is highly ATS compatible.</p>
            </div>
          ) : (
            <ul className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-2">
              {allFailedChecks.map((check, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="mt-0.5 shrink-0 flex flex-col items-center justify-center w-8 h-8 rounded bg-white border border-red-200 text-red-600 font-bold text-xs">
                    -{check.pointsLost}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1C1C1A] leading-snug mb-2">{check.message}</p>
                    {check.fixAction && (
                      <button
                        onClick={() => handleFixAction(check.fixAction)}
                        className="text-xs font-semibold text-[#33415C] hover:text-[#283349] hover:underline flex items-center gap-1"
                      >
                        {check.fixAction.type === 'navigate' ? 'Fix this section →' :
                         check.fixAction.type === 'toggle' ? 'Apply quick fix ⚡' :
                         'Provide information →'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
