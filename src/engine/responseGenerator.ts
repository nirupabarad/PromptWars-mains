/**
 * Empathetic Response Generator
 *
 * Generates warm, supportive responses based on user mood and context.
 * Uses positive psychology principles and empathetic language.
 *
 * DESIGN: Never judgmental, always validating.
 * Language is warm, gentle, and encouraging.
 *
 * SECURITY: Responses are pre-defined templates.
 * No user input is reflected back without sanitization.
 */

import type { MoodLevel, CrisisSeverity } from "@/src/types";

/**
 * Generates an empathetic acknowledgment based on mood.
 *
 * @param mood - User's selected mood
 * @param sentimentScore - Numerical sentiment from analysis
 * @returns Warm, validating response string
 */
export function generateEmpathyMessage(
  mood: MoodLevel,
  sentimentScore: number,
): string {
  const messages: Record<MoodLevel, readonly string[]> = {
    great: [
      "That is wonderful to hear! Your positive energy is inspiring.",
      "I am so glad you are feeling great today. You deserve it!",
      "What a fantastic mood! Let us keep this momentum going.",
    ],
    good: [
      "Nice! It is good to hear you are doing well.",
      "Glad you are having a good day. Every positive moment counts.",
      "A good day is something to appreciate. Well done!",
    ],
    okay: [
      "Thanks for checking in. Okay days are perfectly normal.",
      "Not every day needs to be amazing. You are doing fine.",
      "An okay day is still a day you showed up. That matters.",
    ],
    low: [
      "I hear you. It is okay to have low days — they do not define you.",
      "Thank you for being honest about how you feel. That takes courage.",
      "Low days are tough, but they are temporary. I am here with you.",
    ],
    rough: [
      "I am sorry you are going through this. Your feelings are valid.",
      "That sounds really hard. Remember, it is okay to not be okay.",
      "I hear you. Let us see if we can find something to help, even a little.",
    ],
  };

  const options = messages[mood];
  const index = Math.abs(sentimentScore) % options.length;
  return options[index];
}

/**
 * Generates an encouragement message based on recent progress.
 *
 * @param streak - Current positive mood streak
 * @param totalEntries - Total entries logged
 * @returns Encouraging string
 */
export function generateEncouragement(
  streak: number,
  totalEntries: number,
): string {
  if (streak >= 5) {
    return `Amazing! ${streak} positive days in a row. You are building incredible resilience.`;
  }

  if (streak >= 3) {
    return `${streak} good days and counting! Your consistency is paying off.`;
  }

  if (totalEntries >= 10) {
    return "You have been checking in regularly. That self-awareness is a real strength.";
  }

  if (totalEntries >= 5) {
    return "You are building a habit of reflection. Each check-in helps you understand yourself better.";
  }

  return "Thank you for taking this time for yourself. Self-care is not selfish — it is essential.";
}

/**
 * Generates a transition message when suggesting a coping strategy.
 *
 * @param mood - Current mood
 * @param severity - Crisis severity assessment
 * @returns Natural transition to recommendation
 */
export function generateTransition(
  mood: MoodLevel,
  severity: CrisisSeverity,
): string {
  if (severity === "severe" || severity === "moderate") {
    return "I want to help. Here is something that might bring a moment of calm:";
  }

  switch (mood) {
    case "rough":
    case "low":
      return "Here is something gentle that might help right now:";
    case "okay":
      return "Would you like to try something that could lift your mood?";
    case "good":
    case "great":
      return "Since you are in a good space, here is something to keep the momentum:";
    default:
      return "Here is a technique you might find helpful:";
  }
}
