export interface FormData {
  // Step 1: Birth Data
  firstName: string;
  birthDate: string;
  birthTimePrecision: "exact" | "approximate" | "unknown" | "";
  birthTimeExact: string;
  birthTimeApproximate: "morning" | "afternoon" | "evening" | "night" | "";
  birthCity: string;
  birthState: string;
  birthStateCode: string;
  birthCountry: string;
  birthCountryCode: string;
  birthLatitude: number | null;
  birthLongitude: number | null;

  // Step 2: Life Context
  genderIdentity: string;
  work: string;
  relationshipStatus: string;
  hasKids: string;
  inTransition: string;
  transitionDescription: string;

  // Step 3: Self-Perception
  friendDescription: string;
  misunderstood: string;
  conflictStyle: string;
  controlRelationship: string;
  feelingStuck: string;
  deepestWant: string;

  // Step 4: Family & Upbringing
  motherRelationship: string;
  fatherRelationship: string;
  familyRole: string;
  childhoodStability: string;
  lastingImpact: string;

  // Step 5: Emotional Patterns
  dailyEmotion: string;
  hardestToExpress: string;
  overwhelmResponse: string;
  othersNeedsFirst: string;
  rechargeMethod: string;

  // Step 6: Relationships & Connection
  relationshipChallenge: string;
  loseOrDistance: string;
  unaskedNeed: string;
  friendshipStyle: string;
  fittingIn: string;

  // Step 7: Ambition & Purpose
  workAlignment: string;
  primaryDrivers: string;
  noConstraints: string;
  riskTolerance: string;
  ownLife: string;

  // Step 8: The Deeper Stuff
  deepestFear: string;
  selfJudgment: string;
  recurringPattern: string;
  transformativeEvent: string;
  transformativeEventTime: string;
  intuitionTrust: string;
  spiritualPractice: string;

  // Step 9: Assessments (Optional)
  mbtiType: string;
  enneagramType: string;
  otherAssessments: string;
  additionalNotes: string;
}

export const initialFormData: FormData = {
  firstName: "",
  birthDate: "",
  birthTimePrecision: "",
  birthTimeExact: "",
  birthTimeApproximate: "",
  birthCity: "",
  birthState: "",
  birthStateCode: "",
  birthCountry: "",
  birthCountryCode: "",
  birthLatitude: null,
  birthLongitude: null,
  genderIdentity: "",
  work: "",
  relationshipStatus: "",
  hasKids: "",
  inTransition: "",
  transitionDescription: "",
  friendDescription: "",
  misunderstood: "",
  conflictStyle: "",
  controlRelationship: "",
  feelingStuck: "",
  deepestWant: "",
  motherRelationship: "",
  fatherRelationship: "",
  familyRole: "",
  childhoodStability: "",
  lastingImpact: "",
  dailyEmotion: "",
  hardestToExpress: "",
  overwhelmResponse: "",
  othersNeedsFirst: "",
  rechargeMethod: "",
  relationshipChallenge: "",
  loseOrDistance: "",
  unaskedNeed: "",
  friendshipStyle: "",
  fittingIn: "",
  workAlignment: "",
  primaryDrivers: "",
  noConstraints: "",
  riskTolerance: "",
  ownLife: "",
  deepestFear: "",
  selfJudgment: "",
  recurringPattern: "",
  transformativeEvent: "",
  transformativeEventTime: "",
  intuitionTrust: "",
  spiritualPractice: "",
  mbtiType: "",
  enneagramType: "",
  otherAssessments: "",
  additionalNotes: "",
};

export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
}

export const STEPS: StepConfig[] = [
  { id: "birth", title: "The Beginning", subtitle: "Your birth data anchors everything" },
  { id: "context", title: "Where You Stand", subtitle: "The landscape of your life right now" },
  { id: "perception", title: "How You See Yourself", subtitle: "The mirror you carry" },
  { id: "family", title: "Where You Come From", subtitle: "The soil you grew in" },
  { id: "emotions", title: "What You Feel", subtitle: "Your emotional architecture" },
  { id: "relationships", title: "How You Connect", subtitle: "The space between you and others" },
  { id: "ambition", title: "Where You're Headed", subtitle: "Purpose, drive, and direction" },
  { id: "deeper", title: "What Lies Beneath", subtitle: "The depths most people never share" },
  { id: "assessments", title: "Additional Insights", subtitle: "Optional — if you know these, they deepen the reading" },
  { id: "review", title: "Your Reading Awaits", subtitle: "Review and generate your natal portrait" },
];

export interface StepProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}
