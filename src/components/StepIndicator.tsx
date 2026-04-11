"use client";

import { STEPS } from "@/lib/types";

export default function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === currentStep
              ? "w-8 bg-gold"
              : i < currentStep
                ? "w-3 bg-gold/50"
                : "w-3 bg-border"
          }`}
        />
      ))}
    </div>
  );
}
