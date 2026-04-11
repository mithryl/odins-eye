"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormData, initialFormData, STEPS } from "@/lib/types";
import StepIndicator from "./StepIndicator";
import BirthDataStep from "./steps/BirthDataStep";
import LifeContextStep from "./steps/LifeContextStep";
import SelfPerceptionStep from "./steps/SelfPerceptionStep";
import FamilyStep from "./steps/FamilyStep";
import EmotionalPatternsStep from "./steps/EmotionalPatternsStep";
import RelationshipsStep from "./steps/RelationshipsStep";
import AmbitionStep from "./steps/AmbitionStep";
import DeeperSelfStep from "./steps/DeeperSelfStep";
import AssessmentsStep from "./steps/AssessmentsStep";
import ReviewStep from "./steps/ReviewStep";

export default function FormStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<FormData>(initialFormData);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = (updates: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (): string | null => {
    if (currentStep === 0) {
      if (!data.firstName.trim()) return "Please enter your name.";
      if (!data.birthDate) return "Please enter your birth date.";
      if (!data.birthTimePrecision) return "Please select a birth time option.";
      if (data.birthTimePrecision === "exact" && !data.birthTimeExact) return "Please enter your exact birth time.";
      if (data.birthTimePrecision === "approximate" && !data.birthTimeApproximate) return "Please select an approximate time of day.";
      if (!data.birthCountry.trim()) return "Please enter your birth country.";
      if (!data.birthCity.trim()) return "Please enter your birth city.";
    }
    return null;
  };

  const next = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate reading");
      }

      sessionStorage.setItem("odins-eye-reading", JSON.stringify({ ...result, firstName: data.firstName }));
      router.push("/reading");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerating(false);
    }
  };

  const stepProps = { data, updateData };

  const stepComponents = [
    <BirthDataStep key="birth" {...stepProps} />,
    <LifeContextStep key="context" {...stepProps} />,
    <SelfPerceptionStep key="perception" {...stepProps} />,
    <FamilyStep key="family" {...stepProps} />,
    <EmotionalPatternsStep key="emotions" {...stepProps} />,
    <RelationshipsStep key="relationships" {...stepProps} />,
    <AmbitionStep key="ambition" {...stepProps} />,
    <DeeperSelfStep key="deeper" {...stepProps} />,
    <AssessmentsStep key="assessments" {...stepProps} />,
    <ReviewStep key="review" {...stepProps} />,
  ];

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepIndicator currentStep={currentStep} />

      <div className="mb-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
          Step {currentStep + 1} of {STEPS.length}
        </p>
        <h2 className="font-heading text-2xl md:text-3xl text-text-primary mb-1">
          {step.title}
        </h2>
        <p className="text-sm text-text-secondary">{step.subtitle}</p>
      </div>

      <div className="step-enter" key={currentStep}>
        <div className="glass-card p-6 md:p-8">
          {stepComponents[currentStep]}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error text-center">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-6 mb-16">
        {currentStep > 0 ? (
          <button
            onClick={back}
            className="rounded-lg border border-border px-6 py-3 text-sm text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={generating}
            className="rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-bg-deep border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate My Reading"
            )}
          </button>
        ) : (
          <button
            onClick={next}
            className="rounded-lg bg-gold px-8 py-3 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors cursor-pointer"
          >
            Continue
          </button>
        )}
      </div>

      {generating && (
        <div className="text-center mb-16 step-enter">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="font-heading text-lg md:text-xl text-text-primary mb-2">
            The stars are aligning
          </p>
          <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
            Your chart is being calculated and interpreted.
            <br />
            This typically takes 60 to 90 seconds.
          </p>
          <p className="text-xs text-text-muted mt-4 italic">
            Some truths take a moment to surface.
          </p>
        </div>
      )}

    </div>
  );
}
