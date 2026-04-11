"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextInput,
  TextArea,
  RadioGroup,
  FieldGroup,
} from "@/components/ui/FormField";

export default function LifeContextStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label htmlFor="genderIdentity" optional>
          Gender identity
        </Label>
        <TextInput
          id="genderIdentity"
          value={data.genderIdentity}
          onChange={(v) => updateData({ genderIdentity: v })}
          placeholder="How you identify"
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="work">What do you do for work?</Label>
        <TextInput
          id="work"
          value={data.work}
          onChange={(v) => updateData({ work: v })}
          placeholder="Your role or field, in a sentence"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Relationship status</Label>
        <RadioGroup
          id="relationshipStatus"
          value={data.relationshipStatus}
          onChange={(v) => updateData({ relationshipStatus: v })}
          options={[
            { value: "single", label: "Single" },
            { value: "in-a-relationship", label: "In a relationship" },
            { value: "married", label: "Married" },
            { value: "divorced", label: "Divorced" },
            { value: "its-complicated", label: "It's complicated" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Do you have kids?</Label>
        <RadioGroup
          id="hasKids"
          value={data.hasKids}
          onChange={(v) => updateData({ hasKids: v })}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Are you in a major life transition right now?</Label>
        <RadioGroup
          id="inTransition"
          value={data.inTransition}
          onChange={(v) => updateData({ inTransition: v })}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "not-sure", label: "Not sure" },
          ]}
        />
      </FieldGroup>

      {data.inTransition === "yes" && (
        <FieldGroup>
          <Label htmlFor="transitionDescription">
            Briefly, what&apos;s shifting?
          </Label>
          <TextArea
            id="transitionDescription"
            value={data.transitionDescription}
            onChange={(v) => updateData({ transitionDescription: v })}
            placeholder="A sentence or two about what's changing"
            rows={2}
          />
        </FieldGroup>
      )}
    </div>
  );
}
