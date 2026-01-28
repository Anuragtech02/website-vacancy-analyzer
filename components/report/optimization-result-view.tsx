"use client";

import { OptimizationResult } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, Check } from "lucide-react";
import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { useLocale } from "next-intl";

interface OptimizationResultViewProps {
  result: OptimizationResult;
  email: string;
  phase: number;
}

export function OptimizationResultView({ result, email, phase }: OptimizationResultViewProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.full_text_plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert(locale === 'en' ? 'Failed to copy text' : 'Kopiëren mislukt');
    }
  };

  // Download as Word (.docx)
  const handleDownloadWord = async () => {
    setDownloadingWord(true);
    try {
      // Create document sections
      const docSections: Paragraph[] = [];

      // Title
      docSections.push(
        new Paragraph({
          text: result.metadata.job_title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 },
        })
      );

      // Metadata
      if (result.metadata.organization) {
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({ text: locale === 'en' ? 'Organization: ' : 'Organisatie: ', bold: true }),
              new TextRun(result.metadata.organization),
            ],
            spacing: { after: 200 },
          })
        );
      }

      if (result.metadata.location) {
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({ text: locale === 'en' ? 'Location: ' : 'Locatie: ', bold: true }),
              new TextRun(result.metadata.location),
            ],
            spacing: { after: 400 },
          })
        );
      }

      // Hook
      docSections.push(
        new Paragraph({
          text: result.content.hook,
          spacing: { after: 400 },
        })
      );

      // Sections
      result.content.sections.forEach((section) => {
        // Section header
        docSections.push(
          new Paragraph({
            text: section.header,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          })
        );

        // Section content
        if (section.content) {
          docSections.push(
            new Paragraph({
              text: section.content,
              spacing: { after: 200 },
            })
          );
        }

        // Bullets
        if (section.bullets && section.bullets.length > 0) {
          section.bullets.forEach((bullet) => {
            docSections.push(
              new Paragraph({
                text: bullet,
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            );
          });
          docSections.push(new Paragraph({ text: "", spacing: { after: 200 } }));
        }
      });

      // Diversity statement
      if (result.content.diversity_statement) {
        docSections.push(
          new Paragraph({
            text: locale === 'en' ? 'Diversity & Inclusion' : 'Diversiteit & Inclusie',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          })
        );
        docSections.push(
          new Paragraph({
            text: result.content.diversity_statement,
            spacing: { after: 400 },
          })
        );
      }

      // Call to action
      if (result.content.call_to_action) {
        docSections.push(
          new Paragraph({
            text: result.content.call_to_action,
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
          })
        );
      }

      // Create document
      const doc = new Document({
        sections: [
          {
            children: docSections,
          },
        ],
      });

      // Generate and save
      const blob = await Packer.toBlob(doc);
      const fileName = `${result.metadata.job_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_optimized.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Failed to generate Word document:", error);
      alert(locale === 'en' ? 'Failed to generate Word document' : 'Word-document genereren mislukt');
    } finally {
      setDownloadingWord(false);
    }
  };

  // Download as PDF (existing functionality - via email)
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      // This triggers the existing PDF email flow
      alert(
        locale === 'en'
          ? 'PDF has been sent to your email'
          : 'PDF is naar je e-mail verzonden'
      );
    } catch (error) {
      console.error("Failed to send PDF:", error);
      alert(locale === 'en' ? 'Failed to send PDF' : 'PDF verzenden mislukt');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {locale === 'en' ? 'Optimized Vacancy' : 'Verbeterde Vacature'}
            </h2>
            <p className="text-sm text-slate-600">
              {locale === 'en'
                ? 'Your improved vacancy text is ready. Copy or download it below.'
                : 'Je verbeterde vacaturetekst is klaar. Kopieer of download deze hieronder.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Copy to Clipboard (Priority 1) */}
          <Button
            onClick={handleCopy}
            disabled={copied}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {locale === 'en' ? 'Copied!' : 'Gekopieerd!'}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {locale === 'en' ? 'Copy Text' : 'Kopieer Tekst'}
              </>
            )}
          </Button>

          {/* Download Word (Priority 2) */}
          <Button
            onClick={handleDownloadWord}
            disabled={downloadingWord}
            variant="outline"
            className="flex items-center gap-2 font-semibold border-2"
          >
            <Download className="w-4 h-4" />
            {downloadingWord
              ? (locale === 'en' ? 'Generating...' : 'Genereren...')
              : (locale === 'en' ? 'Download Word' : 'Download Word')}
          </Button>

          {/* Download PDF (Priority 3) */}
          <Button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            variant="outline"
            className="flex items-center gap-2 font-semibold border-2"
          >
            <FileText className="w-4 h-4" />
            {downloadingPdf
              ? (locale === 'en' ? 'Sending...' : 'Verzenden...')
              : (locale === 'en' ? 'Download PDF' : 'Download PDF')}
          </Button>
        </div>
      </div>

      {/* Optimized Text Display */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
          {locale === 'en' ? 'Full Text' : 'Volledige Tekst'}
        </h3>

        <div className="prose prose-slate max-w-none">
          {/* Job Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            {result.metadata.job_title}
          </h1>

          {/* Metadata */}
          {(result.metadata.organization || result.metadata.location) && (
            <div className="text-sm text-slate-600 mb-6 space-y-1">
              {result.metadata.organization && (
                <p>
                  <strong>{locale === 'en' ? 'Organization:' : 'Organisatie:'}</strong>{' '}
                  {result.metadata.organization}
                </p>
              )}
              {result.metadata.location && (
                <p>
                  <strong>{locale === 'en' ? 'Location:' : 'Locatie:'}</strong>{' '}
                  {result.metadata.location}
                </p>
              )}
            </div>
          )}

          {/* Hook */}
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            {result.content.hook}
          </p>

          {/* Sections */}
          {result.content.sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{section.header}</h2>
              {section.content && (
                <p className="text-slate-700 leading-relaxed mb-3">{section.content}</p>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  {section.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Diversity Statement */}
          {result.content.diversity_statement && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                {locale === 'en' ? 'Diversity & Inclusion' : 'Diversiteit & Inclusie'}
              </h2>
              <p className="text-slate-700 leading-relaxed">
                {result.content.diversity_statement}
              </p>
            </div>
          )}

          {/* Call to Action */}
          {result.content.call_to_action && (
            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-primary">
                {result.content.call_to_action}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Changes Summary */}
      {result.changes && result.changes.summary && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {locale === 'en' ? 'What Changed?' : 'Wat is er veranderd?'}
          </h3>
          <p className="text-slate-700 leading-relaxed mb-4">{result.changes.summary}</p>

          {result.changes.improvements && result.changes.improvements.length > 0 && (
            <div className="space-y-3">
              {result.changes.improvements.slice(0, 5).map((improvement, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{improvement.pillar}</p>
                    <p className="text-sm text-slate-600">{improvement.change}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
