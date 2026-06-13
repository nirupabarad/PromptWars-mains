/**
 * Application Constants and Configuration
 *
 * Centralized configuration for MindMate.
 * All values are immutable and type-safe.
 *
 * SECURITY: No secrets or API keys stored here.
 * Only static configuration values.
 */

import type {
  MoodLevel,
  Recommendation,
  RecommendationCategory,
} from "@/src/types";

/** Maximum mood entries stored in session (EFFICIENCY: prevents memory bloat) */
export const MAX_ENTRIES = 30;

/** Maximum chat messages in session */
export const MAX_CHAT_MESSAGES = 50;

/** Rate limit: max API requests per minute (SECURITY: prevents abuse) */
export const RATE_LIMIT_MAX = 60;

/** Maximum input text length (SECURITY: prevents DoS via large payloads) */
export const MAX_INPUT_LENGTH = 2000;

/** Minimum input length to trigger analysis */
export const MIN_INPUT_LENGTH = 3;

/** Mood numeric values for chart visualization */
export const MOOD_VALUES: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  rough: 1,
} as const;

/** Mood emoji mappings for accessible display */
export const MOOD_EMOJIS: Record<MoodLevel, { emoji: string; label: string }> =
  {
    great: { emoji: "😊", label: "Feeling great" },
    good: { emoji: "🙂", label: "Feeling good" },
    okay: { emoji: "😐", label: "Feeling okay" },
    low: { emoji: "😔", label: "Feeling low" },
    rough: { emoji: "😢", label: "Having a rough time" },
  } as const;

/** Crisis-related trigger words for detection (SECURITY: processed server-side only) */
export const CRISIS_TRIGGER_WORDS: readonly string[] = [
  "hopeless",
  "worthless",
  "give up",
  "cant go on",
  "no point",
  "end it",
  "harm myself",
  "suicide",
  "kill myself",
  "want to die",
  "self harm",
  "cutting",
  "overdose",
  "no reason to live",
] as const;

/** Stress trigger words for pattern detection */
export const STRESS_TRIGGER_WORDS: readonly string[] = [
  "exam",
  "test",
  "fail",
  "failure",
  "pressure",
  "deadline",
  "nervous",
  "anxious",
  "scared",
  "overwhelmed",
  "stressed",
  "cant sleep",
  "insomnia",
  "panic",
  "worried",
  "fear",
  "mock test",
  "result",
  "marks",
  "rank",
  "cutoff",
] as const;

/** Positive indicator words */
export const POSITIVE_WORDS: readonly string[] = [
  "happy",
  "grateful",
  "accomplished",
  "proud",
  "relaxed",
  "calm",
  "focused",
  "motivated",
  "confident",
  "peaceful",
  "completed",
  "progress",
  "learned",
  "improved",
  "breakthrough",
] as const;

/** Emergency helpline resources */
export const EMERGENCY_RESOURCES = {
  india: {
    name: "Vandrevala Foundation Helpline",
    number: "1860-2662-345",
    available: "24/7",
  },
  iCall: {
    name: "iCall (TISS)",
    number: "9152987821",
    available: "Mon-Sat, 8am-10pm",
  },
  kiran: {
    name: "KIRAN Mental Health Helpline",
    number: "1800-599-0019",
    available: "24/7, Toll-free",
  },
} as const;

/**
 * Pre-computed coping strategies database
 * EFFICIENCY: Static lookup table avoids runtime computation
 */
export const COPING_STRATEGIES: readonly Recommendation[] = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    description:
      "A calming technique used by Navy SEALs to reduce stress and improve focus.",
    category: "breathing",
    duration: "4 minutes",
    steps: [
      "Breathe in slowly for 4 seconds",
      "Hold your breath for 4 seconds",
      "Exhale slowly for 4 seconds",
      "Hold for 4 seconds",
      "Repeat 4 times",
    ],
    examContext:
      "Perfect before starting a study session or during exam anxiety.",
  },
  {
    id: "478-breathing",
    title: "4-7-8 Breathing",
    description:
      "A relaxation technique that helps calm the nervous system quickly.",
    category: "breathing",
    duration: "3 minutes",
    steps: [
      "Inhale quietly through your nose for 4 seconds",
      "Hold your breath for 7 seconds",
      "Exhale completely through mouth for 8 seconds",
      "Repeat 3-4 cycles",
    ],
    examContext:
      "Great for calming pre-exam nerves or when feeling overwhelmed by syllabus.",
  },
  {
    id: "pomodoro-focus",
    title: "Pomodoro Technique",
    description:
      "Time-blocking method that improves focus and prevents burnout.",
    category: "study-technique",
    duration: "25 minutes",
    steps: [
      "Choose one topic or chapter to focus on",
      "Set a timer for 25 minutes",
      "Study with full focus — no phone, no distractions",
      "Take a 5-minute break when timer rings",
      "After 4 rounds, take a 15-minute break",
    ],
    examContext:
      "Ideal for long study sessions. NEET/JEE aspirants can cover one topic per pomodoro.",
  },
  {
    id: "body-scan",
    title: "Quick Body Scan",
    description:
      "A mindfulness exercise to release physical tension from studying.",
    category: "mindfulness",
    duration: "5 minutes",
    steps: [
      "Sit comfortably and close your eyes",
      "Start from the top of your head",
      "Slowly move attention down: forehead, jaw, neck, shoulders",
      "Notice any tension and consciously relax that area",
      "Continue down to your toes",
    ],
    examContext:
      "After long hours of sitting and studying, this releases built-up tension.",
  },
  {
    id: "gratitude-list",
    title: "Gratitude List",
    description: "Shift focus from stress to appreciation to improve mood.",
    category: "cognitive",
    duration: "3 minutes",
    steps: [
      "Take a piece of paper or open notes",
      "Write down 3 things you are grateful for today",
      "Include one thing about your study progress",
      "Read them aloud to yourself",
      "Notice how your perspective shifts",
    ],
    examContext:
      "Helps maintain a positive mindset during the long preparation journey.",
  },
  {
    id: "walk-break",
    title: "5-Minute Walk Break",
    description: "Physical movement to reset focus and boost energy.",
    category: "physical",
    duration: "5 minutes",
    steps: [
      "Stand up from your desk",
      "Walk around your room or outside",
      "Focus on your surroundings — notice 5 things you can see",
      "Take deep breaths while walking",
      "Return to your desk refreshed",
    ],
    examContext:
      "Boosts blood flow to the brain — especially helpful between subjects.",
  },
  {
    id: "positive-affirmations",
    title: "Study Affirmations",
    description:
      "Reframe negative thoughts about exams with positive statements.",
    category: "cognitive",
    duration: "2 minutes",
    steps: [
      "Take 3 deep breaths",
      'Say: "I am capable of learning this material"',
      'Say: "Every hour I study brings me closer to my goal"',
      'Say: "It is okay to take breaks — rest makes me stronger"',
      'Say: "I am doing my best, and that is enough"',
    ],
    examContext: "Use when self-doubt creeps in about your preparation level.",
  },
  {
    id: "study-buddy-call",
    title: "Study Buddy Check-In",
    description:
      "Social connection to reduce isolation during intense preparation.",
    category: "social",
    duration: "10 minutes",
    steps: [
      "Call or message a friend who is also preparing",
      "Share one thing you learned today",
      "Ask them about their progress",
      "Encourage each other",
      "Set a time to check in again tomorrow",
    ],
    examContext:
      "Combats the isolation of competitive exam prep. You are not alone in this.",
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    description: "A sensory grounding technique for anxiety and panic moments.",
    category: "mindfulness",
    duration: "3 minutes",
    steps: [
      "Name 5 things you can SEE around you",
      "Name 4 things you can TOUCH",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
    ],
    examContext:
      "Use during panic moments — before entering exam hall or opening results.",
  },
  {
    id: "time-blocking",
    title: "Daily Time Blocking",
    description: "Structure your day to reduce decision fatigue and anxiety.",
    category: "study-technique",
    duration: "10 minutes",
    steps: [
      "Divide tomorrow into 2-hour blocks",
      "Assign one subject or task to each block",
      "Include break blocks (non-negotiable)",
      "Add one block for physical activity",
      "End the day with a wind-down routine",
    ],
    examContext:
      'Reduces the "what should I study" anxiety. JEE/NEET prep needs structure.',
  },
] as const;

/** Category-to-strategy mapping for efficient lookup */
export const STRATEGIES_BY_CATEGORY: Record<
  RecommendationCategory,
  readonly string[]
> = {
  breathing: ["box-breathing", "478-breathing"],
  mindfulness: ["body-scan", "grounding-54321"],
  physical: ["walk-break"],
  cognitive: ["gratitude-list", "positive-affirmations"],
  social: ["study-buddy-call"],
  "study-technique": ["pomodoro-focus", "time-blocking"],
} as const;
