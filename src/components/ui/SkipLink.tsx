/**
 * Skip Link Component
 *
 * ACCESSIBILITY: Provides a skip-to-main-content link for keyboard users.
 * Hidden visually but accessible to screen readers and keyboard navigation.
 * Becomes visible on focus for keyboard users.
 */

"use client";

import React from "react";

/**
 * SkipLink renders a hidden link that becomes visible on focus.
 * Allows keyboard users to skip navigation and jump to main content.
 */
export function SkipLink(): React.JSX.Element {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
