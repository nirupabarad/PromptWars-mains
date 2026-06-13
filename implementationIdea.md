# MindMate - Mental Wellness Tracker for Students

## Role
Act as a Senior Full Stack Software Engineer and AI Architect.

## Task
Create a complete, production-ready codebase for a "Mental Wellness Tracker" application designed for students preparing for high-stakes exams (e.g., NEET, JEE, UPSC).

---

## Project Requirements

### Core Features
- A conversational interface that allows students to log daily moods and open-ended journal entries
- A backend logic layer that analyzes sentiment to identify stress triggers and emotional patterns
- A "Wellness Companion" agent that provides hyper-personalized coping strategies (e.g., box breathing, time-blocking, focus techniques)
- Crisis detection with emergency resource display
- Mood trend visualization with interactive charts
- Context-aware recommendations based on exam type, time of day, and mood history

### Technical Stack
- **Framework:** Next.js 14 (App Router) with TypeScript
- **UI Styling:** Tailwind CSS (custom dark calm theme)
- **Sentiment Analysis:** `sentiment` npm package (lightweight AFINN-based)
- **Charts:** Recharts (accessible, React-native)
- **Validation:** Zod (type-safe input schemas)
- **State Management:** React Context + useReducer (in-memory only)
- **Testing:** Jest + React Testing Library + jest-axe
- Ensure all dependencies are minimal to keep the total repository size under 10MB
- Use a modular file structure: /src/app, /src/engine, /src/utils, /src/components, /tests

---

## Evaluation Criteria (Prioritize These)

### Code Quality (HIGH IMPACT)
- TypeScript strict mode with no `any` types
- Clean modular functions with single responsibility
- Full type annotations and JSDoc comments on every function
- ESLint + consistent formatting
- Design patterns: Strategy pattern for recommendations, Context for state
- Custom error classes and error boundaries
- Meaningful variable/function names throughout

### Security (HIGH IMPACT)
- In-memory processing only via React Context (no database, no persistence)
- Server-side sentiment analysis in API routes (logic not exposed to client)
- Input sanitization with Zod schemas + DOMPurify
- Content Security Policy headers in next.config.js
- XSS prevention (no dangerouslySetInnerHTML with user content)
- Rate limiting on API routes (in-memory counter)
- No API keys in code, .env.example provided
- Security comments explaining every decision in code

### Efficiency (MEDIUM IMPACT)
- Lightweight `sentiment` package (~15KB) instead of heavy ML frameworks
- Next.js automatic code splitting per page
- Memoized components (React.memo, useMemo, useCallback)
- Pre-computed lookup tables for coping strategies
- Bounded session history (max 30 entries)
- SVG icons (no icon library overhead)
- Dynamic imports for heavy components (charts)

### Testing (MEDIUM IMPACT)
- Unit tests for all engine modules (sentiment, patterns, recommendations, crisis)
- Component tests with React Testing Library
- Accessibility tests with jest-axe
- Integration tests for full pipeline
- Edge cases: empty input, XSS attempts, very long text
- 85%+ coverage on core logic

### Accessibility (LOW IMPACT)
- Semantic HTML: proper headings, landmarks (header, nav, main, aside, footer)
- ARIA labels on all interactive elements
- aria-live regions for dynamic chat updates
- Skip to main content link
- Keyboard navigation with visible focus indicators
- prefers-reduced-motion respected
- WCAG 2.1 AA color contrast (4.5:1 ratio)
- High contrast mode toggle
- Color-blind safe (emoji + text + position, not just color)

---

## File Structure

```
mindmate/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with a11y, metadata
│   │   ├── page.tsx                  # Home / mood check-in
│   │   ├── chat/page.tsx             # Companion chat interface
│   │   ├── dashboard/page.tsx        # Wellness insights & charts
│   │   ├── toolbox/page.tsx          # Coping exercises library
│   │   └── api/
│   │       ├── analyze/route.ts      # Sentiment analysis endpoint
│   │       └── recommend/route.ts    # Recommendation endpoint
│   ├── components/
│   │   ├── ui/                       # Base UI components
│   │   │   ├── MoodSelector.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── SkipLink.tsx
│   │   ├── features/                 # Feature components
│   │   │   ├── BreathingExercise.tsx
│   │   │   ├── MoodChart.tsx
│   │   │   ├── CrisisAlert.tsx
│   │   │   ├── PatternInsight.tsx
│   │   │   └── JournalInput.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── engine/
│   │   ├── sentiment.ts              # Sentiment analysis logic
│   │   ├── patternDetector.ts        # Emotional pattern recognition
│   │   ├── recommendation.ts         # Coping strategy engine
│   │   ├── crisisDetector.ts         # Crisis/severity detection
│   │   └── responseGenerator.ts      # Empathetic response builder
│   ├── context/
│   │   └── WellnessContext.tsx       # Global state (in-memory only)
│   ├── utils/
│   │   ├── validators.ts             # Input sanitization (Zod)
│   │   ├── constants.ts              # Config, strategies DB
│   │   ├── helpers.ts                # Utility functions
│   │   └── exceptions.ts             # Custom error classes
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── styles/
│       └── globals.css               # Tailwind + custom dark theme
├── tests/
│   ├── engine/                       # Engine unit tests
│   ├── components/                   # Component + a11y tests
│   ├── utils/                        # Validator tests
│   └── integration/                  # Pipeline tests
├── public/icons/                     # SVG mood icons
├── .gitignore
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── jest.config.ts
├── jest.setup.ts
├── eslint.config.mjs
└── README.md
```

---

## Deliverables

- Full source code for every file listed above
- README.md clearly explaining: Chosen Vertical, Approach/Logic, How the solution works, Assumptions made
- .gitignore excluding node_modules, .next, .env, coverage, and build artifacts
- .env.example with placeholder values (no real secrets)
- All tests passing with 85%+ coverage on engine modules

---

## .gitignore Must Include

```
node_modules/
.next/
out/
.env
.env.local
coverage/
*.tsbuildinfo
.DS_Store
```

---

## Dependencies (Minimal & Pinned)

### Production
- next: 14.2.0
- react: 18.3.0
- react-dom: 18.3.0
- sentiment: 5.0.2
- zod: 3.23.0
- recharts: 2.12.0
- dompurify: 3.1.0

### Dev
- typescript: 5.4.0
- @types/react: 18.3.0
- @types/dompurify: 3.0.0
- tailwindcss: 3.4.0
- postcss: 8.4.0
- autoprefixer: 10.4.0
- jest: 29.7.0
- @testing-library/react: 14.2.0
- @testing-library/jest-dom: 6.4.0
- jest-axe: 9.0.0
- jest-environment-jsdom: 29.7.0
- eslint: 8.57.0
- eslint-config-next: 14.2.0

No bloat. No heavy ML. All pinned versions. Repo stays under 2MB.

---

## Key Differentiators

1. **Crisis Detection** - Shows real-world responsibility and ethical AI
2. **Server-side Analysis** - API routes keep logic hidden (security)
3. **TypeScript Strict** - No `any` types, full type coverage
4. **jest-axe Tests** - Automated accessibility validation
5. **Context-Aware** - Adapts to exam type, time of day, mood history
6. **Strategy Pattern** - Extensible recommendation engine
7. **Security Comments** - Every file explains its security decisions
8. **Dark Calm Theme** - Visually distinct from default apps

---

## Implementation Order

1. Project skeleton + all config files
2. Engine modules (sentiment, patterns, recommendations, crisis)
3. API routes + validators (security layer)
4. Context + types (state management)
5. UI components (mood selector, chat, dashboard, toolbox)
6. Testing suite (unit + integration + a11y)
7. Styling + accessibility polish
8. README + final cleanup
