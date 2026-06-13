/**
 * Toolbox Page - Coping Exercises Library
 *
 * Browse all available coping strategies organized by category.
 * Includes breathing exercises, study techniques, and more.
 *
 * ACCESSIBILITY: Proper headings, expandable sections, keyboard navigation.
 */

"use client";

import React, { useState } from "react";
import { BreathingExercise } from "@/src/components/features/BreathingExercise";
import { CrisisAlert } from "@/src/components/features/CrisisAlert";
import { useWellness } from "@/src/context/WellnessContext";
import {
  COPING_STRATEGIES,
  STRATEGIES_BY_CATEGORY,
} from "@/src/utils/constants";
import type { RecommendationCategory, Recommendation } from "@/src/types";

const CATEGORY_LABELS: Record<
  RecommendationCategory,
  { label: string; icon: string }
> = {
  breathing: { label: "Breathing Exercises", icon: "🌬️" },
  mindfulness: { label: "Mindfulness", icon: "🧘" },
  physical: { label: "Physical Activity", icon: "🏃" },
  cognitive: { label: "Cognitive Techniques", icon: "🧠" },
  social: { label: "Social Connection", icon: "🤝" },
  "study-technique": { label: "Study Techniques", icon: "📚" },
};

/**
 * ToolboxPage renders the full coping strategies library.
 *
 * @returns Toolbox page component
 */
export default function ToolboxPage(): React.JSX.Element {
  const { state } = useWellness();
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);

  const toggleStrategy = (id: string) => {
    setExpandedStrategy((prev) => (prev === id ? null : id));
    if (COPING_STRATEGIES.find((s) => s.id === id)?.category === "breathing") {
      setShowBreathing(true);
    } else {
      setShowBreathing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section aria-label="Toolbox header">
        <h2 className="text-2xl font-bold text-text-primary">
          Wellness Toolbox 🧰
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Explore coping strategies and exercises. Pick one that resonates with
          you today.
        </p>
      </section>

      {/* Breathing exercise widget */}
      {showBreathing && (
        <section aria-label="Interactive breathing exercise">
          <BreathingExercise reducedMotion={state.reducedMotion} />
        </section>
      )}

      {/* Strategies by category */}
      {(Object.keys(STRATEGIES_BY_CATEGORY) as RecommendationCategory[]).map(
        (category) => {
          const { label, icon } = CATEGORY_LABELS[category];
          const strategies = COPING_STRATEGIES.filter(
            (s) => s.category === category,
          );

          return (
            <section key={category} aria-label={label}>
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-3">
                <span aria-hidden="true">{icon}</span>
                {label}
              </h3>
              <div className="space-y-2">
                {strategies.map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    isExpanded={expandedStrategy === strategy.id}
                    onToggle={() => toggleStrategy(strategy.id)}
                  />
                ))}
              </div>
            </section>
          );
        },
      )}

      {/* Emergency resources */}
      <section aria-label="Emergency resources">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          Need Immediate Support?
        </h3>
        <CrisisAlert
          visible={true}
          message="If you are in crisis or need someone to talk to, these resources are available around the clock."
        />
      </section>
    </div>
  );
}

/** Strategy Card sub-component */
interface StrategyCardProps {
  strategy: Recommendation;
  isExpanded: boolean;
  onToggle: () => void;
}

function StrategyCard({
  strategy,
  isExpanded,
  onToggle,
}: StrategyCardProps): React.JSX.Element {
  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`strategy-${strategy.id}`}
        className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
      >
        <div>
          <p className="text-text-primary text-sm font-medium">
            {strategy.title}
          </p>
          <p className="text-text-muted text-xs mt-0.5">{strategy.duration}</p>
        </div>
        <span
          className={`text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div
          id={`strategy-${strategy.id}`}
          className="px-4 pb-4 pt-1 border-t border-primary/10 animate-fade-in"
        >
          <p className="text-text-muted text-sm mb-3">{strategy.description}</p>
          <ol className="space-y-1.5" aria-label="Steps">
            {strategy.steps.map((step, index) => (
              <li key={index} className="flex gap-2 text-text-primary text-sm">
                <span className="text-primary font-bold text-xs mt-0.5">
                  {index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-secondary text-xs mt-3 italic">
            💡 {strategy.examContext}
          </p>
        </div>
      )}
    </div>
  );
}
