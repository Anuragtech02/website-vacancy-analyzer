import { type PillarKey } from "../theme";

export type PillarLabelKey = 'excellent' | 'good' | 'fair' | 'needsWork' | 'critical';

export interface PillarDatum {
  key: PillarKey;
  score: number;
  label: PillarLabelKey;
  verdict: string;
  tone: "ok" | "warn" | "bad";
}

// TODO: replace with real API data. Fallback for ReviewChip/preview mode.
export const PILLAR_DATA: PillarDatum[] = [
  {
    key: "structure_layout",
    score: 5.8,
    label: "needsWork",
    verdict: "Responsibilities read as platitudes. Three of eight bullets repeat the same idea (\"be agile\", \"move fast\", \"ship quickly\") without naming a concrete outcome.",
    tone: "warn",
  },
  {
    key: "inclusion_bias",
    score: 4.1,
    label: "critical",
    verdict: "\"Rockstar developer\", the 7-year experience gate, and \"native-level English\" together exclude roughly 38% of qualified candidates in our sample.",
    tone: "bad",
  },
  {
    key: "tone_of_voice",
    score: 7.2,
    label: "good",
    verdict: "Warm, conversational register overall. One sentence (\"work independently under pressure\") tips into a red flag — consider reframing.",
    tone: "ok",
  },
  {
    key: "evp_brand",
    score: 3.8,
    label: "critical",
    verdict: "\"Pizza Fridays\" is the only concrete benefit mentioned. No comp range, growth budget, flexibility policy, or parental leave signal.",
    tone: "bad",
  },
  {
    key: "persona_fit",
    score: 6.4,
    label: "fair",
    verdict: "The title is clear but seniority is ambiguous — \"Senior\" is undermined by reporting lines and scope that read more mid-level.",
    tone: "warn",
  },
  {
    key: "mobile_experience",
    score: 5.2,
    label: "needsWork",
    verdict: "Mobile scrollers may tune out by the benefits section — long unbroken paragraphs and dense bullet lists don't scan well on small screens.",
    tone: "warn",
  },
  {
    key: "seo_findability",
    score: 4.9,
    label: "needsWork",
    verdict: "No location in the title; no salary signals. Search ranking depends on these cues and candidates using filters will miss this posting.",
    tone: "warn",
  },
  {
    key: "neuromarketing",
    score: 5.5,
    label: "needsWork",
    verdict: "\"Send your CV to jobs@\" is 2010s-era. No hint of what happens next, how long it takes, or who will read it.",
    tone: "warn",
  },
];

// TODO: replace with real API data. Fallback for ReviewChip/preview mode.
export const CRITICAL_POINTS: { title: string; detail: string }[] = [
  { title: "The 7-year experience gate", detail: "Drops the qualified pool by ~31% with minimal signal gain above year 4." },
  { title: "\"Native-level English\"",   detail: "Legally risky in NL and excludes strong non-native speakers." },
  { title: "Missing comp range",         detail: "Applicants who see no range apply ~40% less often." },
  { title: "\"Work under pressure\" line", detail: "Reads as a warning signal to senior candidates." },
  { title: "Vague CTA",                  detail: "No process description, no timeline, no human on the other side." },
];

// TODO: replace with real API data. Fallback for ReviewChip/preview mode.
export const REWRITTEN = `Senior Full-Stack Engineer
Remote (CET ±2) · Amsterdam HQ · €75–95k + equity

We're a 40-person SaaS team building recruitment software used by 2,000 European HR teams. You'd be joining a platform engineering group of six, reporting to Sara (VP Eng).

What you'd actually do
• Own the rewrite of our ATS sync layer — currently a brittle REST bridge we want to turn into a queue-backed event pipeline.
• Pair with our designer to ship two recruiter-facing features per quarter, from prototype to production.
• Mentor one mid-level engineer (we'll help you do this well).

What we're looking for
• You've shipped production React and Node.js services at real scale. (We don't count years; we read your code.)
• You're comfortable being the person who rewrites the thing nobody wants to touch.
• You can explain tradeoffs clearly in English — Dutch is a bonus, never a requirement.

What we offer
• €75–95k, 0.1–0.4% equity, 30 days PTO, €1,500/year learning budget.
• Four days in-office per month is the max we'll ever ask; the rest is your call.
• Parental leave: 16 weeks, fully paid, any parent.

How this works
Reply with a short note (no cover letter). If there's a fit, you'll hear from Sara within 3 working days. Process is: intro call → take-home (paid, 4h cap) → two technical conversations → offer. Typically 2.5 weeks end-to-end.`;
