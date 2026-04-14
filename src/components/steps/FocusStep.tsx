"use client";

import {
  StepProps,
  FOCUS_AREAS,
  LIFE_CHAPTERS,
  READING_INTENTS,
  MBTI_TYPES,
  ENNEAGRAM_TYPES,
} from "@/lib/types";
import { Label, FieldGroup, Hint, RadioGroup, TextArea } from "@/components/ui/FormField";
import Select from "@/components/ui/Select";
import { useState } from "react";

export default function FocusStep({ data, updateData }: StepProps) {
  const [showOptional, setShowOptional] = useState(
    Boolean(data.mbtiType || data.enneagramType)
  );

  const toggleArea = (value: string) => {
    const set = new Set(data.focusAreas);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    updateData({ focusAreas: Array.from(set) });
  };

  return (
    <div className="space-y-8">
      <FieldGroup>
        <Label>What's most active in your life right now?</Label>
        <Hint>Pick as many as apply.</Hint>
        <div className="flex flex-wrap gap-2 mt-1">
          {FOCUS_AREAS.map((opt) => {
            const active = data.focusAreas.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleArea(opt.value)}
                className={`rounded-lg border px-4 py-2.5 text-sm transition-all cursor-pointer ${
                  active
                    ? "border-gold bg-gold-muted text-gold"
                    : "border-border bg-bg-input text-text-secondary hover:border-text-muted hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label>How would you describe this chapter of your life?</Label>
        <RadioGroup
          id="lifeChapter"
          value={data.lifeChapter}
          onChange={(v) => updateData({ lifeChapter: v })}
          options={LIFE_CHAPTERS}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>What do you want from this reading?</Label>
        <div className="flex flex-col gap-2">
          {READING_INTENTS.map((opt) => {
            const active = data.readingIntent === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateData({ readingIntent: opt.value })}
                className={`text-left rounded-lg border px-4 py-3 text-sm transition-all cursor-pointer ${
                  active
                    ? "border-gold bg-gold-muted text-gold"
                    : "border-border bg-bg-input text-text-secondary hover:border-text-muted hover:text-text-primary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="specificFocus" optional>
          Anything specific you want addressed?
        </Label>
        <TextArea
          id="specificFocus"
          value={data.specificFocus}
          onChange={(v) => updateData({ specificFocus: v.slice(0, 500) })}
          placeholder="A pattern, a question, a decision — keep it short."
          rows={3}
        />
        <Hint>{data.specificFocus.length}/500</Hint>
      </FieldGroup>

      <div className="border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setShowOptional((s) => !s)}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {showOptional ? "− Hide" : "+ Add"} personality type (optional)
        </button>

        {showOptional && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FieldGroup>
              <Label htmlFor="mbtiType" optional>
                MBTI type
              </Label>
              <Select
                id="mbtiType"
                value={data.mbtiType}
                onChange={(v) => updateData({ mbtiType: v })}
                placeholder="Select if you know it..."
                options={[
                  { value: "", label: "—" },
                  ...MBTI_TYPES.map((t) => ({ value: t, label: t })),
                ]}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="enneagramType" optional>
                Enneagram type
              </Label>
              <Select
                id="enneagramType"
                value={data.enneagramType}
                onChange={(v) => updateData({ enneagramType: v })}
                placeholder="Select if you know it..."
                options={[
                  { value: "", label: "—" },
                  ...ENNEAGRAM_TYPES.map((t) => ({ value: t, label: t })),
                ]}
              />
            </FieldGroup>
          </div>
        )}
      </div>
    </div>
  );
}
