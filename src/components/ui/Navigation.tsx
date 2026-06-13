/**
 * Navigation Component
 *
 * Main navigation bar with links to all app sections.
 * Responsive: horizontal on desktop, bottom nav on mobile.
 *
 * ACCESSIBILITY:
 * - Semantic nav element with aria-label
 * - Current page indicated with aria-current
 * - Keyboard navigable links
 * - Visible focus indicators
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/chat", label: "Companion", icon: "💬" },
  { href: "/dashboard", label: "Journey", icon: "📊" },
  { href: "/toolbox", label: "Toolbox", icon: "🧰" },
];

/**
 * Navigation renders the main app navigation.
 *
 * @returns Accessible navigation component
 */
export function Navigation(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-primary/20 sm:static sm:border-t-0 sm:border-b sm:border-primary/10"
    >
      <ul className="flex justify-around items-center max-w-lg mx-auto py-2 sm:py-3 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                  ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-light"
                  }
                `}
              >
                <span className="text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
