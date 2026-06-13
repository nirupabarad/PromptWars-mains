/**
 * Type declarations for the 'sentiment' npm package.
 * The package does not ship its own types.
 */

declare module "sentiment" {
  interface SentimentOptions {
    extras?: Record<string, number>;
  }

  interface SentimentAnalysisResult {
    score: number;
    comparative: number;
    calculation: Array<Record<string, number>>;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  class Sentiment {
    analyze(text: string, options?: SentimentOptions): SentimentAnalysisResult;
  }

  export default Sentiment;
}
