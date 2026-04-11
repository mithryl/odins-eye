"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextArea,
  RadioGroup,
  FieldGroup,
} from "@/components/ui/FormField";

export default function SelfPerceptionStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label htmlFor="friendDescription">
          How would your closest friend describe you?
        </Label>
        <TextArea
          id="friendDescription"
          value={data.friendDescription}
          onChange={(v) => updateData({ friendDescription: v })}
          placeholder="In their words, not yours"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="misunderstood">
          What do people consistently get wrong about you?
        </Label>
        <TextArea
          id="misunderstood"
          value={data.misunderstood}
          onChange={(v) => updateData({ misunderstood: v })}
          placeholder="The gap between how you're seen and who you are"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>How do you handle conflict?</Label>
        <RadioGroup
          id="conflictStyle"
          value={data.conflictStyle}
          onChange={(v) => updateData({ conflictStyle: v })}
          options={[
            { value: "avoid", label: "I avoid it" },
            { value: "head-on", label: "I address it head-on" },
            { value: "internalize", label: "I internalize it" },
            { value: "depends", label: "Depends on who it's with" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>What&apos;s your relationship with control?</Label>
        <RadioGroup
          id="controlRelationship"
          value={data.controlRelationship}
          onChange={(v) => updateData({ controlRelationship: v })}
          options={[
            { value: "need-it", label: "I need it" },
            { value: "go-with-flow", label: "I go with the flow" },
            { value: "depends", label: "It depends on the domain" },
            { value: "working-on-it", label: "I'm working on letting go" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="feelingStuck">
          Where in your life do you feel most stuck right now?
        </Label>
        <TextArea
          id="feelingStuck"
          value={data.feelingStuck}
          onChange={(v) => updateData({ feelingStuck: v })}
          placeholder="The area that feels heaviest"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="deepestWant">
          What do you want most right now that you don&apos;t have?
        </Label>
        <TextArea
          id="deepestWant"
          value={data.deepestWant}
          onChange={(v) => updateData({ deepestWant: v })}
          placeholder="Be honest, not aspirational"
          rows={2}
        />
      </FieldGroup>
    </div>
  );
}
