/**
 * Statistics Utility Module
 *
 * Pure functions for computing wellness statistics from mood entries.
 * Implements DRY principle - these calculations are used across
 * multiple components (Home, Dashboard, Insights).
 *
 * EFFICIENCY: All functions are O(n) with early returns.
 * All inputs are readonly to prevent accidental mutations.
 */

import type { MoodEntry, MoodLevel } from "@/src/types";
import { MOOD_VALUES, MOOD_EMOJIS } from "@/src/utils/constants";

/** Computed statistics result */
export interface WellnessStatistics {
  readonly totalEntries: number;
  readonly averageMood: number;
  readonly averageMoodLabel: string;
  readonly bestMoodEmoji: string;
  readonly streak: number;
  readonly streakLabel: string;
  readonly moodVariant: "success" | "warning" | "danger" | "default";
}

/** Threshold constants for mood classification */
const MOOD_THRESHOLD_GOOD = 3.5;
const MOOD_THRESHOLD_OKAY = 2.5;
const STREAK_THRESHOLD_POSITIVE = 3;

/**
 * Computes all wellness statistics from mood entries.
 * Single function prevents redundant iterations over the entries array.
 *
 * @param entries - Readonly array of mood entries
 * @returns Complete statistics object
 */
export function computeWellnessStatistics(
  entries: readonly MoodEntry[],
): WellnessStatistics {
  const totalEntries = entries.length;

  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      averageMoodLabel: "—",
      bestMoodEmoji: "—",
      streak: 0,
      streakLabel: "Build your streak",
      moodVariant: "default",
    };
  }

  const averageMood = computeAverageMood(entries);
  const streak = computePositiveStreak(entries.map((e) => e.mood));
  const bestMood = findBestMood(entries);

  return {
    totalEntries,
    averageMood,
    averageMoodLabel: averageMood.toFixed(1),
    bestMoodEmoji: MOOD_EMOJIS[bestMood].emoji,
    streak,
    streakLabel:
      streak >= STREAK_THRESHOLD_POSITIVE ? "Keep it up!" : "Build your streak",
    moodVariant: classifyMoodVariant(averageMood),
  };
}

/**
 * Computes the average mood score from entries.
 *
 * @param entries - Mood entries to average
 * @returns Average score between 1-5
 */
function computeAverageMood(entries: readonly MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + MOOD_VALUES[entry.mood], 0);
  return sum / entries.length;
}

/**
 * Computes the current positive mood streak.
 *
 * @param moods - Array of mood levels (newest first)
 * @returns Number of consecutive positive days
 */
function computePositiveStreak(moods: readonly MoodLevel[]): number {
  if (moods.length === 0) return 0;

  const isPositive = (mood: MoodLevel): boolean =>
    mood === "great" || mood === "good";

  const firstIsPositive = isPositive(moods[0]);
  let count = 0;

  for (const mood of moods) {
    if (isPositive(mood) !== firstIsPositive) break;
    count++;
  }

  return firstIsPositive ? count : 0;
}

/**
 * Finds the best mood entry.
 *
 * @param entries - Mood entries to search
 * @returns The highest mood level found
 */
function findBestMood(entries: readonly MoodEntry[]): MoodLevel {
  return entries.reduce(
    (best, entry) =>
      MOOD_VALUES[entry.mood] > MOOD_VALUES[best] ? entry.mood : best,
    entries[0].mood,
  );
}

/**
 * Classifies mood average into a UI variant for color coding.
 *
 * @param average - Average mood score
 * @returns Variant string for InsightCard component
 */
function classifyMoodVariant(
  average: number,
): "success" | "warning" | "danger" | "default" {
  if (average >= MOOD_THRESHOLD_GOOD) return "success";
  if (average >= MOOD_THRESHOLD_OKAY) return "warning";
  return "danger";
}

/**
 * Determines the sentiment label from a numerical score.
 *
 * @param score - Sentiment score from analysis
 * @returns Human-readable sentiment label
 */
export function getSentimentLabel(score: number): string {
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}

/**
 * Determines the CSS variant class for a sentiment score.
 *
 * @param score - Sentiment score
 * @returns Tailwind class string for styling
 */
export function getSentimentVariantClass(score: number): string {
  if (score > 0) return "bg-success/10 text-success";
  if (score < 0) return "bg-danger/10 text-danger";
  return "bg-text-muted/10 text-text-muted";
}
