"use client";

import { useTranslations } from "next-intl";

interface CalculatorStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
  maxAccessibleStep: 1 | 2 | 3 | 4;
  isProductPageMode?: boolean;
}

export default function CalculatorStepper({
  currentStep,
  onSelectStep,
  maxAccessibleStep,
  isProductPageMode = false,
}: CalculatorStepperProps) {
  const t = useTranslations("calculator.stepper");

  const steps: { number: 1 | 2 | 3 | 4; key: string }[] = isProductPageMode
    ? [
        { number: 2, key: "step2" },
        { number: 3, key: "step3" },
        { number: 4, key: "step4" },
      ]
    : [
        { number: 1, key: "step1" },
        { number: 2, key: "step2" },
        { number: 3, key: "step3" },
        { number: 4, key: "step4" },
      ];

  return (
    <nav aria-label="Calculator Progress" className="w-full mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative px-2">
        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-white/10 z-0"
          aria-hidden="true"
        />

        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isAccessible = step.number <= maxAccessibleStep;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onSelectStep(step.number)}
              className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-yellow ${
                isActive
                  ? "bg-primary-yellow text-black font-bold shadow-glow/30"
                  : isCompleted
                  ? "bg-surface-elevated text-primary-yellow border border-primary-yellow/40"
                  : isAccessible
                  ? "bg-surface text-text-secondary hover:text-text-primary border border-white/10"
                  : "bg-background/80 text-text-secondary/40 border border-white/5 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-mono font-bold ${
                  isActive
                    ? "bg-black text-primary-yellow"
                    : isCompleted
                    ? "bg-primary-yellow text-black"
                    : "bg-white/10 text-text-secondary"
                }`}
              >
                {isCompleted ? "✓" : step.number}
              </span>
              <span className="text-xs uppercase font-mono tracking-wider hidden sm:inline">
                {t(step.key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
