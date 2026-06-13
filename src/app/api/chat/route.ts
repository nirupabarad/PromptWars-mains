/**
 * Chat API Route (Gemini AI with Long-Term Memory)
 *
 * POST /api/chat
 *
 * Generates conversational responses with CONTEXTUALIZATION.
 * The AI references the user's journal history and known patterns
 * to provide hyper-personalized support.
 *
 * SECURITY:
 * - Input validated and sanitized via Zod schema
 * - No conversation history stored server-side
 * - API key only accessible server-side
 *
 * EFFICIENCY:
 * - Sentiment analysis uses cached results (LRU)
 * - Gemini called only when available (graceful degradation)
 * - Response built incrementally to minimize memory allocation
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSentiment } from "@/src/engine/sentiment";
import { assessCrisis } from "@/src/engine/crisisDetector";
import { getRecommendation } from "@/src/engine/recommendation";
import {
  generateEmpathyMessage,
  generateTransition,
} from "@/src/engine/responseGenerator";
import { generateChatResponse, isGeminiAvailable } from "@/src/engine/gemini";
import { sanitizeText } from "@/src/utils/validators";
import { MAX_INPUT_LENGTH } from "@/src/utils/constants";
import type { MoodEntry, WeeklyAnalysisReport } from "@/src/types";

/** Schema for journal entry context passed from client */
const entryContextSchema = z.object({
  mood: z.string(),
  journalText: z.string(),
  timestamp: z.number(),
  sentimentScore: z.number(),
  timePeriod: z.string(),
});

/** Schema for weekly analysis report context */
const weeklyReportSchema = z.object({
  summary: z.string(),
  hiddenTriggers: z.array(z.string()),
  emotionalPatterns: z.array(z.string()),
  recommendations: z.array(z.string()),
  moodTrajectory: z.string(),
});

/** Complete chat request validation schema */
const chatRequestSchema = z.object({
  message: z.string().min(1).max(MAX_INPUT_LENGTH).transform(sanitizeText),
  mood: z.enum(["great", "good", "okay", "low", "rough"]),
  examType: z.enum(["NEET", "JEE", "UPSC", "general"]),
  recentMoods: z
    .array(z.enum(["great", "good", "okay", "low", "rough"]))
    .max(30),
  recentEntries: z.array(entryContextSchema).max(10).optional(),
  weeklyReport: weeklyReportSchema.nullable().optional(),
});

/** Type inferred from the validated schema */
type ValidatedChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Generates AI-powered chat response with context awareness.
 *
 * @param request - Incoming HTTP request with chat message and context
 * @returns JSON response with AI message, sentiment score, and crisis flag
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    return await processChat(validated);
  } catch (error) {
    return handleChatError(error);
  }
}

/**
 * Core chat processing logic (separated for testability and SRP).
 *
 * @param validated - Type-safe validated request data
 * @returns NextResponse with chat result
 */
async function processChat(
  validated: ValidatedChatRequest,
): Promise<NextResponse> {
  const sentiment = analyzeSentiment(validated.message);
  const crisis = assessCrisis(validated.message, sentiment.score);

  const responseText = await generateResponse(validated, sentiment.score);
  const finalResponse = appendCrisisInfo(responseText, crisis);

  return NextResponse.json({
    response: finalResponse,
    sentiment: sentiment.score,
    crisis: crisis.showResources,
  });
}

/**
 * Generates the AI response, falling back to local engine if Gemini is unavailable.
 *
 * @param validated - Validated request data
 * @param sentimentScore - Computed sentiment score
 * @returns Response text string
 */
async function generateResponse(
  validated: ValidatedChatRequest,
  sentimentScore: number,
): Promise<string> {
  if (isGeminiAvailable()) {
    const geminiResponse = await generateChatResponse(validated.message, {
      mood: validated.mood,
      examType: validated.examType,
      sentimentScore,
      recentMoods: validated.recentMoods,
      recentEntries: validated.recentEntries as unknown as
        | readonly MoodEntry[]
        | undefined,
      weeklyReport: validated.weeklyReport as unknown as
        | WeeklyAnalysisReport
        | null
        | undefined,
    });

    if (geminiResponse) return geminiResponse;
  }

  return buildLocalResponse(validated, sentimentScore);
}

/**
 * Builds a response from the local rule-based engine (fallback).
 *
 * @param validated - Validated request data
 * @param sentimentScore - Computed sentiment score
 * @returns Locally generated response string
 */
function buildLocalResponse(
  validated: ValidatedChatRequest,
  sentimentScore: number,
): string {
  const empathy = generateEmpathyMessage(validated.mood, sentimentScore);
  const recommendation = getRecommendation({
    sentimentScore,
    mood: validated.mood,
    examType: validated.examType,
    timePeriod: "morning",
    recentMoods: validated.recentMoods,
  });
  const transition = generateTransition(validated.mood, "none");

  return `${empathy}\n\n${transition}\n\n${recommendation.title}: ${recommendation.steps[0]}`;
}

/**
 * Appends crisis resources to response if crisis is detected.
 *
 * @param responseText - Current response text
 * @param crisis - Crisis assessment result
 * @returns Response with optional crisis info appended
 */
function appendCrisisInfo(
  responseText: string,
  crisis: { showResources: boolean; recommendation: string },
): string {
  if (!crisis.showResources) return responseText;
  return `${responseText}\n\n💛 ${crisis.recommendation}`;
}

/**
 * Centralized error handler for the chat route.
 *
 * @param error - Caught error
 * @returns Appropriate error response
 */
function handleChatError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid message format." },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
