"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextArea,
  RadioGroup,
  FieldGroup,
} from "@/components/ui/FormField";

export default function FamilyStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label htmlFor="motherRelationship">
          How would you describe your relationship with your mother or primary
          caregiver growing up?
        </Label>
        <TextArea
          id="motherRelationship"
          value={data.motherRelationship}
          onChange={(v) => updateData({ motherRelationship: v })}
          placeholder="A sentence or two — not what happened, but how it felt"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="fatherRelationship">
          How would you describe your relationship with your father or other
          parent?
        </Label>
        <TextArea
          id="fatherRelationship"
          value={data.fatherRelationship}
          onChange={(v) => updateData({ fatherRelationship: v })}
          placeholder="The emotional shape of it, not the biography"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>What role did you play in your family?</Label>
        <RadioGroup
          id="familyRole"
          value={data.familyRole}
          onChange={(v) => updateData({ familyRole: v })}
          options={[
            { value: "responsible", label: "The responsible one" },
            { value: "peacekeeper", label: "The peacekeeper" },
            { value: "achiever", label: "The achiever" },
            { value: "rebel", label: "The rebel" },
            { value: "quiet", label: "The quiet one" },
            { value: "caretaker", label: "The caretaker" },
            { value: "other", label: "Something else" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          Did your childhood feel stable, chaotic, or somewhere in between?
        </Label>
        <RadioGroup
          id="childhoodStability"
          value={data.childhoodStability}
          onChange={(v) => updateData({ childhoodStability: v })}
          options={[
            { value: "stable", label: "Stable" },
            { value: "mostly-stable", label: "Mostly stable" },
            { value: "mixed", label: "Mixed" },
            { value: "mostly-chaotic", label: "Mostly chaotic" },
            { value: "chaotic", label: "Chaotic" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="lastingImpact" optional>
          Is there something from your upbringing that still affects how you show
          up today?
        </Label>
        <TextArea
          id="lastingImpact"
          value={data.lastingImpact}
          onChange={(v) => updateData({ lastingImpact: v })}
          placeholder="Only if it comes to mind — no pressure"
          rows={3}
        />
      </FieldGroup>
    </div>
  );
}
