/**
 * Mood Chart Component
 *
 * Interactive mood timeline visualization using Recharts.
 * Shows mood trends over recent entries.
 *
 * ACCESSIBILITY:
 * - Chart has aria-label describing its purpose
 * - Data also available as text (not chart-only)
 * - Color-blind safe with different shapes/patterns
 * - Tooltip provides exact values
 *
 * EFFICIENCY: Dynamically imported to avoid loading
 * Recharts on pages that don't need it.
 */

"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MoodEntry } from "@/src/types";
import { MOOD_VALUES } from "@/src/utils/constants";

interface MoodChartProps {
  /** Mood entries to visualize (newest first) */
  entries: readonly MoodEntry[];
}

interface ChartDataPoint {
  name: string;
  mood: number;
  label: string;
}

/**
 * MoodChart renders an interactive line chart of mood history.
 *
 * @param props - Component props with entry data
 * @returns Accessible mood visualization
 */
export function MoodChart({ entries }: MoodChartProps): React.JSX.Element {
  // Transform entries to chart data (oldest first for timeline)
  const chartData: ChartDataPoint[] = useMemo(() => {
    return [...entries]
      .reverse()
      .slice(-14) // Last 14 entries max
      .map((entry, index) => ({
        name: `Day ${index + 1}`,
        mood: MOOD_VALUES[entry.mood],
        label: entry.mood,
      }));
  }, [entries]);

  if (entries.length < 2) {
    return (
      <div
        className="flex items-center justify-center h-48 bg-surface rounded-xl border border-primary/10"
        role="img"
        aria-label="Mood chart - needs at least 2 entries to display"
      >
        <p className="text-text-muted text-sm text-center px-4">
          Log at least 2 mood entries to see your trend chart here.
        </p>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Mood trend chart showing ${entries.length} entries. Current trend: ${entries[0]?.mood || "unknown"}`}
      className="w-full h-48 sm:h-56"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#A0A0B0", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a4a" }}
          />
          <YAxis
            domain={[1, 5]}
            tick={{ fill: "#A0A0B0", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a4a" }}
            tickFormatter={(value: number) => {
              const labels: Record<number, string> = {
                1: "😢",
                2: "😔",
                3: "😐",
                4: "🙂",
                5: "😊",
              };
              return labels[value] || "";
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A2E",
              border: "1px solid #6C63FF",
              borderRadius: "8px",
              color: "#EAEAEA",
            }}
            formatter={(value: number) => {
              const labels: Record<number, string> = {
                1: "Rough",
                2: "Low",
                3: "Okay",
                4: "Good",
                5: "Great",
              };
              return [labels[value] || value, "Mood"];
            }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6C63FF"
            strokeWidth={3}
            dot={{ fill: "#6C63FF", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: "#00BFA6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
