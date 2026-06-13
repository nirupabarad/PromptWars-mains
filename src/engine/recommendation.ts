/**
 * Coping Strategy Recommendation Engine
 *
 * Provides context-aware coping strategy recommendations based on:
 * - Current mood and sentiment score
 * - Exam type (NEET/JEE/UPSC)
 * - Time of day
 * - Recent mood history (avoids repeating strategies)
 *
 * DESIGN PATTERN: Strategy Pattern
 * Different recommendation strategies are selected based on context.
 *
 * EFFICIENCY: Uses pre-computed lookup tables from constants.
 * No computation-heavy algorithms — just intelligent matching.
 *
 * SECURITY: No user data is stored or logged.
 */

import type {
  ExamType,
  MoodLevel,
  Recommendation,
  RecommendationCategory,
  TimePeriod,
} from "@/src/types";
import {
  COPING_STRATEGIES,
  STRATEGIES_BY_CATEGORY,
} from "@/src/utils/constants";

/** Context for making a recommendation decision */
interface RecommendationContext {
  readonly sentimentScore: number;
  readonly mood: MoodLevel;
  readonly examType: ExamType;
  readonly timePeriod: TimePeriod;
  readonly recentMoods: readonly MoodLevel[];
  readonly usedStrategyIds?: readonly string[];
}

/**
 * Gets a personalized coping strategy recommendation.
 *
 * @param context - Full context for recommendation decision
 * @returns The best-matching recommendation
 *
 * @example
 * const rec = getRecommendation({
 *   sentimentScore: -2,
 *   mood: 'low',
 *   examType: 'JEE',
 *   timePeriod: 'evening',
 *   recentMoods: ['low', 'okay', 'low'],
 * });
 */
export function getRecommendation(
  context: RecommendationContext,
): Recommendation {
  const category = selectCategory(context);
  const strategy = selectStrategy(category, context.usedStrategyIds || []);
  return strategy;
}

/**
 * Selects the most appropriate recommendation category based on context.
 * This is the core decision-making logic.
 *
 * @param context - User context for decision
 * @returns Best category for current situation
 */
function selectCategory(
  context: RecommendationContext,
): RecommendationCategory {
  const { sentimentScore, mood, timePeriod, recentMoods } = context;

  // If multiple consecutive bad moods, suggest social support
  const recentNegativeCount = recentMoods
    .slice(0, 5)
    .filter((m) => m === "low" || m === "rough").length;

  if (recentNegativeCount >= 3) {
    return "social";
  }

  // Severe negative sentiment -> immediate calming (breathing)
  if (sentimentScore <= -3 || mood === "rough") {
    return "breathing";
  }

  // Moderate negative -> mindfulness
  if (sentimentScore <= -1 || mood === "low") {
    return "mindfulness";
  }

  // Night time with neutral mood -> wind-down technique
  if (timePeriod === "night") {
    return "mindfulness";
  }

  // Morning or afternoon with okay mood -> study technique
  if (
    (timePeriod === "morning" || timePeriod === "afternoon") &&
    mood === "okay"
  ) {
    return "study-technique";
  }

  // Good mood -> cognitive reinforcement
  if (mood === "good" || mood === "great") {
    return "cognitive";
  }

  // Default: physical activity
  return "physical";
}

/**
 * Selects a specific strategy from a category, avoiding recently used ones.
 *
 * @param category - Target category
 * @param usedIds - Recently used strategy IDs to avoid
 * @returns Selected recommendation
 */
function selectStrategy(
  category: RecommendationCategory,
  usedIds: readonly string[],
): Recommendation {
  const categoryStrategies = STRATEGIES_BY_CATEGORY[category];

  // Find strategies not recently used
  const availableIds = categoryStrategies.filter((id) => !usedIds.includes(id));

  // If all used, reset and pick first
  const targetId =
    availableIds.length > 0
      ? availableIds[Math.floor(Math.random() * availableIds.length)]
      : categoryStrategies[0];

  const strategy = COPING_STRATEGIES.find((s) => s.id === targetId);

  // Fallback to first strategy if not found (defensive)
  return strategy || COPING_STRATEGIES[0];
}

/**
 * Gets exam-specific context for a recommendation.
 *
 * @param examType - User's exam type
 * @param recommendation - The selected recommendation
 * @returns Contextual message for the exam type
 */
export function getExamContext(
  examType: ExamType,
  recommendation: Recommendation,
): string {
  const examMessages: Record<ExamType, string> = {
    NEET: `For NEET preparation: ${recommendation.examContext}`,
    JEE: `For JEE preparation: ${recommendation.examContext}`,
    UPSC: `For UPSC preparation: ${recommendation.examContext}`,
    general: recommendation.examContext,
  };

  return examMessages[examType];
}

/**
 * Gets all strategies for a specific category (for toolbox display).
 *
 * @param category - Category to filter by
 * @returns Array of recommendations in that category
 */
export function getStrategiesByCategory(
  category: RecommendationCategory,
): readonly Recommendation[] {
  const ids = STRATEGIES_BY_CATEGORY[category];
  return COPING_STRATEGIES.filter((s) => ids.includes(s.id));
}

/**
 * Gets all available categories.
 *
 * @returns Array of all recommendation categories
 */
export function getAllCategories(): RecommendationCategory[] {
  return Object.keys(STRATEGIES_BY_CATEGORY) as RecommendationCategory[];
}
