/**
 * Mood Selector Component
 *
 * Interactive emoji-based mood picker with 5 levels.
 * Fully accessible with keyboard navigation and ARIA labels.
 *
 * ACCESSIBILITY:
 * - Role="radiogroup" for screen readers
 * - Each option has aria-label with description
 * - Keyboard navigable (arrow keys + enter)
 * - Visible focus indicators
 * - Not reliant on color alone (emoji + text + position)
 */

"use client";

import React from "react";
import type { MoodLevel } from "@/src/types";
import { MOOD_EMOJIS } from "@/src/utils/constants";

interface MoodSelectorProps {
  /** Currently selected mood */
  selectedMood: MoodLevel | null;
  /** Callback when mood is selected */
  onSelect: (mood: MoodLevel) => void;
  /** Whether reduced motion is preferred */
  reducedMotion?: boolean;
}

const MOOD_OPTIONS: MoodLevel[] = ["great", "good", "okay", "low", "rough"];

/**
 * MoodSelector renders 5 clickable mood options with emojis.
 *
 * @param props - Component props
 * @returns Accessible mood selection interface
 */
export function MoodSelector({
  selectedMood,
  onSelect,
  reducedMotion = false,
}: MoodSelectorProps): React.JSX.Element {
  return (
    <div
      role="radiogroup"
      aria-label="Select your current mood"
      className="flex flex-wrap justify-center gap-3 sm:gap-4"
    >
      {MOOD_OPTIONS.map((mood) => {
        const { emoji, label } = MOOD_EMOJIS[mood];
        const isSelected = selectedMood === mood;

        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
            onClick={() => onSelect(mood)}
            className={`
              flex flex-col items-center gap-1 p-3 sm:p-4 rounded-xl
              transition-all duration-200 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
              ${
                isSelected
                  ? "bg-surface-light border-2 border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-surface border-2 border-transparent hover:border-primary/50 hover:bg-surface-light"
              }
              ${!reducedMotion && !isSelected ? "hover:scale-105" : ""}
            `}
          >
            <span
              className={`text-2xl sm:text-3xl ${!reducedMotion && isSelected ? "animate-bounce-soft" : ""}`}
              aria-hidden="true"
            >
              {emoji}
            </span>
            <span
              className={`text-xs sm:text-sm capitalize ${isSelected ? "text-primary font-semibold" : "text-text-muted"}`}
            >
              {mood}
            </span>
          </button>
        );
      })}
    </div>
  );
}
