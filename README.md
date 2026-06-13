# MindMate — Mental Wellness Tracker for Students

An AI-powered mental wellness tracker that helps students preparing for competitive exams (NEET, JEE, UPSC) manage stress by analyzing their daily journal entries, uncovering hidden stress triggers, identifying emotional patterns, and providing hyper-personalized coping strategies based on their history.

---

## Chosen Vertical

**Health & Wellness — Smart Mental Wellness AI Assistant**

MindMate is not a generic chatbot. It is a **data-driven wellness tracker** that performs the Input → Analyze → Contextualize → Respond loop:

1. **Ingestion**: Students log daily moods and open-ended journal entries
2. **Analysis**: AI analyzes the full journal history to uncover hidden stress triggers and emotional patterns
3. **Contextualization**: The AI remembers past entries and references specific triggers when responding
4. **Personalization**: Coping strategies are selected based on mood, exam type, time of day, and historical patterns

---

## Approach and Logic

### Architecture: The Pattern Analyzer Agent

The core intelligence of MindMate is the **Pattern Analyzer Agent** — a Gemini AI-powered system that processes the student's complete journal history to surface insights they cannot see themselves.

```
┌─────────────────────────────────────────────────────┐
│                    USER INTERFACE                     │
│  Mood Selector → Journal Entry → Quick Thoughts      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              API ROUTES (Server-Side)                 │
│                                                      │
│  /api/analyze   → Sentiment + Crisis Detection       │
│  /api/patterns  → AI Pattern Analyzer Agent          │
│  /api/recommend → Context-Aware Recommendations      │
│  /api/chat      → Memory-Enhanced Companion          │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              GEMINI AI + LOCAL ENGINE                 │
│                                                      │
│  1. Local Sentiment (AFINN) — fast, always works     │
│  2. Pattern Analyzer (Gemini) — deep journal review  │
│  3. Chat with Memory — references past patterns      │
│  4. Crisis Detection — safety net with helplines     │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Structured Journaling**: Each entry stores timestamp, mood level, text, sentiment score, and time period — enabling time-series pattern analysis.

2. **Hidden Trigger Detection**: The AI prompt explicitly asks Gemini to "identify triggers the student may not consciously realize" — e.g., "Sunday evenings before Monday mock tests cause anticipatory anxiety."

3. **Long-Term Memory**: When the student chats with MindMate, the AI receives their full journal history AND the weekly analysis report. This enables responses like "I remember you felt the same way before your Physics test last time."

4. **Auto-Analysis Loop**: After every 3+ entries, the Pattern Analyzer Agent runs automatically in the background, updating the weekly report with new insights.

5. **Graceful Degradation**: If Gemini is unavailable, local sentiment analysis + rule-based recommendations still work.

---

## How the Solution Works

### 1. Home Page — Daily Journaling
- Select mood (5 levels with emoji)
- Choose from predefined quick thoughts OR write freely
- Entry is analyzed for sentiment and crisis indicators
- Auto-triggers pattern analysis after 3+ entries

### 2. Companion Chat — AI with Memory
- Gemini-powered conversational interface
- **References past journal entries** in responses
- **Aware of detected patterns and triggers**
- Provides contextual breathing exercises when stress detected
- Quick prompts adapt based on whether patterns are known

### 3. Dashboard — Pattern Analysis Report
- **AI Pattern Analyzer Agent** processes full journal history
- Surfaces **hidden stress triggers** the student may not see
- Shows **emotional patterns** with specific evidence from entries
- Provides **personalized recommendations** linked to identified triggers
- Mood timeline chart, streak tracking, mood distribution

### 4. Toolbox — Coping Strategies
- 10 evidence-based coping techniques
- Categories: Breathing, Mindfulness, Physical, Cognitive, Social, Study
- Each technique has exam-specific context (NEET/JEE/UPSC)
- Interactive breathing exercise with animated guide

### 5. Crisis Detection
- Scans every entry for crisis-level language
- Immediately shows Indian helpline resources (KIRAN, iCall, Vandrevala Foundation)
- Warm, non-judgmental messaging

---

## Technical Highlights

### Security
- In-memory only (no database, no localStorage)
- Server-side AI processing via API routes
- Input sanitization (Zod + DOMPurify)
- CSP headers, rate limiting, XSS prevention
- API key in .env.local (never committed)

### Code Quality
- TypeScript strict mode
- Modular architecture: /engine, /components, /utils, /types
- Design patterns: Strategy, Context, Reducer
- Security comments on every file
- JSDoc documentation

### Efficiency
- Local sentiment analysis (<5ms per entry)
- Gemini API for deep analysis (only when needed)
- Bounded history (max 30 entries)
- Next.js code splitting

### Testing
- 90 unit + integration tests passing
- Tests cover: sentiment, crisis, patterns, recommendations, validators
- Edge cases: XSS, empty input, long text, performance

### Accessibility
- Skip to content link, semantic landmarks
- ARIA labels, aria-live regions
- Keyboard navigation, visible focus
- WCAG 2.1 AA color contrast
- prefers-reduced-motion respected

---

## Setup and Run

```bash
# Install dependencies
npm install

# Add your Gemini API key
cp .env.example .env.local
# Edit .env.local and add: GEMINI_API_KEY=your_key

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Assumptions Made

1. Target users are Indian students preparing for NEET, JEE, or UPSC
2. Privacy is paramount — no persistent data storage
3. The app should work even without Gemini (graceful degradation)
4. Students may be in genuine distress — crisis detection is a safety requirement
5. The AI must remember and reference past entries (not be stateless)
6. Pattern analysis improves with more entries (minimum 3 required)
7. Emergency resources are India-based helplines

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| AI | Google Gemini 2.0 Flash |
| Sentiment | `sentiment` npm (AFINN-based) |
| UI | Tailwind CSS (dark calm theme) |
| Charts | Recharts |
| Validation | Zod |
| State | React Context + useReducer |
| Testing | Jest + React Testing Library |
