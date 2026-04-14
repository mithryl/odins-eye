import { FormData } from "./types";
import { NatalChart } from "./chart";

/**
 * Build the Claude prompt from chart data + user context.
 */
export function buildPrompt(
  chart: NatalChart,
  aspects: string[],
  formData: FormData,
): string {
  const placementBlock = chart.placements
    .map((p) => {
      const house = p.house ? ` (House ${p.house})` : "";
      return `- ${p.planet}: ${p.sign} at ${p.degree.toFixed(2)}°${house}`;
    })
    .join("\n");

  const aspectBlock = aspects.join("\n- ");

  const risingBlock = chart.risingSign
    ? `Rising Sign (Ascendant): ${chart.risingSign} at ${chart.risingDegree?.toFixed(2)}°${
        chart.midheavenSign ? `\nMidheaven (MC): ${chart.midheavenSign} at ${chart.midheavenDegree?.toFixed(2)}°` : ""
      }`
    : "Rising Sign: Unknown (birth time not precise enough)";

  // Build the user context section from form answers
  const contextParts: string[] = [];

  if (formData.genderIdentity) contextParts.push(`Gender identity: ${formData.genderIdentity}`);
  if (formData.work) contextParts.push(`Work: ${formData.work}`);
  if (formData.relationshipStatus) contextParts.push(`Relationship: ${formData.relationshipStatus}`);
  if (formData.hasKids) contextParts.push(`Kids: ${formData.hasKids}`);
  if (formData.inTransition === "yes" && formData.transitionDescription) {
    contextParts.push(`Currently in transition: ${formData.transitionDescription}`);
  }

  if (formData.friendDescription) contextParts.push(`How their closest friend describes them: "${formData.friendDescription}"`);
  if (formData.misunderstood) contextParts.push(`What people get wrong about them: "${formData.misunderstood}"`);
  if (formData.conflictStyle) contextParts.push(`Conflict style: ${formData.conflictStyle}`);
  if (formData.controlRelationship) contextParts.push(`Relationship with control: ${formData.controlRelationship}`);
  if (formData.feelingStuck) contextParts.push(`Where they feel stuck: "${formData.feelingStuck}"`);
  if (formData.deepestWant) contextParts.push(`What they want most: "${formData.deepestWant}"`);

  if (formData.motherRelationship) contextParts.push(`Mother/primary caregiver relationship: "${formData.motherRelationship}"`);
  if (formData.fatherRelationship) contextParts.push(`Father/other parent relationship: "${formData.fatherRelationship}"`);
  if (formData.familyRole) contextParts.push(`Role in family: ${formData.familyRole}`);
  if (formData.childhoodStability) contextParts.push(`Childhood stability: ${formData.childhoodStability}`);
  if (formData.lastingImpact) contextParts.push(`Lasting impact from upbringing: "${formData.lastingImpact}"`);

  if (formData.dailyEmotion) contextParts.push(`Most frequent emotion: ${formData.dailyEmotion}`);
  if (formData.hardestToExpress) contextParts.push(`Hardest emotion to express: ${formData.hardestToExpress}`);
  if (formData.overwhelmResponse) contextParts.push(`When overwhelmed: ${formData.overwhelmResponse}`);
  if (formData.othersNeedsFirst) contextParts.push(`Puts others first (1-5 scale): ${formData.othersNeedsFirst}`);
  if (formData.rechargeMethod) contextParts.push(`Recharges by: ${formData.rechargeMethod}`);

  if (formData.relationshipChallenge) contextParts.push(`Biggest relationship challenge: "${formData.relationshipChallenge}"`);
  if (formData.loseOrDistance) contextParts.push(`Lose self vs. keep distance (1-5): ${formData.loseOrDistance}`);
  if (formData.unaskedNeed) contextParts.push(`What they need but rarely ask for: "${formData.unaskedNeed}"`);
  if (formData.friendshipStyle) contextParts.push(`Friendship style: ${formData.friendshipStyle}`);
  if (formData.fittingIn) contextParts.push(`Fitting in vs. feeling different (1-5): ${formData.fittingIn}`);

  if (formData.workAlignment) contextParts.push(`Work alignment (1-5): ${formData.workAlignment}`);
  if (formData.primaryDrivers) contextParts.push(`Primary driver: ${formData.primaryDrivers}`);
  if (formData.noConstraints) contextParts.push(`If no constraints: "${formData.noConstraints}"`);
  if (formData.riskTolerance) contextParts.push(`Risk tolerance (1-5, safe to risky): ${formData.riskTolerance}`);
  if (formData.ownLife) contextParts.push(`Own life vs. shaped by others (1-5): ${formData.ownLife}`);

  if (formData.deepestFear) contextParts.push(`Deepest fear: "${formData.deepestFear}"`);
  if (formData.selfJudgment) contextParts.push(`Harshest self-judgment: "${formData.selfJudgment}"`);
  if (formData.recurringPattern) contextParts.push(`Recurring life pattern: "${formData.recurringPattern}"`);
  if (formData.transformativeEvent !== "") {
    contextParts.push(`Transformative life event: ${formData.transformativeEvent}${formData.transformativeEventTime ? ` (${formData.transformativeEventTime})` : ""}`);
  }
  if (formData.intuitionTrust) contextParts.push(`Trusts own intuition (1-5): ${formData.intuitionTrust}`);
  if (formData.spiritualPractice) contextParts.push(`Spiritual practice: "${formData.spiritualPractice}"`);

  if (formData.mbtiType) contextParts.push(`MBTI: ${formData.mbtiType}`);
  if (formData.enneagramType) contextParts.push(`Enneagram: ${formData.enneagramType}`);
  if (formData.otherAssessments) contextParts.push(`Other assessments: ${formData.otherAssessments}`);
  if (formData.additionalNotes) contextParts.push(`Additional notes: "${formData.additionalNotes}"`);

  return `You are a master astrologer and depth psychologist. You create natal chart readings that are deeply personal, psychologically honest, and synthesize astrological symbolism with real human experience. You reference the astrological terms (planet, sign, house, aspect) but always translate them into psychological and emotional language that makes someone feel truly seen.

Your tone is: warm but direct, poetic but grounded, insightful but never preachy. You speak with the authority of someone who has studied thousands of charts but the compassion of someone who understands that every chart belongs to a real person navigating real life.

You are writing a natal chart reading for ${formData.firstName}.

## NATAL CHART DATA

Birth: ${chart.birthDateTime}
${risingBlock}

### Planetary Placements
${placementBlock}

### Major Aspects
- ${aspectBlock}

## PERSONAL CONTEXT

${formData.firstName} shared the following about themselves. Use this to ground your astrological interpretation in their actual lived experience. When a placement maps to something they shared, name it explicitly — "Your Mars in Scorpio explains why..." + reference their specific answer. This is what makes the reading feel personal rather than generic.

${contextParts.join("\n")}

## READING STRUCTURE

Write the reading in these sections, using the markdown headers exactly as shown. Each section should be 2-4 paragraphs. Do not use bullet points — write in flowing prose.

### The Core of Who You Are
Interpret the Sun sign and its degree. Who is ${formData.firstName} at their center? Connect to what they shared about their self-perception, work, and drivers.

### Your Emotional Architecture
Interpret the Moon sign. How do they process feelings, what they need to feel safe, what their emotional reflexes are. Connect to their answers about emotions, overwhelm response, childhood, and mother relationship.

### The Face You Show the World
${chart.risingSign ? `Interpret the ${chart.risingSign} rising sign — the mask, the first impression, the persona.` : "Since birth time was not precise, discuss the Sun sign's outward expression and what they shared about being misunderstood."}
Connect to what people get wrong about them and how their friend describes them.

### How You Think and Communicate
Interpret Mercury — how their mind works, how they process and share ideas, their communication style.

### How You Love
Interpret Venus — what they value, how they express and receive love, what they're drawn to. Connect to their relationship answers, closeness patterns, and unasked needs.

### How You Fight and Pursue
Interpret Mars — their drive, anger, assertion, ambition style. Connect to their conflict style, control relationship, and risk tolerance.

### Where You Grow
Interpret Jupiter — where life expands, where luck flows, where they tend toward excess.

### Where You're Tested
Interpret Saturn — their deepest discipline, their relationship with authority, where they feel restricted. Connect to father relationship, self-judgment, and recurring patterns.

### Your Deepest Wound — Chiron
Interpret Chiron — the wound that never fully heals but becomes the source of ${formData.firstName}'s greatest wisdom and capacity to help others. Where Chiron sits shows where they were hurt early, where they overcompensate or avoid, and paradoxically where they have the most to offer. Connect to what they shared about their upbringing, lasting impact, and the patterns they can't break. This isn't about fixing — it's about recognizing the wound as a teacher.

### The Untamed — Lilith
Interpret Black Moon Lilith — the raw, unfiltered, refused-to-be-domesticated part of ${formData.firstName}. Lilith shows where they carry suppressed power, shadow rage, and the parts of themselves they've been told are "too much." Connect to what they judge themselves hardest for, their deepest fear, and the emotion that's hardest to express. Lilith is not a wound — it's a wildness that demands integration, not healing.

### The Depths
Interpret Uranus, Neptune, and Pluto as they relate to ${formData.firstName}'s generation and personal chart. Focus on Pluto especially — connect to their deepest fear, transformative events, and the patterns they can't break.

### The Nodal Axis — Where You've Been and Where You're Going
Interpret the North Node and South Node axis in depth. The South Node represents the comfort zone, the past-life patterns, the skills and tendencies ${formData.firstName} came in with — what feels effortless but ultimately keeps them stuck. The North Node is the growth direction, the soul's purpose, what feels unfamiliar and even uncomfortable but is exactly where fulfillment lives. Name the specific signs and connect them to what ${formData.firstName} shared about feeling stuck, what they want most, and the tension between safety and growth. This is one of the most important parts of the reading — give it real depth.

### Through Odin's Eye
This is the final and most important section — the synthesis. Pull together the full chart: the tensions between planets, the nodal axis direction, the aspects that create friction and flow. What is the larger arc of who ${formData.firstName} is becoming? Connect to where they feel stuck, what they want most, and the life they'd live without constraints. This section should feel like the moment someone truly sees them — not flattery, not advice, but a clear-eyed recognition of who they are and what they're here to do. End with something that lands, not a motivational poster.

## IMPORTANT RULES
- Address ${formData.firstName} directly as "you" throughout
- Reference specific placements by name (e.g., "your Venus in Pisces") but always explain what it means psychologically
- When a chart placement maps to something they shared about themselves, explicitly connect them: "This is why..." or "You can see this showing up in..."
- Be honest, not flattering. Name the difficult placements and what they demand
- Do not use bullet points or lists — flowing prose only
- Do not use emojis
- Write approximately 3000-4000 words total
- Do not include a preamble, introduction, or sign-off outside the section structure`;
}
