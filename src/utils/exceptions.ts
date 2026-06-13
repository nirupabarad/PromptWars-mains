/**
 * Custom Exception Classes
 *
 * Structured error handling for MindMate application.
 * Each exception provides clear context for debugging
 * without exposing sensitive information.
 *
 * SECURITY: Error messages never include user input or PII.
 */

/** Base application error */
export class MindMateError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = "MindMateError";
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, MindMateError.prototype);
  }
}

/** Input validation failed */
export class ValidationError extends MindMateError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/** Rate limit exceeded */
export class RateLimitError extends MindMateError {
  constructor() {
    super(
      "Too many requests. Please wait a moment before trying again.",
      "RATE_LIMIT_EXCEEDED",
      429,
    );
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/** Sentiment analysis failed */
export class AnalysisError extends MindMateError {
  constructor(message: string) {
    super(message, "ANALYSIS_ERROR", 500);
    this.name = "AnalysisError";
    Object.setPrototypeOf(this, AnalysisError.prototype);
  }
}

/** Session capacity exceeded */
export class CapacityError extends MindMateError {
  constructor() {
    super(
      "Session capacity reached. Oldest entries will be removed.",
      "CAPACITY_EXCEEDED",
      200,
    );
    this.name = "CapacityError";
    Object.setPrototypeOf(this, CapacityError.prototype);
  }
}
