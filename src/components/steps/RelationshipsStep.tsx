"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextArea,
  RadioGroup,
  ScaleInput,
  FieldGroup,
} from "@/components/ui/FormField";

export default function RelationshipsStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label htmlFor="relationshipChallenge">
          What&apos;s your biggest challenge in close relationships?
        </Label>
        <TextArea
          id="relationshipChallenge"
          value={data.relationshipChallenge}
          onChange={(v) => updateData({ relationshipChallenge: v })}
          placeholder="One sentence — the pattern, not an incident"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          In relationships, are you more likely to lose yourself or keep too much
          distance?
        </Label>
        <ScaleInput
          id="loseOrDistance"
          value={data.loseOrDistance}
          onChange={(v) => updateData({ loseOrDistance: v })}
          leftLabel="Lose myself"
          rightLabel="Keep too much distance"
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="unaskedNeed">
          What do you need from people close to you that you rarely ask for?
        </Label>
        <TextArea
          id="unaskedNeed"
          value={data.unaskedNeed}
          onChange={(v) => updateData({ unaskedNeed: v })}
          placeholder="The thing you wish they just knew"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Do you have many friends or a few deep ones?</Label>
        <RadioGroup
          id="friendshipStyle"
          value={data.friendshipStyle}
          onChange={(v) => updateData({ friendshipStyle: v })}
          options={[
            { value: "many", label: "Many friends" },
            { value: "few-deep", label: "A few deep ones" },
            { value: "loner", label: "I keep mostly to myself" },
            { value: "mix", label: "A mix" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          Have you always felt like you fit in, or have you always felt a little
          different?
        </Label>
        <ScaleInput
          id="fittingIn"
          value={data.fittingIn}
          onChange={(v) => updateData({ fittingIn: v })}
          leftLabel="Fit in easily"
          rightLabel="Always felt different"
        />
      </FieldGroup>
    </div>
  );
}
