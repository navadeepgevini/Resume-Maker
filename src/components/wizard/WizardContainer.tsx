'use client';

import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/Button';
import StepPersonal from './StepPersonal';
import StepLinks from './StepLinks';
import StepEducation from './StepEducation';
import StepCertifications from './StepCertifications';
import StepProjects from './StepProjects';
import StepSkills from './StepSkills';
import StepReview from './StepReview';

const STEP_COMPONENTS = [
  StepPersonal,
  StepLinks,
  StepEducation,
  StepCertifications,
  StepProjects,
  StepSkills,
  StepReview,
];

export default function WizardContainer() {
  const { currentStep, nextStep, prevStep, markStepCompleted, completedSteps } = useResume();

  const StepComponent = STEP_COMPONENTS[currentStep - 1];

  const handleNext = () => {
    markStepCompleted(currentStep as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    nextStep();
  };

  const isNextDisabled = !completedSteps.has(currentStep);

  const nextLabel =
    currentStep === 6 ? 'Review Resume' : currentStep === 7 ? '' : 'Continue';

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-1 py-2">
        {StepComponent && <StepComponent />}
      </div>

      {/* Navigation */}
      {currentStep < 7 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E4E4DF]">
          {currentStep > 1 ? (
            <Button variant="ghost" onClick={prevStep} id="wizard-back-btn">
              ← Back
            </Button>
          ) : (
            <div />
          )}
          <Button 
            variant="primary" 
            onClick={handleNext} 
            id="wizard-next-btn"
            disabled={isNextDisabled}
          >
            {nextLabel} →
          </Button>
        </div>
      )}

      {currentStep === 7 && (
        <div className="flex items-center pt-4 mt-4 border-t border-[#E4E4DF]">
          <Button variant="ghost" onClick={prevStep} id="wizard-back-btn">
            ← Back to Skills
          </Button>
        </div>
      )}
    </div>
  );
}
