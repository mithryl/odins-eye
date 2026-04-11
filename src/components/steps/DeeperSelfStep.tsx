"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  TextArea,
  RadioGroup,
  ScaleInput,
  FieldGroup,
  Hint,
} from "@/components/ui/FormField";

export default function DeeperSelfStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary italic border-l-2 border-gold/30 pl-4">
        These questions go deeper. Answer only what feels right. Skip anything
        you want — there&apos;s no wrong way through this.
      </p>

      <FieldGroup>
        <Label htmlFor="deepestFear">
          What&apos;s your deepest fear — not spiders or heights, but the real
          one?
        </Label>
        <TextArea
          id="deepestFear"
          value={data.deepestFear}
          onChange={(v) => updateData({ deepestFear: v })}
          placeholder="The fear underneath the fear"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="selfJudgment">
          What do you judge yourself hardest for?
        </Label>
        <TextArea
          id="selfJudgment"
          value={data.selfJudgment}
          onChange={(v) => updateData({ selfJudgment: v })}
          placeholder="The inner critic's favorite line"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="recurringPattern">
          What pattern keeps showing up in your life that you can&apos;t seem to
          break?
        </Label>
        <TextArea
          id="recurringPattern"
          value={data.recurringPattern}
          onChange={(v) => updateData({ recurringPattern: v })}
          placeholder="The loop you keep finding yourself in"
          rows={2}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>
          Have you been through something that fundamentally changed who you are?
        </Label>
        <Hint>
          You don&apos;t have to describe it — just whether it happened.
        </Hint>
        <RadioGroup
          id="transformativeEvent"
          value={data.transformativeEvent}
          onChange={(v) => updateData({ transformativeEvent: v })}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "still-in-it", label: "I'm still in it" },
          ]}
        />
      </FieldGroup>

      {(data.transformativeEvent === "yes" ||
        data.transformativeEvent === "still-in-it") && (
        <FieldGroup>
          <Label htmlFor="transformativeEventTime" optional>
            Roughly how long ago?
          </Label>
          <RadioGroup
            id="transformativeEventTime"
            value={data.transformativeEventTime}
            onChange={(v) => updateData({ transformativeEventTime: v })}
            options={[
              { value: "recent", label: "Within the last year" },
              { value: "few-years", label: "2-5 years ago" },
              { value: "long-ago", label: "More than 5 years ago" },
              { value: "ongoing", label: "It's ongoing" },
            ]}
          />
        </FieldGroup>
      )}

      <FieldGroup>
        <Label>Do you trust your own intuition?</Label>
        <ScaleInput
          id="intuitionTrust"
          value={data.intuitionTrust}
          onChange={(v) => updateData({ intuitionTrust: v })}
          leftLabel="Not at all"
          rightLabel="Deeply"
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="spiritualPractice" optional>
          Do you have a spiritual practice or belief system that&apos;s
          important to you?
        </Label>
        <TextArea
          id="spiritualPractice"
          value={data.spiritualPractice}
          onChange={(v) => updateData({ spiritualPractice: v })}
          placeholder="Whatever this means to you — organized religion, meditation, nature, nothing"
          rows={2}
        />
      </FieldGroup>
    </div>
  );
}
