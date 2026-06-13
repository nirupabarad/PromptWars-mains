/**
 * Wellness Context Provider
 *
 * Global state management using React Context + useReducer.
 * All data is stored in-memory only (React state).
 *
 * SECURITY:
 * - No data persisted to localStorage, cookies, or external storage
 * - All data destroyed when browser tab closes
 * - Session bounded to MAX_ENTRIES to prevent memory abuse
 * - Clear all data action available for immediate privacy
 *
 * EFFICIENCY:
 * - useReducer for predictable state updates
 * - Bounded arrays prevent memory growth
 * - Memoized context value prevents unnecessary re-renders
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
};

/**
 * State reducer for wellness actions.
 * All mutations are immutable (new array/object references).
 *
 * @param state - Current state
 * @param action - Action to apply
 * @returns New state
 */
function wellnessReducer(
  state: WellnessState,
  action: WellnessAction,
): WellnessState {
  switch (action.type) {
    case "ADD_ENTRY": {
      // EFFICIENCY: Bounded array - remove oldest if at capacity
      const entries = [action.payload, ...state.entries].slice(0, MAX_ENTRIES);
      return { ...state, entries };
    }

    case "ADD_CHAT_MESSAGE": {
      // EFFICIENCY: Bounded chat history
      const chatMessages = [...state.chatMessages, action.payload].slice(
        -MAX_CHAT_MESSAGES,
      );
      return { ...state, chatMessages };
    }

    case "SET_EXAM_TYPE":
      return { ...state, examType: action.payload };

    case "UPDATE_STREAK":
      return { ...state, currentStreak: action.payload };

    case "TOGGLE_HIGH_CONTRAST":
      return { ...state, highContrastMode: !state.highContrastMode };

    case "TOGGLE_REDUCED_MOTION":
      return { ...state, reducedMotion: !state.reducedMotion };

    case "CLEAR_ALL_DATA":
      // SECURITY: Complete data wipe - returns to initial state
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
  clearAllData: () => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(
  undefined,
);

/** Provider component props */
interface WellnessProviderProps {
  children: ReactNode;
}

/**
 * WellnessProvider wraps the application to provide global state.
 *
 * @param props - Provider props with children
 * @returns Context provider component
 */
export function WellnessProvider({
  children,
}: WellnessProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(wellnessReducer, initialState);

  // Memoized helper functions to prevent unnecessary re-renders
  const contextValue = useMemo<WellnessContextType>(
    () => ({
      state,
      dispatch,
      addEntry: (entry: MoodEntry) =>
        dispatch({ type: "ADD_ENTRY", payload: entry }),
      addChatMessage: (message: ChatMessage) =>
        dispatch({ type: "ADD_CHAT_MESSAGE", payload: message }),
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

/**
 * Custom hook to access wellness context.
 * Throws if used outside provider (fail-fast for development).
 *
 * @returns WellnessContextType with state and actions
 */
export function useWellness(): WellnessContextType {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return context;
}
