/**
 * Input Validation and Sanitization
 *
 * All user inputs are validated and sanitized before processing.
 * Uses Zod for type-safe schema validation.
 *
 * SECURITY: This is the first line of defense against:
 * - XSS attacks (HTML/script injection)
 * - DoS attacks (oversized payloads)
 * - Injection attacks (malicious patterns)
 * - Type confusion attacks
 */

import { z } from "zod";
import { MAX_INPUT_LENGTH, MIN_INPUT_LENGTH } from "./constants";

/**
 * Sanitizes text input by removing potentially dangerous content.
 * SECURITY: Strips HTML tags, script content, and normalizes whitespace.
 *
 * @param input - Raw user input string
 * @returns Sanitized string safe for processing
 */
export function sanitizeText(input: string): string {
  return (
    input
      // SECURITY: Remove HTML tags to prevent XSS
      .replace(/<[^>]*>/g, "")
      // SECURITY: Remove script-related patterns
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      // SECURITY: Remove null bytes that could bypass filters
      .replace(/\0/g, "")
      // Normalize whitespace for consistent processing
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Zod schema for mood entry validation */
export const moodEntrySchema = z.object({
  text: z
    .string()
    .min(
      MIN_INPUT_LENGTH,
      "Please write at least a few words about how you feel.",
    )
    .max(MAX_INPUT_LENGTH, `Text must be under ${MAX_INPUT_LENGTH} characters.`)
    .transform(sanitizeText),
  mood: z.enum(["great", "good", "okay", "low", "rough"], {
    errorMap: () => ({ message: "Please select a valid mood." }),
  }),
});

/** Zod schema for analyze API request */
export const analyzeRequestSchema = z.object({
  text: z
    .string()
    .min(MIN_INPUT_LENGTH)
    .max(MAX_INPUT_LENGTH)
    .transform(sanitizeText),
  mood: z.enum(["great", "good", "okay", "low", "rough"]),
});

/** Zod schema for recommend API request */
export const recommendRequestSchema = z.object({
  sentimentScore: z.number().min(-5).max(5),
  mood: z.enum(["great", "good", "okay", "low", "rough"]),
  examType: z.enum(["NEET", "JEE", "UPSC", "general"]),
  timePeriod: z.enum(["morning", "afternoon", "evening", "night"]),
  recentMoods: z
    .array(z.enum(["great", "good", "okay", "low", "rough"]))
    .max(30),
});

/**
 * Validates and sanitizes a mood entry input.
 *
 * @param data - Unknown input to validate
 * @returns Validated and sanitized data or error
 */
export function validateMoodEntry(
  data: unknown,
): z.infer<typeof moodEntrySchema> {
  return moodEntrySchema.parse(data);
}

/**
 * Validates analyze API request body.
 *
 * @param data - Unknown request body
 * @returns Validated request data or throws ZodError
 */
export function validateAnalyzeRequest(
  data: unknown,
): z.infer<typeof analyzeRequestSchema> {
  return analyzeRequestSchema.parse(data);
}

/**
 * Validates recommend API request body.
 *
 * @param data - Unknown request body
 * @returns Validated request data or throws ZodError
 */
export function validateRecommendRequest(
  data: unknown,
): z.infer<typeof recommendRequestSchema> {
  return recommendRequestSchema.parse(data);
}
