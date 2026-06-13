/**
 * Sentiment Analysis API Route
 *
 * POST /api/analyze
 *
 * Processes user journal text server-side to determine sentiment,
 * detect crisis indicators, and identify patterns.
 *
 * SECURITY:
 * - Input validated with Zod schema before processing
 * - Rate limited to prevent abuse (60 req/min)
 * - No user data logged or stored
 * - Runs server-side only (logic not exposed to client bundle)
 * - Error messages never contain user input
 */

import { NextResponse } from "next/server";
import { analyzeEntryWithGemini } from "@/src/engine/gemini";
import { validateAnalyzeRequest } from "@/src/utils/validators";
import { RATE_LIMIT_MAX } from "@/src/utils/constants";
import type { AnalyzeResponse, MoodEntry } from "@/src/types";
import { getCurrentTimePeriod, generateId } from "@/src/utils/helpers";

/**
 * SECURITY: Simple in-memory rate limiter.
 * Resets every minute. No persistent storage.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // SECURITY: Rate limiting check
    const clientId = request.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    // SECURITY: Parse and validate request body
    const body = await request.json();
    const validated = validateAnalyzeRequest(body);

    // Process sentiment analysis using Gemini API
    const response = await analyzeEntryWithGemini(validated.text);

    return NextResponse.json(response);
  } catch (error) {
    // SECURITY: Never expose internal error details to client
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input. Please check your entry." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
