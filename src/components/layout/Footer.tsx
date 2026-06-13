/**
 * Footer Component
 *
 * Application footer with emergency resources quick link
 * and privacy notice.
 *
 * ACCESSIBILITY:
 * - Semantic footer element
 * - Emergency link always accessible
 * - Clear privacy statement
 */

"use client";

import React from "react";

/**
 * Footer renders the app footer with resources and privacy info.
 *
 * @returns Semantic footer element
 */
export function Footer(): React.JSX.Element {
  return (
    <footer className="pb-20 sm:pb-4 px-4 py-4 border-t border-primary/10 mt-8">
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <p className="text-text-muted text-xs">
          🔒 Your data stays in your browser. Nothing is stored or sent to any
          server.
        </p>
        <p className="text-text-muted text-xs">
          If you are in crisis, call{" "}
          <a
            href="tel:18005990019"
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            aria-label="Call KIRAN helpline at 1800-599-0019"
          >
            KIRAN: 1800-599-0019
          </a>{" "}
          (24/7, toll-free)
        </p>
        <p className="text-text-muted text-xs opacity-60">
          MindMate is not a substitute for professional mental health care.
        </p>
      </div>
    </footer>
  );
}
