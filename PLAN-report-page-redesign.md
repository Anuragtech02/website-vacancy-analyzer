# Report Page Redesign Plan

## Overview

Transform the report page from a passive analysis display into a conversion-focused experience that clearly communicates value and drives users to unlock the optimized vacancy.

### Goals
1. **Highlight the score and issues prominently** - Make users feel the gap between their vacancy and a perfect one
2. **Always-visible CTA** - Persistent banner/button to unlock the optimized version
3. **Brand alignment** - Connect visually with vacaturetovenaar.nl (orange accent, similar patterns)
4. **Mobile-first conversion** - Ensure the CTA flow works perfectly on mobile

---

## Current Problems

| Issue | Impact | Priority |
|-------|--------|----------|
| Score floats disconnected from content | Users don't understand what the score means | High |
| Critical issues buried in sidebar | Users miss the most compelling conversion drivers | High |
| No persistent CTA | Users must scroll to find unlock button | Critical |
| "Original Source" tab shown by default | Shows content users already have, not value | Medium |
| No brand connection to main product | Missed cross-sell opportunity | Medium |
| Generic "Free for a limited time" | No urgency or scarcity | Medium |
| No visual comparison (current vs optimized) | Users can't see the potential improvement | High |

---

## New Layout Architecture

### Desktop Layout (1200px+)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (existing - keep as is)                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ HERO SECTION                                                     │   │
│  │ ┌──────────────┐  Job Title                                      │   │
│  │ │     6.6      │  Organization • Location • Type                 │   │
│  │ │    /10       │                                                 │   │
│  │ │   [SCORE]    │  "Your vacancy needs work. Here's why..."       │   │
│  │ └──────────────┘                                                 │   │
│  │                  [🔓 Get the Perfect 10/10 Version - Free]       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CRITICAL ISSUES (Full Width Cards)                               │   │
│  │ ┌───────────────────────┐ ┌───────────────────────┐              │   │
│  │ │ ❌ Empty Sections     │ │ ❌ Generic Team Desc   │              │   │
│  │ │ "Wat breng je mee?"   │ │ Candidates don't get   │              │   │
│  │ │ is empty...           │ │ a feel for culture...  │              │   │
│  │ └───────────────────────┘ └───────────────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ SCORE BREAKDOWN (Pillar Cards Grid)                              │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │   │
│  │ │ Structure   │ │ Persona Fit │ │ EVP Brand   │ │ Tone        │ │   │
│  │ │ 4.5  ██░░░  │ │ 6.0  ████░░ │ │ 7.0  █████░ │ │ 5.5  ███░░░ │ │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │   │
│  │ │ Inclusion   │ │ Mobile      │ │ SEO         │ │ Neuro       │ │   │
│  │ │ 7.5  █████░ │ │ 6.0  ████░░ │ │ 5.0  ███░░░ │ │ 6.5  ████░░ │ │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ORIGINAL TEXT (Collapsible/Secondary)                            │   │
│  │ [▼ View Original Vacancy Text]                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ STICKY BOTTOM CTA BANNER                                                │
│ 🪄 Transform this vacancy into a 10/10     [Unlock Now - It's Free]    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────────┐
│ HEADER                  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │      6.6 /10        │ │
│ │   Needs Work        │ │
│ └─────────────────────┘ │
│                         │
│ Job Title               │
│ Org • Location          │
│                         │
│ "Your vacancy has       │
│ critical issues..."     │
│                         │
│ [Get 10/10 Version]     │
├─────────────────────────┤
│ CRITICAL ISSUES         │
│ ┌─────────────────────┐ │
│ │ ❌ Issue 1          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ❌ Issue 2          │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ SCORES (2x4 Grid)       │
│ ┌─────────┐ ┌─────────┐ │
│ │ Struct  │ │ Persona │ │
│ │ 4.5     │ │ 6.0     │ │
│ └─────────┘ └─────────┘ │
│ ...                     │
├─────────────────────────┤
│ [▼ Original Text]       │
├─────────────────────────┤
│ STICKY BANNER           │
│ [Unlock 10/10 Version]  │
└─────────────────────────┘
```

---

## Component Architecture

### New Components to Create

#### 1. `components/report/score-hero.tsx`
Main hero section with score circle, job title, and primary CTA.

```typescript
interface ScoreHeroProps {
  score: number;
  verdict: 'excellent' | 'good' | 'needs_work' | 'poor';
  jobTitle: string;
  organization: string | null;
  executiveSummary: string;
  onUnlockClick: () => void;
  isUnlocked: boolean;
}
```

Features:
- Large animated score circle (keep existing animation)
- Verdict badge with color coding
- Executive summary text
- Primary CTA button (hidden when unlocked)
- Metadata pills (org, location, type)

#### 2. `components/report/issue-cards.tsx`
Grid of critical issues with visual emphasis.

```typescript
interface IssueCardsProps {
  issues: Array<{
    problem: string;
    why_it_matters: string;
    how_to_improve: string;
  }>;
}
```

Features:
- 2-column grid on desktop, 1-column on mobile
- Red accent color for critical emphasis
- Expandable "how to fix" section (teaser for optimization)
- Icon per issue type

#### 3. `components/report/pillar-grid.tsx`
Score breakdown with all 8 pillars in a responsive grid.

```typescript
interface PillarGridProps {
  pillars: AnalysisResult['pillars'];
  estimatedScores?: OptimizationResult['estimated_scores']; // Show improvement when unlocked
  isUnlocked: boolean;
}
```

Features:
- 4x2 grid on desktop, 2x4 on mobile
- Progress bars with color coding
- Expandable diagnosis text
- **Before/After scores:** When unlocked, show "6.6 → 9.2" format with green arrow indicator
- Animated score change on unlock

#### 4. `components/report/sticky-cta-banner.tsx`
Persistent bottom banner for conversion.

```typescript
interface StickyCTABannerProps {
  onUnlockClick: () => void;
  isUnlocked: boolean;
}
```

Features:
- Fixed to bottom of viewport
- Hidden when unlocked or scrolled to footer
- Animated entry (slide up)
- Mobile-optimized (full width button)
- Trust indicators (secure, no spam)

#### 5. `components/report/original-text-collapsible.tsx`
Collapsible section for original vacancy text.

```typescript
interface OriginalTextCollapsibleProps {
  vacancyText: string;
  defaultOpen?: boolean;
}
```

Features:
- Collapsed by default
- Smooth expand animation
- Copy button
- Line numbers (optional)

#### 6. `components/report/trust-bar.tsx`
Social proof metrics bar.

```typescript
interface TrustBarProps {
  variant?: 'compact' | 'full';
}
```

Features:
- Display key metrics: "75% less time", "25% higher conversion", "15% more applicants"
- Compact version for footer area
- Full version with icons for standalone section
- "Powered by Vacature Tovenaar" branding with link

#### 7. `components/report/success-state.tsx`
Shown after email submission (replaces CTA areas).

```typescript
interface SuccessStateProps {
  email: string;
  estimatedScores: OptimizationResult['estimated_scores'];
}
```

Features:
- "Check your inbox!" headline with mail icon
- Shows email address submitted
- Displays estimated score improvement summary
- Link to main Vacature Tovenaar site

### Components to Modify

#### `components/report-view.tsx`
Complete restructure to use new components:

```typescript
export function ReportView({ analysis, vacancyText, reportId }: ReportViewProps) {
  return (
    <div>
      <ScoreHero {...} />
      <IssueCards {...} />
      <PillarGrid {...} />
      <OriginalTextCollapsible {...} />
      <StickyCTABanner {...} />
      <EmailModal {...} /> {/* Keep existing */}
    </div>
  );
}
```

#### `app/globals.css`
No color changes needed - keeping indigo primary as confirmed.

### Components to Remove/Deprecate

- `components/report/text-viewer.tsx` - Replace with collapsible + separate optimized view
- `components/report/analysis-sidebar.tsx` - Content moves to main flow

---

## Implementation Phases

### Phase 1: Core Layout Restructure
**Files:** `report-view.tsx`, `score-hero.tsx`, `sticky-cta-banner.tsx`

1. Create `ScoreHero` component with score circle + CTA
2. Create `StickyCTABanner` component
3. Restructure `ReportView` to single-column layout
4. Test on mobile and desktop

### Phase 2: Issue Cards & Pillar Grid
**Files:** `issue-cards.tsx`, `pillar-grid.tsx`

1. Create `IssueCards` with expanded design
2. Create `PillarGrid` with 8-pillar layout
3. Add responsive grid breakpoints
4. Connect to existing data

### Phase 3: Original Text & Polish
**Files:** `original-text-collapsible.tsx`

1. Create collapsible original text section
2. Add animations and micro-interactions
3. Remove deprecated components (text-viewer.tsx, analysis-sidebar.tsx)

### Phase 4: Success State & Trust Elements
**Files:** All report components, `trust-bar.tsx`

1. Show score comparison when unlocked (before/after in pillar cards)
2. Success state in hero: "Check your inbox!" with email confirmation
3. Add confetti/celebration animation on unlock
4. Create trust bar with metrics (75% less time, 25% higher conversion)
5. Hide CTA banner when unlocked, show success message instead

---

## Styling Guidelines

### Colors
- **Score colors:** Green (>=8), Yellow (6-7.9), Red (<6)
- **Critical issues:** Red-50 background, Red-600 icons
- **CTA buttons:** Primary indigo for main, Orange for secondary emphasis
- **Cards:** White with subtle shadow, slate-200 border

### Typography
- **Score number:** text-5xl font-black
- **Job title:** text-3xl font-extrabold
- **Issue titles:** text-base font-bold
- **Body text:** text-sm text-slate-600

### Spacing
- Section gap: `space-y-8` (32px)
- Card padding: `p-6` (24px)
- Grid gap: `gap-4` (16px)

### Animations
- Score circle: Existing SVG stroke animation
- Sticky banner: `animate-slide-up` on entry
- Card hover: `hover:shadow-md hover:border-blue-200`
- Collapsible: `transition-all duration-300`

---

## Data Flow

```
ReportPage (Server Component)
    │
    ├── Fetch report from DB
    ├── Parse analysis JSON
    │
    └── ReportView (Client Component)
            │
            ├── State: isUnlocked, showModal, optimizationResult
            │
            ├── ScoreHero
            │     └── Uses: summary.total_score, summary.verdict, metadata
            │
            ├── IssueCards
            │     └── Uses: summary.key_issues
            │
            ├── PillarGrid
            │     └── Uses: pillars, (optimizationResult.estimated_scores when unlocked)
            │
            ├── OriginalTextCollapsible
            │     └── Uses: vacancyText
            │
            ├── StickyCTABanner
            │     └── Uses: isUnlocked, onUnlockClick
            │
            └── EmailModal (existing)
                  └── Handles: email capture, API call
```

---

## Mobile Considerations

1. **Score Hero:** Stack vertically, score above title
2. **Issue Cards:** Single column, full width
3. **Pillar Grid:** 2 columns, compact cards
4. **Sticky Banner:** Full width, larger touch target (min 48px height)
5. **Collapsible:** Opens inline, no overlay

---

## Success Metrics (Post-Implementation)

Track these to measure improvement:
- **Unlock rate:** % of report views that click unlock CTA
- **Email submit rate:** % of modal opens that submit email
- **Scroll depth:** How far users scroll before clicking CTA
- **Time to CTA:** Seconds from page load to first CTA click
- **Mobile conversion:** Unlock rate on mobile vs desktop

---

## Files to Create/Modify Summary

### Create New
- [ ] `components/report/score-hero.tsx` - Main hero with score, title, CTA
- [ ] `components/report/issue-cards.tsx` - Critical issues grid
- [ ] `components/report/pillar-grid.tsx` - 8-pillar score breakdown with before/after
- [ ] `components/report/sticky-cta-banner.tsx` - Persistent bottom CTA
- [ ] `components/report/original-text-collapsible.tsx` - Collapsible original text
- [ ] `components/report/trust-bar.tsx` - Social proof metrics
- [ ] `components/report/success-state.tsx` - Post-unlock success messaging

### Modify
- [ ] `components/report-view.tsx` (major restructure)
- [ ] `app/report/[id]/page.tsx` (minor - adjust container if needed)

### Delete (after migration)
- [ ] `components/report/text-viewer.tsx`
- [ ] `components/report/analysis-sidebar.tsx`

---

## Design Decisions (Confirmed)

1. **Optimized text delivery:** Email only - after unlock, user receives optimized vacancy via email. The page shows a success state with "Check your inbox" messaging. No optimized text displayed on website.

2. **Score comparison:** Show before/after scores side-by-side in pillar cards (e.g., "6.6 → 9.2 estimated") when unlocked.

3. **Brand colors:** Keep current indigo primary. No orange accent.

4. **Social proof:** Yes - add trust bar with metrics from main site (75% less time, 25% higher conversion, etc.)
