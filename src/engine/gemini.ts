/**
 * Gemini AI Integration
 *
 * Enhances MindMate responses using Google Gemini AI.
 * Used for generating empathetic, personalized wellness responses.
 *
 * SECURITY:
 * - API key stored in .env.local (never committed to git)
 * - Runs server-side only (API routes)
 * - User text sent to Gemini for analysis but not stored
 * - Falls back to local engine if Gemini is unavailable
 *
 * ARCHITECTURE:
 * - Local sentiment analysis runs FIRST (fast, always available)
 * - Gemini ENHANCES responses with personalized, human-like messages
 * - If Gemini fails, local responses are used (graceful degradation)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  MoodLevel,
  ExamType,
  TimePeriod,
  Recommendation,
} from "@/src/types";

/** Initialize Gemini client - server-side only */
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/** Check if Gemini is configured */
export function isGeminiAvailable(): boolean {
  return apiKey.length > 10;
}

/**
 * Generates an empathetic, personalized response using Gemini.
 *
 * @param context - User's current emotional context
 * @returns AI-generated empathetic response or null on failure
 */
export async function generateGeminiResponse(context: {
  journalText: string;
  mood: MoodLevel;
  sentimentScore: number;
  examType: ExamType;
  timePeriod: TimePeriod;
  recentMoods: readonly MoodLevel[];
  recommendation: Recommendation;
}): Promise<{ empathyMessage: string; personalizedTip: string } | null> {
  if (!isGeminiAvailable()) return null;

  const prompt = `You are MindMate, a warm and supportive mental wellness companion for Indian students preparing for ${context.examType} exams. 

The student just shared: "${context.journalText}"
Their current mood: ${context.mood}
Sentiment score: ${context.sentimentScore} (scale: -5 to +5)
Time of day: ${context.timePeriod}
Recent mood trend: ${context.recentMoods.slice(0, 5).join(", ") || "first entry"}
Suggested coping strategy: ${context.recommendation.title}

Generate a response in JSON format with exactly these two fields:
{
  "empathyMessage": "A warm, validating 2-3 sentence response acknowledging their feelings. Be genuine, not clinical. Use simple English. Never be judgmental. If they are struggling, validate that it is hard. If they are doing well, celebrate with them.",
  "personalizedTip": "A specific, actionable 1-2 sentence tip related to the suggested strategy (${context.recommendation.title}) that connects to their specific situation and ${context.examType} preparation."
}

Rules:
- Be warm and conversational, like a supportive friend
- Never use clinical or robotic language
- Keep each field under 100 words
- If the student seems in crisis, acknowledge the pain and gently suggest professional help
- Reference their specific exam when relevant
- Output ONLY valid JSON, no markdown or extra text`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.empathyMessage && parsed.personalizedTip) {
      return {
        empathyMessage: String(parsed.empathyMessage).substring(0, 500),
        personalizedTip: String(parsed.personalizedTip).substring(0, 300),
      };
    }
    return null;
  } catch {
    // SECURITY: Don't expose error details - fail silently to local fallback
    return null;
  }
}

/**
 * Generates a conversational chat response using Gemini.
 *
 * @param userMessage - The user's chat message
 * @param context - Conversation context
 * @returns AI response string or null
 */
export async function generateChatResponse(
  userMessage: string,
  context: {
    mood: MoodLevel;
    examType: ExamType;
    sentimentScore: number;
    recentMoods: readonly MoodLevel[];
  },
): Promise<string | null> {
  if (!isGeminiAvailable()) return null;

  const prompt = `You are MindMate, a warm mental wellness companion for Indian students preparing for ${context.examType} exams.

The student says: "${userMessage}"
Their overall mood: ${context.mood}
Sentiment: ${context.sentimentScore} (-5 to +5 scale)
Recent mood pattern: ${context.recentMoods.slice(0, 5).join(", ") || "new user"}

Respond as a supportive friend who understands exam pressure. Keep your response:
- 2-4 sentences maximum
- Warm, genuine, and non-judgmental
- If they ask for help, suggest ONE specific technique
- If they are venting, validate their feelings first
- Reference ${context.examType} preparation naturally when relevant
- Use simple, conversational English
- NEVER be preachy or lecture them
- If they seem in crisis, gently mention that talking to a trusted adult or counselor helps

Respond with ONLY your message text, no quotes, no JSON, no formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    // SECURITY: Limit response length
    return responseText.substring(0, 800);
  } catch {
    return null;
  }
}
