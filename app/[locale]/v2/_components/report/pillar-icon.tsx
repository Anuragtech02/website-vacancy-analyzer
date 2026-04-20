"use client";

import { type PillarKey } from "../theme";

interface PillarIconProps {
  name: PillarKey;
  color: string;
}

// Shared SVG presentation attributes safe to spread on any SVG shape element
interface SvgAttrs {
  stroke: string;
  strokeWidth: number;
  fill: string;
  strokeLinecap: "round";
  strokeLinejoin: "round";
}

export function PillarIcon({ name, color }: PillarIconProps) {
  const s: SvgAttrs = {
    stroke: color,
    strokeWidth: 1.6,
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths: Record<PillarKey, React.ReactNode> = {
    clarity:   <><circle cx="10" cy="10" r="6" {...s} /><path d="M10 7v3l2 2" {...s} /></>,
    inclusion: <><circle cx="7" cy="9" r="2.5" {...s} /><circle cx="13" cy="9" r="2.5" {...s} /><path d="M3 16c.8-2.4 2.5-3.5 4-3.5M17 16c-.8-2.4-2.5-3.5-4-3.5" {...s} /></>,
    tone:      <><path d="M3 10a7 4 0 0 0 14 0 7 4 0 0 0-14 0zM3 10v3a7 4 0 0 0 14 0v-3" {...s} /></>,
    benefits:  <><rect x="3" y="7" width="14" height="10" rx="1" {...s} /><path d="M10 7V4M7 10h6" {...s} /></>,
    role:      <><rect x="4" y="5" width="12" height="12" rx="1" {...s} /><path d="M7 9h6M7 12h4" {...s} /></>,
    growth:    <><path d="M3 15l4-5 3 3 7-8" {...s} /><path d="M12 5h5v5" {...s} /></>,
    culture:   <><path d="M10 17s-6-4-6-9a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 5-6 9-6 9z" {...s} /></>,
    cta:       <><path d="M3 10h14M13 6l4 4-4 4" {...s} /></>,
  };

  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      {paths[name]}
    </svg>
  );
}
