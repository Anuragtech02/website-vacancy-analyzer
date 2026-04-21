import { notFound } from "next/navigation";
import { dbClient } from "@/lib/db";
import { ReportView } from "@/components/report-view";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from "@/components/language-switcher";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'report' });

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
              href={`/${locale}`}
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium text-sm hidden sm:inline">{t('navigation.newAnalysis')}</span>
            </Link>
            <div className="h-5 w-[1px] bg-border hidden sm:block" />
            {/*
              Brand mark — use the SVG asset as-is (icon + stacked wordmark
              in one file). Don't pair it with a separate <h1> text node,
              the wordmark is already inside the image. Tagline remains
              alongside as a small descriptor.
            */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image
                src="/vt-dark.svg"
                alt={t('navigation.logo')}
                width={107}
                height={40}
                className="h-9 sm:h-10 w-auto shrink-0"
              />
              <p className="text-xs text-muted-foreground hidden md:block">
                {t('navigation.tagline')}
              </p>
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-sm text-muted-foreground shrink-0">
              <span className="hidden sm:inline">{t('navigation.reportLabel')} </span>
              <span className="font-mono text-xs bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                {id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 lg:py-8">
        <ReportView
          analysis={analysis}
          vacancyText={report.vacancy_text}
          reportId={id}
          locale={locale}
        />
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            {t('footer.copyright').replace('2025', new Date().getFullYear().toString())}
          </p>
          <div className="flex items-center gap-6">
            <a
              href={`/${locale}/privacy`}
              className="hover:text-foreground transition-colors"
            >
              {t('footer.privacy')}
            </a>
            <a
              href={`/${locale}/terms`}
              className="hover:text-foreground transition-colors"
            >
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
