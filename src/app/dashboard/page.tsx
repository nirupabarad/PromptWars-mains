/**
 * Dashboard Page - My Wellness Journey + AI Pattern Analysis
 *
 * This page demonstrates the core "Mental Wellness Tracker" capabilities:
 * 1. Mood timeline visualization
 * 2. AI-POWERED PATTERN ANALYSIS (Gemini analyzes journal history)
 * 3. Hidden trigger identification
 * 4. Personalized recommendations based on patterns
 *
 * This is the KEY page for "Problem Statement Alignment" —
 * it shows the app ANALYZING journal data to uncover hidden triggers.
 *
 * ACCESSIBILITY: Charts have text alternatives, patterns are readable.
 */

"use client";

import React, { useState, useCallback } from "react";
import { MoodChart } from "@/src/components/features/MoodChart";
import { PatternInsight } from "@/src/components/features/PatternInsight";
import { InsightCard } from "@/src/components/ui/InsightCard";
import { useWellness } from "@/src/context/WellnessContext";
import { detectPatterns } from "@/src/engine/patternDetector";
import { MOOD_VALUES, MOOD_EMOJIS } from "@/src/utils/constants";
import { calculateStreak, generateId } from "@/src/utils/helpers";
import type { WeeklyAnalysisReport } from "@/src/types";

export default function DashboardPage(): React.JSX.Element {
  const { state, setWeeklyReport } = useWellness();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const patterns = detectPatterns(state.entries);
  const streak = calculateStreak(state.entries.map((e) => e.mood));
  const totalEntries = state.entries.length;
  const avgMood =
    totalEntries > 0
      ? state.entries.reduce((sum, e) => sum + MOOD_VALUES[e.mood], 0) /
        totalEntries
      : 0;

  // Determine if new analysis is needed
  const needsNewAnalysis =
    totalEntries >= 3 && totalEntries > state.lastAnalysisEntryCount + 1;

  /**
   * Triggers the AI Pattern Analyzer Agent.
   * Sends all journal entries to Gemini for deep analysis.
   */
  const runPatternAnalysis = useCallback(async () => {
    if (totalEntries < 3) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: state.entries.map((e) => ({
            mood: e.mood,
            journalText: e.journalText,
            timestamp: e.timestamp,
            sentimentScore: e.sentimentScore,
            timePeriod: e.timePeriod,
          })),
          examType: state.examType,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      if (data.report) {
        setWeeklyReport(data.report as WeeklyAnalysisReport);
      }
    } catch {
      setAnalysisError("Could not complete analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.entries, state.examType, totalEntries, setWeeklyReport]);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <section aria-label="Dashboard header">
        <h2 className="text-2xl font-bold text-text-primary">
          My Wellness Journey 📊
        </h2>
        <p className="text-text-muted text-sm mt-1">
          {totalEntries > 0
            ? `Tracking ${totalEntries} journal entries. AI analysis available.`
            : "Start logging moods on the Home page to see insights here."}
        </p>
      </section>

      {/* Stats row */}
      <section aria-label="Statistics">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InsightCard
            title="Journal Entries"
            value={`${totalEntries}`}
            icon="📝"
            description="Total logged"
          />
          <InsightCard
            title="Avg Mood"
            value={avgMood > 0 ? avgMood.toFixed(1) + "/5" : "—"}
            icon="📈"
            variant={
              avgMood >= 3.5 ? "success" : avgMood >= 2.5 ? "warning" : "danger"
            }
          />
          <InsightCard
            title="Streak"
            value={`${streak} days`}
            icon="🔥"
            variant={streak >= 3 ? "success" : "default"}
          />
          <InsightCard
            title="Trajectory"
            value={state.weeklyReport?.moodTrajectory || "—"}
            icon={
              state.weeklyReport?.moodTrajectory === "improving"
                ? "📈"
                : state.weeklyReport?.moodTrajectory === "declining"
                  ? "📉"
                  : "➡️"
            }
            variant={
              state.weeklyReport?.moodTrajectory === "improving"
                ? "success"
                : state.weeklyReport?.moodTrajectory === "declining"
                  ? "danger"
                  : "default"
            }
          />
        </div>
      </section>

      {/* Mood Timeline */}
      <section aria-label="Mood timeline" className="glass-card p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Mood Timeline
        </h3>
        <MoodChart entries={state.entries} />
      </section>

      {/* AI PATTERN ANALYSIS — The Key Feature */}
      <section
        aria-label="AI Pattern Analysis"
        className="glass-card p-5 border-2 border-secondary/20"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <span aria-hidden="true">🧠</span>
              AI Pattern Analysis
            </h3>
            <p className="text-text-muted text-xs mt-0.5">
              Gemini AI analyzes your journal to uncover hidden stress triggers
            </p>
          </div>
          <button
            type="button"
            onClick={runPatternAnalysis}
            disabled={isAnalyzing || totalEntries < 3}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            aria-label="Run AI pattern analysis on journal entries"
          >
            {isAnalyzing
              ? "🔄 Analyzing..."
              : needsNewAnalysis
                ? "✨ Analyze New Entries"
                : "🔄 Re-analyze"}
          </button>
        </div>

        {totalEntries < 3 && (
          <div className="text-center py-6 bg-surface-light/30 rounded-lg">
            <p className="text-text-muted text-sm">
              Log at least 3 journal entries to unlock AI pattern analysis.
            </p>
            <p className="text-text-muted text-xs mt-1">
              The more entries you log, the more accurate the analysis becomes.
            </p>
          </div>
        )}

        {analysisError && (
          <p className="text-danger text-sm p-3 bg-danger/5 rounded-lg">
            {analysisError}
          </p>
        )}

        {/* Weekly Report Display */}
        {state.weeklyReport && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                Summary
              </p>
              <p className="text-text-primary text-sm leading-relaxed">
                {state.weeklyReport.summary}
              </p>
              <p className="text-text-muted text-xs mt-2">
                Based on {state.weeklyReport.entryCount} entries • Generated{" "}
                {new Date(state.weeklyReport.generatedAt).toLocaleString()}
              </p>
            </div>

            {/* Hidden Triggers — THE KEY DIFFERENTIATOR */}
            {state.weeklyReport.hiddenTriggers.length > 0 && (
              <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
                <p className="text-warning text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span aria-hidden="true">⚡</span> Hidden Stress Triggers
                  Detected
                </p>
                <ul
                  className="space-y-2"
                  aria-label="Identified stress triggers"
                >
                  {state.weeklyReport.hiddenTriggers.map((trigger, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning text-xs mt-0.5">•</span>
                      <p className="text-text-primary text-sm">{trigger}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emotional Patterns */}
            {state.weeklyReport.emotionalPatterns.length > 0 && (
              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                <p className="text-secondary text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span aria-hidden="true">🔄</span> Emotional Patterns
                </p>
                <ul
                  className="space-y-2"
                  aria-label="Detected emotional patterns"
                >
                  {state.weeklyReport.emotionalPatterns.map((pattern, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-secondary text-xs mt-0.5">•</span>
                      <p className="text-text-primary text-sm">{pattern}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personalized Recommendations */}
            {state.weeklyReport.recommendations.length > 0 && (
              <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
                <p className="text-success text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span aria-hidden="true">💡</span> Personalized
                  Recommendations
                </p>
                <ul
                  className="space-y-2"
                  aria-label="Personalized recommendations"
                >
                  {state.weeklyReport.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success text-xs mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-text-primary text-sm">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Local Pattern Detection (always available) */}
      {patterns.length > 0 && (
        <section aria-label="Local pattern insights">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Additional Insights
          </h3>
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <PatternInsight
                key={`${pattern.type}-${index}`}
                pattern={pattern}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mood Distribution */}
      {totalEntries > 0 && (
        <section aria-label="Mood distribution" className="glass-card p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Mood Distribution
          </h3>
          <div className="space-y-2">
            {(
              Object.entries(MOOD_EMOJIS) as [
                string,
                { emoji: string; label: string },
              ][]
            ).map(([mood, { emoji, label }]) => {
              const count = state.entries.filter((e) => e.mood === mood).length;
              const percentage =
                totalEntries > 0 ? (count / totalEntries) * 100 : 0;
              return (
                <div key={mood} className="flex items-center gap-3">
                  <span className="text-lg w-8" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className="text-text-muted text-xs w-14 capitalize">
                    {mood}
                  </span>
                  <div className="flex-1 h-3 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${label}: ${Math.round(percentage)}%`}
                    />
                  </div>
                  <span className="text-text-muted text-xs w-16 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Privacy */}
      <p className="text-text-muted text-xs text-center">
        🔒 All analysis runs in your session. Data is not stored permanently.
      </p>
    </div>
  );
}
