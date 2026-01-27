# Multi-Language Support Implementation Checklist

**Project:** website-vacancy-analyzer
**Goal:** Add Dutch ↔ English language switching with next-intl
**Started:** 2025-01-23
**Estimated Time:** ~11 hours

---

## Phase 1: Infrastructure Setup (Foundation) ⏳

### 1.1 Install Dependencies
- [x] Install `next-intl` package ✅
- [x] Install types if needed (`@types/next-intl`) ✅ (included in package)

### 1.2 Create Core Configuration Files
- [x] Create `i18n.ts` - i18n configuration ✅
- [x] Create `middleware.ts` - Language detection and routing ✅
- [ ] Update `next.config.js` - Add i18n configuration

### 1.3 Create Translation Files
- [ ] Create `messages/nl.json` - Dutch translations (extract existing)
- [ ] Create `messages/en.json` - English translations

### 1.4 Restructure App Directory
- [ ] Create `app/[locale]/` directory
- [ ] Move `app/page.tsx` → `app/[locale]/page.tsx`
- [ ] Move `app/layout.tsx` → `app/[locale]/layout.tsx`
- [ ] Move `app/report/` → `app/[locale]/report/`
- [ ] Keep `app/api/` at root (no locale prefix)
- [ ] Update layout.tsx to wrap with NextIntlClientProvider

### 1.5 Create Language Switcher Component
- [ ] Create `components/language-switcher.tsx`
- [ ] Add dropdown/toggle UI (NL ↔ EN)
- [ ] Implement locale switching logic
- [ ] Add cookie persistence

**Phase 1 Status:** 🟡 In Progress
**Completed:** 0/17 items

---

## Phase 2: Extract & Translate Core UI ⏳

### 2.1 Landing Page (app/[locale]/page.tsx)
- [ ] Extract hero section text (~8 strings)
- [ ] Extract problem section text (~10 strings)
- [ ] Extract feature bullets (~8 strings)
- [ ] Extract CTA buttons (~4 strings)
- [ ] Add `useTranslations()` hooks
- [ ] Test landing page in both languages

### 2.2 Report Components - Pillar Grid
- [ ] Extract 8 pillar titles to translations
- [ ] Extract pillar descriptions to translations
- [ ] Update `components/report/pillar-grid.tsx` with `t()` calls
- [ ] Test pillar grid in both languages

### 2.3 Report Components - Score Hero
- [ ] Extract 4 verdict labels (Uitstekend, Goed, etc.)
- [ ] Extract verdict descriptions
- [ ] Update `components/report/score-hero.tsx` with `t()` calls
- [ ] Test score hero in both languages

### 2.4 Report View Component
- [ ] Extract optimization messages (8 items)
- [ ] Extract modal text ("De smaak te pakken?")
- [ ] Extract limit reached modal text
- [ ] Extract email modal text
- [ ] Update `components/report-view.tsx` with `t()` calls
- [ ] Test report view in both languages

### 2.5 Add Language Switcher to UI
- [ ] Add language switcher to navbar on landing page
- [ ] Add language switcher to navbar on report page
- [ ] Style language switcher consistently
- [ ] Test switcher interaction and persistence

**Phase 2 Status:** 🔴 Not Started
**Completed:** 0/22 items

---

## Phase 3: AI Prompts & API Routes ⏳

### 3.1 Update Prompts Library
- [ ] Add locale parameter to `getAnalyzerPrompt()`
- [ ] Translate analyzer system prompt to English
- [ ] Add locale parameter to `OPTIMIZER_PROMPT`
- [ ] Translate optimizer system prompt to English
- [ ] Add locale to category adjustment logic
- [ ] Test prompt generation in both languages

### 3.2 Update Analyze API
- [ ] Add locale to request body in `app/api/analyze/route.ts`
- [ ] Pass locale to `getAnalyzerPrompt()`
- [ ] Pass locale to Gemini API call
- [ ] Store locale in database (optional)
- [ ] Test analysis API with both locales

### 3.3 Update Optimize API
- [ ] Add locale to request body in `app/api/optimize/route.ts`
- [ ] Pass locale to `optimizeVacancy()`
- [ ] Pass locale to email function
- [ ] Test optimization API with both locales

### 3.4 Update Client-Side API Calls
- [ ] Update landing page to pass locale to analyze API
- [ ] Update report view to pass locale to optimize API
- [ ] Get locale from URL params/context

**Phase 3 Status:** 🔴 Not Started
**Completed:** 0/14 items

---

## Phase 4: Email Templates ⏳

### 4.1 Email Content Translation
- [ ] Extract email subject line
- [ ] Extract Phase 1 intro text
- [ ] Extract Phase 2 intro text (upsell)
- [ ] Extract "Why this matters" content
- [ ] Extract CTA button text
- [ ] Extract footer contact text

### 4.2 Update Email Function
- [ ] Add locale parameter to `sendOptimizedVacancyEmail()`
- [ ] Add conditional logic for locale-based content
- [ ] Update subject line generation
- [ ] Update HTML template with locale-aware content
- [ ] Test email in Dutch
- [ ] Test email in English

### 4.3 Email Rendering Tests
- [ ] Test email in Gmail (both languages)
- [ ] Test email in Outlook (both languages)
- [ ] Check for text overflow issues
- [ ] Verify PDF attachment works for both languages

**Phase 4 Status:** 🔴 Not Started
**Completed:** 0/14 items

---

## Phase 5: Metadata & SEO ⏳

### 5.1 Dynamic Metadata
- [ ] Update `app/[locale]/layout.tsx` with generateMetadata()
- [ ] Add locale-based title
- [ ] Add locale-based description
- [ ] Add locale-based keywords
- [ ] Update OpenGraph locale (nl_NL vs en_US)

### 5.2 SEO Tags
- [ ] Add hreflang tags for /nl route
- [ ] Add hreflang tags for /en route
- [ ] Add canonical URLs
- [ ] Update sitemap.xml (if exists)

### 5.3 Structured Data
- [ ] Update JSON-LD with locale-aware content
- [ ] Test structured data in Google Rich Results Test

**Phase 5 Status:** 🔴 Not Started
**Completed:** 0/11 items

---

## Phase 6: Testing & Polish ⏳

### 6.1 Functional Testing
- [ ] Test language switcher on landing page
- [ ] Test language switcher on report page
- [ ] Verify URL changes correctly (/nl → /en)
- [ ] Verify cookie persistence works
- [ ] Test browser back/forward with language switching
- [ ] Test direct URL access (/en/report/abc123)

### 6.2 Content Testing
- [ ] Verify all landing page text translates
- [ ] Verify all report page text translates
- [ ] Verify pillar labels translate
- [ ] Verify verdict labels translate
- [ ] Verify modal text translates

### 6.3 AI Testing
- [ ] Submit vacancy in Dutch, verify analysis in Dutch
- [ ] Submit vacancy in English, verify analysis in English
- [ ] Request optimization in Dutch, verify output in Dutch
- [ ] Request optimization in English, verify output in English
- [ ] Check AI response quality in both languages

### 6.4 Email Testing
- [ ] Trigger optimization email in Dutch
- [ ] Trigger optimization email in English
- [ ] Verify subject line is correct language
- [ ] Verify email body is correct language
- [ ] Verify PDF is generated correctly

### 6.5 SEO Testing
- [ ] Check metadata in Dutch version
- [ ] Check metadata in English version
- [ ] Verify hreflang tags present
- [ ] Test OpenGraph preview (Twitter, Facebook)

### 6.6 Edge Cases
- [ ] Test existing report URL redirect (/report/abc → /nl/report/abc)
- [ ] Test with no cookie (should default to nl)
- [ ] Test Accept-Language header detection
- [ ] Test on mobile devices
- [ ] Test with ad blockers (localStorage/cookie access)

### 6.7 Performance
- [ ] Check page load time with translations
- [ ] Verify no hydration errors
- [ ] Check middleware performance

**Phase 6 Status:** 🔴 Not Started
**Completed:** 0/32 items

---

## Overall Progress

| Phase | Status | Progress | Time Est. |
|-------|--------|----------|-----------|
| Phase 1: Infrastructure Setup | 🟡 In Progress | 0/17 | ~2 hours |
| Phase 2: Core UI Translation | 🔴 Not Started | 0/22 | ~3 hours |
| Phase 3: AI & API Routes | 🔴 Not Started | 0/14 | ~2 hours |
| Phase 4: Email Templates | 🔴 Not Started | 0/14 | ~1.5 hours |
| Phase 5: Metadata & SEO | 🔴 Not Started | 0/11 | ~1 hour |
| Phase 6: Testing & Polish | 🔴 Not Started | 0/32 | ~1.5 hours |
| **TOTAL** | **🟡 In Progress** | **0/110** | **~11 hours** |

---

## Critical Files Modified

### ✅ Completed
- None yet

### 🟡 In Progress
- None yet

### 🔴 To Do
- `middleware.ts` (create)
- `i18n.ts` (create)
- `messages/nl.json` (create)
- `messages/en.json` (create)
- `components/language-switcher.tsx` (create)
- `app/[locale]/layout.tsx` (move & modify)
- `app/[locale]/page.tsx` (move & modify)
- `app/[locale]/report/[id]/page.tsx` (move & modify)
- `lib/prompts.ts` (modify)
- `lib/email.ts` (modify)
- `app/api/analyze/route.ts` (modify)
- `app/api/optimize/route.ts` (modify)
- `components/report/pillar-grid.tsx` (modify)
- `components/report/score-hero.tsx` (modify)
- `components/report-view.tsx` (modify)
- `next.config.js` (modify)
- `db/schema.ts` (optional - add language field)

---

## Known Issues / Blockers
- None yet

---

## Notes
- Default locale: `nl` (Dutch)
- Supported locales: `nl`, `en`
- Cookie name: `NEXT_LOCALE`
- Cookie max age: 1 year
- URL structure: `/[locale]/path` (e.g., `/nl/report/abc123`)
- API routes stay at `/api/*` (no locale prefix)

---

## Post-Implementation Tasks
- [ ] Update README with i18n documentation
- [ ] Document translation workflow
- [ ] Add API documentation for locale parameter
- [ ] Create translation contribution guide
- [ ] Consider adding language analytics tracking
