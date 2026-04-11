"use client";

import { StepProps, STEPS } from "@/lib/types";

function SummarySection({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string }[];
}) {
  const filledItems = items.filter((item) => item.value);
  if (filledItems.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {filledItems.map((item) => (
          <div key={item.label} className="flex gap-3">
            <span className="text-sm text-text-muted min-w-[140px] shrink-0">
              {item.label}
            </span>
            <span className="text-sm text-text-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const readableMap: Record<string, string> = {
  exact: "Exact time provided",
  approximate: "Approximate time",
  unknown: "Unknown",
  morning: "Morning (6am-12pm)",
  afternoon: "Afternoon (12pm-6pm)",
  evening: "Evening (6pm-12am)",
  night: "Night (12am-6am)",
  single: "Single",
  "in-a-relationship": "In a relationship",
  married: "Married",
  divorced: "Divorced",
  "its-complicated": "It's complicated",
  avoid: "Avoid it",
  "head-on": "Address it head-on",
  internalize: "Internalize it",
  depends: "Depends on who it's with",
  "need-it": "I need it",
  "go-with-flow": "Go with the flow",
  "working-on-it": "Working on letting go",
  responsible: "The responsible one",
  peacekeeper: "The peacekeeper",
  achiever: "The achiever",
  rebel: "The rebel",
  quiet: "The quiet one",
  caretaker: "The caretaker",
  other: "Something else",
  stable: "Stable",
  "mostly-stable": "Mostly stable",
  mixed: "Mixed",
  "mostly-chaotic": "Mostly chaotic",
  chaotic: "Chaotic",
  anxiety: "Anxiety",
  sadness: "Sadness",
  anger: "Anger",
  restlessness: "Restlessness",
  contentment: "Contentment",
  numbness: "Numbness",
  changes: "It changes constantly",
  vulnerability: "Vulnerability",
  joy: "Joy",
  need: "Need",
  fear: "Fear",
  withdraw: "Withdraw and isolate",
  overwork: "Overwork or stay busy",
  "seek-comfort": "Seek comfort from others",
  "shut-down": "Shut down emotionally",
  irritable: "Get irritable",
  move: "Exercise or move my body",
  alone: "Completely alone",
  "one-on-one": "One-on-one with someone close",
  group: "In a group",
  physical: "Through physical activity",
  creative: "Through creative expression",
  rest: "Through rest and stillness",
  many: "Many friends",
  "few-deep": "A few deep ones",
  loner: "Keep mostly to myself",
  mix: "A mix",
  purpose: "Purpose",
  security: "Security",
  recognition: "Recognition",
  freedom: "Freedom",
  helping: "Helping others",
  mastery: "Mastery",
  creativity: "Creativity",
  "still-in-it": "Still in it",
  recent: "Within the last year",
  "few-years": "2-5 years ago",
  "long-ago": "More than 5 years ago",
  ongoing: "Ongoing",
};

function r(value: string): string {
  return readableMap[value] || value;
}

function scaleLabel(value: string, left: string, right: string): string {
  if (!value) return "";
  const n = parseInt(value);
  if (n <= 1) return left;
  if (n <= 2) return `Leaning ${left.toLowerCase()}`;
  if (n === 3) return "In the middle";
  if (n <= 4) return `Leaning ${right.toLowerCase()}`;
  return right;
}

export default function ReviewStep({ data }: StepProps) {
  const completedSections = STEPS.slice(0, -1).filter((step) => {
    // Very rough check — at least one field from each section has data
    switch (step.id) {
      case "birth":
        return data.firstName && data.birthDate;
      case "context":
        return data.work || data.relationshipStatus;
      case "perception":
        return data.friendDescription || data.conflictStyle;
      case "family":
        return data.motherRelationship || data.familyRole;
      case "emotions":
        return data.dailyEmotion || data.hardestToExpress;
      case "relationships":
        return data.relationshipChallenge || data.friendshipStyle;
      case "ambition":
        return data.primaryDrivers || data.noConstraints;
      case "deeper":
        return data.deepestFear || data.recurringPattern;
      case "assessments":
        return data.mbtiType || data.enneagramType;
      default:
        return false;
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-sm text-text-secondary">
          You&apos;ve completed{" "}
          <span className="text-gold font-medium">
            {completedSections.length}
          </span>{" "}
          of {STEPS.length - 1} sections.
          {completedSections.length >= 7
            ? " Your reading will be deeply personalized."
            : completedSections.length >= 4
              ? " Good foundation — more sections mean a richer reading."
              : " Consider going back to fill in more for a deeper reading."}
        </p>
      </div>

      <div className="space-y-6 divide-y divide-border">
        <SummarySection
          title={STEPS[0].title}
          items={[
            { label: "Name", value: data.firstName },
            { label: "Birth date", value: data.birthDate },
            {
              label: "Birth time",
              value:
                data.birthTimePrecision === "exact"
                  ? data.birthTimeExact
                  : r(data.birthTimeApproximate || data.birthTimePrecision),
            },
            {
              label: "Birth place",
              value: [data.birthCity, data.birthState, data.birthCountry]
                .filter(Boolean)
                .join(", "),
            },
          ]}
        />

        <SummarySection
          title={STEPS[1].title}
          items={[
            { label: "Gender", value: data.genderIdentity },
            { label: "Work", value: data.work },
            { label: "Relationship", value: r(data.relationshipStatus) },
            { label: "Kids", value: r(data.hasKids) },
            { label: "In transition", value: r(data.inTransition) },
          ]}
        />

        <SummarySection
          title={STEPS[2].title}
          items={[
            { label: "Friend sees", value: data.friendDescription },
            { label: "Misunderstood", value: data.misunderstood },
            { label: "Conflict", value: r(data.conflictStyle) },
            { label: "Control", value: r(data.controlRelationship) },
            { label: "Stuck", value: data.feelingStuck },
            { label: "Wants", value: data.deepestWant },
          ]}
        />

        <SummarySection
          title={STEPS[3].title}
          items={[
            { label: "Mother", value: data.motherRelationship },
            { label: "Father", value: data.fatherRelationship },
            { label: "Family role", value: r(data.familyRole) },
            { label: "Childhood", value: r(data.childhoodStability) },
            { label: "Lasting impact", value: data.lastingImpact },
          ]}
        />

        <SummarySection
          title={STEPS[4].title}
          items={[
            { label: "Daily emotion", value: r(data.dailyEmotion) },
            { label: "Hardest to express", value: r(data.hardestToExpress) },
            { label: "When overwhelmed", value: r(data.overwhelmResponse) },
            {
              label: "Others first",
              value: scaleLabel(
                data.othersNeedsFirst,
                "Never",
                "Always"
              ),
            },
            { label: "Recharge", value: r(data.rechargeMethod) },
          ]}
        />

        <SummarySection
          title={STEPS[5].title}
          items={[
            { label: "Challenge", value: data.relationshipChallenge },
            {
              label: "Closeness style",
              value: scaleLabel(
                data.loseOrDistance,
                "Lose myself",
                "Keep distance"
              ),
            },
            { label: "Unasked need", value: data.unaskedNeed },
            { label: "Friends", value: r(data.friendshipStyle) },
            {
              label: "Fitting in",
              value: scaleLabel(
                data.fittingIn,
                "Fit in easily",
                "Always different"
              ),
            },
          ]}
        />

        <SummarySection
          title={STEPS[6].title}
          items={[
            {
              label: "Work alignment",
              value: scaleLabel(
                data.workAlignment,
                "Not aligned",
                "Fully aligned"
              ),
            },
            { label: "Driven by", value: r(data.primaryDrivers) },
            { label: "No constraints", value: data.noConstraints },
            {
              label: "Risk",
              value: scaleLabel(
                data.riskTolerance,
                "Play it safe",
                "Take risks"
              ),
            },
            {
              label: "Own life",
              value: scaleLabel(
                data.ownLife,
                "Fully mine",
                "Shaped by others"
              ),
            },
          ]}
        />

        <SummarySection
          title={STEPS[7].title}
          items={[
            { label: "Deepest fear", value: data.deepestFear },
            { label: "Self-judgment", value: data.selfJudgment },
            { label: "Recurring pattern", value: data.recurringPattern },
            {
              label: "Transformative event",
              value: r(data.transformativeEvent),
            },
            {
              label: "Intuition",
              value: scaleLabel(
                data.intuitionTrust,
                "Don't trust it",
                "Trust deeply"
              ),
            },
            { label: "Spiritual practice", value: data.spiritualPractice },
          ]}
        />

        <SummarySection
          title={STEPS[8].title}
          items={[
            { label: "MBTI", value: data.mbtiType },
            { label: "Enneagram", value: data.enneagramType },
            { label: "Other", value: data.otherAssessments },
            { label: "Notes", value: data.additionalNotes },
          ]}
        />
      </div>
    </div>
  );
}
