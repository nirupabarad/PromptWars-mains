/**
 * Input Validation - Unit Tests
 *
 * Tests security-critical input validation:
 * - XSS prevention
 * - Input length limits
 * - Schema validation
 * - Sanitization
 */

import {
  sanitizeText,
  validateMoodEntry,
  validateAnalyzeRequest,
  validateRecommendRequest,
} from "@/src/utils/validators";

describe("Input Validators", () => {
  describe("sanitizeText", () => {
    it("should remove HTML tags", () => {
      const result = sanitizeText('<script>alert("xss")</script>Hello');
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
      expect(result).toContain("Hello");
    });

    it("should remove javascript: protocol", () => {
      const result = sanitizeText("javascript:alert(1)");
      expect(result).not.toContain("javascript:");
    });

    it("should remove event handlers", () => {
      const result = sanitizeText("text onclick=alert(1) more");
      expect(result).not.toContain("onclick");
    });

    it("should remove null bytes", () => {
      const result = sanitizeText("hello\0world");
      expect(result).not.toContain("\0");
      expect(result).toBe("helloworld");
    });

    it("should normalize whitespace", () => {
      const result = sanitizeText("  hello    world  ");
      expect(result).toBe("hello world");
    });

    it("should handle empty string", () => {
      expect(sanitizeText("")).toBe("");
    });

    it("should preserve normal text", () => {
      const normal = "I feel stressed about my NEET exam tomorrow.";
      expect(sanitizeText(normal)).toBe(normal);
    });

    it("should handle emoji", () => {
      const text = "Feeling good today 😊";
      expect(sanitizeText(text)).toContain("😊");
    });
  });

  describe("validateMoodEntry", () => {
    it("should accept valid mood entry", () => {
      const result = validateMoodEntry({
        text: "I feel good today",
        mood: "good",
      });
      expect(result.mood).toBe("good");
      expect(result.text).toBe("I feel good today");
    });

    it("should reject text that is too short", () => {
      expect(() =>
        validateMoodEntry({
          text: "Hi",
          mood: "good",
        }),
      ).toThrow();
    });

    it("should reject text that is too long", () => {
      expect(() =>
        validateMoodEntry({
          text: "a".repeat(2001),
          mood: "good",
        }),
      ).toThrow();
    });

    it("should reject invalid mood value", () => {
      expect(() =>
        validateMoodEntry({
          text: "Some text here",
          mood: "invalid",
        }),
      ).toThrow();
    });

    it("should sanitize text during validation", () => {
      const result = validateMoodEntry({
        text: "<script>hack</script>I feel okay",
        mood: "okay",
      });
      expect(result.text).not.toContain("<script>");
    });

    it("should accept all valid mood levels", () => {
      const moods = ["great", "good", "okay", "low", "rough"];
      moods.forEach((mood) => {
        const result = validateMoodEntry({ text: "Valid text entry", mood });
        expect(result.mood).toBe(mood);
      });
    });
  });

  describe("validateAnalyzeRequest", () => {
    it("should accept valid analyze request", () => {
      const result = validateAnalyzeRequest({
        text: "I am feeling stressed",
        mood: "low",
      });
      expect(result.text).toBeTruthy();
      expect(result.mood).toBe("low");
    });

    it("should reject missing fields", () => {
      expect(() => validateAnalyzeRequest({})).toThrow();
      expect(() => validateAnalyzeRequest({ text: "hello" })).toThrow();
    });
  });

  describe("validateRecommendRequest", () => {
    it("should accept valid recommend request", () => {
      const result = validateRecommendRequest({
        sentimentScore: -2,
        mood: "low",
        examType: "JEE",
        timePeriod: "evening",
        recentMoods: ["low", "okay"],
      });
      expect(result.sentimentScore).toBe(-2);
      expect(result.examType).toBe("JEE");
    });

    it("should reject sentiment score out of range", () => {
      expect(() =>
        validateRecommendRequest({
          sentimentScore: -10,
          mood: "low",
          examType: "JEE",
          timePeriod: "evening",
          recentMoods: [],
        }),
      ).toThrow();
    });

    it("should reject invalid exam type", () => {
      expect(() =>
        validateRecommendRequest({
          sentimentScore: 0,
          mood: "okay",
          examType: "INVALID",
          timePeriod: "morning",
          recentMoods: [],
        }),
      ).toThrow();
    });

    it("should reject invalid time period", () => {
      expect(() =>
        validateRecommendRequest({
          sentimentScore: 0,
          mood: "okay",
          examType: "JEE",
          timePeriod: "midnight",
          recentMoods: [],
        }),
      ).toThrow();
    });

    it("should reject too many recent moods", () => {
      expect(() =>
        validateRecommendRequest({
          sentimentScore: 0,
          mood: "okay",
          examType: "JEE",
          timePeriod: "morning",
          recentMoods: Array(31).fill("okay"),
        }),
      ).toThrow();
    });
  });
});
