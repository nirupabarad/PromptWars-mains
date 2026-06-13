/**
 * Recommendation API Route
 *
 * POST /api/recommend
 *
 * Generates context-aware coping strategy recommendations.
 * Uses Gemini AI to enhance responses with personalized messages.
 * Falls back to local engine if Gemini is unavailable.
 *
 * SECURITY:
 * - Input validated with Zod schema
 * - API key only on server side
 * - No data persistence
 */

import { NextResponse } from "next/server";
import { getRecommendation, getExamContext } from "@/src/engine/recommendation";
import {
  generateEmpathyMessage,
  generateEncouragement,
} from "@/src/engine/responseGenerator";
import { generateGeminiResponse, isGeminiAvailable } from "@/src/engine/gemini";
import { validateRecommendRequest } from "@/src/utils/validators";
import type { RecommendResponse } from "@/src/types";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // SECURITY: Validate request body
    const body = await request.json();
    const validated = validateRecommendRequest(body);

    // Get personalized recommendation from local engine
    const recommendation = getRecommendation({
      sentimentScore: validated.sentimentScore,
      mood: validated.mood,
      examType: validated.examType,
      timePeriod: validated.timePeriod,
      recentMoods: validated.recentMoods,
    });

    // Generate base messages from local engine (always available)
    let empathyMessage = generateEmpathyMessage(
      validated.mood,
      validated.sentimentScore,
    );
    const encouragement = generateEncouragement(
      0,
      validated.recentMoods.length,
    );

    // Enhance with Gemini AI if available
    if (isGeminiAvailable() && body.journalText) {
      try {
        const geminiResponse = await generateGeminiResponse({
          journalText: body.journalText,
          mood: validated.mood,
          sentimentScore: validated.sentimentScore,
          examType: validated.examType,
          timePeriod: validated.timePeriod,
          recentMoods: validated.recentMoods,
          recommendation,
          weeklyReport: body.weeklyReport || null,
        });

        if (geminiResponse) {
          empathyMessage = geminiResponse.empathyMessage;
        }
      } catch {
        // Graceful degradation: use local response if Gemini fails
      }
    }

    const response: RecommendResponse = {
      recommendation,
      empathyMessage,
      encouragement,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request parameters." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Unable to generate recommendation. Please try again." },
      { status: 500 },
    );
  }
}
