/**
 * Insight Card Component
 *
 * Glassmorphism-styled card for displaying wellness metrics
 * and pattern insights with visual appeal.
 *
 * ACCESSIBILITY:
 * - Semantic structure with heading and description
 * - High contrast text on all backgrounds
 * - Not reliant on color alone for meaning
 */

"use client";

import React from "react";

interface InsightCardProps {
  /** Card title/label */
  title: string;
  /** Primary metric or value to display */
  value: string;
  /** Icon or emoji to show */
  icon: string;
  /** Optional description text */
  description?: string;
  /** Color variant */
  variant?: "default" | "success" | "warning" | "danger";
}

/**
 * InsightCard renders a glassmorphism-styled metric card.
 *
 * @param props - Card content and styling options
 * @returns Styled insight card element
 */
export function InsightCard({
  title,
  value,
  icon,
  description,
  variant = "default",
}: InsightCardProps): React.JSX.Element {
  const variantStyles = {
    default: "border-primary/30",
    success: "border-success/30",
    warning: "border-warning/30",
    danger: "border-danger/30",
  };

  return (
    <article
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-surface/80 backdrop-blur-md border ${variantStyles[variant]}
        hover:shadow-lg transition-shadow duration-200
      `}
      aria-label={`${title}: ${value}`}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-60" />

      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-text-muted text-xs uppercase tracking-wider font-medium">
            {title}
          </p>
          <p className="text-text-primary text-xl font-bold mt-0.5">{value}</p>
          {description && (
            <p className="text-text-muted text-xs mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
