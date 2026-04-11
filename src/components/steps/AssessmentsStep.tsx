"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextInput,
  TextArea,
  FieldGroup,
  Hint,
} from "@/components/ui/FormField";

export default function AssessmentsStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary italic border-l-2 border-gold/30 pl-4">
        If you&apos;ve taken any personality assessments, sharing them here lets
        us cross-reference your chart with how you already understand yourself.
        All of these are optional.
      </p>

      <FieldGroup>
        <Label htmlFor="mbtiType" optional>
          Myers-Briggs (MBTI) type
        </Label>
        <TextInput
          id="mbtiType"
          value={data.mbtiType}
          onChange={(v) => updateData({ mbtiType: v })}
          placeholder="e.g., INFJ, ENTP"
        />
        <Hint>The four-letter type, if you know it.</Hint>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="enneagramType" optional>
          Enneagram type
        </Label>
        <TextInput
          id="enneagramType"
          value={data.enneagramType}
          onChange={(v) => updateData({ enneagramType: v })}
          placeholder="e.g., Type 4, 4w5"
        />
        <Hint>Include your wing if you know it.</Hint>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="otherAssessments" optional>
          Any other assessments?
        </Label>
        <TextArea
          id="otherAssessments"
          value={data.otherAssessments}
          onChange={(v) => updateData({ otherAssessments: v })}
          placeholder="DISC, Kolbe, StrengthsFinder, Human Design, etc."
          rows={3}
        />
        <Hint>
          Include the type/result for each. The more we know, the richer the
          reading.
        </Hint>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="additionalNotes" optional>
          Anything else you want the reading to address?
        </Label>
        <TextArea
          id="additionalNotes"
          value={data.additionalNotes}
          onChange={(v) => updateData({ additionalNotes: v })}
          placeholder="A specific question, a life area you want explored, anything at all"
          rows={3}
        />
      </FieldGroup>
    </div>
  );
}
