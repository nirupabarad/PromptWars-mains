/**
 * Home Page - Comprehensive Check-In
 *
 * Full-featured landing page with:
 * - Animated gradient welcome header
 * - Mood selector with emoji reactions
 * - Quick thoughts + manual journal entry
 * - User activity feed (recent entries)
 * - Wellness statistics dashboard
 * - Exam type with "Other" manual option
 * - Daily tip card
 *
 * SECURITY: All processing via API routes (server-side).
 * ACCESSIBILITY: Proper heading hierarchy, ARIA labels on all widgets.
 */

"use client";

import React, { useState, useCallback } from "react";
import { MoodSelector } from "@/src/components/ui/MoodSelector";
import { InsightCard } from "@/src/components/ui/InsightCard";
import { JournalInput } from "@/src/components/features/JournalInput";
import { CrisisAlert } from "@/src/components/features/CrisisAlert";
import { useWellness } from "@/src/context/WellnessContext";
import {
  generateId,
  getCurrentTimePeriod,
  getTimeGreeting,
  calculateStreak,
  formatRelativeTime,
} from "@/src/utils/helpers";
import { MOOD_VALUES, MOOD_EMOJIS } from "@/src/utils/constants";
import type {
  MoodLevel,
  MoodEntry,
  AnalyzeResponse,
  ExamType,
} from "@/src/types";

/** Daily wellness tips that rotate */
const DAILY_TIPS = [
  { tip: "Take a 5-minute break every 25 minutes of study.", icon: "⏰" },
  {
    tip: "Drink water regularly — dehydration affects concentration.",
    icon: "💧",
  },
  { tip: "A 10-minute walk can boost your focus by 20%.", icon: "🚶" },
  {
    tip: "Sleep 7-8 hours — your brain consolidates memory during sleep.",
    icon: "😴",
  },
  {
    tip: "Practice one breathing exercise before starting your study session.",
    icon: "🌬️",
  },
  { tip: "Write down 3 things you are grateful for today.", icon: "📝" },
  {
    tip: "Avoid studying in bed — keep study and rest spaces separate.",
    icon: "📚",
  },
];

/**
 * HomePage renders the comprehensive mood check-in interface.
 */
export default function HomePage(): React.JSX.Element {
  const { state, addEntry, dispatch } = useWellness();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crisisVisible, setCrisisVisible] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [customExam, setCustomExam] = useState("");
  const [showCustomExam, setShowCustomExam] = useState(false);

  const greeting = getTimeGreeting();
  const streak = calculateStreak(state.entries.map((e) => e.mood));
  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!selectedMood) {
        setFeedback("Please select a mood first.");
        return;
      }

      setIsLoading(true);
      setFeedback(null);
      setCrisisVisible(false);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mood: selectedMood }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setFeedback(
            errorData.error || "Something went wrong. Please try again.",
          );
          return;
        }

        const data: AnalyzeResponse = await response.json();

        const entry: MoodEntry = {
          id: generateId(),
          mood: selectedMood,
          journalText: text,
          timestamp: Date.now(),
          sentimentScore: data.sentiment.score,
          timePeriod: getCurrentTimePeriod(),
        };

        addEntry(entry);

        const newStreak = calculateStreak([
          entry.mood,
          ...state.entries.map((e) => e.mood),
        ]);
        dispatch({ type: "UPDATE_STREAK", payload: newStreak });

        if (data.crisis.showResources) {
          setCrisisVisible(true);
          setCrisisMessage(data.crisis.recommendation);
        }

        setFeedback("Thank you for sharing. Your entry has been logged. 💜");
        setSelectedMood(null);
      } catch {
        setFeedback("Unable to process your entry. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedMood, addEntry, dispatch, state.entries],
  );

  const handleExamChange = (value: string) => {
    if (value === "other") {
      setShowCustomExam(true);
    } else {
      setShowCustomExam(false);
      setCustomExam("");
      dispatch({ type: "SET_EXAM_TYPE", payload: value as ExamType });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hero Welcome Section */}
      <section
        aria-label="Welcome"
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary/20 via-surface to-secondary/10 border border-primary/20"
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2"
          aria-hidden="true"
        />

        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {greeting} 👋
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Take a moment to check in with yourself. How is your day going?
          </p>

          {/* Daily Tip */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <span className="text-lg" aria-hidden="true">
              {todayTip.icon}
            </span>
            <div>
              <p className="text-accent text-xs font-semibold uppercase tracking-wider">
                Daily Tip
              </p>
              <p className="text-text-primary text-sm mt-0.5">{todayTip.tip}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Selector */}
      <section aria-label="Mood selection" className="glass-card p-5">
        <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
          <span aria-hidden="true">🎭</span>
          How are you feeling right now?
        </h3>
        <MoodSelector
          selectedMood={selectedMood}
          onSelect={setSelectedMood}
          reducedMotion={state.reducedMotion}
        />
      </section>

      {/* Journal Input with Quick Thoughts */}
      <section aria-label="Journal entry" className="glass-card p-5">
        <JournalInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          currentMood={selectedMood}
        />
      </section>

      {/* Feedback message */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`text-center text-sm p-3 rounded-xl border ${
            feedback.includes("Thank you")
              ? "text-success bg-success/5 border-success/20"
              : "text-warning bg-warning/5 border-warning/20"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Crisis Alert */}
      <CrisisAlert visible={crisisVisible} message={crisisMessage} />

      {/* Wellness Statistics */}
      <section aria-label="Wellness statistics">
        <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
          <span aria-hidden="true">📊</span>
          Your Wellness Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InsightCard
            title="Mood Streak"
            value={`${streak} days`}
            icon="🔥"
            variant={streak >= 3 ? "success" : "default"}
            description={streak >= 3 ? "Keep it up!" : "Build your streak"}
          />
          <InsightCard
            title="Check-ins"
            value={`${state.entries.length}`}
            icon="📝"
            description="Total entries"
          />
          <InsightCard
            title="Avg Mood"
            value={
              state.entries.length > 0
                ? (
                    state.entries.reduce(
                      (sum, e) => sum + MOOD_VALUES[e.mood],
                      0,
                    ) / state.entries.length
                  ).toFixed(1)
                : "—"
            }
            icon="📈"
            variant={
              state.entries.length > 0
                ? state.entries.reduce(
                    (sum, e) => sum + MOOD_VALUES[e.mood],
                    0,
                  ) /
                    state.entries.length >=
                  3.5
                  ? "success"
                  : "warning"
                : "default"
            }
            description="Out of 5.0"
          />
          <InsightCard
            title="Best Mood"
            value={
              state.entries.length > 0
                ? MOOD_EMOJIS[
                    state.entries.reduce((best, e) =>
                      MOOD_VALUES[e.mood] > MOOD_VALUES[best.mood] ? e : best,
                    ).mood
                  ].emoji
                : "—"
            }
            icon="⭐"
            variant="success"
            description="Your peak moment"
          />
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section aria-label="Recent activity" className="glass-card p-5">
        <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
          <span aria-hidden="true">🕐</span>
          Recent Activity
        </h3>
        {state.entries.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {state.entries.slice(0, 10).map((entry) => (
              <ActivityItem key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-3xl mb-2" aria-hidden="true">
              📭
            </p>
            <p className="text-text-muted text-sm">No entries yet.</p>
            <p className="text-text-muted text-xs mt-1">
              Select your mood and share your thoughts to get started!
            </p>
          </div>
        )}
      </section>

      {/* Exam Type Selection with Custom Option */}
      <section
        aria-label="Exam preparation settings"
        className="glass-card p-5"
      >
        <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
          <span aria-hidden="true">🎯</span>I am preparing for
        </h3>
        <p className="text-text-muted text-xs mb-3">
          This helps MindMate give you exam-specific coping strategies.
        </p>

        <div className="space-y-3">
          {/* Preset exam options */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            role="radiogroup"
            aria-label="Select your exam type"
          >
            {(["NEET", "JEE", "UPSC", "other"] as const).map((exam) => {
              const isSelected =
                (!showCustomExam && state.examType === exam) ||
                (exam === "other" && showCustomExam);
              const labels: Record<string, { emoji: string; name: string }> = {
                NEET: { emoji: "🩺", name: "NEET" },
                JEE: { emoji: "⚙️", name: "JEE" },
                UPSC: { emoji: "🏛️", name: "UPSC" },
                other: { emoji: "✏️", name: "Other" },
              };
              const { emoji, name } = labels[exam];

              return (
                <button
                  key={exam}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Preparing for ${name}`}
                  onClick={() => handleExamChange(exam)}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-xl
                    border-2 transition-all duration-200 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background
                    ${
                      isSelected
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-surface border-primary/10 text-text-muted hover:border-primary/40 hover:text-text-primary"
                    }
                  `}
                >
                  <span aria-hidden="true">{emoji}</span>
                  {name}
                </button>
              );
            })}
          </div>

          {/* Custom exam input */}
          {showCustomExam && (
            <div className="animate-fade-in">
              <label
                htmlFor="custom-exam"
                className="text-text-muted text-xs block mb-1"
              >
                Enter your exam or goal:
              </label>
              <input
                id="custom-exam"
                type="text"
                value={customExam}
                onChange={(e) => setCustomExam(e.target.value)}
                placeholder="e.g., CAT, GATE, Board Exams, Competitive coding..."
                maxLength={50}
                autoComplete="off"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          )}
        </div>
      </section>

      {/* Privacy & Data Notice */}
      <section aria-label="Privacy notice" className="text-center space-y-1">
        <p className="text-text-muted text-xs flex items-center justify-center gap-1">
          <span aria-hidden="true">🔒</span>
          Your data stays in your browser. Nothing is stored permanently.
        </p>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "This will clear all your mood entries and chat history. Are you sure?",
              )
            ) {
              dispatch({ type: "CLEAR_ALL_DATA" });
              setFeedback(null);
              setCrisisVisible(false);
            }
          }}
          className="text-danger/70 text-xs hover:text-danger hover:underline focus:outline-none focus:ring-2 focus:ring-danger rounded px-2 py-1"
          aria-label="Clear all session data"
        >
          Clear all data
        </button>
      </section>
    </div>
  );
}

/** Activity Item sub-component for the recent activity feed */
function ActivityItem({ entry }: { entry: MoodEntry }): React.JSX.Element {
  const { emoji } = MOOD_EMOJIS[entry.mood];
  const moodScore = MOOD_VALUES[entry.mood];
  const sentimentLabel =
    entry.sentimentScore > 0
      ? "Positive"
      : entry.sentimentScore < 0
        ? "Negative"
        : "Neutral";

  return (
    <article
      className="flex items-start gap-3 p-3 rounded-lg bg-surface-light/30 border border-primary/5 hover:border-primary/15 transition-colors"
      aria-label={`Mood entry: ${entry.mood} - ${entry.journalText.substring(0, 50)}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-primary/20">
        <span className="text-lg" aria-hidden="true">
          {emoji}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-text-primary text-sm font-medium capitalize">
            {entry.mood} mood
          </p>
          <span className="text-text-muted text-xs flex-shrink-0">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </div>
        <p className="text-text-muted text-xs mt-0.5 line-clamp-2">
          {entry.journalText}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              entry.sentimentScore > 0
                ? "bg-success/10 text-success"
                : entry.sentimentScore < 0
                  ? "bg-danger/10 text-danger"
                  : "bg-text-muted/10 text-text-muted"
            }`}
          >
            {sentimentLabel}
          </span>
          <span className="text-text-muted text-xs capitalize">
            {entry.timePeriod}
          </span>
        </div>
      </div>
    </article>
  );
}
