/**
 * MindMate Type Definitions
 *
 * Central type definitions for the Mental Wellness Tracker.
 * All interfaces are strictly typed with no 'any' types.
 *
 * SECURITY: No sensitive data types (passwords, tokens) are defined here.
 * All mood data is transient and session-scoped.
 */

/** Mood levels from most positive to most negative */
export type MoodLevel = "great" | "good" | "okay" | "low" | "rough";

/** Supported exam types for context-aware recommendations */
export type ExamType = "NEET" | "JEE" | "UPSC" | "general";

/** Time periods for pattern detection */
export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

/** Severity levels for crisis detection */
export type CrisisSeverity = "none" | "mild" | "moderate" | "severe";

/** Recommendation categories */
export type RecommendationCategory =
  | "breathing"
  | "mindfulness"
  | "physical"
  | "cognitive"
  | "social"
  | "study-technique";

/** Single mood entry logged by the user */
export interface MoodEntry {
  readonly id: string;
  readonly mood: MoodLevel;
  readonly journalText: string;
  readonly timestamp: number;
  readonly sentimentScore: number;
  readonly timePeriod: TimePeriod;
}

/** Result from sentiment analysis engine */
export interface SentimentResult {
  readonly score: number;
  readonly comparative: number;
  readonly positive: readonly string[];
  readonly negative: readonly string[];
  readonly confidence: number;
}

/** Detected emotional pattern */
export interface PatternInsight {
  readonly type: "time_based" | "trigger" | "trend" | "streak";
  readonly description: string;
  readonly confidence: number;
  readonly suggestion: string;
}

/** Crisis detection result */
export interface CrisisAssessment {
  readonly severity: CrisisSeverity;
  readonly triggerWords: readonly string[];
  readonly recommendation: string;
  readonly showResources: boolean;
}

/** Coping strategy recommendation */
export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: RecommendationCategory;
  readonly duration: string;
  readonly steps: readonly string[];
  readonly examContext: string;
}

/** Chat message in the companion interface */
export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: number;
  readonly recommendation?: Recommendation;
  readonly crisisAlert?: boolean;
}

/** Global wellness state (in-memory only) */
export interface WellnessState {
  readonly entries: readonly MoodEntry[];
  readonly chatMessages: readonly ChatMessage[];
  readonly examType: ExamType;
  readonly currentStreak: number;
  readonly highContrastMode: boolean;
  readonly reducedMotion: boolean;
}

/** Actions for the wellness state reducer */
export type WellnessAction =
  | { type: "ADD_ENTRY"; payload: MoodEntry }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_EXAM_TYPE"; payload: ExamType }
  | { type: "UPDATE_STREAK"; payload: number }
  | { type: "TOGGLE_HIGH_CONTRAST" }
  | { type: "TOGGLE_REDUCED_MOTION" }
  | { type: "CLEAR_ALL_DATA" };

/** API request body for sentiment analysis */
export interface AnalyzeRequest {
  readonly text: string;
  readonly mood: MoodLevel;
}

/** API response from sentiment analysis */
export interface AnalyzeResponse {
  readonly sentiment: SentimentResult;
  readonly crisis: CrisisAssessment;
  readonly patterns: readonly PatternInsight[];
}

/** API request body for recommendations */
export interface RecommendRequest {
  readonly sentimentScore: number;
  readonly mood: MoodLevel;
  readonly examType: ExamType;
  readonly timePeriod: TimePeriod;
  readonly recentMoods: readonly MoodLevel[];
}

/** API response with recommendation */
export interface RecommendResponse {
  readonly recommendation: Recommendation;
  readonly empathyMessage: string;
  readonly encouragement: string;
}
