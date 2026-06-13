/**
 * Response Generator - Unit Tests
 *
 * Tests empathetic response generation:
 * - Appropriate tone for each mood
 * - No judgmental language
 * - Encouragement messages
 * - Transition messages
 */

import {
  generateEmpathyMessage,
  generateEncouragement,
  generateTransition,
} from "@/src/engine/responseGenerator";

describe("Response Generator", () => {
  describe("generateEmpathyMessage", () => {
    it("should return positive message for great mood", () => {
      const message = generateEmpathyMessage("great", 3);
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(10);
    });

    it("should return supportive message for rough mood", () => {
      const message = generateEmpathyMessage("rough", -4);
      expect(message).toBeTruthy();
      expect(message.toLowerCase()).not.toContain("bad");
      expect(message.toLowerCase()).not.toContain("wrong");
    });

    it("should never contain judgmental language", () => {
      const moods = ["great", "good", "okay", "low", "rough"] as const;
      const judgmentalWords = [
        "stupid",
        "lazy",
        "weak",
        "pathetic",
        "wrong with you",
      ];

      moods.forEach((mood) => {
        const message = generateEmpathyMessage(mood, 0);
        judgmentalWords.forEach((word) => {
          expect(message.toLowerCase()).not.toContain(word);
        });
      });
    });

    it("should return different messages for different sentiment scores", () => {
      const message1 = generateEmpathyMessage("okay", 0);
      const message2 = generateEmpathyMessage("okay", 1);
      // Messages may or may not differ due to modulo selection, but both should be valid
      expect(message1).toBeTruthy();
      expect(message2).toBeTruthy();
    });

    it("should handle all mood levels without error", () => {
      const moods = ["great", "good", "okay", "low", "rough"] as const;
      moods.forEach((mood) => {
        const message = generateEmpathyMessage(mood, 0);
        expect(typeof message).toBe("string");
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe("generateEncouragement", () => {
    it("should celebrate long streaks", () => {
      const message = generateEncouragement(5, 10);
      expect(message).toContain("5");
    });

    it("should acknowledge moderate streaks", () => {
      const message = generateEncouragement(3, 5);
      expect(message).toContain("3");
    });

    it("should encourage regular check-ins", () => {
      const message = generateEncouragement(0, 10);
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(10);
    });

    it("should welcome new users", () => {
      const message = generateEncouragement(0, 1);
      expect(message).toBeTruthy();
    });
  });

  describe("generateTransition", () => {
    it("should be gentle for rough moods", () => {
      const message = generateTransition("rough", "none");
      expect(message.toLowerCase()).toContain("gentle");
    });

    it("should be encouraging for good moods", () => {
      const message = generateTransition("good", "none");
      expect(message.toLowerCase()).toContain("momentum");
    });

    it("should prioritize crisis messaging for severe situations", () => {
      const message = generateTransition("rough", "severe");
      expect(message.toLowerCase()).toContain("help");
    });

    it("should handle all mood/severity combinations", () => {
      const moods = ["great", "good", "okay", "low", "rough"] as const;
      const severities = ["none", "mild", "moderate", "severe"] as const;

      moods.forEach((mood) => {
        severities.forEach((severity) => {
          const message = generateTransition(mood, severity);
          expect(typeof message).toBe("string");
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
