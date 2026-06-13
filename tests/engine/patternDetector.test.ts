/**
 * Pattern Detection Engine - Unit Tests
 *
 * Tests emotional pattern detection including:
 * - Time-based patterns
 * - Stress triggers
 * - Mood trends
 * - Streak detection
 * - Minimum data requirements
 */

import { detectPatterns } from "@/src/engine/patternDetector";
import type { MoodEntry } from "@/src/types";

// Helper to create mock entries
function createEntry(
  mood: MoodEntry["mood"],
  text: string,
  timePeriod: MoodEntry["timePeriod"] = "morning",
  daysAgo: number = 0,
): MoodEntry {
  return {
    id: `test-${Math.random()}`,
    mood,
    journalText: text,
    timestamp: Date.now() - daysAgo * 86400000,
    sentimentScore: mood === "great" ? 3 : mood === "rough" ? -3 : 0,
    timePeriod,
  };
}

describe("Pattern Detection Engine", () => {
  describe("detectPatterns", () => {
    it("should return empty array with fewer than 3 entries", () => {
      const entries = [
        createEntry("good", "Nice day"),
        createEntry("okay", "Normal day"),
      ];
      const patterns = detectPatterns(entries);
      expect(patterns).toEqual([]);
    });

    it("should detect time-based patterns", () => {
      const entries = [
        createEntry("rough", "Stressed", "evening", 0),
        createEntry("rough", "Tired", "evening", 1),
        createEntry("good", "Energized", "morning", 2),
        createEntry("great", "Productive", "morning", 3),
        createEntry("low", "Exhausted", "evening", 4),
        createEntry("good", "Fresh start", "morning", 5),
      ];

      const patterns = detectPatterns(entries);
      const timePattern = patterns.find((p) => p.type === "time_based");

      expect(timePattern).toBeDefined();
      expect(timePattern?.description).toContain("evening");
    });

    it("should detect stress triggers", () => {
      const entries = [
        createEntry("low", "The exam pressure is killing me", "morning", 0),
        createEntry("rough", "Failed another mock test", "afternoon", 1),
        createEntry("low", "Exam tomorrow and not prepared", "evening", 2),
        createEntry("okay", "Studied today", "morning", 3),
      ];

      const patterns = detectPatterns(entries);
      const triggerPattern = patterns.find((p) => p.type === "trigger");

      expect(triggerPattern).toBeDefined();
      expect(triggerPattern?.description).toContain("exam");
    });

    it("should detect positive streak", () => {
      const entries = [
        createEntry("great", "Amazing day", "morning", 0),
        createEntry("good", "Good progress", "morning", 1),
        createEntry("great", "Feeling confident", "morning", 2),
        createEntry("good", "Productive session", "morning", 3),
      ];

      const patterns = detectPatterns(entries);
      const streakPattern = patterns.find((p) => p.type === "streak");

      expect(streakPattern).toBeDefined();
      expect(streakPattern?.description).toContain("positive");
    });

    it("should detect negative streak", () => {
      const entries = [
        createEntry("rough", "Terrible day", "morning", 0),
        createEntry("low", "Feeling down", "morning", 1),
        createEntry("rough", "Cannot focus", "morning", 2),
        createEntry("low", "Exhausted", "morning", 3),
      ];

      const patterns = detectPatterns(entries);
      const streakPattern = patterns.find((p) => p.type === "streak");

      expect(streakPattern).toBeDefined();
      expect(streakPattern?.description).toContain("tough");
    });

    it("should detect improving trend", () => {
      const entries = [
        createEntry("great", "Amazing", "morning", 0),
        createEntry("good", "Better", "morning", 1),
        createEntry("good", "Improving", "morning", 2),
        createEntry("great", "Great", "morning", 3),
        createEntry("good", "Good", "morning", 4),
        createEntry("low", "Was bad", "morning", 5),
        createEntry("rough", "Terrible", "morning", 6),
        createEntry("low", "Bad", "morning", 7),
        createEntry("rough", "Awful", "morning", 8),
        createEntry("low", "Down", "morning", 9),
      ];

      const patterns = detectPatterns(entries);
      const trendPattern = patterns.find((p) => p.type === "trend");

      expect(trendPattern).toBeDefined();
      expect(trendPattern?.description).toContain("improving");
    });

    it("should include confidence scores between 0 and 1", () => {
      const entries = [
        createEntry("great", "Great day", "morning", 0),
        createEntry("great", "Another great day", "morning", 1),
        createEntry("great", "Wonderful", "morning", 2),
        createEntry("great", "Perfect", "morning", 3),
      ];

      const patterns = detectPatterns(entries);
      patterns.forEach((pattern) => {
        expect(pattern.confidence).toBeGreaterThanOrEqual(0);
        expect(pattern.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should include suggestions for all detected patterns", () => {
      const entries = [
        createEntry("great", "Exam went well", "morning", 0),
        createEntry("great", "Good progress", "morning", 1),
        createEntry("great", "Feeling great", "morning", 2),
        createEntry("great", "Wonderful", "morning", 3),
      ];

      const patterns = detectPatterns(entries);
      patterns.forEach((pattern) => {
        expect(pattern.suggestion).toBeTruthy();
        expect(pattern.suggestion.length).toBeGreaterThan(10);
      });
    });
  });
});
