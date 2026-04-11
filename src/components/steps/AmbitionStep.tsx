"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextArea,
  RadioGroup,
  ScaleInput,
  FieldGroup,
} from "@/components/ui/FormField";

export default function AmbitionStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label>
          Does your current work feel aligned with who you actually are?
        </Label>
        <ScaleInput
          id="workAlignment"
          value={data.workAlignment}
          onChange={(v) => updateData({ workAlignment: v })}
          leftLabel="Not at all"
          rightLabel="Completely"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          What drives you most? Pick the one or two that feel truest.
        </Label>
        <RadioGroup
          id="primaryDrivers"
          value={data.primaryDrivers}
          onChange={(v) => updateData({ primaryDrivers: v })}
          options={[
            { value: "purpose", label: "Purpose" },
            { value: "security", label: "Security" },
            { value: "recognition", label: "Recognition" },
            { value: "freedom", label: "Freedom" },
            { value: "helping", label: "Helping others" },
            { value: "mastery", label: "Mastery" },
            { value: "creativity", label: "Creativity" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="noConstraints">
          If money and obligations disappeared, what would you spend your time
          doing?
        </Label>
        <TextArea
          id="noConstraints"
          value={data.noConstraints}
          onChange={(v) => updateData({ noConstraints: v })}
          placeholder="The answer that comes before the 'realistic' one"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          Do you tend to play it safe or take risks when it comes to career and
          life direction?
        </Label>
        <ScaleInput
          id="riskTolerance"
          value={data.riskTolerance}
          onChange={(v) => updateData({ riskTolerance: v })}
          leftLabel="Play it safe"
          rightLabel="Take risks"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          Do you feel like you&apos;re living your own life, or a version shaped
          by others&apos; expectations?
        </Label>
        <ScaleInput
          id="ownLife"
          value={data.ownLife}
          onChange={(v) => updateData({ ownLife: v })}
          leftLabel="Fully mine"
          rightLabel="Shaped by others"
        />
      </FieldGroup>
    </div>
  );
}
