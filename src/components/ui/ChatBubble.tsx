/**
 * Chat Bubble Component
 *
 * Renders a single chat message with appropriate styling
 * based on the sender (user or assistant).
 *
 * ACCESSIBILITY:
 * - Role="article" for screen reader context
 * - Aria-label identifies speaker and time
 * - Proper heading hierarchy within bubbles
 *
 * SECURITY: Content is rendered as text, never as HTML.
 * No dangerouslySetInnerHTML used.
 */

"use client";

import React from "react";
import type { ChatMessage } from "@/src/types";
import { formatRelativeTime } from "@/src/utils/helpers";

interface ChatBubbleProps {
  /** The chat message to display */
  message: ChatMessage;
}

/**
 * ChatBubble renders a styled message bubble.
 * Assistant messages appear on the left (purple), user messages on the right (teal).
 *
 * @param props - Component props with message data
 * @returns Styled chat bubble element
 */
export function ChatBubble({ message }: ChatBubbleProps): React.JSX.Element {
  const isAssistant = message.role === "assistant";
  const timeString = formatRelativeTime(message.timestamp);

  return (
    <div
      role="article"
      aria-label={`${isAssistant ? "MindMate" : "You"} said: ${message.content}`}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"} animate-slide-up`}
    >
      <div
        className={`
          max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3
          ${
            isAssistant
              ? "bg-surface-light border border-primary/30 rounded-bl-md"
              : "bg-secondary/20 border border-secondary/30 rounded-br-md"
          }
        `}
      >
        {/* Speaker label */}
        <p
          className={`text-xs font-semibold mb-1 ${isAssistant ? "text-primary" : "text-secondary"}`}
        >
          {isAssistant ? "🧠 MindMate" : "You"}
        </p>

        {/* Message content - rendered as text only (SECURITY) */}
        <p className="text-text-primary text-sm leading-relaxed">
          {message.content}
        </p>

        {/* Crisis alert indicator */}
        {message.crisisAlert && (
          <div
            className="mt-2 p-2 bg-danger/10 border border-danger/30 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-danger text-xs font-medium">
              💛 Support resources available below
            </p>
          </div>
        )}

        {/* Timestamp */}
        <p
          className="text-text-muted text-xs mt-2"
          aria-label={`Sent ${timeString}`}
        >
          {timeString}
        </p>
      </div>
    </div>
  );
}
