import { GoogleGenerativeAI } from "@google/generative-ai";
import { ANALYZER_PROMPT, OPTIMIZER_PROMPT } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    verdict: 'excellent' | 'good' | 'needs_work' | 'poor';
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

export async function analyzeVacancy(vacancyText: string): Promise<AnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: ANALYZER_PROMPT },
          { text: `Vacancy Text:\n${vacancyText}` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const response = result.response;
  return JSON.parse(response.text()) as AnalysisResult;
}

export async function optimizeVacancy(vacancyText: string, analysis?: AnalysisResult): Promise<OptimizationResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const promptParts = [
    { text: OPTIMIZER_PROMPT },
    { text: `Original Vacancy Text:\n${vacancyText}` }
  ];

  if (analysis) {
    promptParts.push({ text: `Analysis Context:\n${JSON.stringify(analysis)}` });
  }

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: promptParts
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const response = result.response;
  return JSON.parse(response.text()) as OptimizationResult;
}
