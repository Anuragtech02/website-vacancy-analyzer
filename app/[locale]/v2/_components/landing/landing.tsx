"use client";

// landing.tsx — main Landing component that composes all landing page sections.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { Reveal } from "../motion";
import { HeroSection } from "./hero-section";
import { AnalyzerCard } from "./analyzer-card";
import { StatsBand } from "./stats-band";
import { ProblemSection } from "./problem-section";
import { MethodologySection } from "./methodology-section";
import { Footer } from "./footer";
import { useBreakpoint, isMobile, isNarrow } from "../use-breakpoint";

export interface LandingProps {
  tokens: Tokens;
  onAnalyze: (text: string) => void;
}

export function Landing({ tokens, onAnalyze }: LandingProps) {
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* HERO */}
      <section style={{
        padding: mobile ? "20px 16px 20px" : narrow ? "28px 24px 28px" : "32px 64px 32px",
        maxWidth: 1360, margin: "0 auto", position: "relative",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: narrow ? "1fr" : "1.05fr 1.25fr",
            gap: mobile ? 28 : narrow ? 36 : 64,
            alignItems: "start",
          }}>
            <HeroSection tokens={tokens} />
            <Reveal tokens={tokens} delay={180} y={16}>
              <AnalyzerCard tokens={tokens} onAnalyze={onAnalyze} />
            </Reveal>
          </div>
        </div>
      </section>

      <StatsBand tokens={tokens} />
      <ProblemSection tokens={tokens} />
      <MethodologySection tokens={tokens} />
      <Footer tokens={tokens} />
    </div>
  );
}
