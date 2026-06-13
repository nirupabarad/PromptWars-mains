/**
 * Performance Utilities
 *
 * EFFICIENCY: Utility functions for optimizing application performance.
 * Includes debouncing, throttling, and memoization helpers.
 */

/**
 * EFFICIENCY: Debounce function to prevent excessive API calls.
 * Used for text input analysis - waits until user stops typing.
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * EFFICIENCY: Throttle function to limit execution frequency.
 * Used for scroll events and real-time updates.
 *
 * @param fn - Function to throttle
 * @param limit - Minimum time between executions in ms
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * EFFICIENCY: Simple memoize for pure functions with string keys.
 * Caches results to avoid redundant computations.
 *
 * @param fn - Pure function to memoize
 * @param maxSize - Maximum cache size (prevents memory leaks)
 * @returns Memoized function
 */
export function memoize<T>(
  fn: (key: string) => T,
  maxSize: number = 50,
): (key: string) => T {
  const cache = new Map<string, T>();

  return (key: string): T => {
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(key);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
}

/**
 * EFFICIENCY: Measures execution time of a function.
 * Used in development to identify performance bottlenecks.
 *
 * @param label - Label for the measurement
 * @param fn - Function to measure
 * @returns Function result
 */
export function measureTime<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;

  if (process.env.NODE_ENV === "development" && elapsed > 50) {
    console.warn(`[PERF] ${label} took ${elapsed.toFixed(2)}ms`);
  }

  return result;
}
