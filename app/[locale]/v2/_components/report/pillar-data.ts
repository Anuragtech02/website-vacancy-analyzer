import { type PillarKey } from "../theme";

export type PillarLabelKey = 'excellent' | 'good' | 'fair' | 'needsWork' | 'critical';

export interface PillarDatum {
  key: PillarKey;
  score: number;
  label: PillarLabelKey;
  verdict: string;
  tone: "ok" | "warn" | "bad";
}
