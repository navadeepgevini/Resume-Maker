'use client';

import { useResume } from '@/context/ResumeContext';

const STEP_LABELS = [
  'Personal',
  'Links',
  'Education',
  'Certifications',
  'Experience',
  'Projects',
  'Skills',
  'Review',
] as const;

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ProgressBar() {
  const { currentStep, completedSteps, goToStep } = useResume();

  return (
    <nav aria-label="Wizard progress" className="w-full">
      {/* Desktop view */}
      <ol className="hidden md:flex items-center justify-between w-full">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = completedSteps.has(stepNum);
          const isCurrent = currentStep === stepNum;
          const isFuture = !isCompleted && !isCurrent;
          const isLastStep = stepNum === STEP_LABELS.length;

          return (
            <li
              key={stepNum}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                {/* Circle */}
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => goToStep(stepNum as 1|2|3|4|5|6|7|8)}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[#33415C] text-white transition-colors hover:bg-[#2a3650] focus:outline-none focus:ring-2 focus:ring-[#33415C] focus:ring-offset-2 cursor-pointer"
                    aria-label={`Go to step ${stepNum}: ${label} (completed)`}
                  >
                    <CheckIcon />
                  </button>
                ) : (
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-[#33415C] text-white'
                        : 'border-2 border-[#E4E4DF] text-[#6B6B63]'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {stepNum}
                  </span>
                )}

                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    isFuture ? 'text-[#6B6B63]' : 'text-[#1C1C1A]'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line */}
              {!isLastStep && (
                <div
                  className={`flex-1 h-0.5 mx-3 mt-[-1.25rem] ${
                    isCompleted ? 'bg-[#33415C]' : 'bg-[#E4E4DF]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile view */}
      <div className="flex md:hidden items-center justify-center gap-2">
        <span className="text-sm font-medium text-[#33415C]">
          Step {currentStep} / {STEP_LABELS.length}
        </span>
        <span className="text-[#E4E4DF]">•</span>
        <span className="text-sm font-medium text-[#1C1C1A]">
          {STEP_LABELS[currentStep - 1]}
        </span>
      </div>
    </nav>
  );
}
