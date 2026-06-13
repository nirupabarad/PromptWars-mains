# MindMate - Mental Wellness Tracker for Students

A smart, dynamic AI-powered wellness companion that helps students preparing for high-stakes exams (NEET, JEE, UPSC) manage stress through mood tracking, sentiment analysis, and personalized coping strategies.

## Chosen Vertical

**Health & Wellness AI Assistant**

MindMate addresses the critical mental health challenges faced by competitive exam aspirants in India, where student stress and burnout are widespread issues.

## Approach and Logic

### Architecture Overview

MindMate uses a modular, layered architecture with clear separation of concerns:

```
User Interface (React + Tailwind)
        |
        v
API Routes (Server-side, secure)
        |
        v
Engine Layer (Sentiment, Patterns, Crisis, Recommendations)
        |
        v
Context Layer (In-memory state, no persistence)
```

### Core Logic Flow

1. **Input Validation**: All user input is sanitized using Zod schemas and DOMPurify to prevent XSS and injection attacks.

2. **Sentiment Analysis**: Uses the AFINN-based `sentiment` package with custom lexicon additions for exam-related terminology. Processes text server-side in API routes.

3. **Pattern Detection**: Analyzes mood history to identify:
   - Time-based patterns (e.g., "you feel more stressed in evenings")
   - Stress triggers (recurring words like "exam", "pressure")
   - Mood trends (improving or declining)
   - Streaks (consecutive positive/negative days)

4. **Crisis Detection**: Scans for crisis-level language and extremely negative sentiment. When detected, immediately shows emergency helpline resources (KIRAN, iCall, Vandrevala Foundation).

5. **Context-Aware Recommendations**: Uses the Strategy Pattern to select coping techniques based on:
   - Current mood severity
   - Exam type (NEET/JEE/UPSC-specific tips)
   - Time of day (morning study vs evening wind-down)
   - Recent mood history (avoids repeating same strategies)

### Design Patterns Used

- **Strategy Pattern**: Recommendation engine selects different strategies based on context
- **Context Pattern**: React Context + useReducer for predictable state management
- **Defensive Programming**: Input validation at every boundary
- **Separation of Concerns**: Engine/UI/API layers are independent

## How the Solution Works

### Pages

1. **Home** (`/`): Quick mood check-in with emoji selector and journal input. Shows mood streak, entry count, and average mood.

2. **Companion Chat** (`/chat`): Conversational interface with MindMate. Provides empathetic responses, coping strategies, and interactive breathing exercises.

3. **Dashboard** (`/dashboard`): Mood timeline visualization, pattern insights, mood distribution, and streak tracking.

4. **Toolbox** (`/toolbox`): Browse all 10 coping strategies organized by category (breathing, mindfulness, physical, cognitive, social, study techniques).

### Key Features

- Emoji-based mood selection (5 levels)
- Free-text journaling with sentiment analysis
- Interactive box breathing exercise with animated guide
- Mood trend chart (Recharts)
- Crisis detection with emergency helpline display
- Exam-type-specific recommendations
- Dark calm theme designed for stress reduction
- Full keyboard navigation and screen reader support

## Setup and Installation

```bash
# Clone the repository
git clone <repository-url>
cd mindmate

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Technical Highlights

### Security (implemented throughout)
- In-memory only processing (no database, no localStorage, no cookies)
- Server-side sentiment analysis via API routes (logic not in client bundle)
- Input sanitization with Zod + DOMPurify at every entry point
- Content Security Policy headers in next.config.js
- Rate limiting on API routes (60 req/min)
- XSS prevention (no dangerouslySetInnerHTML with user content)
- No external API calls (all NLP processing is local)
- Security decision comments on every file

### Efficiency
- Lightweight `sentiment` package (~15KB) instead of TensorFlow/PyTorch
- Pre-computed strategy lookup tables (no runtime computation for recommendations)
- Bounded session history (max 30 entries prevents memory growth)
- Next.js automatic code splitting per page
- Memoized React components prevent unnecessary re-renders
- Total repo size under 2MB

### Testing
- Unit tests for all engine modules (sentiment, patterns, crisis, recommendations)
- Input validation tests (XSS, bounds, schema)
- Integration tests (full pipeline end-to-end)
- Performance tests (30 entries processed in under 500ms)
- Edge case coverage (empty input, special characters, long text)

### Accessibility
- Skip to main content link
- Semantic HTML landmarks (header, nav, main, footer)
- ARIA labels on all interactive elements
- aria-live regions for dynamic content updates
- Visible focus indicators for keyboard navigation
- prefers-reduced-motion respected
- WCAG 2.1 AA color contrast compliance
- Not reliant on color alone (emoji + text + position)
- High contrast mode toggle

## Assumptions Made

1. Users are students preparing for Indian competitive exams (NEET, JEE, UPSC)
2. No persistent data storage is needed (session-based for privacy)
3. Sentiment analysis via word-level scoring is sufficient (no deep learning needed)
4. Emergency resources are India-based helplines
5. The application runs in a modern browser with JavaScript enabled
6. Users may be in distress and UI must be non-judgmental and warm
7. All processing must happen client/server-side with no external API dependencies

## Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, code splitting |
| Language | TypeScript (strict) | Type safety, code quality |
| Styling | Tailwind CSS | Rapid theming, accessibility |
| Sentiment | `sentiment` npm package | Lightweight, fast, no ML overhead |
| Charts | Recharts | Accessible, React-native |
| Validation | Zod | Type-safe schemas |
| State | React Context + useReducer | In-memory, predictable |
| Testing | Jest + React Testing Library | Industry standard |

## Project Structure

```
src/
├── app/          # Next.js pages and API routes
├── components/   # Reusable UI components (ui/, features/, layout/)
├── engine/       # Core logic (sentiment, patterns, crisis, recommendations)
├── context/      # Global state management
├── utils/        # Validators, constants, helpers, exceptions
├── types/        # TypeScript interfaces
└── styles/       # Global CSS with Tailwind
tests/
├── engine/       # Engine unit tests
├── utils/        # Validator tests
└── integration/  # End-to-end pipeline tests
```
