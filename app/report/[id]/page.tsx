import { notFound } from "next/navigation";
import { dbClient } from "@/lib/db";
import { ReportView } from "@/components/report-view";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params;

  const report = await dbClient.getReport(id);

  if (!report) {
    notFound();
  }

  const analysis = JSON.parse(report.analysis_json);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-2">
          {/* Left side */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium text-sm hidden sm:inline">Nieuwe Analyse</span>
            </Link>
            <div className="h-5 w-[1px] bg-border hidden sm:block" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm text-foreground truncate">
                  Vacature Tovenaar
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  De #1 Recruitment Software
                </p>
              </div>
            </div>
          </div>
          {/* Right side */}
          <div className="text-sm text-muted-foreground shrink-0">
            <span className="hidden sm:inline">Rapport </span>
            <span className="font-mono text-xs bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {id.slice(0, 8)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 lg:py-8">
        <ReportView
          analysis={analysis}
          vacancyText={report.vacancy_text}
          reportId={id}
        />
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Vacature Tovenaar. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacybeleid
            </a>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Algemene Voorwaarden
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
