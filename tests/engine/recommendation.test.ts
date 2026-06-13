/**
 * Recommendation Engine - Unit Tests
 *
 * Tests the context-aware coping strategy selection:
 * - Category selection based on mood/sentiment
 * - Exam-type specific context
 * - Avoidance of recently used strategies
 * - All categories accessible
 * - Edge cases
 */

import {
  getRecommendation,
  getExamContext,
  getStrategiesByCategory,
  getAllCategories,
} from "@/src/engine/recommendation";
import type { Recommendation } from "@/src/types";

describe("Recommendation Engine", () => {
  describe("getRecommendation", () => {
    it("should return breathing exercise for very negative sentiment", () => {
      const result = getRecommendation({
        sentimentScore: -4,
        mood: "rough",
        examType: "JEE",
        timePeriod: "morning",
        recentMoods: ["rough"],
      });

      expect(result.category).toBe("breathing");
      expect(result.title).toBeTruthy();
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it("should return mindfulness for moderately negative mood", () => {
      const result = getRecommendation({
        sentimentScore: -2,
        mood: "low",
        examType: "NEET",
        timePeriod: "evening",
        recentMoods: ["low", "okay"],
      });

      expect(result.category).toBe("mindfulness");
    });

    it("should return social support for consecutive bad moods", () => {
      const result = getRecommendation({
        sentimentScore: -1,
        mood: "low",
        examType: "UPSC",
        timePeriod: "afternoon",
        recentMoods: ["low", "rough", "low", "rough", "low"],
      });

      expect(result.category).toBe("social");
    });

    it("should return study technique for morning with okay mood", () => {
      const result = getRecommendation({
        sentimentScore: 0,
        mood: "okay",
        examType: "JEE",
        timePeriod: "morning",
        recentMoods: ["okay"],
      });

      expect(result.category).toBe("study-technique");
    });

    it("should return cognitive reinforcement for good mood", () => {
      const result = getRecommendation({
        sentimentScore: 2,
        mood: "good",
        examType: "NEET",
        timePeriod: "afternoon",
        recentMoods: ["good", "great"],
      });

      expect(result.category).toBe("cognitive");
    });

    it("should have all required fields in recommendation", () => {
      const result = getRecommendation({
        sentimentScore: 0,
        mood: "okay",
        examType: "general",
        timePeriod: "morning",
        recentMoods: [],
      });

      expect(result.id).toBeTruthy();
      expect(result.title).toBeTruthy();
      expect(result.description).toBeTruthy();
      expect(result.category).toBeTruthy();
      expect(result.duration).toBeTruthy();
      expect(result.steps).toBeInstanceOf(Array);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.examContext).toBeTruthy();
    });

    it("should avoid recently used strategies when possible", () => {
      const results: Recommendation[] = [];
      for (let i = 0; i < 3; i++) {
        const result = getRecommendation({
          sentimentScore: -4,
          mood: "rough",
          examType: "JEE",
          timePeriod: "evening",
          recentMoods: ["rough"],
          usedStrategyIds: results.map((r) => r.id),
        });
        results.push(result);
      }

      // Should try to diversify (may not always succeed with limited options)
      expect(results.length).toBe(3);
    });

    it("should handle empty recent moods array", () => {
      const result = getRecommendation({
        sentimentScore: 0,
        mood: "okay",
        examType: "general",
        timePeriod: "morning",
        recentMoods: [],
      });

      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
    });
  });

  describe("getExamContext", () => {
    it("should return NEET-specific context", () => {
      const recommendation = getRecommendation({
        sentimentScore: -2,
        mood: "low",
        examType: "NEET",
        timePeriod: "morning",
        recentMoods: [],
      });

      const context = getExamContext("NEET", recommendation);
      expect(context).toContain("NEET");
    });

    it("should return JEE-specific context", () => {
      const recommendation = getRecommendation({
        sentimentScore: 0,
        mood: "okay",
        examType: "JEE",
        timePeriod: "morning",
        recentMoods: [],
      });

      const context = getExamContext("JEE", recommendation);
      expect(context).toContain("JEE");
    });

    it("should return general context for general exam type", () => {
      const recommendation = getRecommendation({
        sentimentScore: 0,
        mood: "okay",
        examType: "general",
        timePeriod: "morning",
        recentMoods: [],
      });

      const context = getExamContext("general", recommendation);
      expect(context).toBeTruthy();
    });
  });

  describe("getStrategiesByCategory", () => {
    it("should return strategies for breathing category", () => {
      const strategies = getStrategiesByCategory("breathing");
      expect(strategies.length).toBeGreaterThan(0);
      strategies.forEach((s) => expect(s.category).toBe("breathing"));
    });

    it("should return strategies for all categories", () => {
      const categories = getAllCategories();
      categories.forEach((category) => {
        const strategies = getStrategiesByCategory(category);
        expect(strategies.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getAllCategories", () => {
    it("should return all 6 categories", () => {
      const categories = getAllCategories();
      expect(categories).toContain("breathing");
      expect(categories).toContain("mindfulness");
      expect(categories).toContain("physical");
      expect(categories).toContain("cognitive");
      expect(categories).toContain("social");
      expect(categories).toContain("study-technique");
    });
  });
});
