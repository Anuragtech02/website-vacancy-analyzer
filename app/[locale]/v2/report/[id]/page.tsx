// /v2/report/[id] — server component that hydrates the v2 Report from the
// database. Mirrors /v1's /report/[id] shareable-URL pattern, so every v2
// analysis has its own addressable link that survives reloads and can be
// shared with colleagues.

import { notFound } from "next/navigation";
import { dbClient } from "@/lib/db";
import type { AnalysisResult } from "@/lib/gemini";
import { V2ReportView } from "./v2-report-view";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function V2ReportPage({ params }: PageProps) {
  const { id } = await params;

  const report = await dbClient.getReport(id);
  if (!report) notFound();

  // analysis_json is a stringified AnalysisResult produced by
  // /api/analyze -> dbClient.createReport. Parse defensively — if it's
  // malformed (e.g. schema drift on old reports), show 404 rather than
  // crash the render.
  let analysis: AnalysisResult;
  try {
    analysis = JSON.parse(report.analysis_json) as AnalysisResult;
    if (!analysis?.pillars || !analysis?.metadata || !analysis?.summary) {
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <V2ReportView
      reportId={id}
      analysis={analysis}
      vacancyText={report.vacancy_text}
    />
  );
}
