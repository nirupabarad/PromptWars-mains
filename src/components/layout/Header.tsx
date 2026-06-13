/**
 * Header Component
 *
 * Application header with branding and accessibility toggles.
 *
 * ACCESSIBILITY:
 * - Semantic header element
 * - Site title in h1 for page structure
 * - Toggle buttons have clear aria-labels
 */

"use client";

import React from "react";
import { useWellness } from "@/src/context/WellnessContext";

/**
 * Header renders the app branding and accessibility controls.
 */
export function Header(): React.JSX.Element {
  const { state, dispatch } = useWellness();

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-primary/10 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white text-lg" aria-hidden="true">
              🧠
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              MindMate
            </h1>
            <p className="text-text-muted text-[10px] leading-tight">
              Your wellness companion
            </p>
          </div>
        </div>

        {/* Accessibility controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_REDUCED_MOTION" })}
            aria-label={
              state.reducedMotion ? "Enable animations" : "Reduce motion"
            }
            aria-pressed={state.reducedMotion}
            className="p-2 rounded-lg text-sm hover:bg-surface-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            title="Toggle reduced motion"
          >
            {state.reducedMotion ? "▶️" : "⏸️"}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_HIGH_CONTRAST" })}
            aria-label={
              state.highContrastMode
                ? "Disable high contrast"
                : "Enable high contrast"
            }
            aria-pressed={state.highContrastMode}
            className="p-2 rounded-lg text-sm hover:bg-surface-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            title="Toggle high contrast"
          >
            {state.highContrastMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
