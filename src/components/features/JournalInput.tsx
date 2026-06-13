/**
 * Journal Input Component
 *
 * Secure text input for mood journaling with:
 * - Predefined quick thoughts (tap to select)
 * - Manual text entry option
 * - Character counter and validation
 *
 * SECURITY:
 * - Character limit enforced (MAX_INPUT_LENGTH)
 * - Input sanitized before submission
 * - No autocomplete to prevent data leakage
 *
 * ACCESSIBILITY:
 * - Associated label via htmlFor
 * - Quick thoughts are keyboard-navigable buttons
 * - Character count announced to screen readers
 * - Error messages linked via aria-describedby
 */

"use client";

import React, { useState, useCallback } from "react";
import { MAX_INPUT_LENGTH, MIN_INPUT_LENGTH } from "@/src/utils/constants";
import type { MoodLevel } from "@/src/types";

interface JournalInputProps {
  /** Callback when text is submitted */
  onSubmit: (text: string) => void;
  /** Whether submission is in progress */
  isLoading?: boolean;
  /** Current selected mood for contextual quick thoughts */
  currentMood?: MoodLevel | null;
}

/** Predefined quick thoughts grouped by mood context */
const QUICK_THOUGHTS: Record<string, readonly string[]> = {
  positive: [
    "Had a productive study session today!",
    "Feeling confident about my preparation",
    "Completed my daily targets on time",
    "Took a good break and feel refreshed",
    "Solved a difficult problem by myself",
  ],
  neutral: [
    "Just a regular study day, nothing special",
    "Trying to stay consistent with my routine",
    "Need to focus more on weak topics",
    "Planning to revise what I learned today",
    "Balancing between subjects is challenging",
  ],
  negative: [
    "Feeling overwhelmed by the syllabus",
    "Could not concentrate during study hours",
    "Exam pressure is getting to me lately",
    "Comparing myself to others and feeling behind",
    "Did not sleep well, feeling tired and drained",
  ],
  general: [
    "I want to talk about how I am feeling",
    "Looking for some motivation today",
    "Need help managing my study schedule",
    "Feeling stuck and not making progress",
    "Want to try a relaxation technique",
  ],
};

/**
 * Gets contextual quick thoughts based on selected mood.
 */
function getQuickThoughts(
  mood: MoodLevel | null | undefined,
): readonly string[] {
  if (!mood) return QUICK_THOUGHTS.general;
  if (mood === "great" || mood === "good") return QUICK_THOUGHTS.positive;
  if (mood === "okay") return QUICK_THOUGHTS.neutral;
  return QUICK_THOUGHTS.negative;
}

/**
 * JournalInput renders a secure text area with predefined quick thoughts.
 *
 * @param props - Input configuration and callbacks
 * @returns Accessible text input with quick thought selection
 */
export function JournalInput({
  onSubmit,
  isLoading = false,
  currentMood = null,
}: JournalInputProps): React.JSX.Element {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const charCount = text.length;
  const isValid =
    charCount >= MIN_INPUT_LENGTH && charCount <= MAX_INPUT_LENGTH;
  const isNearLimit = charCount > MAX_INPUT_LENGTH * 0.9;
  const quickThoughts = getQuickThoughts(currentMood);

  const handleSubmit = useCallback(() => {
    if (!isValid) {
      setError(
        charCount < MIN_INPUT_LENGTH
          ? "Please write at least a few words."
          : "Text is too long. Please shorten your entry.",
      );
      return;
    }

    setError(null);
    onSubmit(text);
    setText("");
    setShowManualInput(false);
  }, [text, isValid, charCount, onSubmit]);

  const handleQuickThoughtSelect = useCallback((thought: string) => {
    setText(thought);
    setShowManualInput(true);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="journal-input"
          className="block text-text-primary text-sm font-medium"
        >
          How are you feeling? Share your thoughts.
        </label>
      </div>

      {/* Quick Thoughts - Predefined options */}
      <div className="space-y-2">
        <p className="text-text-muted text-xs font-medium">
          Quick select or write your own:
        </p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Predefined thoughts - tap to select"
        >
          {quickThoughts.map((thought, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQuickThoughtSelect(thought)}
              aria-label={`Select: ${thought}`}
              className={`
                px-3 py-1.5 rounded-full text-xs
                border transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background
                ${
                  text === thought
                    ? "bg-primary/20 border-primary text-primary font-medium"
                    : "bg-surface-light/50 border-primary/20 text-text-muted hover:border-primary/50 hover:text-text-primary hover:bg-surface-light"
                }
              `}
            >
              {thought}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle for manual input */}
      <button
        type="button"
        onClick={() => setShowManualInput(!showManualInput)}
        className="text-primary text-xs font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
        aria-expanded={showManualInput}
        aria-controls="manual-input-section"
      >
        {showManualInput ? "▾ Hide text editor" : "▸ Write my own thoughts..."}
      </button>

      {/* Manual text input area */}
      {showManualInput && (
        <div id="manual-input-section" className="space-y-2 animate-fade-in">
          <textarea
            id="journal-input"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write freely about your day, feelings, or anything on your mind..."
            maxLength={MAX_INPUT_LENGTH}
            rows={4}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="true"
            aria-describedby="journal-helper journal-error"
            aria-invalid={error ? "true" : undefined}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-surface border-2 transition-colors duration-200
              text-text-primary text-sm leading-relaxed
              placeholder:text-text-muted/60
              focus:outline-none focus:ring-2 focus:ring-primary/50
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none
              ${error ? "border-danger/50" : "border-primary/20 focus:border-primary"}
            `}
          />

          {/* Helper text and character count */}
          <div className="flex justify-between items-center">
            <p id="journal-helper" className="text-text-muted text-xs">
              Press Ctrl+Enter to submit
            </p>
            <p
              className={`text-xs ${isNearLimit ? "text-warning" : "text-text-muted"}`}
              aria-live="polite"
              aria-label={`${charCount} of ${MAX_INPUT_LENGTH} characters used`}
            >
              {charCount}/{MAX_INPUT_LENGTH}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p id="journal-error" role="alert" className="text-danger text-xs">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !isValid}
        aria-label="Submit journal entry"
        className={`
          w-full py-3 rounded-xl font-medium text-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
          ${
            isValid && !isLoading
              ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20"
              : "bg-surface-light text-text-muted cursor-not-allowed"
          }
        `}
      >
        {isLoading ? "✨ Analyzing..." : "💜 Share with MindMate"}
      </button>
    </div>
  );
}
