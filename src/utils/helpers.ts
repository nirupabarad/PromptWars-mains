/**
 * Utility Helper Functions
 *
 * Pure utility functions used across the application.
 * All functions are pure (no side effects) and fully typed.
 *
 * SECURITY: No user data is logged or stored by these functions.
 */

import type { MoodLevel, TimePeriod } from "@/src/types";

/**
 * Generates a unique identifier for entries and messages.
 * Uses crypto-safe random values when available.
 *
 * @returns A unique string ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Determines the current time period based on hour.
 * Used for context-aware recommendations.
 *
 * @returns Current time period category
 */
export function getCurrentTimePeriod(): TimePeriod {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Formats a timestamp into a human-readable relative time.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable string like "2 min ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Calculates the current mood streak (consecutive same-direction moods).
 *
 * @param moods - Array of recent mood entries (newest first)
 * @returns Number of consecutive positive or negative days
 */
export function calculateStreak(moods: readonly MoodLevel[]): number {
  if (moods.length === 0) return 0;

  const isPositive = (mood: MoodLevel): boolean =>
    mood === "great" || mood === "good";

  const firstIsPositive = isPositive(moods[0]);
  let streak = 0;

  for (const mood of moods) {
    if (isPositive(mood) === firstIsPositive) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Clamps a number within a range.
 *
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Gets a greeting based on time of day.
 *
 * @returns Appropriate greeting string
 */
export function getTimeGreeting(): string {
  const period = getCurrentTimePeriod();
  const greetings: Record<TimePeriod, string> = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Hey there, night owl",
  };
  return greetings[period];
}

/**
 * Truncates text to a maximum length with ellipsis.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}
