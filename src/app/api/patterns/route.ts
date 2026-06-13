/**
 * Pattern Analysis API Route
 *
 * POST /api/patterns
 *
 * The "Pattern Analyzer Agent" — the core differentiator.
 * Sends the user's complete journal history to Gemini to:
 * 1. Uncover HIDDEN stress triggers the user may not see
 * 2. Identify emotional patterns (time-based, subject-based, social)
 * 3. Generate a personalized weekly analysis report
 * 4. Provide contextual recommendations based on patterns
 *
 * This is what makes MindMate a "Mental Wellness Tracker" rather
 * than a generic chatbot — it performs data-driven analysis.
 *
 * SECURITY:
 * - Journal data processed server-side only
 * - No data stored permanently
 * - Rate limited
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isGeminiAvailable } from "@/src/engine/gemini";
import { detectPatterns } from "@/src/engine/patternDetector";
import type { MoodEntry, WeeklyAnalysisReport } from "@/src/types";
import { generateId } from "@/src/utils/helpers";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/** Schema for pattern analysis request */
const patternsRequestSchema = z.object({
  entries: z
    .array(
      z.object({
        mood: z.string(),
        journalText: z.string(),
        timestamp: z.number(),
        sentimentScore: z.number(),
        timePeriod: z.string(),
      }),
    )
    .min(3)
    .max(30),
  examType: z.string(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = patternsRequestSchema.parse(body);

    // If Gemini is available, use AI-powered deep analysis
    if (isGeminiAvailable() && validated.entries.length >= 3) {
      const report = await analyzeWithGemini(
        validated.entries,
        validated.examType,
      );
      if (report) {
        return NextResponse.json({ report });
      }
    }

    // Fallback: Use local pattern detection
    const localPatterns = detectPatterns(
      validated.entries as unknown as MoodEntry[],
    );
    const fallbackReport: WeeklyAnalysisReport = {
      id: generateId(),
      generatedAt: Date.now(),
      entryCount: validated.entries.length,
      summary: `Based on ${validated.entries.length} journal entries, here is what I have noticed about your emotional patterns.`,
      hiddenTriggers: localPatterns
        .filter((p) => p.type === "trigger")
        .map((p) => p.description),
      emotionalPatterns: localPatterns.map((p) => p.description),
      recommendations: localPatterns.map((p) => p.suggestion),
      moodTrajectory: determineTrend(
        validated.entries.map((e) => e.sentimentScore),
      ),
    };

    return NextResponse.json({ report: fallbackReport });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Need at least 3 entries for analysis." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * Deep pattern analysis using Gemini AI.
 * This is the "Pattern Analyzer Agent" — it processes the full
 * journal history to uncover hidden triggers and emotional patterns.
 */
async function analyzeWithGemini(
  entries: Array<{
    mood: string;
    journalText: string;
    timestamp: number;
    sentimentScore: number;
    timePeriod: string;
  }>,
  examType: string,
): Promise<WeeklyAnalysisReport | null> {
  // Format entries for the prompt
  const entriesText = entries
    .map((e, i) => {
      const date = new Date(e.timestamp).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const time = e.timePeriod;
      return `Entry ${i + 1} [${date}, ${time}] - Mood: ${e.mood} (sentiment: ${e.sentimentScore})\n"${e.journalText}"`;
    })
    .join("\n\n");

  const prompt = `You are an expert pattern analysis AI for "MindMate," a mental wellness tracker for Indian students preparing for ${examType} exams.

TASK: Analyze the following ${entries.length} journal entries and uncover HIDDEN stress triggers, emotional patterns, and provide actionable insights that the student might not see themselves.

=== JOURNAL ENTRIES ===
${entriesText}
=== END ENTRIES ===

Perform deep analysis and output EXACTLY this JSON structure (no markdown, no extra text):
{
  "summary": "A 2-3 sentence personalized overview addressing the student directly (use 'you'). Mention specific things from their entries. e.g., 'Over the past week, I have noticed that your stress peaks around mock test days, especially in the evenings. However, your morning entries show a pattern of optimism that we can build on.'",
  "hiddenTriggers": [
    "Specific trigger 1 the student may not realize (e.g., 'Sunday evenings before Monday mock tests cause anticipatory anxiety')",
    "Specific trigger 2 (e.g., 'Comparing marks with peers triggers feelings of inadequacy')",
    "Specific trigger 3 if applicable"
  ],
  "emotionalPatterns": [
    "Pattern 1 with specific evidence (e.g., 'Your mood drops significantly on days you mention Physics — 3 out of 4 Physics entries had negative sentiment')",
    "Pattern 2 (e.g., 'Morning study sessions consistently correlate with positive mood entries')",
    "Pattern 3 (e.g., 'You tend to feel better on days you mention friends or social interaction')"
  ],
  "recommendations": [
    "Personalized recommendation 1 that directly addresses a hidden trigger (e.g., 'Since Sunday evenings are tough, try scheduling a 10-minute breathing session at 7 PM as a weekly ritual before the new week starts')",
    "Personalized recommendation 2 (e.g., 'Consider studying Physics in the morning when your mood is naturally higher, rather than in the evening')",
    "Personalized recommendation 3 (e.g., 'Your entries show social connection boosts your mood — schedule a 15-min study buddy call on low-energy days')"
  ],
  "moodTrajectory": "improving" or "stable" or "declining"
}

RULES:
- Be SPECIFIC — reference actual content from their entries
- Identify triggers they might NOT be consciously aware of
- Connect patterns to their ${examType} preparation context
- Recommendations must be actionable and time-specific
- Use warm, supportive language (not clinical)
- Output ONLY valid JSON`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    const report: WeeklyAnalysisReport = {
      id: generateId(),
      generatedAt: Date.now(),
      entryCount: entries.length,
      summary: String(parsed.summary || "").substring(0, 500),
      hiddenTriggers: (parsed.hiddenTriggers || []).map((t: unknown) =>
        String(t).substring(0, 200),
      ),
      emotionalPatterns: (parsed.emotionalPatterns || []).map((p: unknown) =>
        String(p).substring(0, 200),
      ),
      recommendations: (parsed.recommendations || []).map((r: unknown) =>
        String(r).substring(0, 200),
      ),
      moodTrajectory: ["improving", "stable", "declining"].includes(
        parsed.moodTrajectory,
      )
        ? parsed.moodTrajectory
        : "stable",
    };

    return report;
  } catch {
    return null;
  }
}

/** Determine mood trend from sentiment scores */
function determineTrend(
  scores: number[],
): "improving" | "stable" | "declining" {
  if (scores.length < 3) return "stable";
  const recent = scores.slice(0, Math.ceil(scores.length / 2));
  const older = scores.slice(Math.ceil(scores.length / 2));
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  if (recentAvg - olderAvg > 0.5) return "improving";
  if (olderAvg - recentAvg > 0.5) return "declining";
  return "stable";
}
