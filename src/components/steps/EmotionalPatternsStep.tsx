"use client";

import { StepProps } from "@/lib/types";
import {
  Label,
  RadioGroup,
  ScaleInput,
  FieldGroup,
} from "@/components/ui/FormField";

export default function EmotionalPatternsStep({
  data,
  updateData,
}: StepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup>
        <Label>What emotion do you feel most often day-to-day?</Label>
        <RadioGroup
          id="dailyEmotion"
          value={data.dailyEmotion}
          onChange={(v) => updateData({ dailyEmotion: v })}
          options={[
            { value: "anxiety", label: "Anxiety" },
            { value: "sadness", label: "Sadness" },
            { value: "anger", label: "Anger" },
            { value: "restlessness", label: "Restlessness" },
            { value: "contentment", label: "Contentment" },
            { value: "numbness", label: "Numbness" },
            { value: "changes", label: "It changes constantly" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>What emotion is hardest for you to express?</Label>
        <RadioGroup
          id="hardestToExpress"
          value={data.hardestToExpress}
          onChange={(v) => updateData({ hardestToExpress: v })}
          options={[
            { value: "anger", label: "Anger" },
            { value: "sadness", label: "Sadness" },
            { value: "vulnerability", label: "Vulnerability" },
            { value: "joy", label: "Joy" },
            { value: "need", label: "Need" },
            { value: "fear", label: "Fear" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>When you&apos;re overwhelmed, what do you do?</Label>
        <RadioGroup
          id="overwhelmResponse"
          value={data.overwhelmResponse}
          onChange={(v) => updateData({ overwhelmResponse: v })}
          options={[
            { value: "withdraw", label: "Withdraw and isolate" },
            { value: "overwork", label: "Overwork or stay busy" },
            { value: "seek-comfort", label: "Seek comfort from others" },
            { value: "shut-down", label: "Shut down emotionally" },
            { value: "irritable", label: "Get irritable" },
            { value: "move", label: "Exercise or move my body" },
          ]}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Do you tend to put others&apos; needs before your own?</Label>
        <ScaleInput
          id="othersNeedsFirst"
          value={data.othersNeedsFirst}
          onChange={(v) => updateData({ othersNeedsFirst: v })}
          leftLabel="Never"
          rightLabel="Always"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>How do you recharge?</Label>
        <RadioGroup
          id="rechargeMethod"
          value={data.rechargeMethod}
          onChange={(v) => updateData({ rechargeMethod: v })}
          options={[
            { value: "alone", label: "Completely alone" },
            { value: "one-on-one", label: "One-on-one with someone close" },
            { value: "group", label: "In a group" },
            { value: "physical", label: "Through physical activity" },
            { value: "creative", label: "Through creative expression" },
            { value: "rest", label: "Through rest and stillness" },
          ]}
        />
      </FieldGroup>
    </div>
  );
}
