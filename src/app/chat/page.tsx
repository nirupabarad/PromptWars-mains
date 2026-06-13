/**
 * Chat Page - Wellness Companion
 *
 * Full conversational interface with MindMate companion.
 * Provides contextual responses, coping recommendations,
 * and interactive exercises.
 *
 * SECURITY: Messages processed via API routes.
 * ACCESSIBILITY: aria-live region for new messages, keyboard submit.
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ChatBubble } from "@/src/components/ui/ChatBubble";
import { CrisisAlert } from "@/src/components/features/CrisisAlert";
import { BreathingExercise } from "@/src/components/features/BreathingExercise";
import { useWellness } from "@/src/context/WellnessContext";
import { generateId, getCurrentTimePeriod } from "@/src/utils/helpers";
import { sanitizeText } from "@/src/utils/validators";
import { MAX_INPUT_LENGTH } from "@/src/utils/constants";
import type {
  ChatMessage,
  AnalyzeResponse,
  RecommendResponse,
} from "@/src/types";

/**
 * ChatPage renders the MindMate companion chat interface.
 *
 * @returns Chat page component
 */
export default function ChatPage(): React.JSX.Element {
  const { state, addChatMessage } = useWellness();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [crisisVisible, setCrisisVisible] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatMessages]);

  // Show welcome message if no messages
  useEffect(() => {
    if (state.chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "Hi! I am MindMate, your wellness companion. Tell me how you are feeling, what is on your mind, or if you would like to try a relaxation technique. I am here to listen.",
        timestamp: Date.now(),
      };
      addChatMessage(welcomeMessage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // SECURITY: Sanitize input before processing
    const sanitized = sanitizeText(trimmed);
    if (sanitized.length < 3) return;

    setInput("");
    setIsLoading(true);
    setCrisisVisible(false);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: sanitized,
      timestamp: Date.now(),
    };
    addChatMessage(userMessage);

    try {
      // Analyze sentiment
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sanitized,
          mood: state.entries[0]?.mood || "okay",
        }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const analyzeData: AnalyzeResponse = await analyzeRes.json();

      // Check crisis
      if (analyzeData.crisis.showResources) {
        setCrisisVisible(true);
        setCrisisMessage(analyzeData.crisis.recommendation);
      }

      // Get recommendation
      const recommendRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentimentScore: analyzeData.sentiment.score,
          mood: state.entries[0]?.mood || "okay",
          examType: state.examType,
          timePeriod: getCurrentTimePeriod(),
          recentMoods: state.entries.slice(0, 5).map((e) => e.mood),
        }),
      });

      if (!recommendRes.ok) throw new Error("Recommendation failed");
      const recommendData: RecommendResponse = await recommendRes.json();

      // Build assistant response
      let responseContent = recommendData.empathyMessage;
      responseContent += `\n\n${recommendData.recommendation.title}: ${recommendData.recommendation.description}`;
      responseContent += `\n\nSteps:\n${recommendData.recommendation.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      responseContent += `\n\n${recommendData.encouragement}`;

      // Check if breathing exercise recommended
      if (recommendData.recommendation.category === "breathing") {
        setShowBreathing(true);
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: responseContent,
        timestamp: Date.now(),
        crisisAlert: analyzeData.crisis.showResources,
      };
      addChatMessage(assistantMessage);
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "I am sorry, something went wrong on my end. Could you try sharing that again?",
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, state.entries, state.examType, addChatMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-fade-in">
      <h2 className="sr-only">MindMate Companion Chat</h2>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {state.chatMessages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start" aria-label="MindMate is thinking">
            <div className="bg-surface-light rounded-2xl px-4 py-3 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle" />
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Crisis alert */}
      <CrisisAlert visible={crisisVisible} message={crisisMessage} />

      {/* Breathing exercise (if suggested) */}
      {showBreathing && (
        <div className="my-4">
          <BreathingExercise reducedMotion={state.reducedMotion} />
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 pt-3 border-t border-primary/10">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your thoughts..."
          maxLength={MAX_INPUT_LENGTH}
          rows={2}
          disabled={isLoading}
          autoComplete="off"
          aria-label="Type your message to MindMate"
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-primary/20 text-text-primary text-sm placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors self-end"
        >
          Send
        </button>
      </div>
    </div>
  );
}
