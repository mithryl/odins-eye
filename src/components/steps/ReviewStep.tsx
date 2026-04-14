"use client";

import {
  StepProps,
  FOCUS_AREAS,
  LIFE_CHAPTERS,
  READING_INTENTS,
} from "@/lib/types";

function SummarySection({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string }[];
}) {
  const filled = items.filter((i) => i.value);
  if (filled.length === 0) return null;
  return (
    <div className="pt-6">
      <h3 className="text-xs uppercase tracking-[0.15em] text-gold/70 mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {filled.map((item) => (
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

export default function ReviewStep({ data }: StepProps) {
  const birthTime =
    data.birthTimePrecision === "exact"
      ? data.birthTimeExact
      : data.birthTimePrecision === "approximate"
        ? `Approximately ${data.birthTimeApproximate}`
        : "Unknown";

  const focusLabels = data.focusAreas
    .map((v) => FOCUS_AREAS.find((f) => f.value === v)?.label)
    .filter(Boolean)
    .join(", ");
  const chapterLabel =
    LIFE_CHAPTERS.find((c) => c.value === data.lifeChapter)?.label || "";
  const intentLabel =
    READING_INTENTS.find((r) => r.value === data.readingIntent)?.label || "";

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <p className="text-sm text-text-secondary">
          Review your details, then generate your reading.
        </p>
      </div>

      <div className="divide-y divide-border">
        <SummarySection
          title="Birth"
          items={[
            { label: "Name", value: data.firstName },
            { label: "Date", value: data.birthDate },
            { label: "Time", value: birthTime },
            {
              label: "Place",
              value: [data.birthCity, data.birthState, data.birthCountry]
                .filter(Boolean)
                .join(", "),
            },
          ]}
        />
        <SummarySection
          title="Focus"
          items={[
            { label: "Active areas", value: focusLabels },
            { label: "Current chapter", value: chapterLabel },
            { label: "Reading intent", value: intentLabel },
            { label: "Specific focus", value: data.specificFocus },
            { label: "MBTI", value: data.mbtiType },
            { label: "Enneagram", value: data.enneagramType },
          ]}
        />
      </div>
    </div>
  );
}
