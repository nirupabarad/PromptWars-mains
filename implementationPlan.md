# Implementation Plan: Mental Wellness Tracker for Students

## Chosen Vertical: Health & Wellness AI Assistant

---

## 1. PROJECT OVERVIEW

**Persona:** "MindMate" - A smart, dynamic mental wellness companion for students preparing for high-stakes exams (NEET, JEE, UPSC).

**What it does:**
- Conversational mood logging with open-ended journaling
- Sentiment analysis to detect stress triggers and emotional patterns
- Personalized coping strategies based on user context (exam type, stress level, time of day)
- Wellness insights dashboard with trend visualization
- Crisis detection with emergency resource suggestions

---

## 2. TECH STACK (Next.js + TypeScript)

| Component | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, clean structure |
| Language | TypeScript | Type safety = higher code quality score |
| UI Styling | Tailwind CSS | Rapid custom theming, accessibility |
| Sentiment | `sentiment` npm package | Lightweight AFINN-based, fast |
| Charts | Recharts | Accessible, lightweight, React-native |
| Testing | Jest + React Testing Library | Industry standard, accessibility checks |
| Validation | Zod | Type-safe input schemas |
| State | React Context + useReducer | In-memory only, no DB (security) |

**Repo size estimate: ~1-2 MB (well under 10 MB limit)**

---

## 3. SCORING STRATEGY (Mapped to Evaluation Parameters)

### HIGH IMPACT - Code Quality and Problem Statement Alignment

| What to Do | How |
|---|---|
| Modular architecture | Separate concerns: /app, /engine, /components, /utils, /tests |
| TypeScript strict mode | Full type safety, no `any` types |
| JSDoc + inline comments | Every function documented |
| Design patterns | Strategy pattern for recommendations, Context for state |
| Error handling | Custom error classes, error boundaries |
| Clean code | Meaningful names, small functions, single responsibility |
| Consistent formatting | ESLint + Prettier configured |

### HIGH IMPACT - Security

| What to Do | How |
|---|---|
| No persistent data storage | In-memory only via React Context |
| Input sanitization | Zod schemas + DOMPurify for user text |
| No API keys in code | Environment variables with .env.local |
| Server-side processing | Sentiment analysis in API routes (not exposed to client) |
| Privacy-by-design | Security comments explaining every decision |
| XSS prevention | Sanitize all rendered user content |
| Rate limiting | API route protection with in-memory counter |
| CSP headers | Content Security Policy in next.config.js |

### MEDIUM IMPACT - Efficiency

| What to Do | How |
|---|---|
| Lightweight dependencies | `sentiment` package (tiny) vs heavy ML |
| Code splitting | Next.js automatic per-page splitting |
| Memoization | React.memo, useMemo, useCallback where needed |
| Lazy loading | Dynamic imports for dashboard/charts |
| Pre-computed strategies | Lookup tables for coping recommendations |
| Bounded history | Maximum 30 entries in session (memory cap) |
| Image optimization | Next.js Image component, SVG icons |

### MEDIUM IMPACT - Testing

| What to Do | How |
|---|---|
| Unit tests | Jest for all engine modules |
| Component tests | React Testing Library for UI |
| Integration tests | Full analysis pipeline testing |
| Edge cases | Empty inputs, XSS attempts, long text |
| Accessibility tests | jest-axe for automated a11y checks |
| Test coverage | 85%+ on core logic |
| Test fixtures | Reusable mock data and providers |

### LOW IMPACT - Accessibility

| What to Do | How |
|---|---|
| Semantic HTML | Proper headings, landmarks, nav, main, article |
| ARIA labels | All interactive elements labeled |
| Color contrast | WCAG 2.1 AA compliant (4.5:1 ratio) |
| Keyboard navigation | Focus management, skip links, tab order |
| Screen reader | aria-live regions for dynamic updates |
| Reduced motion | respects prefers-reduced-motion |
| Color-blind safe | Emoji + text + position (not just color) |
| Focus indicators | Visible focus rings on all elements |

---

## 4. FILE STRUCTURE

```
mindmate/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with a11y, metadata
│   │   ├── page.tsx                  # Home / mood check-in
│   │   ├── chat/
│   │   │   └── page.tsx              # Companion chat interface
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Wellness insights & charts
│   │   ├── toolbox/
│   │   │   └── page.tsx              # Coping exercises library
│   │   └── api/
│   │       ├── analyze/
│   │       │   └── route.ts          # Sentiment analysis endpoint
│   │       └── recommend/
│   │           └── route.ts          # Recommendation endpoint
│   ├── components/
│   │   ├── ui/
│   │   │   ├── MoodSelector.tsx      # Emoji mood picker
│   │   │   ├── ChatBubble.tsx        # Chat message bubble
│   │   │   ├── InsightCard.tsx       # Glassmorphism stat card
│   │   │   ├── Navigation.tsx        # Sidebar/nav component
│   │   │   └── SkipLink.tsx          # Accessibility skip navigation
│   │   ├── features/
│   │   │   ├── BreathingExercise.tsx  # Animated breathing widget
│   │   │   ├── MoodChart.tsx         # Recharts mood timeline
│   │   │   ├── CrisisAlert.tsx       # Emergency resources banner
│   │   │   ├── PatternInsight.tsx    # AI pattern display
│   │   │   └── JournalInput.tsx      # Secure text input
│   │   └── layout/
│   │       ├── Header.tsx            # App header
│   │       └── Footer.tsx            # App footer with resources
│   ├── engine/
│   │   ├── sentiment.ts              # Sentiment analysis logic
│   │   ├── patternDetector.ts        # Emotional pattern recognition
│   │   ├── recommendation.ts         # Coping strategy engine
│   │   ├── crisisDetector.ts         # Crisis/severity detection
│   │   └── responseGenerator.ts      # Empathetic response builder
│   ├── context/
│   │   └── WellnessContext.tsx       # Global state management
│   ├── utils/
│   │   ├── validators.ts             # Input sanitization (Zod)
│   │   ├── constants.ts              # App config, strategies DB
│   │   ├── helpers.ts                # Utility functions
│   │   └── exceptions.ts             # Custom error classes
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── styles/
│       └── globals.css               # Tailwind + custom theme
├── tests/
│   ├── engine/
│   │   ├── sentiment.test.ts         # Sentiment analysis tests
│   │   ├── patternDetector.test.ts   # Pattern detection tests
│   │   ├── recommendation.test.ts    # Recommendation tests
│   │   ├── crisisDetector.test.ts    # Crisis detection tests
│   │   └── responseGenerator.test.ts # Response builder tests
│   ├── components/
│   │   ├── MoodSelector.test.tsx     # Component + a11y tests
│   │   ├── ChatBubble.test.tsx       # Chat bubble tests
│   │   └── BreathingExercise.test.tsx
│   ├── utils/
│   │   └── validators.test.ts        # Validation tests
│   └── integration/
│       └── pipeline.test.ts          # End-to-end flow tests
├── public/
│   └── icons/                        # SVG mood icons
├── .gitignore
├── .env.example                      # Environment template (no secrets)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js                    # CSP headers, security
├── jest.config.ts
├── jest.setup.ts
├── eslint.config.mjs
└── README.md
```

---

## 5. CORE LOGIC FLOW

```
User Input (mood emoji + journal text)
       |
       v
Input Validation & Sanitization (Zod + DOMPurify)
       |
       v
API Route: /api/analyze
       |
       v
Sentiment Analysis Engine
  - AFINN-based word scoring
  - Negation handling
  - Comparative score (normalized)
  - Confidence level calculation
       |
       v
Pattern Detection
  - Time-based patterns (morning vs evening)
  - Trigger word detection (exam, fail, pressure)
  - Trend analysis (improving/declining over entries)
  - Streak tracking (consecutive mood states)
       |
       v
Crisis Detection (if sentiment score < -3)
  - Flag for immediate support resources
  - Show emergency helpline numbers
  - Gentle professional help suggestion
       |
       v
API Route: /api/recommend
       |
       v
Context-Aware Recommendation Engine
  - Exam type context (NEET/JEE/UPSC specific tips)
  - Stress level -> appropriate technique intensity
  - Time of day -> suitable activity suggestion
  - History-informed (avoid repeating same tip)
       |
       v
Response Generation
  - Empathetic acknowledgment
  - Personalized coping strategy
  - Actionable next step
  - Progress encouragement
       |
       v
UI Update (React state, charts, chat bubbles)
```

---

## 6. KEY IMPLEMENTATION DECISIONS

### Security Decisions (Documented in Code Comments)
1. **In-memory only**: React Context state, destroyed on tab close
2. **Server-side analysis**: Sentiment logic in API routes, not exposed to browser
3. **Input sanitization**: Zod validation + DOMPurify before processing
4. **No external APIs**: All NLP processing happens locally
5. **CSP headers**: Strict Content-Security-Policy in next.config.js
6. **XSS prevention**: Never use dangerouslySetInnerHTML with user content
7. **Rate limiting**: In-memory counter on API routes (max 60 req/min)
8. **No PII logging**: Console logs stripped in production build

### Efficiency Decisions
1. **Bounded history**: Max 30 mood entries per session
2. **Code splitting**: Each page lazy-loaded by Next.js automatically
3. **Memoized components**: Prevent unnecessary re-renders on charts
4. **Lightweight sentiment**: `sentiment` package (~15KB) vs TensorFlow (~500KB)
5. **Pre-computed lookup**: Coping strategies as static object map
6. **SVG icons**: No icon library overhead, just inline SVGs

### Accessibility Decisions
1. **Skip to main content** link for keyboard users
2. **aria-live="polite"** on chat responses for screen readers
3. **Role and label** on every interactive component
4. **Focus trap** in modal dialogs
5. **prefers-reduced-motion** respected in all animations
6. **High contrast mode** toggle in settings
7. **Semantic landmarks**: header, nav, main, aside, footer

---

## 7. UI DESIGN THEME

### Color Palette (Dark Calm Theme)
```
Primary:      #6C63FF (Soft Purple - trust)
Secondary:    #00BFA6 (Teal - growth)
Background:   #0F0F1A (Deep Dark)
Surface:      #1A1A2E (Card bg)
Text Primary: #EAEAEA (High contrast)
Text Muted:   #A0A0B0 (Subtle)
Success:      #4CAF50 (Good mood)
Warning:      #FF9800 (Mixed mood)
Danger:       #EF5350 (Low mood)
Accent:       #FFD93D (Encouragement)
```

### Key UI Components
- Emoji mood selector with bounce animation
- Chat bubbles (assistant left/purple, user right/teal)
- Glassmorphism stat cards with gradient borders
- Animated breathing exercise circle
- Recharts mood timeline with color-coded points
- Crisis alert banner with pulsing indicator

---

## 8. IMPLEMENTATION ORDER

| Phase | What | Time |
|---|---|---|
| 1 | Project skeleton (Next.js, configs, .gitignore) | 5 min |
| 2 | Engine modules (sentiment, patterns, recommendations, crisis) | 15 min |
| 3 | API routes + validators (security layer) | 5 min |
| 4 | Context + types (state management) | 5 min |
| 5 | UI components (mood selector, chat, dashboard) | 15 min |
| 6 | Testing suite (unit + integration + a11y) | 10 min |
| 7 | Styling + accessibility polish (Tailwind, ARIA) | 5 min |
| 8 | README + final cleanup | 5 min |
| **Total** | | **~65 min** |

---

## 9. WHAT MAKES THIS A WINNING SUBMISSION

| Differentiator | Scoring Impact |
|---|---|
| TypeScript strict mode (no `any`) | Code Quality: HIGH |
| Server-side sentiment (API routes) | Security: HIGH |
| Security comments on every file | Security: HIGH |
| Crisis detection + helpline resources | Problem Alignment: HIGH |
| Context-aware (exam type, time, history) | Problem Alignment: HIGH |
| jest-axe automated accessibility tests | Accessibility: LOW but shows effort |
| 85%+ test coverage | Testing: MEDIUM |
| Lightweight deps (<2MB total) | Efficiency: MEDIUM |
| CSP headers + rate limiting | Security: HIGH |
| Strategy pattern for extensibility | Code Quality: HIGH |

---

## 10. DEPENDENCIES (package.json)

### Production
```json
{
  "next": "14.2.0",
  "react": "18.3.0",
  "react-dom": "18.3.0",
  "sentiment": "5.0.2",
  "zod": "3.23.0",
  "recharts": "2.12.0",
  "dompurify": "3.1.0"
}
```

### Dev
```json
{
  "typescript": "5.4.0",
  "@types/react": "18.3.0",
  "@types/dompurify": "3.0.0",
  "tailwindcss": "3.4.0",
  "postcss": "8.4.0",
  "autoprefixer": "10.4.0",
  "jest": "29.7.0",
  "@testing-library/react": "14.2.0",
  "@testing-library/jest-dom": "6.4.0",
  "jest-axe": "9.0.0",
  "jest-environment-jsdom": "29.7.0",
  "eslint": "8.57.0",
  "eslint-config-next": "14.2.0"
}
```

All pinned versions. No bloat. No unnecessary packages.
