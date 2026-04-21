import { google as googleAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText, type LanguageModel } from "ai";
import { getAnalyzerPrompt, getOptimizerPrompt, type PromptLocale } from "./prompts";

// ─── Provider selection ────────────────────────────────────────────────────
// Prefer Vertex AI (service account credentials) when available.
// Falls back to Google AI Studio API key (GOOGLE_GENERATIVE_AI_API_KEY) for dev.
//
// Auth (checked in order):
//   1. GOOGLE_VERTEX_CREDENTIALS_B64 — base64-encoded service account JSON
//   2. GOOGLE_VERTEX_CREDENTIALS     — inline service account JSON
//   3. GOOGLE_APPLICATION_CREDENTIALS — path to service account file
//
// Preview models (gemini-3-*) require the GLOBAL endpoint on Vertex AI.
// Stable models (gemini-2.5-*) use the regional endpoint.

function parseVertexCredentials(): object | undefined {
  const b64 = process.env.GOOGLE_VERTEX_CREDENTIALS_B64;
  if (b64) {
    // Let parse errors throw — a set-but-malformed credential is a
    // misconfig that should fail loud at startup, not silently fall
    // through to the Studio API.
    return JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  }
  const json = process.env.GOOGLE_VERTEX_CREDENTIALS;
  if (json) {
    return JSON.parse(json);
  }
  return undefined;
}

const vertexCredentials = parseVertexCredentials();
const vertexCredentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const useVertex = Boolean(vertexCredentials || vertexCredentialsFile);
const vertexProject = process.env.GOOGLE_VERTEX_PROJECT || "vacaturetovenaar-application";
const vertexLocation = process.env.GOOGLE_VERTEX_LOCATION || "europe-west4";

const googleAuthOptions = vertexCredentials
  ? { credentials: vertexCredentials }
  : undefined;

const vertex = useVertex
  ? createVertex({ project: vertexProject, location: vertexLocation, googleAuthOptions })
  : null;

const vertexGlobal = useVertex
  ? createVertex({ project: vertexProject, location: "global", googleAuthOptions })
  : null;

const GLOBAL_MODELS = new Set([
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-preview",
]);

/** Route a model id to Vertex (global for previews, regional otherwise) or AI Studio. */
function resolveModel(modelId: string): LanguageModel {
  if (useVertex) {
    if (GLOBAL_MODELS.has(modelId)) return vertexGlobal!(modelId);
    return vertex!(modelId);
  }
  // Fallback: Google AI Studio. Ensure the env var name expected by @ai-sdk/google is set.
  if (
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY)
  ) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
  }
  return googleAI(modelId);
}

if (typeof window === "undefined") {
  if (useVertex) {
    console.log("[lib/gemini] using Vertex AI", { project: vertexProject, location: vertexLocation, previewEndpoint: "global" });
  } else {
    console.log("[lib/gemini] using Google AI Studio (no Vertex credentials found)");
  }
}

// ─── Types (unchanged from the previous @google/generative-ai implementation) ──

export interface AnalysisResult {
  metadata: {
    organization: string | null;
    job_title: string;
    job_type: string | null;
    location: string | null;
    detected_evp: string;
    word_count: number;
    analyzed_at: string;
  };
  pillars: {
    structure_layout: PillarScore;
    persona_fit: PillarScore;
    evp_brand: PillarScore;
    tone_of_voice: PillarScore;
    inclusion_bias: PillarScore;
    mobile_experience: PillarScore;
    seo_findability: PillarScore;
    neuromarketing: PillarScore;
  };
  summary: {
    total_score: number;
    weighted_score: number;
    verdict: "excellent" | "good" | "needs_work" | "poor";
    top_strengths: string[];
    critical_weaknesses: string[];
    key_issues: Array<{
      problem: string;
      why_it_matters: string;
      how_to_improve: string;
    }>;
    executive_summary: string;
  };
  original_headers: string[];
}

interface PillarScore {
  score: number;
  diagnosis: string;
}

export interface StrategyNote {
  title: string;
  description: string;
  icon: string;
}

export interface OptimizationResult {
  metadata: {
    job_title: string;
    original_job_title: string;
    organization: string | null;
    location: string | null;
    rewritten_at: string;
  };
  content: {
    hook: string;
    sections: Array<{
      header: string;
      is_original_header: boolean;
      content: string;
      bullets: string[] | null;
    }>;
    diversity_statement: string;
    call_to_action: string;
  };
  full_text_markdown: string;
  full_text_plain: string;
  changes: {
    summary: string;
    improvements: Array<{
      pillar: string;
      change: string;
      before_example: string | null;
      after_example: string | null;
    }>;
    preserved_elements: string[];
  };
  strategy_notes: StrategyNote[];
  estimated_scores: {
    structure_layout: number;
    persona_fit: number;
    evp_brand: number;
    tone_of_voice: number;
    inclusion_bias: number;
    mobile_experience: number;
    seo_findability: number;
    neuromarketing: number;
    total_score: number;
    weighted_score: number;
  };
}

// ─── Safety settings (matches chat-service baseline) ───────────────────────

const GEMINI_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HATE_SPEECH" as const, threshold: "BLOCK_MEDIUM_AND_ABOVE" as const },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as const, threshold: "BLOCK_MEDIUM_AND_ABOVE" as const },
  { category: "HARM_CATEGORY_HARASSMENT" as const, threshold: "BLOCK_MEDIUM_AND_ABOVE" as const },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as const, threshold: "BLOCK_MEDIUM_AND_ABOVE" as const },
];

function googleProviderOptions(opts?: { thinkingLevel?: "minimal" | "low" | "medium" | "high" }) {
  return {
    google: {
      safetySettings: GEMINI_SAFETY_SETTINGS,
      ...(opts?.thinkingLevel != null && {
        thinkingConfig: { thinkingLevel: opts.thinkingLevel },
      }),
      // Note: intentionally no responseModalities set — matches chat-service/src/ai/aiClient.ts
      // for consistency. Vertex AI + Gemini 3.x default TEXT output, which is what we want.
    },
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Three-tier JSON extraction: fenced block → first-brace-to-last-brace → raw parse.
 * Handles: model preamble prose, thinking-model leakage, bare JSON, ```json fences.
 * Throws a readable error with a response preview on total failure.
 */
function parseJsonResponse<T>(raw: string, context: string): T {
  const text = raw.trim();

  // Try 1: strip fences if present anywhere in the text.
  // Matches: ```json ... ``` or ``` ... ``` (anywhere in the string, not just at start)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]) as T;
    } catch {
      // fall through to brace-extraction
    }
  }

  // Try 2: find the first `{` through the last `}` (handles prefix/suffix text around raw JSON)
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      // fall through to raw-parse
    }
  }

  // Try 3: raw parse (unchanged from current behavior)
  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.length > 200 ? text.slice(0, 200) + "…" : text;
    throw new Error(`${context}: model did not return valid JSON (got: ${preview})`);
  }
}

// ─── Exports (same signatures as before) ───────────────────────────────────

export async function analyzeVacancy(
  vacancyText: string,
  category: string = "General",
  locale: string = "nl"
): Promise<AnalysisResult> {
  const promptLocale: PromptLocale = locale === "en" ? "en" : "nl";

  const { text } = await generateText({
    model: resolveModel("gemini-3.1-pro-preview"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: getAnalyzerPrompt(category, promptLocale) },
          { type: "text", text: `Vacancy Text:\n${vacancyText}` },
        ],
      },
    ],
    providerOptions: googleProviderOptions({ thinkingLevel: "high" }),
  });

  return parseJsonResponse<AnalysisResult>(text, "analyzeVacancy");
}

export async function optimizeVacancy(
  vacancyText: string,
  analysis?: AnalysisResult,
  locale: string = "nl"
): Promise<OptimizationResult> {
  const promptLocale: PromptLocale = locale === "en" ? "en" : "nl";

  const parts: Array<{ type: "text"; text: string }> = [
    { type: "text", text: getOptimizerPrompt(promptLocale) },
    { type: "text", text: `Original Vacancy Text:\n${vacancyText}` },
  ];

  if (analysis) {
    parts.push({ type: "text", text: `Analysis Context:\n${JSON.stringify(analysis)}` });
  }

  const { text } = await generateText({
    // NOTE: gemini-3.1-flash-preview does not yet exist on Vertex AI (as of
    // 2026-04) — "NOT_FOUND" at the publisher level. The optimizer stays on
    // 3.0 Flash preview; swap this to 3.1 the day it lands. The routing in
    // GLOBAL_MODELS is already prepared for both.
    model: resolveModel("gemini-3-flash-preview"),
    messages: [{ role: "user", content: parts }],
    providerOptions: googleProviderOptions({ thinkingLevel: "medium" }),
  });

  return parseJsonResponse<OptimizationResult>(text, "optimizeVacancy");
}
