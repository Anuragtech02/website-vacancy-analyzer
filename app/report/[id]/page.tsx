import { notFound } from "next/navigation";
import { dbClient } from "@/lib/db";
import { ReportView } from "@/components/report-view";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params;
  const report = dbClient.getReport(id);

  if (!report) {
    notFound();
  }

  const analysis = JSON.parse(report.analysis_json);

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 sm:px-8 max-w-[1600px] mx-auto">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </Link>
          <div className="h-6 w-[1px] bg-border mx-2" />
          <div className="text-sm text-muted-foreground">
            Report <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{id}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <ReportView 
          analysis={analysis} 
          vacancyText={report.vacancy_text} 
          reportId={id} 
        />
      </div>
    </main>
  );
}
