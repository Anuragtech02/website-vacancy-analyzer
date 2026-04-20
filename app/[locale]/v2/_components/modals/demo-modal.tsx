"use client";

import { type Tokens } from "../theme";
import { Button, Eyebrow } from "../primitives";
import { ModalShell } from "./modal-shell";

interface DemoModalProps {
  tokens: Tokens;
  onClose: () => void;
}

const FEATURES = [
  { t: "Unlimited rewrites",       s: "No daily caps — rewrite every posting your team ships." },
  { t: "Persona matching",         s: "Target specific candidate personas, not just \"good writing\"." },
  { t: "Recruitment strategies",   s: "Distribution playbooks per role, by channel." },
  { t: "ATS integrations",         s: "Greenhouse, Workday, Recruitee, Homerun, Teamtailor, SmartRecruiters." },
];

export function DemoModal({ tokens, onClose }: DemoModalProps) {
  return (
    <ModalShell tokens={tokens} onClose={onClose} maxWidth={720}>
      <div style={{ padding: "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>What the full product does</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: 32, lineHeight: 1.08,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.025em",
          color: tokens.ink, marginTop: 12,
        }}>
          This tool is the tip of it.
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 10, maxWidth: 520,
        }}>
          The analyzer is a free taster. The actual platform is what your recruiters live in every day.
        </p>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22,
        }}>
          {FEATURES.map((f) => (
            <div key={f.t} style={{
              padding: 18,
              background: tokens.bgMuted,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.cardRadius,
            }}>
              <div style={{ fontFamily: tokens.bodyFont, fontSize: 15, fontWeight: 600, color: tokens.ink }}>{f.t}</div>
              <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, color: tokens.inkSoft, marginTop: 6, lineHeight: 1.45 }}>{f.s}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22, alignItems: "center" }}>
          <Button tokens={tokens} variant="primary" style={{ padding: "14px 22px" }} onClick={onClose}>
            Plan a 20-min demo
          </Button>
          <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, color: tokens.inkMute }}>
            No deck. A real recruiter on the call. Bring a real posting.
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
