/**
 * Home Page - Comprehensive Mood Check-In
 *
 * Primary entry point for daily wellness logging.
 * Demonstrates separation of concerns:
 * - UI rendering (this file)
 * - API communication (analysisService)
 * - Statistics computation (statistics utility)
 * - State management (WellnessContext)
 *
 * SECURITY: All analysis processing via server-side API routes.
 * ACCESSIBILITY: Proper heading hierarchy, ARIA labels, keyboard navigation.
 * EFFICIENCY: Memoized statistics, service-layer caching, minimal re-renders.
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";

import { MoodSelector } from "@/src/components/ui/MoodSelector";
import { InsightCard } from "@/src/components/ui/InsightCard";
import { JournalInput } from "@/src/components/features/JournalInput";
import { CrisisAlert } from "@/src/components/features/CrisisAlert";

import { useWellness } from "@/src/context/WellnessContext";
import {
  analyzeEntry,
  runPatternAnalysis,
} from "@/src/services/analysisService";
import {
  computeWellnessStatistics,
  getSentimentLabel,
  getSentimentVariantClass,
} from "@/src/utils/statistics";
import {
  generateId,
  getCurrentTimePeriod,
  getTimeGreeting,
  formatRelativeTime,
} from "@/src/utils/helpers";
import { MOOD_EMOJIS } from "@/src/utils/constants";

import type { MoodLevel, MoodEntry, ExamType } from "@/src/types";

/** Minimum entries required to trigger AI pattern analysis */
const PATTERN_ANALYSIS_THRESHOLD = 3;

/** How many new entries before re-triggering analysis */
const PATTERN_REANALYSIS_GAP = 2;

/** Maximum recent activity items to display */
const MAX_ACTIVITY_ITEMS = 10;

/** Daily wellness tips - rotates by day of week */
const DAILY_TIPS: readonly { tip: string; icon: string }[] = [
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
] as const;

/** Exam type option configuration */
const EXAM_OPTIONS: readonly { id: string; emoji: string; name: string }[] = [
  { id: "NEET", emoji: "🩺", name: "NEET" },
  { id: "JEE", emoji: "⚙️", name: "JEE" },
  { id: "UPSC", emoji: "🏛️", name: "UPSC" },
  { id: "other", emoji: "✏️", name: "Other" },
] as const;

/**
 * HomePage renders the comprehensive mood check-in interface.
 * Implements the Controller pattern - coordinates between UI, services, and state.
 *
 * @returns React element for the home page
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

  // EFFICIENCY: Memoize computed values to prevent recalculation on every render
  const greeting = useMemo(() => getTimeGreeting(), []);
  const todayTip = useMemo(
    () => DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length],
    [],
  );
  const statistics = useMemo(
    () => computeWellnessStatistics(state.entries),
    [state.entries],
  );

  /**
   * Handles journal entry submission.
   * Orchestrates: validation → API call → state update → pattern analysis.
   */
  const handleEntrySubmit = useCallback(
    async (text: string) => {
      if (!selectedMood) {
        setFeedback("Please select a mood first.");
        return;
      }

      setIsLoading(true);
      setFeedback(null);
      setCrisisVisible(false);

      const result = await analyzeEntry({ text, mood: selectedMood });

      if (!result.success || !result.data) {
        setFeedback(result.error || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      const entry: MoodEntry = {
        id: generateId(),
        mood: selectedMood,
        journalText: text,
        timestamp: Date.now(),
        sentimentScore: result.data.sentiment.score,
        timePeriod: getCurrentTimePeriod(),
      };

      addEntry(entry);
      handleCrisisDetection(result.data.crisis);
      triggerBackgroundPatternAnalysis(entry);

      setFeedback("Thank you for sharing. Your entry has been logged. 💜");
      setSelectedMood(null);
      setIsLoading(false);
    },
    [
      selectedMood,
      addEntry,
      state.entries,
      state.examType,
      state.lastAnalysisEntryCount,
      dispatch,
    ],
  );

  /**
   * Handles crisis detection result - shows resources if needed.
   */
  const handleCrisisDetection = useCallback(
    (crisis: { showResources: boolean; recommendation: string }) => {
      if (!crisis.showResources) return;
      setCrisisVisible(true);
      setCrisisMessage(crisis.recommendation);
    },
    [],
  );

  /**
   * Triggers background pattern analysis after sufficient entries.
   * Non-blocking - does not affect UI responsiveness.
   */
  const triggerBackgroundPatternAnalysis = useCallback(
    (newEntry: MoodEntry) => {
      const newEntryCount = state.entries.length + 1;
      const shouldAnalyze =
        newEntryCount >= PATTERN_ANALYSIS_THRESHOLD &&
        newEntryCount > state.lastAnalysisEntryCount + PATTERN_REANALYSIS_GAP;

      if (!shouldAnalyze) return;

      runPatternAnalysis({
        entries: [newEntry, ...state.entries],
        examType: state.examType,
      }).then((result) => {
        if (result.success && result.data) {
          dispatch({ type: "SET_WEEKLY_REPORT", payload: result.data });
        }
      });
    },
    [state.entries, state.examType, state.lastAnalysisEntryCount, dispatch],
  );

  /**
   * Handles exam type selection change.
   */
  const handleExamChange = useCallback(
    (value: string) => {
      if (value === "other") {
        setShowCustomExam(true);
        return;
      }
      setShowCustomExam(false);
      setCustomExam("");
      dispatch({ type: "SET_EXAM_TYPE", payload: value as ExamType });
    },
    [dispatch],
  );

  /**
   * Handles clearing all session data with confirmation.
   */
  const handleClearData = useCallback(() => {
    const confirmed = window.confirm(
      "This will clear all your mood entries and chat history. Are you sure?",
    );
    if (!confirmed) return;
    dispatch({ type: "CLEAR_ALL_DATA" });
    setFeedback(null);
    setCrisisVisible(false);
  }, [dispatch]);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hero Welcome Section */}
      <WelcomeSection greeting={greeting} tip={todayTip} />

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

      {/* Journal Input */}
      <section aria-label="Journal entry" className="glass-card p-5">
        <JournalInput
          onSubmit={handleEntrySubmit}
          isLoading={isLoading}
          currentMood={selectedMood}
        />
      </section>

      {/* Feedback */}
      {feedback && <FeedbackBanner message={feedback} />}

      {/* Crisis Alert */}
      <CrisisAlert visible={crisisVisible} message={crisisMessage} />

      {/* Statistics */}
      <StatisticsSection statistics={statistics} />

      {/* Recent Activity */}
      <ActivitySection entries={state.entries} />

      {/* Exam Type */}
      <ExamTypeSection
        examType={state.examType}
        showCustomExam={showCustomExam}
        customExam={customExam}
        onExamChange={handleExamChange}
        onCustomExamChange={setCustomExam}
      />

      {/* Privacy */}
      <PrivacySection onClearData={handleClearData} />
    </div>
  );
}

// ─── SUB-COMPONENTS (Single Responsibility) ─────────────────────────────────

/** Welcome section with greeting and daily tip */
function WelcomeSection({
  greeting,
  tip,
}: {
  greeting: string;
  tip: { tip: string; icon: string };
}): React.JSX.Element {
  return (
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
          Take a moment to check in with yourself.
        </p>
        <div className="mt-4 flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
          <span className="text-lg" aria-hidden="true">
            {tip.icon}
          </span>
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-wider">
              Daily Tip
            </p>
            <p className="text-text-primary text-sm mt-0.5">{tip.tip}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Feedback banner for success/error messages */
function FeedbackBanner({ message }: { message: string }): React.JSX.Element {
  const isSuccess = message.includes("Thank you");
  return (
    <div
      role="status"
      aria-live="polite"
      className={`text-center text-sm p-3 rounded-xl border ${
        isSuccess
          ? "text-success bg-success/5 border-success/20"
          : "text-warning bg-warning/5 border-warning/20"
      }`}
    >
      {message}
    </div>
  );
}

/** Statistics grid section */
function StatisticsSection({
  statistics,
}: {
  statistics: ReturnType<typeof computeWellnessStatistics>;
}): React.JSX.Element {
  return (
    <section aria-label="Wellness statistics">
      <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
        <span aria-hidden="true">📊</span> Your Wellness Stats
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InsightCard
          title="Mood Streak"
          value={`${statistics.streak} days`}
          icon="🔥"
          variant={statistics.streak >= 3 ? "success" : "default"}
          description={statistics.streakLabel}
        />
        <InsightCard
          title="Check-ins"
          value={`${statistics.totalEntries}`}
          icon="📝"
          description="Total entries"
        />
        <InsightCard
          title="Avg Mood"
          value={statistics.averageMoodLabel}
          icon="📈"
          variant={statistics.moodVariant}
          description="Out of 5.0"
        />
        <InsightCard
          title="Best Mood"
          value={statistics.bestMoodEmoji}
          icon="⭐"
          variant="success"
          description="Your peak moment"
        />
      </div>
    </section>
  );
}

/** Recent activity feed section */
function ActivitySection({
  entries,
}: {
  entries: readonly MoodEntry[];
}): React.JSX.Element {
  return (
    <section aria-label="Recent activity" className="glass-card p-5">
      <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
        <span aria-hidden="true">🕐</span> Recent Activity
      </h3>
      {entries.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {entries.slice(0, MAX_ACTIVITY_ITEMS).map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyActivityState />
      )}
    </section>
  );
}

/** Single activity item in the feed */
function ActivityItem({ entry }: { entry: MoodEntry }): React.JSX.Element {
  const { emoji } = MOOD_EMOJIS[entry.mood];
  const sentimentLabel = getSentimentLabel(entry.sentimentScore);
  const sentimentClass = getSentimentVariantClass(entry.sentimentScore);

  return (
    <article
      className="flex items-start gap-3 p-3 rounded-lg bg-surface-light/30 border border-primary/5 hover:border-primary/15 transition-colors"
      aria-label={`Mood entry: ${entry.mood}`}
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
            className={`text-xs px-2 py-0.5 rounded-full ${sentimentClass}`}
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

/** Empty state when no entries exist */
function EmptyActivityState(): React.JSX.Element {
  return (
    <div className="text-center py-6">
      <p className="text-3xl mb-2" aria-hidden="true">
        📭
      </p>
      <p className="text-text-muted text-sm">No entries yet.</p>
      <p className="text-text-muted text-xs mt-1">
        Select your mood and share your thoughts to get started!
      </p>
    </div>
  );
}

/** Exam type selection section */
function ExamTypeSection({
  examType,
  showCustomExam,
  customExam,
  onExamChange,
  onCustomExamChange,
}: {
  examType: ExamType;
  showCustomExam: boolean;
  customExam: string;
  onExamChange: (value: string) => void;
  onCustomExamChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <section aria-label="Exam preparation settings" className="glass-card p-5">
      <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
        <span aria-hidden="true">🎯</span> I am preparing for
      </h3>
      <p className="text-text-muted text-xs mb-3">
        This helps MindMate give you exam-specific strategies.
      </p>
      <div className="space-y-3">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          role="radiogroup"
          aria-label="Select exam type"
        >
          {EXAM_OPTIONS.map((option) => {
            const isSelected =
              (!showCustomExam && examType === option.id) ||
              (option.id === "other" && showCustomExam);
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Preparing for ${option.name}`}
                onClick={() => onExamChange(option.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background ${isSelected ? "bg-primary/15 border-primary text-primary" : "bg-surface border-primary/10 text-text-muted hover:border-primary/40 hover:text-text-primary"}`}
              >
                <span aria-hidden="true">{option.emoji}</span>
                {option.name}
              </button>
            );
          })}
        </div>
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
              onChange={(e) => onCustomExamChange(e.target.value)}
              placeholder="e.g., CAT, GATE, Board Exams..."
              maxLength={50}
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-primary/20 text-text-primary text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** Privacy notice and clear data button */
function PrivacySection({
  onClearData,
}: {
  onClearData: () => void;
}): React.JSX.Element {
  return (
    <section aria-label="Privacy notice" className="text-center space-y-1">
      <p className="text-text-muted text-xs flex items-center justify-center gap-1">
        <span aria-hidden="true">🔒</span> Your data stays in your browser.
        Nothing is stored permanently.
      </p>
      <button
        type="button"
        onClick={onClearData}
        className="text-danger/70 text-xs hover:text-danger hover:underline focus:outline-none focus:ring-2 focus:ring-danger rounded px-2 py-1"
        aria-label="Clear all session data"
      >
        Clear all data
      </button>
    </section>
  );
}
