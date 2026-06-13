/**
 * Sentiment Analysis Engine - Unit Tests
 *
 * Tests the core sentiment analysis functionality including:
 * - Positive text detection
 * - Negative text detection
 * - Neutral text handling
 * - Custom lexicon (exam-related terms)
 * - Edge cases (empty input, special characters)
 * - Score bounds validation
 */

import { analyzeSentiment, getIntensityLevel } from "@/src/engine/sentiment";

describe("Sentiment Analysis Engine", () => {
  describe("analyzeSentiment", () => {
    it("should return positive score for happy text", () => {
      const result = analyzeSentiment(
        "I feel great and happy today! Everything is wonderful.",
      );
      expect(result.score).toBeGreaterThan(0);
      expect(result.positive.length).toBeGreaterThan(0);
    });

    it("should return negative score for sad text", () => {
      const result = analyzeSentiment(
        "I am stressed and overwhelmed by the exam pressure.",
      );
      expect(result.score).toBeLessThan(0);
      expect(result.negative.length).toBeGreaterThan(0);
    });

    it("should return neutral score for factual text", () => {
      const result = analyzeSentiment("I studied physics for two hours today.");
      expect(result.score).toBeGreaterThanOrEqual(-1);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it("should handle empty string gracefully", () => {
      const result = analyzeSentiment("");
      expect(result.score).toBe(0);
      expect(result.comparative).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.positive).toEqual([]);
      expect(result.negative).toEqual([]);
    });

    it("should handle special characters without crashing", () => {
      const result = analyzeSentiment("!@#$%^&*() 🎉 emoji test");
      expect(result).toBeDefined();
      expect(typeof result.score).toBe("number");
    });

    it("should clamp score within -5 to 5 range", () => {
      const result = analyzeSentiment(
        "amazing wonderful fantastic incredible awesome great perfect beautiful lovely",
      );
      expect(result.score).toBeLessThanOrEqual(5);
      expect(result.score).toBeGreaterThanOrEqual(-5);
    });

    it("should detect exam-related positive terms from custom lexicon", () => {
      const result = analyzeSentiment(
        "I completed my revision and feel motivated.",
      );
      expect(result.score).toBeGreaterThan(0);
    });

    it("should detect exam-related negative terms from custom lexicon", () => {
      const result = analyzeSentiment(
        "I am overwhelmed with burnout from studying.",
      );
      expect(result.score).toBeLessThan(0);
    });

    it("should calculate confidence based on word coverage", () => {
      const result = analyzeSentiment("happy sad angry");
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should handle very long text without performance issues", () => {
      const longText = "I feel stressed about exams. ".repeat(100);
      const start = Date.now();
      const result = analyzeSentiment(longText);
      const elapsed = Date.now() - start;

      expect(result).toBeDefined();
      expect(elapsed).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle null-like input defensively", () => {
      // Testing defensive behavior with invalid input
      const result = analyzeSentiment(null);
      expect(result.score).toBe(0);
    });
  });

  describe("getIntensityLevel", () => {
    it('should return "neutral" for score 0', () => {
      expect(getIntensityLevel(0)).toBe("neutral");
    });

    it('should return "mild" for score 1', () => {
      expect(getIntensityLevel(1)).toBe("mild");
    });

    it('should return "moderate" for score 2', () => {
      expect(getIntensityLevel(2)).toBe("moderate");
    });

    it('should return "strong" for score 3', () => {
      expect(getIntensityLevel(3)).toBe("strong");
    });

    it('should return "very strong" for score 4+', () => {
      expect(getIntensityLevel(4)).toBe("very strong");
      expect(getIntensityLevel(5)).toBe("very strong");
    });

    it("should handle negative scores", () => {
      expect(getIntensityLevel(-3)).toBe("strong");
      expect(getIntensityLevel(-5)).toBe("very strong");
    });
  });
});
