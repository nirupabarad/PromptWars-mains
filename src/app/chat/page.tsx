/**
 * Chat Page - AI Wellness Companion with Long-Term Memory
 *
 * Conversational interface powered by Gemini AI.
 * KEY DIFFERENTIATOR: The AI references past journal entries and
 * detected patterns to provide hyper-personalized support.
 *
 * SECURITY: All processing via server-side API routes.
 * ACCESSIBILITY: aria-live for messages, keyboard navigation.
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ChatBubble } from "@/src/components/ui/ChatBubble";
import { CrisisAlert } from "@/src/components/features/CrisisAlert";
import { BreathingExercise } from "@/src/components/features/BreathingExercise";
import { useWellness } from "@/src/context/WellnessContext";
import { generateId } from "@/src/utils/helpers";
import { sanitizeText } from "@/src/utils/validators";
import { MAX_INPUT_LENGTH } from "@/src/utils/constants";
import type { ChatMessage } from "@/src/types";

export default function ChatPage(): React.JSX.Element {
  const { state, addChatMessage } = useWellness();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [crisisVisible, setCrisisVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatMessages]);

  // Welcome message with context awareness
  useEffect(() => {
    if (state.chatMessages.length === 0) {
      let welcomeText =
        "Hi there! I am MindMate, your personal wellness companion. 💜\n\n";

      if (state.entries.length > 0 && state.weeklyReport) {
        welcomeText += `I have been tracking your journey — you have ${state.entries.length} check-ins so far. Based on your patterns, I know what has been tough and what helps you. Ask me anything or just vent — I am here.\n\nI remember your recent experiences and can give you personalized support.`;
      } else if (state.entries.length > 0) {
        welcomeText += `I can see you have logged ${state.entries.length} entries. Tell me how you are feeling, and I will draw from what I know about your patterns to help.`;
      } else {
        welcomeText +=
          "I am here to listen, help you track your mental wellness, and give you personalized coping strategies for your exam preparation. Start by telling me how you are feeling today.";
      }

      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: welcomeText,
        timestamp: Date.now(),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const sanitized = sanitizeText(trimmed);
    if (sanitized.length < 2) return;

    setInput("");
    setIsLoading(true);
    setCrisisVisible(false);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: sanitized,
      timestamp: Date.now(),
    };
    addChatMessage(userMessage);

    try {
      // Send to chat API with FULL CONTEXT for personalization
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sanitized,
          mood: state.entries[0]?.mood || "okay",
          examType: state.examType,
          recentMoods: state.entries.slice(0, 10).map((e) => e.mood),
          // LONG-TERM MEMORY: Pass recent entries for context
          recentEntries: state.entries.slice(0, 7).map((e) => ({
            mood: e.mood,
            journalText: e.journalText,
            timestamp: e.timestamp,
            sentimentScore: e.sentimentScore,
            timePeriod: e.timePeriod,
          })),
          // PATTERN AWARENESS: Pass weekly report so AI references triggers
          weeklyReport: state.weeklyReport
            ? {
                summary: state.weeklyReport.summary,
                hiddenTriggers: state.weeklyReport.hiddenTriggers,
                emotionalPatterns: state.weeklyReport.emotionalPatterns,
                recommendations: state.weeklyReport.recommendations,
                moodTrajectory: state.weeklyReport.moodTrajectory,
              }
            : null,
        }),
      });

      if (!response.ok) throw new Error("Chat failed");
      const data = await response.json();

      if (data.crisis) setCrisisVisible(true);

      const lowerResponse = (data.response || "").toLowerCase();
      if (
        lowerResponse.includes("breathing") ||
        lowerResponse.includes("breathe")
      ) {
        setShowBreathing(true);
      }

      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: data.response || "I hear you. Let me think about how to help.",
        timestamp: Date.now(),
        crisisAlert: data.crisis,
      });
    } catch {
      addChatMessage({
        id: generateId(),
        role: "assistant",
        content: "I could not process that right now. Could you try again?",
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, state, addChatMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = state.weeklyReport
    ? [
        "What patterns have you noticed?",
        "What are my stress triggers?",
        "Help me with my biggest challenge",
        "I need a coping strategy",
      ]
    : [
        "I am feeling stressed about exams",
        "Help me relax right now",
        "I need study tips",
        "Tell me something motivating",
      ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-fade-in">
      <h2 className="sr-only">MindMate Companion Chat</h2>

      {/* Pattern awareness badge */}
      {state.weeklyReport && (
        <div className="mb-3 px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg flex items-center gap-2">
          <span aria-hidden="true">🧠</span>
          <p className="text-secondary text-xs">
            AI is aware of your patterns and{" "}
            {state.weeklyReport.hiddenTriggers.length} identified triggers
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {state.chatMessages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-light rounded-2xl px-4 py-3 rounded-bl-md border border-primary/20">
              <p className="text-primary text-xs font-medium mb-1">
                🧠 MindMate
              </p>
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle" />
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle [animation-delay:0.4s]" />
                <span className="text-text-muted text-xs ml-2">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <CrisisAlert visible={crisisVisible} message="" />

      {showBreathing && (
        <div className="my-3">
          <BreathingExercise reducedMotion={state.reducedMotion} />
          <button
            type="button"
            onClick={() => setShowBreathing(false)}
            className="text-text-muted text-xs mt-2 hover:text-text-primary"
          >
            Hide exercise
          </button>
        </div>
      )}

      {/* Quick prompts */}
      {state.chatMessages.length <= 3 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 rounded-full text-xs bg-surface-light border border-primary/20 text-text-muted hover:text-primary hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-primary/10">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me how you are feeling... (Enter to send)"
          maxLength={MAX_INPUT_LENGTH}
          rows={2}
          disabled={isLoading}
          autoComplete="off"
          aria-label="Type your message"
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-primary/20 text-text-primary text-sm placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary transition-all self-end shadow-lg shadow-primary/20"
        >
          Send
        </button>
      </div>
    </div>
  );
}
