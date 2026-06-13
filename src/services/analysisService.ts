/**
 * Analysis Service Layer
 *
 * Centralized service for all API communication related to mood analysis.
 * Implements the Single Responsibility Principle - this module ONLY handles
 * API calls and response transformation for the analysis pipeline.
 *
 * EFFICIENCY: Encapsulates fetch logic to prevent code duplication.
 * SECURITY: All requests go through validated server-side API routes.
 */

import type {
  MoodLevel,
  MoodEntry,
  ExamType,
  AnalyzeResponse,
  WeeklyAnalysisReport,
} from "@/src/types";

/** Standardized result type for service operations (replaces try/catch in components) */
export interface ServiceResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

/** Parameters for submitting a mood analysis */
export interface AnalyzeEntryParams {
  readonly text: string;
  readonly mood: MoodLevel;
}

/** Parameters for triggering pattern analysis */
export interface PatternAnalysisParams {
  readonly entries: readonly MoodEntry[];
  readonly examType: ExamType;
}

/** Parameters for chat messages */
export interface ChatMessageParams {
  readonly message: string;
  readonly mood: MoodLevel;
  readonly examType: ExamType;
  readonly recentMoods: readonly MoodLevel[];
  readonly recentEntries?: readonly MoodEntry[];
  readonly weeklyReport?: WeeklyAnalysisReport | null;
}

/** Response from the chat API */
export interface ChatServiceResponse {
  readonly response: string;
  readonly sentiment: number;
  readonly crisis: boolean;
}

/**
 * Submits a journal entry for sentiment analysis and crisis detection.
 *
 * @param params - The entry text and selected mood
 * @returns ServiceResult with AnalyzeResponse data or error message
 */
export async function analyzeEntry(
  params: AnalyzeEntryParams,
): Promise<ServiceResult<AnalyzeResponse>> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Analysis failed. Please try again.",
      };
    }

    const data: AnalyzeResponse = await response.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "Unable to connect. Please check your connection.",
    };
  }
}

/**
 * Triggers the AI Pattern Analyzer Agent to process journal history.
 * Runs as a background operation — failure does not block the UI.
 *
 * @param params - Journal entries and exam type for context
 * @returns ServiceResult with WeeklyAnalysisReport or null on failure
 */
export async function runPatternAnalysis(
  params: PatternAnalysisParams,
): Promise<ServiceResult<WeeklyAnalysisReport>> {
  try {
    const serializedEntries = params.entries.slice(0, 30).map((entry) => ({
      mood: entry.mood,
      journalText: entry.journalText,
      timestamp: entry.timestamp,
      sentimentScore: entry.sentimentScore,
      timePeriod: entry.timePeriod,
    }));

    const response = await fetch("/api/patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: serializedEntries,
        examType: params.examType,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Pattern analysis unavailable." };
    }

    const data = await response.json();
    if (!data.report) {
      return { success: false, error: "No patterns detected yet." };
    }

    return { success: true, data: data.report as WeeklyAnalysisReport };
  } catch {
    return { success: false, error: "Pattern analysis failed silently." };
  }
}

/**
 * Sends a message to the AI companion chat with full context.
 *
 * @param params - Message, mood, and context for personalized response
 * @returns ServiceResult with chat response or fallback error
 */
export async function sendChatMessage(
  params: ChatMessageParams,
): Promise<ServiceResult<ChatServiceResponse>> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: params.message,
        mood: params.mood,
        examType: params.examType,
        recentMoods: params.recentMoods,
        recentEntries: params.recentEntries?.slice(0, 7).map((entry) => ({
          mood: entry.mood,
          journalText: entry.journalText,
          timestamp: entry.timestamp,
          sentimentScore: entry.sentimentScore,
          timePeriod: entry.timePeriod,
        })),
        weeklyReport: params.weeklyReport
          ? {
              summary: params.weeklyReport.summary,
              hiddenTriggers: params.weeklyReport.hiddenTriggers,
              emotionalPatterns: params.weeklyReport.emotionalPatterns,
              recommendations: params.weeklyReport.recommendations,
              moodTrajectory: params.weeklyReport.moodTrajectory,
            }
          : null,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Chat unavailable. Please try again." };
    }

    const data: ChatServiceResponse = await response.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Connection failed. Please try again." };
  }
}
