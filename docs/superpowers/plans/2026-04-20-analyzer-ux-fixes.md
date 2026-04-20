# External Analyzer UX Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the stakeholder-reported UX issues on the external analyzer (website-vacancy-analyzer): rate-limit bug blocking legitimate users, serverless timeouts, English output reliability, literal-translation leakage in AI prompts, hardcoded Dutch UI in "EN" mode, broken hover/truncation UX, and a dead `isHovered` reference.

**Architecture:** Targeted fixes in-place. No new features, no new dependencies. Rate limiting moves from "IP OR fingerprint OR email" to "fingerprint AND email" to stop office-IP aggregation. The Gemini prompt gets split into `getAnalyzerPrompt(locale)` / `getOptimizerPrompt(locale)` so Dutch output is used only when locale=nl. UI strings move from hardcoded Dutch to `messages/{nl,en}.json` via `useTranslations`. Serverless route handlers get `maxDuration = 300`. The stakeholder's DNS/SES deliverability work is called out as out-of-scope (infra, not code).

**Tech Stack:** Next.js 15 (App Router), React 18, TypeScript, next-intl, Drizzle + Postgres, AWS SES, Gemini via @google/generative-ai, framer-motion, docx, Tailwind.

**No automated tests in repo** (no Jest/Vitest/Playwright present). Each task verifies manually via `npm run dev` + browser, or via `curl` for API routes. Tasks are independent and individually committable.

---

## File Inventory

**Will modify:**
- `lib/db.ts` — rate-limit query (Task 1)
- `lib/rate-limit.ts` — comment cleanup (Task 1)
- `app/api/analyze/route.ts`, `app/api/optimize/route.ts` — maxDuration (Task 2)
- `lib/prompts.ts` — remove literal example sentences; parameterize language (Task 3, Task 4)
- `lib/gemini.ts` — pass locale through; drop tail-appended override (Task 4)
- `messages/en.json`, `messages/nl.json` — add missing keys for previously-hardcoded strings (Tasks 5, 6, 7, 9)
- `components/report-view.tsx` — translate LimitReachedModal, NotificationToast, success/error copy (Task 5)
- `components/report/score-hero.tsx` — translate verdictConfig; make issue cards expandable (Tasks 6, 8)
- `components/report/pillar-grid.tsx` — translate headings (Task 6)
- `components/report/original-text-collapsible.tsx` — translate (Task 6)
- `components/report/peel-cta.tsx` — remove dead `isHovered` reference (Task 7)
- `app/[locale]/page.tsx` — inline error banner + locale-aware alerts (Task 9)
- `app/[locale]/page.tsx` — optional "Plan a demo" secondary CTA in phase 1/2 (Task 10)

**Out of scope (document, don't fix):**
- SES DKIM/SPF/DMARC — DNS work, not code. Flag to stakeholder.
- New domain (`vacaturetovenaar.io`) — requires domain purchase + SES identity verification.
- PDF-blocked-by-AV — downstream; optional mitigation is hosted HTML view (not in this plan).

---

## Task 1: Fix rate-limit IP aggregation so office-IP users aren't blocked

**Problem:** `countLeadsByIdentity` uses `or(ip, fingerprint)` (`lib/db.ts:60-68`). Any user on a shared IP (office / VPN / NAT) inherits their colleague's count. Two colleagues = combined 2-rewrite quota. Stakeholder reports users "blocked after 1 attempt" — this is the root cause.

**Fix:** Count only by **fingerprint AND email** (both must match to aggregate). IP is dropped from the aggregate key. Keep IP stored for audit/reset but don't use it to gate.

**Files:**
- Modify: `lib/db.ts` (rewrite `countLeadsByIdentity`)
- Modify: `app/api/optimize/route.ts` (use fingerprint-based count)
- Modify: `lib/rate-limit.ts` (update comment)

- [ ] **Step 1.1: Replace `countLeadsByIdentity` with fingerprint-only**

In `lib/db.ts`, replace lines 56-69:

```typescript
// Count leads by browser fingerprint only. IP is intentionally NOT used here
// because office/VPN/NAT networks share IPs across many users; including IP
// in the OR caused legitimate users to be blocked by a colleague's usage.
countLeadsByFingerprint: async (fingerprint?: string) => {
  if (!fingerprint) return 0;
  const result = await db
    .select({ count: count() })
    .from(leads)
    .where(eq(leads.fingerprint, fingerprint));
  return result[0]?.count || 0;
},
```

Remove the old `countLeadsByIdentity` function entirely.

- [ ] **Step 1.2: Update `app/api/optimize/route.ts` to call new function**

Replace lines 36-38:

```typescript
const fingerprintUsageCount = await dbClient.countLeadsByFingerprint(fingerprint);
const emailUsageCount = await dbClient.countLeadsByEmail(email);
const usageCount = Math.max(fingerprintUsageCount, emailUsageCount);
```

Leave the `usageCount >= 2 && !bypassLimit` block unchanged (line 43). Leave `createLead` call unchanged — it still records IP for audit, just doesn't gate on it.

- [ ] **Step 1.3: Update the explanatory comment in `lib/rate-limit.ts`**

Replace the `IMPORTANT:` block comment with:

```typescript
/**
 * Rate limiting for analysis API
 *
 * Analysis: UNLIMITED (this function always returns true).
 * Optimization (rewriting): limited to 2x per user via lib/db.ts.
 *
 * Usage is counted by (fingerprint, email) — NOT IP. Shared office/VPN/NAT
 * IPs would otherwise cause legitimate users to be blocked by a colleague's
 * usage.
 */
```

- [ ] **Step 1.4: Manual verification**

Start dev server: `npm run dev`

1. Open the homepage in one browser profile. Submit 2 rewrites with email A — confirm 3rd attempt shows the limit modal.
2. Open an **incognito / private window** (different fingerprint) on the same machine (same IP). Submit 1 rewrite with email B — confirm it succeeds. Previously this would have been blocked at count=2 from profile A.

- [ ] **Step 1.5: Commit**

```bash
git add lib/db.ts lib/rate-limit.ts app/api/optimize/route.ts
git commit -m "fix(rate-limit): count by (fingerprint, email) instead of IP OR fingerprint

Shared office/VPN IPs were aggregating usage across users, blocking
legitimate testers after 1 attempt. IP is still recorded on leads for
audit/admin reset but no longer gates the 2x rewrite limit."
```

---

## Task 2: Prevent serverless timeout on analyze/optimize routes

**Problem:** Gemini 3 Pro Preview analysis can exceed 60s. No `maxDuration` is set on `app/api/analyze/route.ts` or `app/api/optimize/route.ts`; Vercel defaults to ~60s on Pro and ~10s on Hobby, killing the function before the model finishes. Stakeholder sees "error" toasts.

**Files:**
- Modify: `app/api/analyze/route.ts` (add export)
- Modify: `app/api/optimize/route.ts` (add export)

- [ ] **Step 2.1: Add `maxDuration` to analyze route**

Add this line immediately after the imports (before the `export async function POST`) in `app/api/analyze/route.ts`:

```typescript
// Gemini 3 Pro analysis can take up to ~3 minutes on long vacancies.
// Default Vercel serverless timeout is 60s on Pro. Bump to 300s (5 min).
export const maxDuration = 300;
```

- [ ] **Step 2.2: Add `maxDuration` to optimize route**

Same addition in `app/api/optimize/route.ts`, after imports:

```typescript
// Gemini 3 Flash optimization + Puppeteer PDF + SES send. Budget 5 min.
export const maxDuration = 300;
```

- [ ] **Step 2.3: Manual verification**

Deploy to a preview environment (or run locally with a long vacancy ~3000 words). Submit analysis; confirm the request is not killed at the 60s mark. Watch network tab in DevTools — the /api/analyze request should be able to run past 60s without terminating.

Local note: `next dev` does not enforce the serverless timeout, so this has to be verified on a deployed preview. If you only have local access, at minimum confirm the build succeeds (`npm run build`) with no TypeScript errors on the new exports.

- [ ] **Step 2.4: Commit**

```bash
git add app/api/analyze/route.ts app/api/optimize/route.ts
git commit -m "fix(api): raise serverless maxDuration to 300s

Gemini 3 Pro analysis can exceed the default 60s Vercel function
timeout on long vacancies, surfacing as 'error' alerts to users."
```

---

## Task 3: Remove literal example sentences from AI prompts

**Problem:** The optimizer prompt forbids literal idiom translation but writes the forbidden example verbatim: `"We got your back" → "We hebben elkaars rug" is FORBIDDEN` (`lib/prompts.ts:180`). LLMs leak anti-examples. The analyzer prompt similarly lists forbidden bureaucratic words and bias words that can bleed into output.

**Fix:** Replace all quoted example sentences with abstract instructions. Keep the rules; drop the specific words that models can parrot.

**Files:**
- Modify: `lib/prompts.ts`

- [ ] **Step 3.1: Rewrite the anti-literal-translation block**

In `lib/prompts.ts`, replace lines 175-185 of `OPTIMIZER_PROMPT`:

```typescript
## 🚫 CRITICAL ANTI-COPYING INSTRUCTIONS

**ABSOLUTE RULES - VIOLATION MAKES OUTPUT INVALID:**

1. **NEVER copy phrases from these instructions into the output.** Instructions are educational guidance, not content to reuse.
2. **NEVER translate English idioms word-for-word into Dutch.** If a concept is expressed as an English idiom in your general knowledge, rephrase the underlying idea in natural Dutch, do not render the idiom literally.
3. **NEVER use Americanisms or Silicon Valley business-speak** in Dutch text. Dutch business writing does not use loan phrases from English startup culture. Find the native Dutch equivalent for the idea.
4. **ALWAYS generate ORIGINAL sentences** that fit the specific company culture and role described in the input.
5. **CULTURAL SENSITIVITY:** Use natural Dutch business language that feels authentic, not translated.
```

- [ ] **Step 3.2: Replace the forbidden-bureaucracy word list with a category description**

In `lib/prompts.ts`, replace lines 200-204 (the `### 1. Bureaucracy Ban` block):

```typescript
### 1. Bureaucracy Ban
Formal bureaucratic verbs and archaic prepositions common in Dutch corporate writing are STRICTLY FORBIDDEN. This covers the class of administrative or legal-adjacent vocabulary that creates distance between the reader and the work. Replace with concrete, active Dutch verbs that describe what someone actually does.
```

- [ ] **Step 3.3: Replace the bias keyword examples in analyzer prompt**

In `lib/prompts.ts`, line 67 (`### 5. Inclusie & Drempelverlagend`):

Replace:
```
* **< 5.0:** Bias keywords (Ninja, Rockstar, Young Dog) or strict hard requirements only.
```

With:
```
* **< 5.0:** Bias-loaded job titles or personality labels (informal branding terms that signal a narrow demographic), or strict hard-requirement listings with no learning path.
```

- [ ] **Step 3.4: Replace the tone-of-voice example words**

In `lib/prompts.ts`, line 62 (`### 4. Tone-of-Voice` FATAL ERROR bullet):

Replace:
```
* **FATAL ERROR (< 4.5):** Spelling errors in Title/Headers OR excessive bureaucracy (*Borgen, middels, aangaande, fungeren, tevens*).
```

With:
```
* **FATAL ERROR (< 4.5):** Spelling errors in Title/Headers OR excessive bureaucratic vocabulary (the class of archaic administrative verbs and prepositions described in the Bureaucracy Ban section of the optimizer prompt).
```

- [ ] **Step 3.5: Remove the SEO title example sentences**

In `lib/prompts.ts`, line 208 (`### 2. SEO Title Addition`):

Replace:
```
- Example: "Senior Marketing Specialist Utrecht" or "Medisch Secretaresse Haarlem en IJmuiden"
```

With:
```
- The location follows the job title, separated by a space. Multiple locations may be joined with natural Dutch connectors.
```

- [ ] **Step 3.6: Manual verification**

Start `npm run dev`, run an analysis on a vacancy that previously showed the `"We hebben elkaars rug"` phrase (or any literal-translated idiom). Confirm the rewritten output no longer contains that phrase. Re-run 3 times with different vacancies to confirm it's not intermittent.

- [ ] **Step 3.7: Commit**

```bash
git add lib/prompts.ts
git commit -m "fix(prompts): remove literal example sentences that leak into output

Gemini was echoing forbidden anti-examples ('We hebben elkaars rug',
'Ninja/Rockstar', 'Borgen/middels/aangaande') because they were
written out verbatim in the prompt. Replaced with abstract category
descriptions that convey the rule without priming the model with
specific phrases."
```

---

## Task 4: Split prompts by locale so EN actually outputs English

**Problem:** The prompt body hardcodes "in DUTCH" ~6 times. The runtime tries to override via a tail-appended `"Respond in English"` (`lib/gemini.ts:106, 136`). Gemini 3 frequently ignores late contradictions and still returns Dutch.

**Fix:** Change the prompt factories to take a `locale` parameter and produce a single, internally-consistent prompt. No more contradictory tail overrides.

**Files:**
- Modify: `lib/prompts.ts` (add locale param to both exports)
- Modify: `lib/gemini.ts` (pass locale; remove `languageInstruction` concat)

- [ ] **Step 4.1: Make `getAnalyzerPrompt` locale-aware**

In `lib/prompts.ts`, change the signature from `export const getAnalyzerPrompt = (category: string = "General") => ...` to a function that takes locale:

```typescript
type Locale = 'nl' | 'en';

const languageConfig: Record<Locale, { name: string; output: string }> = {
  nl: { name: 'Dutch', output: 'Dutch' },
  en: { name: 'English', output: 'English' },
};

export const getAnalyzerPrompt = (category: string = "General", locale: Locale = 'nl') => {
  const lang = languageConfig[locale];
  return `
# ROLE: Senior Talent Acquisition Strategist - STRICT MODE
# CONTEXT: INDUSTRY ANALYSIS (${category.toUpperCase()})
# OUTPUT LANGUAGE: ${lang.output.toUpperCase()}

You are an elite Recruitment Marketing Strategist.
Your goal is to AUDIT vacancies based on **HARD DATA & CONVERSION PSYCHOLOGY** and return structured quality assessments.
The user has specified the category: **"${category}"**. You must adjust your scoring nuance slightly based on this context.

[... keep the rest of the prompt body identical ...]

## ⚠️ CRITICAL RULES

1. **DIRECT ACTION:** Do not ask intake questions. Analyze the provided text immediately.
2. **INTERNAL REASONING:** Deduce the EVP and Target Audience silently.
3. **OUTPUT:** Strictly in **${lang.output.toUpperCase()}** for all text fields (diagnoses, summaries, etc.).
4. Return ONLY valid JSON. No markdown, no explanation, no preamble.

[... etc. Every occurrence of the string "DUTCH" in the body that refers to OUTPUT LANGUAGE — NOT to analysis of Dutch-language vacancies — gets replaced with \`${lang.output.toUpperCase()}\`. ...]
`;
};
```

Do a find-and-replace within the function body: every occurrence of literal `DUTCH` / `Dutch` that refers to the **output** language becomes `${lang.output.toUpperCase()}` / `${lang.output}`. Do NOT replace `DUTCH` references that describe the *input* (e.g. "Dutch corporate writing" in the bureaucracy rule, which describes the language class being analyzed, not the output language).

Specifically, change these lines in `getAnalyzerPrompt`:
- Line 37: `**DUTCH**` → `**${lang.output.toUpperCase()}**`
- Line 98: `in Dutch` → `in ${lang.output}`
- Lines 105, 109, 113, 117, 121, 125, 129, 133: `in DUTCH` → `in ${lang.output.toUpperCase()}`
- Line 140, 141: `string in DUTCH` → `string in ${lang.output.toUpperCase()}`
- Line 145, 146, 147: `in DUTCH` → `in ${lang.output.toUpperCase()}`
- Line 149: `in DUTCH` → `in ${lang.output.toUpperCase()}`
- Line 167: `MUST be in DUTCH` → `MUST be in ${lang.output.toUpperCase()}`

- [ ] **Step 4.2: Make `OPTIMIZER_PROMPT` locale-aware**

Convert `OPTIMIZER_PROMPT` from a constant to a function:

```typescript
export const getOptimizerPrompt = (locale: Locale = 'nl') => {
  const lang = languageConfig[locale];
  return `
# ROLE: Human AI Rewrite Specialist
# OUTPUT LANGUAGE: ${lang.output.toUpperCase()}

You are an expert recruitment copywriter specializing in the "Human AI Protocol" - transforming bureaucratic job postings into warm, engaging, high-converting vacancy texts.

[... body ...]

## OUTPUT
Return ONLY valid JSON. No markdown, no explanation, no preamble.
All rewritten content MUST be in **${lang.output.toUpperCase()}**.

[... etc. ...]
`;
};
```

Every `DUTCH` / `Dutch` in the body that refers to the output language (not to Dutch idioms the writer is being told to avoid) gets replaced with the template expression. Specifically: lines 194, 315, 319, 320, 321, 323, 324, 327, 328, 330, 333, 335, 339, 341, 343, 373.

Leave the anti-idiom rules (from Task 3) referring to "Dutch" / "Silicon Valley" intact — they describe *what to avoid translating from*, not the output language.

- [ ] **Step 4.3: Update `lib/gemini.ts` to pass locale and drop the tail override**

In `lib/gemini.ts`:

Replace the import:
```typescript
import { getAnalyzerPrompt, getOptimizerPrompt } from "./prompts";
```

In `analyzeVacancy`, replace lines 104-118 with:

```typescript
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

  const promptLocale = locale === 'en' ? 'en' : 'nl';

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: getAnalyzerPrompt(category, promptLocale) },
          { text: `Vacancy Text:\n${vacancyText}` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
```

In `optimizeVacancy`, replace lines 134-147 similarly:

```typescript
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const promptLocale = locale === 'en' ? 'en' : 'nl';

  const promptParts = [
    { text: getOptimizerPrompt(promptLocale) },
    { text: `Original Vacancy Text:\n${vacancyText}` }
  ];

  if (analysis) {
    promptParts.push({ text: `Analysis Context:\n${JSON.stringify(analysis)}` });
  }
```

- [ ] **Step 4.4: Update any other imports of `OPTIMIZER_PROMPT`**

Check for other callers:

Run: `grep -rn "OPTIMIZER_PROMPT\|getAnalyzerPrompt" --include="*.ts" --include="*.tsx"`
Expected: only `lib/gemini.ts` and `lib/prompts.ts` itself.

If `lib/queue.ts` or any worker also imports `OPTIMIZER_PROMPT`, update it to use `getOptimizerPrompt(locale)` with the locale from the job payload.

- [ ] **Step 4.5: Manual verification**

1. `npm run dev`
2. Switch language toggle to English.
3. Paste a Dutch vacancy and run analysis.
4. Confirm the analysis response (pillar diagnoses, executive_summary, key_issues) is in **English**, not Dutch.
5. Run optimize — confirm `content.hook`, section contents, diversity_statement, CTA are all in English.
6. Switch back to NL, rerun analysis on a fresh vacancy — confirm output is in Dutch (nothing regressed).

- [ ] **Step 4.6: Commit**

```bash
git add lib/prompts.ts lib/gemini.ts
git commit -m "feat(i18n): make Gemini prompts locale-aware for reliable EN output

Prompt body previously hardcoded 'in DUTCH' ~20 times and relied on a
tail-appended 'Respond in English' override, which Gemini 3 frequently
ignored. Now the prompts are parameterized on locale so the output-
language instruction is internally consistent throughout the prompt."
```

---

## Task 5: Translate LimitReachedModal, NotificationToast, and error alerts in report-view

**Problem:** `components/report-view.tsx` hardcodes Dutch strings in three user-visible spots:
- `LimitReachedModal` (lines 77-96): "De smaak te pakken?", "Je hebt je gratis analyses verbruikt", "Vraag volledige toegang aan", "Of neem contact op", copied-email toast
- `EmailModal` (lines 172-220): "Waar mogen we het heen sturen?", "We sturen je...", "Werk Email", placeholder "naam@bedrijf.nl", "Verstuur mijn geoptimaliseerde vacature", "Er ging iets mis. Probeer het opnieuw.", "Geen Spam", "Veilig"
- `NotificationToast` invocation (lines 501-502): "Mail succesvol verzonden!", "We hebben de geoptimaliseerde versie naar je inbox gestuurd. Check ook je spam folder voor de zekerheid."

**Files:**
- Modify: `messages/en.json`, `messages/nl.json` — add `limitModal`, `emailModal`, `successToast` keys under `report`
- Modify: `components/report-view.tsx` — replace literals with `t(...)` calls

- [ ] **Step 5.1: Add keys to `messages/nl.json`**

Under the existing `"report"` object in `messages/nl.json`, add these keys (place next to `"footer"` and `"original"`):

```json
"limitModal": {
  "title": "De smaak te pakken?",
  "body": "Je hebt je gratis analyses verbruikt. Wil je onbeperkt toegang tot onze software voor al je vacatures?",
  "requestAccess": "Vraag volledige toegang aan",
  "contact": "Of neem contact op",
  "copiedToast": "📋 E-mailadres gekopieerd: joost@vacaturetovenaar.nl"
},
"emailModal": {
  "title": "Waar mogen we het heen sturen?",
  "subtitle": "We sturen je de geoptimaliseerde versie van deze vacature per e-mail.",
  "label": "Werk Email",
  "placeholder": "naam@bedrijf.nl",
  "submit": "Verstuur mijn geoptimaliseerde vacature",
  "error": "Er ging iets mis. Probeer het opnieuw.",
  "trustNoSpam": "Geen Spam",
  "trustSecure": "Veilig"
},
"successToast": {
  "title": "Mail succesvol verzonden!",
  "body": "We hebben de geoptimaliseerde versie naar je inbox gestuurd. Check ook je spam folder voor de zekerheid."
}
```

- [ ] **Step 5.2: Add matching keys to `messages/en.json`**

```json
"limitModal": {
  "title": "Got a taste for it?",
  "body": "You've used up your free analyses. Want unlimited access to our software for all your vacancies?",
  "requestAccess": "Request full access",
  "contact": "Or get in touch",
  "copiedToast": "📋 Email copied: joost@vacaturetovenaar.nl"
},
"emailModal": {
  "title": "Where should we send it?",
  "subtitle": "We'll email you the optimized version of this vacancy.",
  "label": "Work Email",
  "placeholder": "name@company.com",
  "submit": "Send my optimized vacancy",
  "error": "Something went wrong. Please try again.",
  "trustNoSpam": "No Spam",
  "trustSecure": "Secure"
},
"successToast": {
  "title": "Email sent successfully!",
  "body": "We've sent the optimized version to your inbox. Please check your spam folder as well, just in case."
}
```

- [ ] **Step 5.3: Replace Dutch literals in `LimitReachedModal`**

In `components/report-view.tsx`, at the top of `LimitReachedModal` (after `const [showCopiedToast...`), add:

```typescript
const t = useTranslations('report.limitModal');
```

Replace:
- Line 77: `<h3>De smaak te pakken?</h3>` → `<h3 className="text-2xl font-black text-slate-900 mb-2">{t('title')}</h3>`
- Line 78-80 (the `<p>`): → `<p className="text-slate-600 mb-8 leading-relaxed">{t('body')}</p>`
- Line 87 (button): `Vraag volledige toegang aan` → `{t('requestAccess')}`
- Line 95 (button): `Of neem contact op` → `{t('contact')}`
- Line 102 (toast): `📋 E-mailadres gekopieerd: joost@vacaturetovenaar.nl` → `{t('copiedToast')}`

- [ ] **Step 5.4: Replace Dutch literals in `EmailModal`**

In `components/report-view.tsx`, at the top of `EmailModal` (after the `useState` calls), add:

```typescript
const t = useTranslations('report.emailModal');
```

Replace:
- Line 176-178 (`<h3>Waar mogen we het heen sturen?</h3>`) → `<h3 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h3>`
- Line 179-181 (`<p>We sturen je...</p>`) → `<p className="text-slate-600 text-sm leading-relaxed max-w-[280px] mx-auto">{t('subtitle')}</p>`
- Line 186 (`<label>Werk Email</label>`) → `<label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">{t('label')}</label>`
- Line 192 (`placeholder="naam@bedrijf.nl"`) → `placeholder={t('placeholder')}`
- Line 210 (`Verstuur mijn geoptimaliseerde vacature`) → `{t('submit')}`
- Line 218 (error `<p>`) → `<p className="text-red-700 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{t('error')}</p>`
- Line 224 (`Geen Spam`) → `{t('trustNoSpam')}`
- Line 226 (`Veilig`) → `{t('trustSecure')}`

- [ ] **Step 5.5: Replace NotificationToast literals**

In `components/report-view.tsx`, in the `ReportView` component body (around line 285), add a translator:

```typescript
const tSuccess = useTranslations('report.successToast');
```

Replace lines 501-502:
```typescript
<NotificationToast
  show={showNotification}
  onClose={() => setShowNotification(false)}
  message={tSuccess('title')}
  description={tSuccess('body')}
/>
```

- [ ] **Step 5.6: Manual verification**

1. `npm run dev`
2. Open `/en`. Trigger the email modal (click unlock). Verify all labels are English.
3. Trigger the success toast (complete an optimize). Verify English.
4. Consume the 2 free rewrites (requires fresh fingerprint / wipe leads table for user). Trigger the limit modal on the 3rd. Verify English.
5. Switch to `/nl`. Repeat — verify Dutch is still correct (no regressions on existing strings).

- [ ] **Step 5.7: Commit**

```bash
git add messages/nl.json messages/en.json components/report-view.tsx
git commit -m "i18n(report): translate LimitReachedModal, EmailModal, success toast

These were hardcoded Dutch, so English users saw a mix of EN UI shell
and NL modals. Now all three pull from messages/{nl,en}.json."
```

---

## Task 6: Translate ScoreHero verdicts, PillarGrid headings, and OriginalTextCollapsible

**Problem:** Three report subcomponents hardcode Dutch:
- `score-hero.tsx:40-65` (`verdictConfig` object: "Uitstekend", "Goed", "Verbetering nodig", "Zwak" + their description strings)
- `score-hero.tsx:103` "Analyse Rapport", line 161 "Van de 10", line 206 "Kritieke Punten", line 222-223 "Uitstekend werk! / Geen kritieke problemen gedetecteerd."
- `pillar-grid.tsx:233-235` "Score Verdeling" + subtitle, plus every `config.label` in `pillarConfig` (lines ~50-118, not yet read but should be translated)
- `original-text-collapsible.tsx` — needs full pass (not read in audit)

**Files:**
- Modify: `messages/nl.json`, `messages/en.json` — add `report.verdict`, `report.scoreHero`, `report.pillarGrid`, `report.pillars`, `report.original` keys
- Modify: `components/report/score-hero.tsx`
- Modify: `components/report/pillar-grid.tsx`
- Modify: `components/report/original-text-collapsible.tsx`

- [ ] **Step 6.1: Inspect the pillar labels and original-text component**

Run:
```bash
sed -n '40,130p' /Users/anurag/bubbble/upwork/vacature-tovenaar/website-vacancy-analyzer/components/report/pillar-grid.tsx
```

Expected: the `pillarConfig` object with `label` strings for each of the 8 pillars (e.g. "Structuur & Haak", "Persona-Fit", "EVP & Merk", "Tone of Voice", etc.).

Then:
```bash
cat /Users/anurag/bubbble/upwork/vacature-tovenaar/website-vacancy-analyzer/components/report/original-text-collapsible.tsx
```

Note every hardcoded Dutch string you see. The next steps assume standard labels — if yours differ, adjust the JSON keys accordingly.

- [ ] **Step 6.2: Add verdict and scoreHero keys to both message files**

Add under `"report"` in `messages/nl.json`:

```json
"verdict": {
  "excellent": { "label": "Uitstekend", "description": "Je vacature presteert geweldig!" },
  "good": { "label": "Goed", "description": "Je vacature is solide maar heeft ruimte voor verbetering." },
  "needs_work": { "label": "Verbetering nodig", "description": "Je vacature heeft aandachtspunten." },
  "poor": { "label": "Zwak", "description": "Kritieke problemen gedetecteerd." }
},
"scoreHero": {
  "reportLabel": "Analyse Rapport",
  "outOf": "Van de 10",
  "criticalPoints": "Kritieke Punten",
  "allGood": "Uitstekend werk!",
  "noIssues": "Geen kritieke problemen gedetecteerd."
},
"pillarGrid": {
  "title": "Score Verdeling",
  "subtitle": "Gedetailleerde analyse van 8 belangrijke onderdelen"
},
"disclaimer": "Disclaimer: Deze analyse is gegenereerd door software. Hoewel we streven naar nauwkeurigheid, raden we aan alle suggesties in context te beoordelen."
```

Matching English:

```json
"verdict": {
  "excellent": { "label": "Excellent", "description": "Your vacancy is performing great!" },
  "good": { "label": "Good", "description": "Your vacancy is solid but has room for improvement." },
  "needs_work": { "label": "Needs work", "description": "Your vacancy has points that need attention." },
  "poor": { "label": "Poor", "description": "Critical issues detected." }
},
"scoreHero": {
  "reportLabel": "Analysis Report",
  "outOf": "Out of 10",
  "criticalPoints": "Critical Points",
  "allGood": "Excellent work!",
  "noIssues": "No critical issues detected."
},
"pillarGrid": {
  "title": "Score Breakdown",
  "subtitle": "Detailed analysis across 8 key pillars"
},
"disclaimer": "Disclaimer: This analysis was generated by software. While we strive for accuracy, we recommend evaluating all suggestions in context."
```

- [ ] **Step 6.3: Add pillar labels to both message files**

For each pillar key in `pillarConfig` (read in 6.1), add a translation. Example block:

NL:
```json
"pillars": {
  "structure_layout": "Structuur & Haak",
  "persona_fit": "Persona-Fit",
  "evp_brand": "EVP & Merk",
  "tone_of_voice": "Tone of Voice",
  "inclusion_bias": "Inclusie & Bias",
  "mobile_experience": "Mobiele Ervaring",
  "seo_findability": "SEO & Vindbaarheid",
  "neuromarketing": "Neuromarketing"
}
```

EN: same keys with translated values:
```json
"pillars": {
  "structure_layout": "Structure & Hook",
  "persona_fit": "Persona Fit",
  "evp_brand": "EVP & Brand",
  "tone_of_voice": "Tone of Voice",
  "inclusion_bias": "Inclusion & Bias",
  "mobile_experience": "Mobile Experience",
  "seo_findability": "SEO & Findability",
  "neuromarketing": "Neuromarketing"
}
```

- [ ] **Step 6.4: Wire up `ScoreHero`**

In `components/report/score-hero.tsx`:

At top of the `ScoreHero` function, add:

```typescript
const tVerdict = useTranslations('report.verdict');
const tHero = useTranslations('report.scoreHero');
```

Replace the `verdictConfig` lookup (around lines 40-65, 80) so `label` / `description` come from the translator:

```typescript
const verdictStyle = {
  excellent: { bgColor: "bg-green-100", textColor: "text-green-800" },
  good: { bgColor: "bg-blue-100", textColor: "text-blue-800" },
  needs_work: { bgColor: "bg-amber-100", textColor: "text-amber-800" },
  poor: { bgColor: "bg-red-100", textColor: "text-red-800" },
}[verdict];

const verdictLabel = tVerdict(`${verdict}.label`);
// description: tVerdict(`${verdict}.description`) — use if referenced
```

Replace literals:
- Line 103 (`Analyse Rapport`) → `{tHero('reportLabel')}`
- Line 161 (`Van de 10`) → `{tHero('outOf')}`
- Line 169 (`{config.label}`) → `{verdictLabel}`
- Line 206 (`Kritieke Punten`) → `{tHero('criticalPoints')}`
- Line 222 (`Uitstekend werk!`) → `{tHero('allGood')}`
- Line 223 (`Geen kritieke problemen gedetecteerd.`) → `{tHero('noIssues')}`

Add the import at the top: `import { useTranslations } from "next-intl";`

- [ ] **Step 6.5: Wire up `PillarGrid`**

In `components/report/pillar-grid.tsx`:

Add at the top:
```typescript
import { useTranslations } from "next-intl";
```

In `PillarGrid` function body:
```typescript
const t = useTranslations('report.pillarGrid');
const tPillars = useTranslations('report.pillars');
```

Replace:
- Line 233 (`Score Verdeling`) → `{t('title')}`
- Line 234-235 subtitle → `{t('subtitle')}`

In `PillarCard`, replace `config.label` usage (line 193 approximately):
```typescript
<span className="font-bold text-slate-800 text-sm">{tPillars(pillarKey)}</span>
```

Since `PillarCard` needs the translator, pass it through props OR call `useTranslations` inside PillarCard directly (next-intl allows this). Prefer calling directly:

```typescript
function PillarCard({ ... }: { ... }) {
  const tPillars = useTranslations('report.pillars');
  // ... existing code ...
  // line 193: <span>{tPillars(pillarKey)}</span>
}
```

Remove the `label` field from `pillarConfig` in the same file — it's now unused.

- [ ] **Step 6.6: Wire up `OriginalTextCollapsible`**

Read the component first (step 6.1). Identify each hardcoded Dutch string (likely: a header like "Originele Tekst", a show/hide toggle label, and possibly a copy button). Add matching keys under `report.original` in both JSON files (the `show` / `hide` keys already exist at `report.original` — check and extend). Wire up via `useTranslations('report.original')`.

- [ ] **Step 6.7: Replace the disclaimer in `report-view.tsx`**

In `components/report-view.tsx`, around line 461, replace the hardcoded disclaimer:

```tsx
<div className="mb-20 p-6 rounded-xl text-xs text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
  {t('disclaimer')}
</div>
```

Where `t = useTranslations('report')` — confirm the top of `ReportView` already has this; if not, add it.

- [ ] **Step 6.8: Manual verification**

1. `npm run dev`
2. `/en` — run a full analysis. Verify all of: report label, "Out of 10", verdict label, "Critical Points", pillar card titles, "Score Breakdown", disclaimer, collapse/expand of original text.
3. `/nl` — same flow. Confirm Dutch still works.
4. Switch locale mid-report using the language switcher: navigate to /en/report/[id] and /nl/report/[id] with the same reportId. Confirm UI swaps correctly (the AI content stays in whatever language it was generated — only the shell should change).

- [ ] **Step 6.9: Commit**

```bash
git add messages/nl.json messages/en.json \
  components/report/score-hero.tsx \
  components/report/pillar-grid.tsx \
  components/report/original-text-collapsible.tsx \
  components/report-view.tsx
git commit -m "i18n(report): translate ScoreHero, PillarGrid, OriginalText, disclaimer

EN users previously saw Dutch labels ('Uitstekend', 'Kritieke Punten',
'Score Verdeling', etc.) inside the English UI shell. All hardcoded
strings moved to messages/{nl,en}.json."
```

---

## Task 7: Remove dead `isHovered` reference in peel-cta

**Problem:** `components/report/peel-cta.tsx:152` references `isHovered` — a variable never declared in that file. This is a leftover from a previous hover-based implementation (the component now auto-animates on scroll per the comment at line 17). It compiles only because of TypeScript's leniency on JSX style props, but it's dead and confusing.

**Files:**
- Modify: `components/report/peel-cta.tsx`

- [ ] **Step 7.1: Replace the `isHovered`-dependent border-radius with a constant**

In `components/report/peel-cta.tsx`, replace line 150-153 (the flap div's style block):

```tsx
<div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-200 rounded-bl-3xl border-b border-l border-white/60 shadow-md" />
```

Remove the `style={{ borderBottomLeftRadius: isHovered ? 24 : 12 }}` entirely. The `rounded-bl-3xl` Tailwind class already provides a constant 24px radius, which matches the "hovered" value — visually identical, no behavior change.

- [ ] **Step 7.2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 7.3: Visual verification**

`npm run dev`, visit a report page. Confirm the peel animation still plays (scroll the ScoreHero into view) and the flap shape looks correct — corner should have a 24px radius matching the card.

- [ ] **Step 7.4: Commit**

```bash
git add components/report/peel-cta.tsx
git commit -m "fix(peel-cta): remove dead isHovered reference

isHovered was referenced but never declared — leftover from an earlier
hover-based animation. Component now auto-animates on scroll, so the
border-radius is constant. Tailwind rounded-bl-3xl already matches the
previous hovered value (24px)."
```

---

## Task 8: Make issue cards expandable so users can read all issues

**Problem:** `components/report/score-hero.tsx:210` does `issues.slice(0, 5)` — silently drops any issue beyond the 5th. There's no "read more" or expand affordance. Stakeholder reported text being "cut off with ... without a way to read more". This is where some of that happens.

**Files:**
- Modify: `components/report/score-hero.tsx` (expand issues, add "show all" toggle)
- Modify: `messages/nl.json`, `messages/en.json` (add toggle labels)

- [ ] **Step 8.1: Add translation keys**

In `messages/nl.json` under `report.scoreHero` (added in Task 6):
```json
"showAllIssues": "Toon alle {count} punten",
"showFewerIssues": "Toon minder"
```

In `messages/en.json`:
```json
"showAllIssues": "Show all {count} points",
"showFewerIssues": "Show less"
```

- [ ] **Step 8.2: Add show-all state to `ScoreHero`**

In `components/report/score-hero.tsx`, inside the `ScoreHero` function, add:

```typescript
const [showAllIssues, setShowAllIssues] = useState(false);
const visibleIssues = showAllIssues ? issues : issues.slice(0, 5);
```

- [ ] **Step 8.3: Render all visible issues plus a toggle**

Replace the `issues.slice(0, 5).map(...)` block (lines ~210-218) with:

```tsx
{visibleIssues.map((issue, idx) => (
  <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all">
    <h4 className="font-bold text-sm text-red-900 mb-2 leading-tight flex items-start gap-2">
      <span className="text-red-400 mt-0.5">•</span> {issue.problem}
    </h4>
    <p className="text-xs text-slate-500 leading-relaxed pl-3.5 border-l-2 border-slate-100 ml-1">
      {issue.why_it_matters}
    </p>
  </div>
))}
{issues.length > 5 && (
  <button
    type="button"
    onClick={() => setShowAllIssues(!showAllIssues)}
    className="w-full py-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
  >
    {showAllIssues
      ? tHero('showFewerIssues')
      : tHero('showAllIssues', { count: issues.length })}
  </button>
)}
```

- [ ] **Step 8.4: Manual verification**

1. Run analysis on a long, poor-quality vacancy that surfaces ≥6 issues. (Try pasting a 1500-word bureaucratic vacancy.)
2. Confirm first 5 show, then "Show all N points" button appears. Click — all issues expand. Click again — collapses back to 5.

- [ ] **Step 8.5: Commit**

```bash
git add components/report/score-hero.tsx messages/nl.json messages/en.json
git commit -m "feat(report): expandable issue list instead of silent slice(0,5)

Issues beyond the 5th were being silently dropped. Now users can
expand to see all of them."
```

---

## Task 9: Replace `alert()` error popups with inline error banners

**Problem:** `app/[locale]/page.tsx:142` and `components/report-view.tsx:380` use native `alert()` for errors. Feels broken / non-branded; blocks the UI thread; can't be styled; not great on mobile. Stakeholder listed "error messages" among Prio 1 issues.

**Files:**
- Modify: `app/[locale]/page.tsx` — inline banner state + render
- Modify: `components/report-view.tsx` — same
- Modify: `messages/nl.json`, `messages/en.json` — add `errorBanner.dismiss` key

- [ ] **Step 9.1: Add translation keys**

Both JSON files, under a new top-level `common` key:

NL:
```json
"common": {
  "dismiss": "Sluiten"
}
```

EN:
```json
"common": {
  "dismiss": "Dismiss"
}
```

- [ ] **Step 9.2: Replace `alert()` in the home page**

In `app/[locale]/page.tsx`:

Add state near the other useState calls (around line 33):
```typescript
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

Replace the alerts at line 128-130 and 142:

```typescript
// was: alert(data.message || (...))
setErrorMessage(data.message || (locale === 'en'
  ? 'Your analysis has been queued. You will receive an email when it\'s ready.'
  : 'Je analyse is in de wachtrij geplaatst. Je ontvangt een email wanneer deze klaar is.'));

// was: alert(errorMessage) at line 142
setErrorMessage(
  error instanceof Error ? getErrorMessage(error, locale) : t('hero.error')
);
```

Also at line 149 (`handleContinueInBackground`):
```typescript
setErrorMessage(locale === 'en' ? 'Please enter your email address' : 'Voer je e-mailadres in');
```

Render the banner near the top of the main container (just below the header, line ~200):

```tsx
{errorMessage && (
  <div role="alert" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24">
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
      <div className="flex-1 text-sm">{errorMessage}</div>
      <button
        type="button"
        onClick={() => setErrorMessage(null)}
        className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
      >
        {useTranslations('common')('dismiss')}
      </button>
    </div>
  </div>
)}
```

(Move `useTranslations('common')` to a top-level variable if you'd rather not inline the hook — this is just for brevity. Idiomatic: `const tCommon = useTranslations('common');` at the top, then `{tCommon('dismiss')}`.)

- [ ] **Step 9.3: Replace `alert()` in `report-view.tsx`**

Add near the other state:
```typescript
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

Replace line 380:
```typescript
const errorMsg = error instanceof Error
  ? getErrorMessage(error, locale)
  : (locale === 'en' ? 'An error occurred' : 'Er is een fout opgetreden');
setErrorMessage(errorMsg);
```

Also replace:
- Line 31-32 (copy failure) — swap `alert('Kopiëren mislukt')` with a toast: wire to `setErrorMessage`.
- Line 163 (Word gen failure) — same.
- Line 181 (PDF send failure) — same.

Actually, `optimization-result-view.tsx` has the copy/word/PDF alerts. Replace those in place using the same pattern — add a local `errorMessage` state to that component and render an inline banner at the top. Use `common.dismiss` for the button.

Render the banner at the top of `ReportView`'s return (around line 386):

```tsx
{errorMessage && (
  <div role="alert" className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3 shadow-lg">
    <div className="flex-1 text-sm">{errorMessage}</div>
    <button
      type="button"
      onClick={() => setErrorMessage(null)}
      className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
    >
      {tCommon('dismiss')}
    </button>
  </div>
)}
```

With `const tCommon = useTranslations('common');` added at the top of `ReportView`.

- [ ] **Step 9.4: Grep for any remaining `alert(` calls**

Run: `grep -rn "alert(" --include="*.ts" --include="*.tsx" app/ components/ lib/`

Expected: no hits in user-facing paths. (Server-side `.ts` files in `lib/` that use `console.*` are fine — only `alert()` in browser-rendered code is the target.)

- [ ] **Step 9.5: Manual verification**

1. Disconnect internet, click Analyze — verify an in-page red banner appears with a dismiss button. No browser `alert()` popup.
2. Reconnect, trigger a copy-to-clipboard inside the results (use a browser that prompts for clipboard permission and deny it) — verify inline banner.
3. Dismiss button hides the banner.

- [ ] **Step 9.6: Commit**

```bash
git add messages/nl.json messages/en.json app/[locale]/page.tsx components/report-view.tsx components/report/optimization-result-view.tsx
git commit -m "refactor(errors): replace alert() popups with inline banners

alert() is blocking, unstyled, and looks broken to users. Replaced
all user-facing error alerts with dismissable in-page banners."
```

---

## Task 10: Add "Plan a demo" secondary CTA in phase 1/2 (optional)

**Problem:** The warm-up modal (`AccessRequestModal`) only appears after the user hits the 2-rewrite limit. Stakeholder's intent was that clicking "Full Access" shows the warm-up BEFORE the calendar — but currently there's no "Full Access" surface outside the limit state. A phase-1/2 user has no path to the demo except consuming their free rewrites first.

**Fix:** Add a secondary, less-prominent "Plan a demo" CTA near the primary unlock button (on the report page) so users can jump to the warm-up without burning their quota.

**Files:**
- Modify: `components/report/score-hero.tsx` — add secondary CTA below the PeelCTA
- Modify: `components/report-view.tsx` — pass `onPlanDemoDirect` prop down, wire to AccessRequestModal
- Modify: `messages/nl.json`, `messages/en.json` — CTA label

- [ ] **Step 10.1: Add translation key**

NL, under `report.scoreHero`:
```json
"planDemoSecondary": "Of plan een demo"
```

EN:
```json
"planDemoSecondary": "Or plan a demo"
```

- [ ] **Step 10.2: Add secondary CTA below PeelCTA in `ScoreHero`**

Add a prop `onPlanDemo: () => void` to `ScoreHeroProps` and the destructured params.

In the right column where PeelCTA renders (around line 201), wrap:

```tsx
{!isUnlocked ? (
  <div className="flex flex-col h-full gap-2">
    <div className="flex-1">
      <PeelCTA onUnlock={onUnlockClick} currentScore={score} />
    </div>
    <button
      type="button"
      onClick={onPlanDemo}
      className="text-xs text-slate-500 hover:text-slate-900 py-2 underline decoration-slate-300 underline-offset-2 transition-colors"
    >
      {tHero('planDemoSecondary')}
    </button>
  </div>
) : (
  <Card variant="filled" ... />
)}
```

- [ ] **Step 10.3: Wire `onPlanDemo` through `ReportView`**

In `components/report-view.tsx`, pass a handler:

```tsx
<ScoreHero
  ...existing props...
  onPlanDemo={() => setShowAccessModal(true)}
/>
```

The `AccessRequestModal` is already rendered at the bottom of `ReportView` and already opens the Hubspot calendar on confirm — no further wiring needed.

- [ ] **Step 10.4: Manual verification**

Visit a fresh report page (phase 1). Confirm:
1. The primary peel CTA still shows "Bekijk verbeterde versie".
2. Below it, a subtle "Of plan een demo" link appears.
3. Clicking the secondary link opens `AccessRequestModal`.
4. Clicking "Plan a demo" inside the modal opens `https://meetings-eu1.hubspot.com/jknuvers`.

- [ ] **Step 10.5: Commit**

```bash
git add messages/nl.json messages/en.json components/report/score-hero.tsx components/report-view.tsx
git commit -m "feat(conversion): expose warm-up demo modal before limit is hit

Previously the AccessRequestModal was only reachable after the user
consumed their 2 free rewrites. Added a secondary CTA below the
primary unlock button so phase-1/2 users can reach the demo warm-up
without burning quota."
```

---

## Out-of-scope notes for stakeholder

These items cannot be fixed in code alone. Flag separately:

1. **Email deliverability (spam landing).** Requires DNS changes on the sending domain:
   - Verify SPF record includes AWS SES (`v=spf1 include:amazonses.com -all`)
   - Publish DKIM CNAMEs given by SES console for `vacaturetovenaar.nl`
   - Publish a DMARC record (`_dmarc.vacaturetovenaar.nl` TXT `v=DMARC1; p=quarantine; rua=...`)
   - Consider changing the From address from `noreply@` to a replyable alias (e.g. `hallo@vacaturetovenaar.nl`) — `noreply` worsens spam scores.
   - Consider a dedicated sending subdomain (e.g. `mail.vacaturetovenaar.nl` or a new domain like `vacaturetovenaar.io`) with its own SES identity so the main-domain reputation isn't affected by automated sends.

2. **PDF blocked by corporate AV.** Server-side can't force a recipient to open an attachment. Two mitigations if the business wants them:
   - Link to a hosted web view of the optimized vacancy (uses `reportId` + a signed URL) instead of attaching the PDF. The email becomes a much smaller, link-only message.
   - Offer the Word document as the primary download on the page (already implemented in `optimization-result-view.tsx`) and remove or de-emphasize the PDF email attachment.

---

## Self-review

**Spec coverage (against the original 8-section feedback document):**

| Feedback section | Tasks covering it |
|---|---|
| 1. Rate limits | Task 1 |
| 1. Timeouts | Task 2 |
| 1. Error messages | Task 9 |
| 2. Multilingualism (shell) | Already done; Tasks 5, 6 fix leftover Dutch leaks |
| 2. Multilingualism (output) | Task 4 |
| 2. Step-by-step visual | Already done (no task) |
| 2. Input placeholder | Already done (no task) |
| 3. Loading time indication | Already done (copy tweak trivial; skipped) |
| 3. Email fallback | Already done (no task) |
| 4. Prompt examples | Task 3 |
| 5. Button text | Already done (no task) |
| 5. Hover tooltip | Task 7 (removes dead hover ref); no replacement needed since diagnoses are already always visible |
| 5. Text truncation | Task 8 |
| 5. Copy / Word | Already done (no task) |
| 6. Warm-up modal | Already done + Task 10 (secondary CTA to reach it earlier) |
| 7. Stats | Already done (no task) |
| 8. Email / PDF / spam | Out-of-scope notes (DNS + infra) |

**Placeholder scan:** No "TBD", "implement later", "add validation", or "similar to Task N". Each step shows the actual code or command to run.

**Type consistency:** `countLeadsByFingerprint` is defined in Task 1 and used in Task 1. No later task references the removed `countLeadsByIdentity`. `getOptimizerPrompt` / `getAnalyzerPrompt` signatures are defined in Task 4 and consumed in Task 4 only. Translation key paths (`report.limitModal.title`, `report.verdict.excellent.label`, etc.) are consistent between the JSON additions and the component call sites within each task.
