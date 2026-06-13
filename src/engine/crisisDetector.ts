/**
 * Crisis Detection Engine
 *
 * Detects potential mental health crises in user input.
 * When severe distress is detected, shows emergency resources.
 *
 * SECURITY: This module processes text server-side only.
 * No crisis-related data is logged or stored.
 * User privacy is maintained throughout.
 *
 * IMPORTANT: This is NOT a replacement for professional help.
 * It is a safety net that connects users to real resources.
 */

import type { CrisisAssessment, CrisisSeverity } from "@/src/types";
import {
  CRISIS_TRIGGER_WORDS,
  EMERGENCY_RESOURCES,
} from "@/src/utils/constants";

/**
 * Assesses crisis severity based on text content and sentiment.
 *
 * @param text - Sanitized user input text
 * @param sentimentScore - Numerical sentiment score from analysis
 * @returns CrisisAssessment with severity and recommendation
 *
 * @example
 * const result = assessCrisis("I feel hopeless", -4);
 * // result.severity: "severe", result.showResources: true
 */
export function assessCrisis(
  text: string,
  sentimentScore: number,
): CrisisAssessment {
  const textLower = text.toLowerCase();
  const detectedTriggers: string[] = [];

  // Check for crisis trigger words
  for (const trigger of CRISIS_TRIGGER_WORDS) {
    if (textLower.includes(trigger)) {
      detectedTriggers.push(trigger);
    }
  }

  const severity = calculateSeverity(detectedTriggers.length, sentimentScore);
  const recommendation = getRecommendation(severity);
  const showResources = severity === "severe" || severity === "moderate";

  return {
    severity,
    triggerWords: detectedTriggers,
    recommendation,
    showResources,
  };
}

/**
 * Calculates crisis severity from trigger count and sentiment.
 *
 * @param triggerCount - Number of crisis words detected
 * @param sentimentScore - Overall sentiment score
 * @returns CrisisSeverity level
 */
function calculateSeverity(
  triggerCount: number,
  sentimentScore: number,
): CrisisSeverity {
  // Severe: explicit crisis language detected
  if (triggerCount >= 2 || (triggerCount >= 1 && sentimentScore <= -4)) {
    return "severe";
  }

  // Moderate: some crisis indicators
  if (triggerCount >= 1 || sentimentScore <= -4) {
    return "moderate";
  }

  // Mild: very negative sentiment without explicit crisis words
  if (sentimentScore <= -3) {
    return "mild";
  }

  return "none";
}

/**
 * Gets appropriate recommendation message based on severity.
 *
 * @param severity - Detected crisis severity level
 * @returns Empathetic recommendation string
 */
function getRecommendation(severity: CrisisSeverity): string {
  switch (severity) {
    case "severe":
      return `I hear you, and I want you to know that you are not alone. What you are feeling is valid, but please reach out to someone who can help right now. You can call ${EMERGENCY_RESOURCES.kiran.name} at ${EMERGENCY_RESOURCES.kiran.number} (${EMERGENCY_RESOURCES.kiran.available}).`;

    case "moderate":
      return "It sounds like you are going through a really tough time. Talking to a trusted person — a friend, family member, or counselor — can help. You do not have to face this alone.";

    case "mild":
      return "I can see things feel heavy right now. Would you like to try a calming technique, or would you prefer to just talk about how you are feeling?";

    case "none":
    default:
      return "";
  }
}

/**
 * Gets emergency contact information formatted for display.
 *
 * @returns Formatted emergency resources object
 */
export function getEmergencyResources(): typeof EMERGENCY_RESOURCES {
  return EMERGENCY_RESOURCES;
}
