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
 * - Input validated and sanitized
 * - No conversation history stored server-side
 * - API key only accessible server-side
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

const chatRequestSchema = z.object({
  message: z.string().min(1).max(MAX_INPUT_LENGTH).transform(sanitizeText),
  mood: z.enum(["great", "good", "okay", "low", "rough"]),
  examType: z.enum(["NEET", "JEE", "UPSC", "general"]),
  recentMoods: z
    .array(z.enum(["great", "good", "okay", "low", "rough"]))
    .max(30),
  // Long-term memory: recent entries for contextualization
  recentEntries: z
    .array(
      z.object({
        mood: z.string(),
        journalText: z.string(),
        timestamp: z.number(),
        sentimentScore: z.number(),
        timePeriod: z.string(),
      }),
    )
    .max(10)
    .optional(),
  // Weekly analysis report for pattern-aware responses
  weeklyReport: z
    .object({
      summary: z.string(),
      hiddenTriggers: z.array(z.string()),
      emotionalPatterns: z.array(z.string()),
      recommendations: z.array(z.string()),
      moodTrajectory: z.string(),
    })
    .nullable()
    .optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    // Run local sentiment analysis
    const sentiment = analyzeSentiment(validated.message);
    const crisis = assessCrisis(validated.message, sentiment.score);

    // Try Gemini with full context (history + patterns)
    let responseText: string | null = null;

    if (isGeminiAvailable()) {
      responseText = await generateChatResponse(validated.message, {
        mood: validated.mood,
        examType: validated.examType,
        sentimentScore: sentiment.score,
        recentMoods: validated.recentMoods,
        recentEntries: validated.recentEntries as any,
        weeklyReport: validated.weeklyReport as any,
      });
    }

    // Fallback: Build response from local engine
    if (!responseText) {
      const empathy = generateEmpathyMessage(validated.mood, sentiment.score);
      const recommendation = getRecommendation({
        sentimentScore: sentiment.score,
        mood: validated.mood,
        examType: validated.examType,
        timePeriod: "morning",
        recentMoods: validated.recentMoods,
      });
      const transition = generateTransition(validated.mood, crisis.severity);
      responseText = `${empathy}\n\n${transition}\n\n${recommendation.title}: ${recommendation.steps[0]}`;
    }

    // Append crisis info if detected
    if (crisis.showResources) {
      responseText += "\n\n💛 " + crisis.recommendation;
    }

    return NextResponse.json({
      response: responseText,
      sentiment: sentiment.score,
      crisis: crisis.showResources,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid message." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
