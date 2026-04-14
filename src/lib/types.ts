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

  // Step 2: Focus & Intent
  focusAreas: string[];           // multi-select
  lifeChapter: string;            // single-select
  readingIntent: string;          // single-select
  specificFocus: string;          // optional textarea
  mbtiType: string;               // optional dropdown
  enneagramType: string;          // optional dropdown
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
  focusAreas: [],
  lifeChapter: "",
  readingIntent: "",
  specificFocus: "",
  mbtiType: "",
  enneagramType: "",
};

export const FOCUS_AREAS = [
  { value: "career", label: "Career & purpose" },
  { value: "love", label: "Love & romance" },
  { value: "family", label: "Family & roots" },
  { value: "friends", label: "Friendships & community" },
  { value: "health", label: "Health & body" },
  { value: "money", label: "Money & resources" },
  { value: "spirituality", label: "Inner work & spirituality" },
  { value: "creativity", label: "Creativity & expression" },
];

export const LIFE_CHAPTERS = [
  { value: "building", label: "Building something new" },
  { value: "transition", label: "In transition" },
  { value: "steady", label: "Steady & settled" },
  { value: "stuck", label: "Stuck or waiting" },
  { value: "reckoning", label: "Facing hard truths" },
];

export const READING_INTENTS = [
  { value: "blindspots", label: "Show me what I might be missing about myself" },
  { value: "sense", label: "Help me make sense of where I am" },
  { value: "pattern", label: "Help me with a pattern I keep hitting" },
  { value: "decision", label: "Help me with a decision I'm weighing" },
  { value: "curious", label: "I'm just curious — show me what you see" },
];

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export const ENNEAGRAM_TYPES = [
  "1 - Reformer", "2 - Helper", "3 - Achiever", "4 - Individualist",
  "5 - Investigator", "6 - Loyalist", "7 - Enthusiast", "8 - Challenger",
  "9 - Peacemaker",
];

export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
}

export const STEPS: StepConfig[] = [
  { id: "birth", title: "The Beginning", subtitle: "Your birth data anchors everything" },
  { id: "focus", title: "Set Your Intention", subtitle: "A few quick questions so the reading lands where it matters" },
  { id: "review", title: "Your Reading Awaits", subtitle: "Review and generate your natal portrait" },
];

export interface StepProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}
