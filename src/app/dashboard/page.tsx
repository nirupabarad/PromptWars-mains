/**
 * Dashboard Page - My Wellness Journey
 *
 * Visualizes mood trends, detected patterns, and insights.
 * Uses Recharts for interactive mood timeline.
 *
 * ACCESSIBILITY: Chart data also presented as text.
 * EFFICIENCY: Charts dynamically imported.
 */

"use client";

import React from "react";
import { MoodChart } from "@/src/components/features/MoodChart";
import { PatternInsight } from "@/src/components/features/PatternInsight";
import { InsightCard } from "@/src/components/ui/InsightCard";
import { useWellness } from "@/src/context/WellnessContext";
import { detectPatterns } from "@/src/engine/patternDetector";
import { MOOD_VALUES, MOOD_EMOJIS } from "@/src/utils/constants";
import { calculateStreak } from "@/src/utils/helpers";

/**
 * DashboardPage renders the wellness insights and visualization.
 *
 * @returns Dashboard page component
 */
export default function DashboardPage(): React.JSX.Element {
  const { state } = useWellness();
  const patterns = detectPatterns(state.entries);
  const streak = calculateStreak(state.entries.map((e) => e.mood));

  // Calculate stats
  const totalEntries = state.entries.length;
  const avgMood =
    totalEntries > 0
      ? state.entries.reduce((sum, e) => sum + MOOD_VALUES[e.mood], 0) /
        totalEntries
      : 0;
  const bestMood =
    totalEntries > 0
      ? state.entries.reduce((best, e) =>
          MOOD_VALUES[e.mood] > MOOD_VALUES[best.mood] ? e : best,
        ).mood
      : null;

  // Count mood distribution
  const moodDistribution = state.entries.reduce(
    (acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <section aria-label="Dashboard header">
        <h2 className="text-2xl font-bold text-text-primary">
          My Wellness Journey 📊
        </h2>
        <p className="text-text-muted text-sm mt-1">
          {totalEntries > 0
            ? `Based on ${totalEntries} check-in${totalEntries > 1 ? "s" : ""} this session.`
            : "Start logging moods on the Home page to see insights here."}
        </p>
      </section>

      {/* Quick stats row */}
      <section aria-label="Statistics overview">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InsightCard
            title="Total Entries"
            value={`${totalEntries}`}
            icon="📝"
          />
          <InsightCard
            title="Avg Mood"
            value={avgMood > 0 ? avgMood.toFixed(1) : "—"}
            icon="📈"
            variant={
              avgMood >= 3.5 ? "success" : avgMood >= 2.5 ? "warning" : "danger"
            }
          />
          <InsightCard
            title="Positive Streak"
            value={`${streak} days`}
            icon="🔥"
            variant={streak >= 3 ? "success" : "default"}
          />
          <InsightCard
            title="Best Mood"
            value={bestMood ? MOOD_EMOJIS[bestMood].emoji : "—"}
            icon="⭐"
            variant="success"
          />
        </div>
      </section>

      {/* Mood timeline chart */}
      <section aria-label="Mood timeline" className="glass-card p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Mood Timeline
        </h3>
        <MoodChart entries={state.entries} />
      </section>

      {/* Mood distribution */}
      {totalEntries > 0 && (
        <section aria-label="Mood distribution" className="glass-card p-5">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Mood Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(MOOD_EMOJIS).map(([mood, { emoji, label }]) => {
              const count = moodDistribution[mood] || 0;
              const percentage =
                totalEntries > 0 ? (count / totalEntries) * 100 : 0;

              return (
                <div key={mood} className="flex items-center gap-3">
                  <span className="text-lg w-8" aria-hidden="true">
                    {emoji}
                  </span>
                  <span className="text-text-muted text-xs w-16 capitalize">
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
                  <span className="text-text-muted text-xs w-12 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pattern insights */}
      <section aria-label="Pattern insights">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          Patterns & Insights
        </h3>
        {patterns.length > 0 ? (
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <PatternInsight
                key={`${pattern.type}-${index}`}
                pattern={pattern}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-5 text-center">
            <p className="text-text-muted text-sm">
              {totalEntries < 3
                ? "Log at least 3 mood entries to start seeing patterns."
                : "No clear patterns detected yet. Keep logging to build insights!"}
            </p>
          </div>
        )}
      </section>

      {/* Data privacy notice */}
      <section aria-label="Privacy notice" className="text-center">
        <p className="text-text-muted text-xs">
          🔒 All data shown here exists only in your current browser session.
          Closing this tab will erase everything.
        </p>
      </section>
    </div>
  );
}
