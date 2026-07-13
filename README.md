# Ground Zero — Deterministic Big Five Assessment (Standalone)

A complete, self-contained Big Five personality assessment built with **Next.js 14 App Router**.  
All calculations happen entirely in the browser—your data never leaves the client until **you** choose to export it.

---

## ✨ Key Features

• **Single Comprehensive Assessment** – One unified assessment flow (`GZFinalAssessment.tsx`) covering all 30 facets (6 per domain) plus archetype selection.  
• **Per-Domain Scoring** – Calculates the Big Five for every domain rather than a single global score.  
• **Deterministic Outputs** – No random number generators; the same answers always yield the same scores.  
• **Circuit Previews** – See existential circuit previews after completing each domain.  
• **Archetype Selection** – Rule-based archetype matching followed by 2-3 tie-breaker questions.  
• **Local-Only Storage** – Results live in memory; export to JSON when you're ready.  
• **Comprehensive Results** – Detailed analysis and insights for all personality domains.  
• **Type-Safe** with TypeScript end-to-end.  
• **Dark-first UI** using minimal CSS-tokens for rapid theming.

---

## 🗂️ Project Structure

```
ground-zero-standalone/
├── app/                          # Next.js App Router routes
│   ├── layout.tsx               # Root layout with global styles
│   ├── page.tsx                 # Landing page
│   ├── assessment/page.tsx      # Assessment page (uses GZFinalAssessment)
│   ├── your-id/page.tsx         # Results ID page (shown after assessment)
│   ├── results/page.tsx         # Detailed results display and export
│   ├── who/page.tsx             # "Who You Are" personality insights
│   └── api/
│       ├── llm/route.ts         # AI integration endpoint
│       └── tests/route.ts       # Data storage endpoint
├── components/
│   ├── assessment/              # Assessment-specific components
│   │   ├── GZFinalAssessment.tsx # The only assessment component (30 facets + archetype)
│   │   ├── FullResults.tsx      # Results visualization
│   │   ├── PsychProfileAI.tsx   # AI profile generation
│   │   └── LifeSignalNudge.tsx  # Progress nudges
│   └── who/                     # Personality insight components
│       ├── IdentityMirror.tsx   # Core personality reflection
│       ├── LifeSignals.tsx      # Behavioral indicators
│       ├── FiveCardResults.tsx  # Personality card system
│       ├── AuthorityBar.tsx     # Verification bar
│       └── useTelemetry.ts      # Analytics hook
├── lib/
│   ├── bigfive/                 # Core Big Five domain logic
│   │   ├── constants.ts         # Domain definitions and constants
│   │   ├── logic.ts            # Scoring algorithms
│   │   ├── format.ts           # Data formatting utilities
│   │   ├── who.ts              # Personality insight generation
│   │   ├── who_bank_renderer.ts # Deterministic view generation
│   │   ├── handoff.ts          # Data handoff utilities
│   │   ├── identityMirror.ts   # Identity mirror logic
│   │   ├── signals.ts          # Life signals logic
│   │   └── fiveCardSelector.ts # Card selection logic
│   ├── data/                    # Data bank files
│   │   ├── anchor_statements.json      # Behavioral statements for rating
│   │   ├── assessment_prompts.json     # Question prompts for each domain
│   │   ├── confirmation_questions.json # Yes/No/Maybe questions
│   │   ├── domain_descriptions.json    # Domain descriptions and explanations
│   │   ├── facet_descriptions.json     # Individual facet descriptions
│   │   ├── facet_hints.json           # Hints for facet selection
│   │   ├── facet_interpretations.json # Score interpretations
│   │   ├── types.ts                   # TypeScript type definitions
│   │   ├── validator.ts               # Data validation schemas
│   │   ├── contentManager.ts          # Content management utilities
│   │   └── contentLoader.ts           # Content loading functions
│   ├── crypto/sha256.ts         # Cryptographic hashing
│   ├── logic/                   # Generic utilities
│   │   ├── guards.ts           # Type guards
│   │   ├── predicates.ts       # Boolean predicates
│   │   └── schema.ts           # TypeScript schemas
│   ├── services/                # External services
│   └── server/                  # Database connections
│       ├── supabase.ts         # Supabase connection
│       └── supabase.ts         # Supabase connection
├── styles/globals.css           # Global styles and design tokens
├── types/jsx.d.ts              # JSX type augmentations
├── who_you_are_bank.json       # Main personality bank with cards and insights
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.mjs             # Next.js configuration
└── next-env.d.ts               # Next.js type definitions
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Navigate to the standalone folder:**
   ```bash
   cd ground-zero-standalone
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables (optional for AI features):**
   ```bash
   # Create .env.local file
   echo "GOOGLE_API_KEY=your_api_key_here" > .env.local
   echo "GEMINI_MODEL=gemini-2.5-pro" >> .env.local
   ```

4. **Start the development server:**
   ```bash
   pnpm dev -p 3001
   # or
   npm run dev -- -p 3001
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3001](http://localhost:3001)

---

## 🎯 User Journey

### 1. **Landing Page** (`/`)
- Learn about Ground Zero and the assessment
- View archetype previews and features
- Start the assessment

### 2. **Assessment** (`/assessment`)
- **Single comprehensive assessment** using `GZFinalAssessment.tsx`
- Complete 30 facets (6 per domain across all 5 Big Five domains)
- For each facet:
  - Answer a binary question (Yes/Yup/No)
  - If "No" is selected, answer a Likert scale question (1-5)
  - If "Yes" or "Yup" is selected, move to next facet
- Progress tracking with circuit previews shown after completing each domain
- After all 30 facets, complete archetype selection (2-3 tie-breaker questions)
- Results are automatically saved and user is redirected to their ID page

### 3. **Your ID Page** (`/your-id`)
- Personalized personality profile with archetype
- Identity mirror with key traits
- Domain snapshot and quick profile
- Core conflict patterns
- Existential circuits visualization
- Share and download options (PDF/JSON)
- Link to detailed results

### 4. **Results Page** (`/results`)
- View comprehensive results for all domains
- Verify data integrity with SHA-256 hashes
- Export results as JSON
- Generate AI personality profile (optional)

### 5. **Who You Are Page** (`/who`)
- Detailed personality insights
- Identity mirror with key traits
- Life signals visualization
- Five-card personality system

---

## 🔧 Core Features

### **Assessment Logic**
- **30-Facet Linear Flow**: One question per facet across all 5 domains (6 facets per domain)
- **Binary → Likert Path**: Each facet starts with a binary question; "No" routes to Likert clarification
- **Asymmetric Scoring**: Likert responses are mapped asymmetrically (5→1, 4→2, 3→2.5, 2→3, 1→3.5) when coming from "No" path
- **Circuit Previews**: After completing each domain (6 facets), users see a preview of their existential circuit
- **Archetype Selection**: After all 30 facets, a 2-3 question tie-breaker determines archetype from rule-based matches
- **Deterministic Scoring**: Same inputs always produce same outputs
- **Per-Domain Analysis**: More granular than traditional Big Five
- **Hash Verification**: Cryptographic integrity checking

### **Data Management**
- **Local Storage**: Results stored in browser localStorage
- **Export/Import**: Full data portability
- **Hash Verification**: SHA-256 for data integrity

### **Personality Analysis**
- **Comprehensive Insights**: Detailed personality analysis and interpretation
- **Deterministic Content**: Based on assessment results
- **Interactive Results**: Explore your personality traits and patterns

---

## 🔐 Environment Variables


### Optional (for external services)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📄 Exporting Results

On the **Results** page, click **Export JSON** to download a portable snapshot of all question responses and computed facet/domain scores.  
The JSON can be re-imported later for further analysis.

---

## 🧑‍💻 Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Key Files to Understand
- **`components/assessment/GZFinalAssessment.tsx`** - The only assessment component (30 facets + archetype selection)
- **`lib/bigfive/constants.ts`** - All domain and facet definitions
- **`lib/bigfive/logic.ts`** - Core scoring algorithms
- **`gz-final/bankv1.json`** - Assessment question bank (binary and Likert questions per facet)
- **`arctyps rules.json`** - Archetype matching rules
- **`arctyps routing.ts`** - Archetype selection logic
- **`who_you_are_bank.json`** - Personality insights and cards
- **`lib/data/`** - Additional assessment content and data

---

## 🎨 Customization

### Styling
- Modify `styles/globals.css` for design changes
- Uses CSS custom properties for theming
- Dark-first design with minimal aesthetic

### Content
- Update `gz-final/bankv1.json` for assessment questions (binary and Likert questions per facet)
- Update `arctyps rules.json` for archetype matching rules
- Modify `who_you_are_bank.json` for personality insights
- Update `lib/data/` JSON files for additional content

### Logic
- Edit `lib/bigfive/logic.ts` for scoring changes
- Modify `lib/bigfive/constants.ts` for domain definitions
- Update validation in `lib/data/validator.ts`

---

## 📊 Data Structure

### Assessment Results
The assessment produces results for all 5 domains plus an archetype:

```typescript
// Array of domain results
[
  {
    domain: 'O' | 'C' | 'E' | 'A' | 'N',
    payload: {
      version: string,
      domain: 'O' | 'C' | 'E' | 'A' | 'N',
      phase1: { p: Record<string, number>, m: Record<string, number>, t: Record<string, number>, P: Record<string, number> },
      phase2: { answers: Array<{facet: string, idx: number, value: number}>, A_raw: Record<string, number> },
      phase3: { asked: Array<{facet: string, answer: 'Yes' | 'No' | 'Maybe'}> },
      final: { A_pct: Record<string, number>, bucket: Record<string, 'High' | 'Medium' | 'Low'>, order: string[], domain_mean_raw: number, domain_mean_pct: number },
      audit: { personalization: DomainKey | null }
    }
  },
  // ... one for each domain (O, C, E, A, N)
  {
    domain: 'ARCH',
    payload: {
      winner: string, // archetype ID (e.g., 'sovereign', 'rebel')
      trace: Array<{ q: string, type: 'triad' | 'binary', options: string[], pick: string }>
    }
  }
]
```

---

## 🚀 Deployment

This project is ready for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

Simply push to GitHub and import the project on your chosen platform.

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.

---

**Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.**
