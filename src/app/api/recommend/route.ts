/**
 * Recommendation API Route
 *
 * POST /api/recommend
 *
 * Generates context-aware coping strategy recommendations
 * based on user's current state and history.
 *
 * SECURITY:
 * - Input validated with Zod schema
 * - Rate limited (shared with analyze endpoint)
 * - No data persistence
 * - Server-side only execution
 */

import { NextResponse } from "next/server";
import { generateRecommendationWithGemini } from "@/src/engine/gemini";
import { validateRecommendRequest } from "@/src/utils/validators";
import type { RecommendResponse } from "@/src/types";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // SECURITY: Validate request body
    const body = await request.json();
    const validated = validateRecommendRequest(body);

    // Get personalized recommendation from Gemini
    const response = await generateRecommendationWithGemini({
      sentimentScore: validated.sentimentScore,
      mood: validated.mood,
      examType: validated.examType,
      timePeriod: validated.timePeriod,
      recentMoods: validated.recentMoods,
    });

    return NextResponse.json(response);
  } catch (error) {
    // SECURITY: Generic error message, no internal details exposed
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
