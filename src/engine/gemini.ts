/**
 * Gemini AI Integration
 *
 * Powers MindMate's AI capabilities:
 * 1. Empathetic response generation
 * 2. Contextual chat with LONG-TERM MEMORY (references past patterns)
 * 3. Pattern analysis agent (separate route)
 *
 * ARCHITECTURE: The key differentiator is CONTEXTUALIZATION.
 * The AI does not just respond to the current message — it references
 * the user's historical patterns, known triggers, and past entries
 * to provide truly personalized support.
 *
 * SECURITY:
 * - API key in .env.local (never committed)
 * - Server-side only (API routes)
 * - Graceful fallback to local engine
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  MoodLevel,
  ExamType,
  TimePeriod,
  Recommendation,
  MoodEntry,
  WeeklyAnalysisReport,
} from "@/src/types";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/** Check if Gemini is configured */
export function isGeminiAvailable(): boolean {
  return apiKey.length > 10;
}

/**
 * Generates an empathetic, personalized response using Gemini.
 * Enhanced with pattern context for hyper-personalization.
 */
export async function generateGeminiResponse(context: {
  journalText: string;
  mood: MoodLevel;
  sentimentScore: number;
  examType: ExamType;
  timePeriod: TimePeriod;
  recentMoods: readonly MoodLevel[];
  recommendation: Recommendation;
  weeklyReport?: WeeklyAnalysisReport | null;
}): Promise<{ empathyMessage: string; personalizedTip: string } | null> {
  if (!isGeminiAvailable()) return null;

  // Build context from weekly report for personalization
  const patternContext = context.weeklyReport
    ? `\nKNOWN PATTERNS FROM ANALYSIS:\n- Triggers: ${context.weeklyReport.hiddenTriggers.join("; ")}\n- Patterns: ${context.weeklyReport.emotionalPatterns.join("; ")}\n- Trajectory: ${context.weeklyReport.moodTrajectory}`
    : "";

  const prompt = `You are MindMate, a warm and supportive mental wellness companion for an Indian student preparing for ${context.examType}.

The student just logged this journal entry: "${context.journalText}"
Current mood: ${context.mood}
Sentiment score: ${context.sentimentScore} (-5 to +5)
Time of day: ${context.timePeriod}
Recent moods: ${context.recentMoods.slice(0, 5).join(", ") || "first entry"}
Suggested technique: ${context.recommendation.title}
${patternContext}

Generate JSON with these two fields:
{
  "empathyMessage": "A warm 2-3 sentence response. If you have pattern data, REFERENCE their known triggers/patterns specifically (e.g., 'I remember you mentioned struggling with Physics last time too — that pattern tells me this subject might need a different approach'). Be genuine, not clinical.",
  "personalizedTip": "A 1-2 sentence actionable tip that connects the suggested technique (${context.recommendation.title}) to their SPECIFIC situation. If pattern data exists, reference it."
}

CRITICAL: If pattern data is available, you MUST reference it to show long-term awareness.
Output ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.empathyMessage && parsed.personalizedTip) {
      return {
        empathyMessage: String(parsed.empathyMessage).substring(0, 600),
        personalizedTip: String(parsed.personalizedTip).substring(0, 400),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generates a conversational chat response with LONG-TERM MEMORY.
 * The AI references the user's past entries, known triggers, and patterns.
 */
export async function generateChatResponse(
  userMessage: string,
  context: {
    mood: MoodLevel;
    examType: ExamType;
    sentimentScore: number;
    recentMoods: readonly MoodLevel[];
    recentEntries?: readonly MoodEntry[];
    weeklyReport?: WeeklyAnalysisReport | null;
  },
): Promise<string | null> {
  if (!isGeminiAvailable()) return null;

  // Build memory context from journal history
  const historyContext = context.recentEntries
    ? context.recentEntries
        .slice(0, 7)
        .map((e) => {
          const date = new Date(e.timestamp).toLocaleDateString("en-IN", {
            weekday: "short",
          });
          return `[${date}] ${e.mood}: "${e.journalText.substring(0, 100)}"`;
        })
        .join("\n")
    : "";

  const patternContext = context.weeklyReport
    ? `\nYOU KNOW ABOUT THIS STUDENT:\n- Hidden triggers: ${context.weeklyReport.hiddenTriggers.join("; ")}\n- Emotional patterns: ${context.weeklyReport.emotionalPatterns.join("; ")}\n- Overall trajectory: ${context.weeklyReport.moodTrajectory}\n- Summary: ${context.weeklyReport.summary}`
    : "";

  const prompt = `You are MindMate, an empathetic wellness companion for an Indian student preparing for ${context.examType}. You are NOT a generic chatbot — you are their personal wellness tracker that REMEMBERS their history.

STUDENT'S CURRENT MESSAGE: "${userMessage}"
Current mood: ${context.mood}
Sentiment: ${context.sentimentScore} (-5 to +5)
Recent mood trend: ${context.recentMoods.slice(0, 5).join(", ") || "new user"}
${historyContext ? `\nRECENT JOURNAL HISTORY:\n${historyContext}` : ""}
${patternContext}

INSTRUCTIONS:
- Respond as a supportive friend who REMEMBERS their journey
- If you have history/pattern data, REFERENCE specific past entries or known triggers (e.g., "I noticed last Tuesday you felt the same way before your mock test — that seems like a pattern we should address")
- Keep response 3-5 sentences
- Be warm, genuine, non-judgmental
- If they need help, suggest ONE specific technique with context
- If they seem in crisis, validate pain and mention professional help
- NEVER be generic — always personalize based on available data

Respond with ONLY your message text, no quotes, no JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    return responseText.substring(0, 1000);
  } catch {
    return null;
  }
}
