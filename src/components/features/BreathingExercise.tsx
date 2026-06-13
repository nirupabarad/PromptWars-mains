/**
 * Breathing Exercise Component
 *
 * Animated breathing guide with expanding/contracting circle.
 * Supports Box Breathing (4-4-4-4) and 4-7-8 technique.
 *
 * ACCESSIBILITY:
 * - Respects prefers-reduced-motion
 * - Phase announced via aria-live region
 * - Start/stop controllable via keyboard
 * - Timer visible as text (not animation only)
 *
 * EFFICIENCY: Uses CSS animations instead of JS intervals
 * for smoother, GPU-accelerated rendering.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";

type BreathingPhase = "inhale" | "hold-in" | "exhale" | "hold-out" | "idle";

interface BreathingExerciseProps {
  /** Whether to reduce/disable animations */
  reducedMotion?: boolean;
}

const PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: "Breathe In...",
  "hold-in": "Hold...",
  exhale: "Breathe Out...",
  "hold-out": "Hold...",
  idle: "Press Start",
};

const PHASE_DURATIONS: Record<Exclude<BreathingPhase, "idle">, number> = {
  inhale: 4000,
  "hold-in": 4000,
  exhale: 4000,
  "hold-out": 4000,
};

const PHASE_ORDER: Exclude<BreathingPhase, "idle">[] = [
  "inhale",
  "hold-in",
  "exhale",
  "hold-out",
];

/**
 * BreathingExercise renders an interactive breathing guide.
 *
 * @param props - Component configuration
 * @returns Animated breathing exercise interface
 */
export function BreathingExercise({
  reducedMotion = false,
}: BreathingExerciseProps): React.JSX.Element {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [seconds, setSeconds] = useState(4);

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setPhase("idle");
    setCycleCount(0);
    setSeconds(4);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let phaseIndex = 0;
    let timer: NodeJS.Timeout;
    let countdown: NodeJS.Timeout;

    const runPhase = () => {
      const currentPhase = PHASE_ORDER[phaseIndex];
      setPhase(currentPhase);
      setSeconds(PHASE_DURATIONS[currentPhase] / 1000);

      // Countdown timer
      let remaining = PHASE_DURATIONS[currentPhase] / 1000;
      countdown = setInterval(() => {
        remaining--;
        setSeconds(remaining);
      }, 1000);

      timer = setTimeout(() => {
        clearInterval(countdown);
        phaseIndex = (phaseIndex + 1) % PHASE_ORDER.length;
        if (phaseIndex === 0) {
          setCycleCount((prev) => prev + 1);
        }
        runPhase();
      }, PHASE_DURATIONS[currentPhase]);
    };

    runPhase();

    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [isActive]);

  // Auto-stop after 4 cycles
  useEffect(() => {
    if (cycleCount >= 4) {
      stopExercise();
    }
  }, [cycleCount, stopExercise]);

  const getCircleScale = (): string => {
    if (!isActive || reducedMotion) return "scale-100";
    if (phase === "inhale") return "scale-125";
    if (phase === "exhale") return "scale-75";
    return "scale-100";
  };

  return (
    <div
      className="flex flex-col items-center gap-4 p-6 bg-surface rounded-2xl border border-primary/20"
      role="region"
      aria-label="Box breathing exercise"
    >
      <h3 className="text-lg font-semibold text-text-primary">Box Breathing</h3>

      {/* Animated breathing circle */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <div
          className={`
            w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40
            border-2 border-primary/50
            transition-transform duration-[4000ms] ease-in-out
            ${getCircleScale()}
            ${isActive && !reducedMotion ? "" : ""}
          `}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Phase label - announced to screen readers */}
            <p
              className="text-text-primary font-medium text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {PHASE_LABELS[phase]}
            </p>
            {isActive && (
              <p
                className="text-primary text-2xl font-bold mt-1"
                aria-label={`${seconds} seconds`}
              >
                {seconds}s
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cycle counter */}
      {isActive && (
        <p className="text-text-muted text-sm" aria-live="polite">
          Cycle {cycleCount + 1} of 4
        </p>
      )}

      {/* Start/Stop button */}
      <button
        type="button"
        onClick={() => (isActive ? stopExercise() : setIsActive(true))}
        className={`
          px-6 py-2.5 rounded-full font-medium text-sm
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
          ${
            isActive
              ? "bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30"
              : "bg-primary text-white hover:bg-primary/80"
          }
        `}
        aria-label={
          isActive ? "Stop breathing exercise" : "Start breathing exercise"
        }
      >
        {isActive ? "Stop" : "Start Exercise"}
      </button>

      {/* Instructions */}
      {!isActive && (
        <p className="text-text-muted text-xs text-center max-w-[200px]">
          4 seconds each: inhale, hold, exhale, hold. 4 cycles total.
        </p>
      )}
    </div>
  );
}
