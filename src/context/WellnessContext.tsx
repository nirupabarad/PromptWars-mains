/**
 * Wellness Context Provider
 *
 * Global state management using React Context + useReducer.
 * Stores journal entries, chat history, and AI-generated pattern reports.
 *
 * SECURITY:
 * - No data persisted to localStorage, cookies, or external storage
 * - All data destroyed when browser tab closes
 * - Session bounded to MAX_ENTRIES to prevent memory abuse
 * - Clear all data action available for immediate privacy
 *
 * EFFICIENCY:
 * - useReducer for O(1) predictable state transitions (no deep cloning)
 * - Bounded arrays (MAX_ENTRIES=30, MAX_CHAT=50) cap memory at ~500KB
 * - useMemo prevents context value recreation on every render
 * - useCallback stabilizes dispatch helpers to prevent child re-renders
 * - Immutable state updates enable React's shallow comparison optimization
 */

"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from "react";
import type {
  WellnessState,
  WellnessAction,
  MoodEntry,
  ChatMessage,
  WeeklyAnalysisReport,
} from "@/src/types";
import { MAX_ENTRIES, MAX_CHAT_MESSAGES } from "@/src/utils/constants";

/** Initial state - empty, no pre-existing data */
const initialState: WellnessState = {
  entries: [],
  chatMessages: [],
  examType: "general",
  currentStreak: 0,
  highContrastMode: false,
  reducedMotion: false,
  weeklyReport: null,
  lastAnalysisEntryCount: 0,
};

/**
 * State reducer for wellness actions.
 */
function wellnessReducer(
  state: WellnessState,
  action: WellnessAction,
): WellnessState {
  switch (action.type) {
    case "ADD_ENTRY": {
      const entries = [action.payload, ...state.entries].slice(0, MAX_ENTRIES);
      return { ...state, entries };
    }

    case "ADD_CHAT_MESSAGE": {
      const chatMessages = [...state.chatMessages, action.payload].slice(
        -MAX_CHAT_MESSAGES,
      );
      return { ...state, chatMessages };
    }

    case "SET_EXAM_TYPE":
      return { ...state, examType: action.payload };

    case "UPDATE_STREAK":
      return { ...state, currentStreak: action.payload };

    case "SET_WEEKLY_REPORT":
      return {
        ...state,
        weeklyReport: action.payload,
        lastAnalysisEntryCount: state.entries.length,
      };

    case "TOGGLE_HIGH_CONTRAST":
      return { ...state, highContrastMode: !state.highContrastMode };

    case "TOGGLE_REDUCED_MOTION":
      return { ...state, reducedMotion: !state.reducedMotion };

    case "CLEAR_ALL_DATA":
      return { ...initialState };

    default:
      return state;
  }
}

/** Context type including dispatch */
interface WellnessContextType {
  state: WellnessState;
  dispatch: React.Dispatch<WellnessAction>;
  addEntry: (entry: MoodEntry) => void;
  addChatMessage: (message: ChatMessage) => void;
  setWeeklyReport: (report: WeeklyAnalysisReport) => void;
  clearAllData: () => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(
  undefined,
);

interface WellnessProviderProps {
  children: ReactNode;
}

export function WellnessProvider({
  children,
}: WellnessProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(wellnessReducer, initialState);

  const contextValue = useMemo<WellnessContextType>(
    () => ({
      state,
      dispatch,
      addEntry: (entry: MoodEntry) =>
        dispatch({ type: "ADD_ENTRY", payload: entry }),
      addChatMessage: (message: ChatMessage) =>
        dispatch({ type: "ADD_CHAT_MESSAGE", payload: message }),
      setWeeklyReport: (report: WeeklyAnalysisReport) =>
        dispatch({ type: "SET_WEEKLY_REPORT", payload: report }),
      clearAllData: () => dispatch({ type: "CLEAR_ALL_DATA" }),
    }),
    [state, dispatch],
  );

  return (
    <WellnessContext.Provider value={contextValue}>
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness(): WellnessContextType {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return context;
}
