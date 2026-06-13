/**
 * Crisis Detection Engine - Unit Tests
 *
 * Tests crisis detection accuracy and safety:
 * - Severe crisis word detection
 * - Moderate distress detection
 * - Mild negative sentiment handling
 * - No false positives on normal text
 * - Emergency resources availability
 */

import {
  assessCrisis,
  getEmergencyResources,
} from "@/src/engine/crisisDetector";

describe("Crisis Detection Engine", () => {
  describe("assessCrisis", () => {
    it("should detect severe crisis with explicit trigger words", () => {
      const result = assessCrisis("I feel hopeless and worthless", -4);
      expect(result.severity).toBe("severe");
      expect(result.showResources).toBe(true);
      expect(result.triggerWords.length).toBeGreaterThan(0);
      expect(result.recommendation).toBeTruthy();
    });

    it("should detect moderate crisis with single trigger word", () => {
      const result = assessCrisis("I want to give up on everything", -2);
      expect(result.severity).toBe("moderate");
      expect(result.showResources).toBe(true);
    });

    it("should detect moderate crisis with very negative sentiment", () => {
      const result = assessCrisis(
        "Everything is terrible and nothing matters",
        -5,
      );
      expect(result.severity).toBe("moderate");
      expect(result.showResources).toBe(true);
    });

    it("should detect mild distress with moderately negative sentiment", () => {
      const result = assessCrisis("I had a really bad day today", -3);
      expect(result.severity).toBe("mild");
      expect(result.showResources).toBe(false);
    });

    it("should return none for neutral text", () => {
      const result = assessCrisis("I studied math today and it was okay", 0);
      expect(result.severity).toBe("none");
      expect(result.showResources).toBe(false);
      expect(result.triggerWords).toEqual([]);
    });

    it("should return none for positive text", () => {
      const result = assessCrisis("I feel great and motivated!", 3);
      expect(result.severity).toBe("none");
      expect(result.showResources).toBe(false);
    });

    it("should not false-positive on normal exam stress", () => {
      const result = assessCrisis("I am nervous about my exam tomorrow", -1);
      expect(result.severity).toBe("none");
      expect(result.showResources).toBe(false);
    });

    it("should handle empty string", () => {
      const result = assessCrisis("", 0);
      expect(result.severity).toBe("none");
      expect(result.triggerWords).toEqual([]);
    });

    it("should detect multiple trigger words", () => {
      const result = assessCrisis("I feel hopeless and want to give up", -4);
      expect(result.severity).toBe("severe");
      expect(result.triggerWords.length).toBeGreaterThanOrEqual(2);
    });

    it("should provide appropriate recommendation for each severity", () => {
      const severe = assessCrisis("I feel hopeless", -4);
      const moderate = assessCrisis("I want to give up", -2);
      const mild = assessCrisis("everything is awful", -3);
      const none = assessCrisis("normal day", 0);

      expect(severe.recommendation).toContain("1800-599-0019");
      expect(moderate.recommendation).toContain("tough time");
      expect(mild.recommendation).toContain("heavy");
      expect(none.recommendation).toBe("");
    });
  });

  describe("getEmergencyResources", () => {
    it("should return all emergency resources", () => {
      const resources = getEmergencyResources();
      expect(resources.kiran).toBeDefined();
      expect(resources.kiran.number).toBe("1800-599-0019");
      expect(resources.india).toBeDefined();
      expect(resources.iCall).toBeDefined();
    });

    it("should have availability info for all resources", () => {
      const resources = getEmergencyResources();
      Object.values(resources).forEach((resource) => {
        expect(resource.name).toBeTruthy();
        expect(resource.number).toBeTruthy();
        expect(resource.available).toBeTruthy();
      });
    });
  });
});
