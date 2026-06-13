/**
 * Integration Tests - Full Analysis Pipeline
 *
 * Tests the complete flow from input validation through
 * sentiment analysis, crisis detection, and recommendation.
 */

import { analyzeSentiment } from "@/src/engine/sentiment";
import { assessCrisis } from "@/src/engine/crisisDetector";
import { getRecommendation } from "@/src/engine/recommendation";
import { detectPatterns } from "@/src/engine/patternDetector";
import { sanitizeText, validateMoodEntry } from "@/src/utils/validators";
import { generateEmpathyMessage } from "@/src/engine/responseGenerator";
import type { MoodEntry } from "@/src/types";

describe("Full Pipeline Integration", () => {
  it("should process a positive journal entry end-to-end", () => {
    // Step 1: Validate input
    const validated = validateMoodEntry({
      text: "I completed three chapters today and feel really motivated!",
      mood: "great",
    });

    // Step 2: Analyze sentiment
    const sentiment = analyzeSentiment(validated.text);
    expect(sentiment.score).toBeGreaterThan(0);

    // Step 3: Check crisis
    const crisis = assessCrisis(validated.text, sentiment.score);
    expect(crisis.severity).toBe("none");
    expect(crisis.showResources).toBe(false);

    // Step 4: Get recommendation
    const recommendation = getRecommendation({
      sentimentScore: sentiment.score,
      mood: validated.mood,
      examType: "NEET",
      timePeriod: "morning",
      recentMoods: ["great", "good"],
    });
    expect(recommendation).toBeDefined();
    expect(recommendation.category).toBe("cognitive");

    // Step 5: Generate response
    const empathy = generateEmpathyMessage(validated.mood, sentiment.score);
    expect(empathy).toBeTruthy();
  });

  it("should process a crisis-level entry end-to-end", () => {
    // Step 1: Validate and sanitize
    const validated = validateMoodEntry({
      text: "I feel completely hopeless and worthless. Nothing matters anymore.",
      mood: "rough",
    });

    // Step 2: Analyze sentiment
    const sentiment = analyzeSentiment(validated.text);
    expect(sentiment.score).toBeLessThan(0);

    // Step 3: Detect crisis
    const crisis = assessCrisis(validated.text, sentiment.score);
    expect(crisis.severity).toBe("severe");
    expect(crisis.showResources).toBe(true);
    expect(crisis.recommendation).toContain("1800-599-0019");

    // Step 4: Still provide recommendation (gentler)
    const recommendation = getRecommendation({
      sentimentScore: sentiment.score,
      mood: validated.mood,
      examType: "JEE",
      timePeriod: "night",
      recentMoods: ["rough", "rough", "low"],
    });
    expect(recommendation).toBeDefined();
  });

  it("should handle XSS attempt gracefully in full pipeline", () => {
    const maliciousInput = '<script>alert("xss")</script>I feel okay today';
    const sanitized = sanitizeText(maliciousInput);

    expect(sanitized).not.toContain("<script>");

    const sentiment = analyzeSentiment(sanitized);
    expect(sentiment).toBeDefined();

    const crisis = assessCrisis(sanitized, sentiment.score);
    expect(crisis.severity).toBe("none");
  });

  it("should detect patterns and provide appropriate recommendations", () => {
    // Create a history of entries
    const entries: MoodEntry[] = [
      {
        id: "1",
        mood: "rough",
        journalText: "Exam stress killing me",
        timestamp: Date.now(),
        sentimentScore: -3,
        timePeriod: "evening",
      },
      {
        id: "2",
        mood: "low",
        journalText: "Failed mock exam again",
        timestamp: Date.now() - 86400000,
        sentimentScore: -2,
        timePeriod: "evening",
      },
      {
        id: "3",
        mood: "okay",
        journalText: "Normal morning study",
        timestamp: Date.now() - 172800000,
        sentimentScore: 0,
        timePeriod: "morning",
      },
      {
        id: "4",
        mood: "good",
        journalText: "Good productive morning",
        timestamp: Date.now() - 259200000,
        sentimentScore: 2,
        timePeriod: "morning",
      },
    ];

    const patterns = detectPatterns(entries);
    expect(patterns.length).toBeGreaterThan(0);

    // Recommendation should account for the recent negative trend
    const recommendation = getRecommendation({
      sentimentScore: -3,
      mood: "rough",
      examType: "NEET",
      timePeriod: "evening",
      recentMoods: entries.map((e) => e.mood),
    });

    // Should suggest breathing for severe distress
    expect(recommendation.category).toBe("breathing");
  });

  it("should maintain performance under load", () => {
    const start = Date.now();

    // Simulate 30 entries (max session size)
    for (let i = 0; i < 30; i++) {
      const text = `Entry ${i}: I studied and feel ${i % 2 === 0 ? "good" : "stressed"}`;
      const sentiment = analyzeSentiment(text);
      assessCrisis(text, sentiment.score);
      getRecommendation({
        sentimentScore: sentiment.score,
        mood: i % 2 === 0 ? "good" : "low",
        examType: "JEE",
        timePeriod: "morning",
        recentMoods: ["okay"],
      });
    }

    const elapsed = Date.now() - start;
    // Full pipeline for 30 entries should complete in under 500ms
    expect(elapsed).toBeLessThan(500);
  });
});
