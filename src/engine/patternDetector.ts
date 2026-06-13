/**
 * Emotional Pattern Detection Engine
 *
 * Identifies patterns and trends in user mood data to provide
 * meaningful insights. Analyzes time-based patterns, triggers,
 * mood trends, and streaks.
 *
 * SECURITY: Processes only in-memory session data.
 * No historical data is persisted between sessions.
 *
 * EFFICIENCY: Uses simple statistical methods (no ML).
 * Operates on bounded arrays (max 30 entries).
 */

import type {
  MoodEntry,
  MoodLevel,
  PatternInsight,
  TimePeriod,
} from "@/src/types";
import {
  MOOD_VALUES,
  STRESS_TRIGGER_WORDS,
  POSITIVE_WORDS,
} from "@/src/utils/constants";

/**
 * Detects all patterns from the user's mood history.
 *
 * @param entries - Array of mood entries (bounded to 30)
 * @returns Array of detected pattern insights
 */
export function detectPatterns(
  entries: readonly MoodEntry[],
): PatternInsight[] {
  if (entries.length < 3) {
    return [];
  }

  const patterns: PatternInsight[] = [];

  const timePattern = detectTimePattern(entries);
  if (timePattern) patterns.push(timePattern);

  const triggers = detectTriggers(entries);
  if (triggers) patterns.push(triggers);

  const trend = detectTrend(entries);
  if (trend) patterns.push(trend);

  const streak = detectStreak(entries);
  if (streak) patterns.push(streak);

  return patterns;
}

/**
 * Detects time-of-day mood patterns.
 * Example: "You tend to feel lower in the evenings"
 *
 * @param entries - Mood entries to analyze
 * @returns Time-based pattern insight or null
 */
function detectTimePattern(
  entries: readonly MoodEntry[],
): PatternInsight | null {
  const periodScores: Record<TimePeriod, { total: number; count: number }> = {
    morning: { total: 0, count: 0 },
    afternoon: { total: 0, count: 0 },
    evening: { total: 0, count: 0 },
    night: { total: 0, count: 0 },
  };

  for (const entry of entries) {
    const period = entry.timePeriod;
    periodScores[period].total += MOOD_VALUES[entry.mood];
    periodScores[period].count += 1;
  }

  // Find worst and best periods
  let worstPeriod: TimePeriod | null = null;
  let worstAvg = Infinity;
  let bestPeriod: TimePeriod | null = null;
  let bestAvg = -Infinity;

  for (const [period, data] of Object.entries(periodScores)) {
    if (data.count >= 2) {
      const avg = data.total / data.count;
      if (avg < worstAvg) {
        worstAvg = avg;
        worstPeriod = period as TimePeriod;
      }
      if (avg > bestAvg) {
        bestAvg = avg;
        bestPeriod = period as TimePeriod;
      }
    }
  }

  if (
    worstPeriod &&
    bestPeriod &&
    worstPeriod !== bestPeriod &&
    bestAvg - worstAvg > 1
  ) {
    return {
      type: "time_based",
      description: `You tend to feel more stressed in the ${worstPeriod} and better in the ${bestPeriod}.`,
      confidence: Math.min(entries.length / 10, 1),
      suggestion: `Consider scheduling breaks or lighter activities during ${worstPeriod} hours.`,
    };
  }

  return null;
}

/**
 * Detects common stress trigger words in journal entries.
 *
 * @param entries - Mood entries with journal text
 * @returns Trigger-based insight or null
 */
function detectTriggers(entries: readonly MoodEntry[]): PatternInsight | null {
  const triggerCounts: Record<string, number> = {};
  const positiveCounts: Record<string, number> = {};

  for (const entry of entries) {
    const textLower = entry.journalText.toLowerCase();

    for (const trigger of STRESS_TRIGGER_WORDS) {
      if (textLower.includes(trigger)) {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      }
    }

    for (const positive of POSITIVE_WORDS) {
      if (textLower.includes(positive)) {
        positiveCounts[positive] = (positiveCounts[positive] || 0) + 1;
      }
    }
  }

  // Find most common triggers
  const sortedTriggers = Object.entries(triggerCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (sortedTriggers.length > 0) {
    const triggerList = sortedTriggers.map(([word]) => word).join(", ");
    return {
      type: "trigger",
      description: `Common stress triggers in your entries: ${triggerList}.`,
      confidence: Math.min(sortedTriggers[0][1] / entries.length, 1),
      suggestion:
        "Try addressing these specific stressors with targeted coping strategies.",
    };
  }

  return null;
}

/**
 * Detects overall mood trend (improving or declining).
 *
 * @param entries - Mood entries sorted by time
 * @returns Trend insight or null
 */
function detectTrend(entries: readonly MoodEntry[]): PatternInsight | null {
  if (entries.length < 5) return null;

  const recent = entries.slice(0, 5);
  const older = entries.slice(5, 10);

  if (older.length < 3) return null;

  const recentAvg =
    recent.reduce((sum, e) => sum + MOOD_VALUES[e.mood], 0) / recent.length;
  const olderAvg =
    older.reduce((sum, e) => sum + MOOD_VALUES[e.mood], 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 0.5) {
    return {
      type: "trend",
      description: "Your mood has been improving recently. Keep it up!",
      confidence: Math.min(Math.abs(diff) / 2, 1),
      suggestion:
        "Whatever you have been doing differently is working. Try to maintain those habits.",
    };
  }

  if (diff < -0.5) {
    return {
      type: "trend",
      description: "Your mood has been declining over recent entries.",
      confidence: Math.min(Math.abs(diff) / 2, 1),
      suggestion:
        "Consider reaching out to a friend or trying a new coping technique.",
    };
  }

  return null;
}

/**
 * Detects consecutive mood streaks (positive or negative).
 *
 * @param entries - Mood entries sorted newest first
 * @returns Streak insight or null
 */
function detectStreak(entries: readonly MoodEntry[]): PatternInsight | null {
  if (entries.length < 3) return null;

  const isPositive = (mood: MoodLevel): boolean =>
    mood === "great" || mood === "good";

  let streak = 1;
  const direction = isPositive(entries[0].mood);

  for (let i = 1; i < entries.length; i++) {
    if (isPositive(entries[i].mood) === direction) {
      streak++;
    } else {
      break;
    }
  }

  if (streak >= 3 && direction) {
    return {
      type: "streak",
      description: `Amazing! You have had ${streak} positive entries in a row.`,
      confidence: 1,
      suggestion: "You are building great momentum. Celebrate this progress!",
    };
  }

  if (streak >= 3 && !direction) {
    return {
      type: "streak",
      description: `You have had ${streak} tough entries in a row. That is hard.`,
      confidence: 1,
      suggestion:
        "It is okay to have difficult days. Consider trying a different coping strategy or talking to someone you trust.",
    };
  }

  return null;
}
