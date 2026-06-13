/**
 * Pattern Insight Component
 *
 * Displays detected emotional patterns with confidence levels
 * and actionable suggestions.
 *
 * ACCESSIBILITY:
 * - Each insight is an article with proper heading
 * - Confidence shown as text (not just progress bar)
 * - Suggestions clearly separated from observations
 */

"use client";

import React from "react";
import type { PatternInsight as PatternInsightType } from "@/src/types";

interface PatternInsightProps {
  /** Pattern data to display */
  pattern: PatternInsightType;
}

const TYPE_ICONS: Record<PatternInsightType["type"], string> = {
  time_based: "🕐",
  trigger: "⚡",
  trend: "📈",
  streak: "🔥",
};

const TYPE_LABELS: Record<PatternInsightType["type"], string> = {
  time_based: "Time Pattern",
  trigger: "Stress Trigger",
  trend: "Mood Trend",
  streak: "Streak",
};

/**
 * PatternInsight renders a single detected emotional pattern.
 *
 * @param props - Pattern data
 * @returns Styled pattern insight card
 */
export function PatternInsight({
  pattern,
}: PatternInsightProps): React.JSX.Element {
  const confidencePercent = Math.round(pattern.confidence * 100);

  return (
    <article
      className="p-4 bg-surface rounded-xl border border-primary/10 animate-fade-in"
      aria-label={`${TYPE_LABELS[pattern.type]}: ${pattern.description}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0" aria-hidden="true">
          {TYPE_ICONS[pattern.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider">
            {TYPE_LABELS[pattern.type]}
          </p>
          <p className="text-text-primary text-sm mt-1 leading-relaxed">
            {pattern.description}
          </p>
          <p className="text-secondary text-xs mt-2 italic">
            💡 {pattern.suggestion}
          </p>

          {/* Confidence indicator */}
          <div className="mt-2 flex items-center gap-2">
            <div
              className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={confidencePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Confidence: ${confidencePercent}%`}
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-text-muted text-xs">
              {confidencePercent}% confidence
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
