import React from 'react';
import { cn } from '@/lib/utils';
import { Check, User, Heart, FileText } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProgressStepperProps {
  currentStep: number;
  steps?: Step[];
  className?: string;
}

const defaultSteps: Step[] = [
  { id: 'personal', label: 'Dados Pessoais', icon: <User className="w-4 h-4 md:w-5 md:h-5" /> },
  { id: 'health', label: 'Histórico de Saúde', icon: <Heart className="w-4 h-4 md:w-5 md:h-5" /> },
  { id: 'signature', label: 'Termo & Assinatura', icon: <FileText className="w-4 h-4 md:w-5 md:h-5" /> },
];

const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  steps = defaultSteps,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-1.5 md:gap-2 lg:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5 lg:gap-2">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                    "w-8 h-8 md:w-9 md:h-9 lg:w-12 lg:h-12",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary bg-primary/10 shadow-gold",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground bg-background"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-6 lg:h-6" />
                  ) : (
                    React.cloneElement(step.icon as React.ReactElement, {
                      className: "w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5"
                    })
                  )}
                </div>

                {/* Label: hidden on mobile/tablet, visible on desktop */}
                <span
                  className={cn(
                    "text-xs lg:text-sm font-medium text-center max-w-[100px] leading-tight",
                    "hidden lg:block",
                    isCurrent && "text-primary",
                    isCompleted && "text-primary/80",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-1 md:mx-1.5 lg:mx-4 h-0.5 mt-[-20px] lg:mt-[-28px]">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
