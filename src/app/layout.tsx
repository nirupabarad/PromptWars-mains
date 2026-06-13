/**
 * Root Layout
 *
 * Next.js App Router root layout. Provides:
 * - WellnessContext provider (global state)
 * - Accessibility: skip link, semantic structure, meta tags
 * - Navigation and header/footer
 *
 * SECURITY: No external scripts loaded.
 * ACCESSIBILITY: Language attribute, viewport meta, skip navigation.
 */

import React from "react";
import type { Metadata, Viewport } from "next";
import "@/src/styles/globals.css";
import { WellnessProvider } from "@/src/context/WellnessContext";
import { SkipLink } from "@/src/components/ui/SkipLink";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { Navigation } from "@/src/components/ui/Navigation";

export const metadata: Metadata = {
  title: "MindMate - Mental Wellness Tracker for Students",
  description:
    "A smart wellness companion that helps students manage exam stress through mood tracking, sentiment analysis, and personalized coping strategies.",
  keywords: [
    "mental health",
    "student wellness",
    "exam stress",
    "mood tracker",
    "coping strategies",
  ],
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F0F1A",
};

/**
 * RootLayout wraps the entire application with providers and structure.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <WellnessProvider>
          {/* ACCESSIBILITY: Skip link for keyboard users */}
          <SkipLink />

          {/* Header */}
          <Header />

          {/* Main content */}
          <main
            id="main-content"
            className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>

          {/* Footer */}
          <Footer />

          {/* Bottom navigation */}
          <Navigation />
        </WellnessProvider>
      </body>
    </html>
  );
}
