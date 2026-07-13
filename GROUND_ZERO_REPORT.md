# Ground Zero: Complete System Report

## Executive Summary

**Ground Zero** is a deterministic personality assessment system that combines Big Five psychology, existential philosophy, and computational design to deliver reproducible identity blueprints. Unlike traditional personality tests that rely on randomization or opaque algorithms, Ground Zero provides 100% deterministic results—the same answers always produce the same scores, with cryptographic verification.

The system measures 30 personality facets across 5 domains, assigns users to one of 12 archetypes, identifies existential circuits, maps conflict patterns, and provides compatibility analysis between individuals. All calculations happen client-side, ensuring privacy and transparency.

---

## 1. Core Philosophy

### 1.1 Determinism Over Randomization
- **No random number generators**: Every calculation is explicit and reproducible
- **Deterministic scoring**: Same inputs → same outputs, always
- **Cryptographic verification**: SHA-256 hashes ensure data integrity
- **Transparent rules**: All matching logic is rule-based and inspectable

### 1.2 Identity as Blueprint
Ground Zero positions personality not as a fixed label, but as an **operational blueprint**:
- **How you operate**: Your behavioral patterns and tendencies
- **What tensions shape you**: Internal conflicts that drive growth
- **Practical playbooks**: Actionable insights for daily life
- **Existential circuits**: Fundamental energy flows (Life/Death, Signal/Silence, Time/Space, Love/Despair, Seeking/Avoiding)

### 1.3 Dual-Results Approach
The system provides two complementary views:
1. **Traditional psychometric clarity**: Big Five domain and facet scores
2. **Practical identity blueprints**: Archetypes, circuits, conflict patterns, and operational guidance

---

## 2. Assessment Architecture

### 2.1 Single Assessment Flow
**Component**: `GZFinalAssessment.tsx` (the only assessment component)

**Structure**:
- **30 facets total**: 6 facets per domain across 5 domains (O, C, E, A, N)
- **Linear progression**: One question per facet, in domain order
- **Binary → Likert path**: Each facet starts with a binary question; "No" routes to Likert clarification
- **Archetype selection**: After all 30 facets, 2-3 tie-breaker questions determine archetype

### 2.2 Question Types

#### Binary Questions
- **Yes**: Moderate agreement → score = 4
- **Yup, that's always me**: Maximum conviction → score = 5
- **No**: Routes to Likert scale for clarification

#### Likert Scale (when "No" is selected)
5-point scale: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree

**Asymmetric scoring** (when coming from "No" path):
- 5 (Strongly Agree) → 1
- 4 (Agree) → 2
- 3 (Neutral) → 2.5
- 2 (Disagree) → 3
- 1 (Strongly Disagree) → 3.5

This asymmetric mapping ensures that "No" followed by strong agreement on the Likert still reflects lower scores than direct "Yes" responses.

### 2.3 Progress Tracking
- **Real-time progress bar**: Shows completion across 30 facets + archetype questions
- **Circuit previews**: After completing each domain (6 facets), users see a preview of their existential circuit for that domain
- **Domain completion milestones**: O (facets 1-6), C (7-12), E (13-18), A (19-24), N (25-30)

### 2.4 Data Sources
- **Question bank**: `gz-final/bankv1.json` (binary and Likert questions per facet)
- **Domain definitions**: `lib/bigfive/constants.ts`
- **Archetype rules**: `arctyps rules.json`
- **Archetype routing**: `arctyps routing.ts`

---

## 3. The Big Five Domains

### 3.1 Domain Structure
Each domain has **6 facets**, measured on a 1-5 scale:

#### **Openness (O)**
- Imagination
- Artistic Interests
- Emotionality
- Adventurousness
- Intellect
- Liberalism

#### **Conscientiousness (C)**
- Orderliness
- Dutifulness
- Achievement
- Self-Discipline
- Cautiousness
- Self-Efficacy

#### **Extraversion (E)**
- Friendliness
- Gregariousness
- Assertiveness
- Activity Level
- Excitement-Seeking
- Cheerfulness

#### **Agreeableness (A)**
- Trust
- Morality
- Altruism
- Cooperation
- Modesty
- Sympathy

#### **Neuroticism (N)**
- Anxiety
- Anger
- Depression
- Self-Consciousness
- Immoderation
- Vulnerability

### 3.2 Scoring System
- **Raw scores**: 1-5 per facet (from assessment responses)
- **Percentile scores**: 0-100% (normalized from raw scores)
- **Buckets**: High (≥4), Medium (2-4), Low (≤2)
- **Domain means**: Average of all 6 facet scores per domain

### 3.3 Per-Domain Analysis
Unlike traditional Big Five assessments that provide a single global score, Ground Zero calculates scores **per domain**, providing more granular insights into how each personality dimension manifests.

---

## 4. Existential Circuits

### 4.1 Concept
Existential circuits are **fundamental energy flows** that map Big Five domains to existential dimensions:

| Circuit | Domain Mapping | Range | Meaning |
|---------|---------------|-------|---------|
| **Energy (Vitality)** | Extraversion | -1 to +1 | Life ↔ Death |
| **Clarity (Signal)** | Openness | -1 to +1 | Signal ↔ Silence |
| **Structure (Time)** | Conscientiousness | -1 to +1 | Time ↔ Space |
| **Bond (Attachment)** | Agreeableness | -1 to +1 | Love/Security ↔ Despair/Rupture |
| **Drive (Seeking)** | Neuroticism (inverted) | -1 to +1 | Seeking ↔ Pain/Avoid |

### 4.2 Calculation
Circuits are computed from domain means using a **weight matrix**:

```
Circuits = [vitality, signal, time, attachment, seeking]
Domain Scores = Weight Matrix × Circuits
```

The weight matrix (`W`) maps each circuit to domain contributions:
- **E (Extraversion)**: +0.35 vitality, +0.20 signal, +0.05 time, +0.00 attachment, +0.40 seeking
- **N (Neuroticism)**: -0.35 vitality, -0.10 signal, -0.05 time, -0.30 attachment, -0.40 seeking
- **C (Conscientiousness)**: +0.10 vitality, +0.05 signal, +0.70 time, +0.05 attachment, +0.10 seeking
- **O (Openness)**: +0.05 vitality, +0.45 signal, -0.60 time, +0.05 attachment, +0.05 seeking
- **A (Agreeableness)**: +0.10 vitality, +0.15 signal, +0.05 time, +0.60 attachment, -0.10 seeking

### 4.3 Circuit Levels
- **High** (>0.33): Strong expression of the positive pole
- **Medium** (-0.33 to 0.33): Balanced expression
- **Low** (<-0.33): Strong expression of the negative pole

### 4.4 Preview System
After completing each domain, users see a preview of the corresponding circuit:
- **O → Clarity Circuit**: After facets 1-6
- **C → Structure Circuit**: After facets 7-12
- **E → Energy Circuit**: After facets 13-18
- **A → Bond Circuit**: After facets 19-24
- **N → Drive Circuit**: After facets 25-30

---

## 5. Archetype System

### 5.1 The 12 Archetypes
Ground Zero assigns users to one of 12 archetypes, each with unique characteristics:

1. **Sovereign**: Lead with structure, authority, and decisive pace
2. **Rebel**: Break constraints; favor independence over consensus
3. **Visionary**: Invent through ideas; pull toward unseen horizons
4. **Navigator**: Guide through change; adjust course with people
5. **Guardian**: Protect the formation; push momentum when needed
6. **Seeker**: Cut through noise; dig for the underlying truth
7. **Architect**: Design and build systems; deliberate and precise
8. **Spotlight**: Energize the room; pull focus and lift morale
9. **Diplomat**: Smooth turbulence; connect through empathy
10. **Partner**: Stabilize the group; keep the lane steady
11. **Provider**: Carry the load; reliability for others
12. **Vessel**: Move with grace; keep peace and composure

### 5.2 Archetype Selection Process

#### Step 1: Rule-Based Matching
Archetypes are matched using rules defined in `arctyps rules.json`:

**Domain-level rules**: Require specific domain buckets (High/Medium/Low)
- Example: Sovereign requires `C: High, E: High, A: Low`

**Facet-cluster rules**: Require specific facet patterns within domains
- `require`: All listed facets must meet stated bucket
- `min_high`: At least N facets are High
- `any_high`: At least one facet is High
- `any_low`: At least one facet is Low

#### Step 2: Candidate Pool
- All archetypes matching the user's domain/facet profile are selected
- If fewer than 4 matches, the pool is backfilled with non-matching archetypes (shuffled for fairness)
- Minimum pool size: 4 archetypes

#### Step 3: Tie-Breaker Questions
A series of 2-3 questions narrows the pool:

**Question types**:
- **Triad questions**: Choose one of three archetype options
- **Binary questions**: Choose between two archetype options
- **Image pairs**: Visual comparison of two archetypes with descriptions

**Routing logic** (`arctyps routing.ts`):
- Uses template matching to select appropriate questions
- Eliminates non-matching archetypes based on answers
- Continues until one archetype remains

### 5.3 Archetype Metadata
Each archetype has:
- **Title**: Display name (e.g., "Sovereign")
- **ID**: Internal identifier (e.g., "sovereign")
- **Color**: Hex color code for UI theming
- **Image**: PNG asset (`/sovereign.png`, etc.)
- **Description**: Poetic bird-flight metaphor
- **Hint**: Short operational guidance

---

## 6. Conflict Patterns

### 6.1 Concept
Conflict patterns identify **internal tensions** between opposing personality traits that create interesting behavioral dynamics.

### 6.2 Identification Process
Conflict patterns are detected by the `selectFiveCards()` function in `lib/bigfive/fiveCardSelector.ts`:

1. **Trait pairs catalog**: Predefined pairs of opposing traits (e.g., "Pursuit vs Threat", "Order vs Chaos")
2. **Threshold evaluation**: Each trait is evaluated against High/Medium thresholds
3. **Scoring**: Pairs are scored based on how strongly both traits are expressed
4. **Selection**: Top 4 conflict patterns are selected (prioritizing High-tier conflicts)

### 6.3 Conflict Pattern Structure
Each conflict pattern includes:
- **Title**: Name of the conflict (e.g., "Gas pedal meets brake")
- **Explanation**: What the conflict represents
- **Friction**: How it manifests in behavior
- **How both can be true**: Practical guidance for managing the tension
- **Left/Right percentages**: Strength of each opposing trait

### 6.4 Example Conflict Patterns
- **Pursuit vs Threat**: High Openness/Extraversion vs High Neuroticism
- **Order vs Chaos**: High Conscientiousness vs Low Conscientiousness
- **Independence vs Connection**: Low Agreeableness vs High Agreeableness

---

## 7. Compatibility Analysis

### 7.1 Purpose
Compare two individuals' Ground Zero profiles to identify:
- **Synergy points**: Where personalities align
- **Complementary traits**: Where differences create balance
- **Tension areas**: Where mismatches may cause friction
- **Actionable prescriptions**: How to work together effectively

### 7.2 Analysis Components

#### Domain-Level Analysis
For each domain (O, C, E, A, N):
- **Delta calculation**: Difference between two people's domain means
- **Synergy label**: Align, Complement, or Tension
- **Score percentage**: Compatibility score (0-100%)

**Synergy logic**:
- **Align**: Both high or both low (similar approach)
- **Complement**: One high, one medium (or vice versa) - balanced difference
- **Tension**: One high, one low (opposite approaches)

#### Facet-Level Analysis
- **Align pairs**: Facets where both people score similarly (both high or both low)
- **Conflict pairs**: Facets where scores diverge significantly
- **Top levers**: Most impactful facets for the relationship

#### Overall Score
Weighted average of all domain compatibility scores:
- **High** (≥80%): Strong compatibility
- **Moderate** (60-79%): Good compatibility with some areas to manage
- **Low** (<60%): Significant differences requiring active management

### 7.3 Prescriptions
The system generates actionable recommendations:
- **Communication strategies**: How to bridge differences
- **Workflow adjustments**: How to structure collaboration
- **Conflict prevention**: How to avoid friction points
- **Leverage strengths**: How to use complementary traits

### 7.4 Archetype Duality
The system also compares archetypes using `lib/bigfive/archetypeDuality.ts`:
- **Harmony points**: Where archetypes naturally align
- **Clash points**: Where archetypes create tension
- **Interaction patterns**: How the two archetypes work together

---

## 8. Results and Outputs

### 8.1 Your ID Page (`/your-id`)
The primary results page shown after assessment completion:

**Components**:
- **Archetype display**: Name, image, color, description
- **Quick profile**: Style, strength, struggle, stance
- **Domain snapshot**: High/Medium/Low summary for all 5 domains
- **Key insight**: Pull-quote from personality narrative
- **Core conflict pattern**: Top conflict pattern preview
- **Run fingerprint**: SHA-256 hash for verification
- **Share/download options**: PDF and JSON export

### 8.2 Detailed Results (`/results`)
Comprehensive breakdown:
- **Per-domain analysis**: Detailed scores and interpretations
- **Facet-level details**: Individual trait scores and meanings
- **Existential circuits**: Full circuit visualization
- **Conflict patterns**: All identified conflicts
- **Export options**: JSON download with full data

### 8.3 Who You Are Page (`/who`)
Personality insights:
- **Identity mirror**: Core traits and characteristics
- **Life signals**: Behavioral indicators
- **Five-card system**: Personality cards (conflict, social, etc.)
- **Narrative**: Personalized personality description

### 8.4 Data Structure
Results are stored as an array of domain results plus archetype:

```typescript
[
  {
    domain: 'O' | 'C' | 'E' | 'A' | 'N',
    payload: {
      version: string,
      domain: DomainKey,
      phase1: { p, m, t, P: Record<string, number> },
      phase2: { answers: Array, A_raw: Record<string, number> },
      phase3: { asked: Array },
      final: {
        A_pct: Record<string, number>,
        bucket: Record<string, 'High'|'Medium'|'Low'>,
        order: string[],
        domain_mean_raw: number,
        domain_mean_pct: number
      },
      audit: { personalization: DomainKey | null }
    }
  },
  // ... one for each domain
  {
    domain: 'ARCH',
    payload: {
      winner: string, // archetype ID
      trace: Array<{ q, type, options, pick }>
    }
  }
]
```

---

## 9. Technical Architecture

### 9.1 Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (end-to-end type safety)
- **Styling**: Tailwind CSS (dark-first design)
- **Package Manager**: pnpm
- **Port**: 3001

### 9.2 Key Libraries
- **@supabase/supabase-js**: Optional cloud storage
- **html2canvas**: PDF/image export
- **jspdf**: PDF generation
- **@vercel/analytics**: Usage analytics

### 9.3 Core Modules

#### Assessment Logic
- `components/assessment/GZFinalAssessment.tsx`: Main assessment component
- `lib/bigfive/logic.ts`: Scoring algorithms
- `lib/bigfive/format.ts`: Data formatting utilities

#### Personality Analysis
- `lib/bigfive/who.ts`: Personality insight generation
- `lib/bigfive/who_bank_renderer.ts`: Deterministic view generation
- `lib/bigfive/identityMirror.ts`: Identity mirror logic
- `lib/bigfive/signals.ts`: Life signals logic
- `lib/bigfive/fiveCardSelector.ts`: Card selection logic

#### Archetype System
- `arctyps rules.json`: Archetype matching rules
- `arctyps routing.ts`: Archetype selection algorithm
- `lib/bigfive/archetypeDuality.ts`: Archetype comparison

#### Compatibility
- `lib/bigfive/compatibility.ts`: Compatibility calculation
- `lib/bigfive/compatibility_config.ts`: Compatibility configuration

#### Existential Circuits
- `Existential Circuits.ts`: Circuit calculation engine
- `components/who/ExistentialCircuits.tsx`: Circuit visualization

### 9.4 Data Files
- `gz-final/bankv1.json`: Assessment question bank
- `who_you_are_bank.json`: Personality insights and cards
- `arctyps rules.json`: Archetype rules
- `lib/data/`: Additional content (prompts, descriptions, interpretations)

### 9.5 Cryptographic Verification
- **SHA-256 hashing**: All results include cryptographic hashes
- **Deterministic IDs**: Run IDs are derived from result hashes
- **Data integrity**: Users can verify their results haven't been tampered with

---

## 10. User Experience Flow

### 10.1 Landing Page (`/`)
- Hero section with "The Axis" owl image
- Value proposition: "Deterministic Identity Blueprint"
- Proof strip: Runs, reproducibility, archetypes
- How it works section
- Archetype preview (12 archetypes)
- Feature cards
- Testimonials
- FAQ
- CTA to start assessment

### 10.2 Assessment (`/assessment`)
1. **30 Facet Questions**:
   - Binary question per facet
   - Likert clarification if "No"
   - Progress bar updates
   - Circuit preview after each domain

2. **Archetype Selection**:
   - 2-3 tie-breaker questions
   - Visual archetype comparisons
   - Final archetype assignment

3. **Completion**:
   - Results saved to `/api/runs`
   - Redirect to `/your-id?rid={runId}`

### 10.3 Your ID Page (`/your-id`)
- Archetype profile card
- Domain snapshot
- Quick profile bullets
- Core conflict pattern preview
- Share/download options
- Links to detailed results

### 10.4 Additional Pages
- **Results** (`/results`): Detailed domain/facet breakdown
- **Who** (`/who`): Personality insights and cards
- **Compatibility** (`/compatibility`): Compare two profiles
- **Conflict Patterns** (`/conflict-patterns`): Detailed conflict analysis
- **Existential Circuits** (`/existential-circuits`): Circuit visualization

---

## 11. Design Philosophy

### 11.1 Minimal, Analytical UI
- **No streaks, badges, or scores**: Clean, professional presentation
- **Hover to highlight**: Interactive elements respond to hover
- **Click to select and lock**: Clear selection states
- **F-severity preserved**: Important information stands out
- **Consistent background**: Unified color scheme across all phases

### 11.2 Dark-First Design
- Black background with white/amber text
- Yellow/amber accent colors for CTAs
- Neon border effects for important cards
- High contrast for readability

### 11.3 Deterministic Aesthetics
- No random animations or effects
- Predictable, consistent interactions
- Clear visual hierarchy
- Professional, analytical tone

---

## 12. Privacy and Data Handling

### 12.1 Client-Side Processing
- **All calculations in browser**: No server-side scoring
- **Local storage**: Results stored in browser localStorage
- **Optional cloud storage**: Users can choose to save to Supabase
- **Export control**: Users export data when ready

### 12.2 Data Portability
- **JSON export**: Full results in portable format
- **PDF export**: Formatted report for sharing
- **Hash verification**: Cryptographic proof of results
- **Re-import capability**: JSON can be loaded later

### 12.3 Privacy Features
- **No tracking by default**: Analytics are optional
- **User-controlled sharing**: Share only when desired
- **Hash-based IDs**: Run IDs don't reveal personal information
- **Local-first**: Data stays on device unless explicitly exported

---

## 13. Determinism and Verification

### 13.1 Reproducibility
- **Same answers → same scores**: 100% deterministic
- **No random number generators**: All calculations are explicit
- **Rule-based matching**: Archetype selection uses explicit rules
- **Stable stringification**: Hash calculations use sorted keys

### 13.2 Verification System
- **SHA-256 hashes**: Cryptographic verification of results
- **Run fingerprints**: Unique identifiers for each assessment
- **Audit trails**: Complete trace of archetype selection
- **Version tracking**: Assessment version included in results

### 13.3 Transparency
- **Open rules**: Archetype matching rules are inspectable
- **Explicit algorithms**: All scoring logic is documented
- **Deterministic IDs**: Run IDs are derived from results
- **Reproducible calculations**: Anyone can verify the math

---

## 14. Advanced Features

### 14.1 Wow Facets
The system identifies "wow facets" - particularly striking or extreme traits:
- **High contrast**: Facets that stand out from domain mean
- **High visibility**: Facets that are easily observable
- **Extreme scores**: Very high or very low values
- **Pattern recognition**: Identifies interesting behavioral patterns

### 14.2 Life Signals
Behavioral indicators derived from personality scores:
- **Energy patterns**: How you expend and recover energy
- **Social dynamics**: How you interact with others
- **Work patterns**: How you approach tasks and projects
- **Stress responses**: How you handle pressure

### 14.3 Identity Mirror
A reflective view of core personality traits:
- **Strengths**: What you do well naturally
- **Risks**: Where you might struggle
- **Tensions**: Internal conflicts to manage
- **Growth areas**: Opportunities for development

### 14.4 Five-Card System
A card-based visualization of personality:
- **Conflict cards**: Internal tensions
- **Social cards**: Interpersonal traits
- **Domain cards**: Big Five summaries
- **Specialty cards**: Unique combinations

---

## 15. API Endpoints

### 15.1 Assessment Endpoints
- `POST /api/runs`: Save assessment results
- `GET /api/who/{rid}`: Retrieve full profile by run ID
- `GET /api/test-supabase`: Test Supabase connection

### 15.2 Analysis Endpoints
- `GET /api/compatibility?ridA={id}&ridB={id}`: Calculate compatibility
- `GET /api/archetype-duals`: Get archetype comparison data
- `GET /api/assessment`: Assessment metadata

### 15.3 Data Endpoints
- `GET /api/tests`: Test data retrieval
- `GET /api/who/{rid}`: Full profile with all derived data

---

## 16. Future Enhancements

### 16.1 Potential Additions
- **Team compatibility**: Analyze group dynamics
- **Career matching**: Suggest roles based on personality
- **Relationship insights**: Deeper interpersonal analysis
- **Progress tracking**: Compare assessments over time
- **Custom archetypes**: User-defined personality types

### 16.2 Technical Improvements
- **Performance optimization**: Faster calculations
- **Mobile optimization**: Better touch interactions
- **Offline support**: Work without internet
- **Multi-language**: Internationalization
- **Accessibility**: Enhanced screen reader support

---

## 17. Conclusion

Ground Zero represents a new approach to personality assessment:
- **Deterministic**: Reproducible, verifiable results
- **Comprehensive**: 30 facets, 12 archetypes, 5 circuits, conflict patterns
- **Practical**: Actionable insights, not just labels
- **Private**: Client-side processing, user-controlled data
- **Transparent**: Open rules, explicit algorithms, cryptographic verification

The system blends psychology, philosophy, and design to create a unique tool for self-understanding and interpersonal dynamics. By prioritizing determinism and transparency, Ground Zero offers a trustworthy alternative to traditional personality tests.

---

## Appendix: Key Files Reference

### Assessment
- `components/assessment/GZFinalAssessment.tsx`: Main assessment component
- `gz-final/bankv1.json`: Question bank
- `arctyps rules.json`: Archetype rules
- `arctyps routing.ts`: Archetype selection

### Core Logic
- `lib/bigfive/constants.ts`: Domain and facet definitions
- `lib/bigfive/logic.ts`: Scoring algorithms
- `lib/bigfive/format.ts`: Data formatting
- `Existential Circuits.ts`: Circuit calculations

### Personality Analysis
- `lib/bigfive/who.ts`: Personality insights
- `lib/bigfive/fiveCardSelector.ts`: Card selection
- `lib/bigfive/identityMirror.ts`: Identity mirror
- `lib/bigfive/signals.ts`: Life signals

### Compatibility
- `lib/bigfive/compatibility.ts`: Compatibility calculation
- `lib/bigfive/archetypeDuality.ts`: Archetype comparison

### Data
- `who_you_are_bank.json`: Personality bank
- `lib/data/`: Content files (prompts, descriptions, etc.)

---

**Version**: 1.0  
**Last Updated**: 2024  
**System**: Ground Zero Deterministic Identity Engine
