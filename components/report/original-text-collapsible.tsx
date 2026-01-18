"use client";

import { useState } from "react";
import { ChevronDown, FileText, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OriginalTextCollapsibleProps {
  vacancyText: string;
  defaultOpen?: boolean;
}

export function OriginalTextCollapsible({
  vacancyText,
  defaultOpen = false,
}: OriginalTextCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(vacancyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <section className="mb-10">
      <div className="bg-surface-container-low rounded-[20px] border border-outline-variant/60 overflow-hidden">
        {/* Header - clickable */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container-high/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-container-high rounded-xl group-hover:bg-white transition-colors">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-on-surface text-lg">Originele Vacaturetekst</h3>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <span>{vacancyText.length.toLocaleString()} tekens</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full hidden sm:flex"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                    Gekopieerd!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Tekst kopiëren
                  </>
                )}
            </Button>

            <ChevronDown
                className={cn(
                "w-5 h-5 text-muted-foreground transition-transform duration-300",
                isOpen && "rotate-180"
                )}
            />
          </div>
        </div>

        {/* Collapsible content */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-outline-variant/60">
            {/* Text content - scrollable */}
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto bg-surface">
              <div className="prose prose-sm prose-slate max-w-none text-on-surface-variant font-medium">
                {vacancyText.split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? (
                    <p key={idx} className="leading-relaxed mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ) : (
                    <br key={idx} />
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
