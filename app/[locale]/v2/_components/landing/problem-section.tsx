"use client";

// problem-section.tsx — "Most postings are quietly broken" section.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { Card, Highlight, Eyebrow } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { Icon } from "../icons";
import type { IconName } from "../icons";
import { HeroIllustration } from "../hero-illustration";

interface ProblemSectionProps {
  tokens: Tokens;
}

export function ProblemSection({ tokens }: ProblemSectionProps) {
  const m = useMotion(tokens);

  const problems: [string, string, IconName][] = [
    ["Too vague", "Responsibilities read as platitudes. Candidates can't tell what the job actually is.", "vague"],
    ["Accidentally exclusive", '"Rockstar", "ninja", 7-year gates and native-language clauses quietly filter out your best hires.', "exclude"],
    ["Asks without giving", "Long requirements lists, thin on growth, comp, flexibility or what the team is actually like.", "imbalance"],
  ];

  return (
    <section style={{ padding: "64px 64px", maxWidth: 1360, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.6fr", gap: 80, alignItems: "start" }}>
        <div>
          <Reveal tokens={tokens}>
            <div style={{ marginBottom: 24 }}>
              <HeroIllustration tokens={tokens} size={280} />
            </div>
          </Reveal>
          <Eyebrow tokens={tokens}>The problem</Eyebrow>
          <h2 style={{
            fontFamily: tokens.displayFont, fontSize: 48, lineHeight: 1.05,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.03em",
            color: tokens.ink, marginTop: 16,
          }}>
            Most postings are <Highlight tokens={tokens}>quietly</Highlight> broken.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {problems.map(([t, s, ic], i) => (
            <Reveal tokens={tokens} delay={i * 120} key={t}>
              <Card
                tokens={tokens}
                pad={22}
                style={{
                  transition: m.on ? "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease" : "none",
                }}
                onMouseEnter={(e) => { if (m.on) { e.currentTarget.style.transform = "translateY(-4px)"; } }}
                onMouseLeave={(e) => { if (m.on) { e.currentTarget.style.transform = "none"; } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{
                    fontFamily: tokens.monoFont, fontSize: 11,
                    color: tokens.inkMute, letterSpacing: "0.14em",
                  }}>0{i + 1}</div>
                  <Icon name={ic} tokens={tokens} size={28} tint={tokens.primaryColor} />
                </div>
                <div style={{
                  fontFamily: tokens.displayFont, fontSize: 22,
                  fontWeight: tokens.displayWeight, color: tokens.ink,
                  marginTop: 18, letterSpacing: "-0.01em",
                }}>{t}</div>
                <div style={{
                  fontFamily: tokens.bodyFont, fontSize: 14, lineHeight: 1.5,
                  color: tokens.inkSoft, marginTop: 10,
                }}>{s}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
