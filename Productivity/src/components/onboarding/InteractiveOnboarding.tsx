import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, RotateCcw } from 'lucide-react';

export interface OnboardingStep {
  id: string;
  targetId: string;
  title: string;
  explanation: string;
  actionNote?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'create_button',
    targetId: 'onboarding-create-btn',
    title: 'Create Anything',
    explanation: 'Quickly launch a task, personal goal, team objective, or note from anywhere in Momentum.',
    actionNote: 'Click "+ Create" at the top anytime you have a new idea or deliverable.',
  },
  {
    id: 'create_task',
    targetId: 'onboarding-create-task',
    title: 'Create Task',
    explanation: 'Add a task, set its deadline and priority, and track your progress through the workflow.',
    actionNote: 'Tasks can be kept private to you or shared with your team workspace.',
  },
  {
    id: 'create_goal',
    targetId: 'onboarding-create-goal',
    title: 'Create Goal',
    explanation: 'Define an outcome and organize milestones that help you and your team achieve it.',
    actionNote: 'Goals measure long-term momentum and link related daily tasks.',
  },
  {
    id: 'workspace_nav',
    targetId: 'onboarding-workspace-nav',
    title: 'Join or Create Workspace',
    explanation: 'Create a shared space for your team to organize tasks and projects, or switch to your personal space.',
    actionNote: 'Use invitation codes to collaborate securely with verified teammates.',
  },
  {
    id: 'assign_task',
    targetId: 'onboarding-assign-task',
    title: 'Assign Task',
    explanation: 'Choose a teammate responsible for completing this task and track who is doing what.',
    actionNote: 'Assigned teammates will see their workload highlighted in team views.',
  },
  {
    id: 'customize_board',
    targetId: 'onboarding-customize-board',
    title: 'Customize Board',
    explanation: 'Choose a background that makes your task board your own—solid shades, soft gradients, or patterns.',
    actionNote: 'Click the palette icon in the task board header to customize.',
  },
];

interface InteractiveOnboardingProps {
  completed: boolean;
  onComplete: () => void;
  onDismissStep?: (stepId: string) => void;
}

export const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({
  completed,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isOpen, setIsOpen] = useState(!completed);

  const step = ONBOARDING_STEPS[currentStepIndex];

  // Update target rect when step changes or window resizes
  useEffect(() => {
    if (!isOpen || !step) return;

    const findTarget = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Highlight element with a subtle glow class
        el.classList.add('ring-4', 'ring-[#1E3A2F]/40', 'ring-offset-2', 'transition-all');
      } else {
        setTargetRect(null);
      }
    };

    findTarget();
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget, true);

    return () => {
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget, true);
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove('ring-4', 'ring-[#1E3A2F]/40', 'ring-offset-2');
      }
    };
  }, [currentStepIndex, isOpen, step]);

  if (!isOpen || completed || !step) {
    return null;
  }

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsOpen(false);
    onComplete();
  };

  return (
    <>
      {/* Target Focus Ring if element is on screen */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-50 border-2 border-[#1E3A2F] rounded-xl animate-pulse shadow-lg"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Floating Onboarding Popover card */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full bg-white rounded-2xl border border-[#E8E4DA] shadow-2xl p-5 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]/60">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#E7F0E8] text-[#1E3A2F] flex items-center justify-center font-bold text-xs">
              <Sparkles size={13} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A2F]">
              Quick Guide • {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <button
            onClick={handleFinish}
            className="text-[#8E9892] hover:text-[#1C221F] p-1 rounded-md hover:bg-[#F2EFE9] transition-colors"
            title="Skip Tour"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="py-3 space-y-1.5">
          <h4 className="font-bold text-[#1C221F] text-base">{step.title}</h4>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            {step.explanation}
          </p>
          {step.actionNote && (
            <div className="mt-2 p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E4DA] text-[11px] text-[#718096] italic">
              💡 {step.actionNote}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-[#E8E4DA] rounded-full overflow-hidden my-2">
          <div
            className="h-full bg-[#1E3A2F] transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleFinish}
            className="text-xs text-[#718096] hover:text-[#1C221F] font-medium transition-colors"
          >
            Skip guide
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-[#E8E4DA] text-[#4A5568] hover:bg-[#FAF8F5] transition-colors text-xs flex items-center gap-1"
              >
                <ArrowLeft size={14} />
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-[#1E3A2F] text-white hover:bg-[#162A22] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>{currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
