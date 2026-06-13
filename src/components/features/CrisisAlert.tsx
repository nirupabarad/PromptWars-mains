/**
 * Crisis Alert Component
 *
 * Displays emergency mental health resources when crisis is detected.
 * Shown with gentle, non-alarming styling to avoid worsening distress.
 *
 * ACCESSIBILITY:
 * - role="alert" for immediate screen reader announcement
 * - aria-live="assertive" for urgency
 * - Phone numbers are clickable links (tel:)
 * - High contrast for readability during distress
 *
 * DESIGN: Warm and supportive tone, never clinical or scary.
 */

"use client";

import React from "react";
import { EMERGENCY_RESOURCES } from "@/src/utils/constants";

interface CrisisAlertProps {
  /** Whether to show the alert */
  visible: boolean;
  /** Optional custom message */
  message?: string;
}

/**
 * CrisisAlert shows emergency helpline information.
 *
 * @param props - Visibility and optional message
 * @returns Emergency resources banner or null
 */
export function CrisisAlert({
  visible,
  message,
}: CrisisAlertProps): React.JSX.Element | null {
  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-label="Mental health support resources"
      className="rounded-xl p-4 bg-accent/10 border border-accent/30 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          💛
        </span>
        <div className="flex-1">
          <h3 className="text-text-primary font-semibold text-sm">
            You are not alone
          </h3>
          {message && (
            <p className="text-text-primary text-sm mt-1 leading-relaxed">
              {message}
            </p>
          )}
          <div className="mt-3 space-y-2">
            {Object.values(EMERGENCY_RESOURCES).map((resource) => (
              <div
                key={resource.name}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"
              >
                <span className="text-text-primary text-xs font-medium">
                  {resource.name}:
                </span>
                <a
                  href={`tel:${resource.number.replace(/-/g, "")}`}
                  className="text-primary text-xs font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label={`Call ${resource.name} at ${resource.number}`}
                >
                  {resource.number}
                </a>
                <span className="text-text-muted text-xs">
                  ({resource.available})
                </span>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-xs mt-3 italic">
            These are trained professionals who care and want to help.
          </p>
        </div>
      </div>
    </div>
  );
}
