"use client";

// icons.tsx — duotone icon set. Each icon renders a soft color-filled shape + a line on top.
// Usage: <Icon name="target" tokens={tokens} size={28} tint={c} />

import type { Tokens } from "./theme";

export type IconName =
  | "target"
  | "document"
  | "publish"
  | "clock"
  | "shield"
  | "spark"
  | "vague"
  | "exclude"
  | "imbalance"
  | "quote"
  | "chart"
  | "timer"
  | "coin"
  | "bolt"
  | "arrow";

export interface IconProps {
  name: IconName;
  size?: number;      // default 22
  tint?: string;      // defaults to tokens.primaryColor
  tokens: Tokens;
  style?: React.CSSProperties;
}

// Each icon: fill (soft bg shape), line (main stroke), accent (colored dot/mark).
const ICON_PATHS: Record<IconName, { fill?: string; line: string; accent?: string }> = {
  // numbered list item
  target: {
    fill:   "M12 4a8 8 0 100 16 8 8 0 000-16z",
    line:   "M12 4a8 8 0 100 16 8 8 0 000-16zM12 8a4 4 0 100 8 4 4 0 000-8z",
    accent: "M12 11.25a.75.75 0 100 1.5.75.75 0 000-1.5z",
  },
  // plain-english / document with line
  document: {
    fill:   "M7 3h8l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z",
    line:   "M7 3h8l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM15 3v4h4",
    accent: "M9 12h8M9 15h5",
  },
  // ready-to-publish / arrow into tray
  publish: {
    fill:   "M4 14v5a1 1 0 001 1h14a1 1 0 001-1v-5",
    line:   "M4 14v5a1 1 0 001 1h14a1 1 0 001-1v-5M12 3v12M7 10l5 5 5-5",
  },
  // hourglass for "results in ~50s"
  clock: {
    fill:   "M12 3a9 9 0 100 18 9 9 0 000-18z",
    line:   "M12 3a9 9 0 100 18 9 9 0 000-18z",
    accent: "M12 7v5l3 2",
  },
  // shield for GDPR safe
  shield: {
    fill:   "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z",
    line:   "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z",
    accent: "M9 12l2 2 4-4",
  },
  // sparkles for "no login"
  spark: {
    fill:   "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z",
    line:   "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z",
  },
  // vague — dotted circle
  vague: {
    fill:   "M12 4a8 8 0 100 16 8 8 0 000-16z",
    line:   "M4 12a8 8 0 018-8M20 12a8 8 0 01-8 8",
    accent: "M9 12h.01M12 12h.01M15 12h.01",
  },
  // exclude — no-entry
  exclude: {
    fill:   "M12 3a9 9 0 100 18 9 9 0 000-18z",
    line:   "M12 3a9 9 0 100 18 9 9 0 000-18zM6 6l12 12",
  },
  // imbalance — unbalanced scale
  imbalance: {
    fill:   "M4 8h16l-3 6H7z",
    line:   "M12 4v16M6 20h12M4 8h16l-3 6H7L4 8z",
    accent: "M12 4l6 2",
  },
  // quote / editorial mark
  quote: {
    fill:   "M5 6h5v8H7l-2 4V6zM14 6h5v8h-3l-2 4V6z",
    line:   "M5 6h5v8H7l-2 4V6zM14 6h5v8h-3l-2 4V6z",
  },
  // chart up / quality
  chart: {
    fill:   "M4 20h16",
    line:   "M4 20h16M4 16l4-4 4 3 7-8",
    accent: "M15 7h4v4",
  },
  // time / clock saved
  timer: {
    fill:   "M12 5a8 8 0 100 16 8 8 0 000-16z",
    line:   "M12 5a8 8 0 100 16 8 8 0 000-16zM10 2h4M12 5v1",
    accent: "M12 9v4l3 2",
  },
  // cost / coin
  coin: {
    fill:   "M12 4a8 8 0 100 16 8 8 0 000-16z",
    line:   "M12 4a8 8 0 100 16 8 8 0 000-16z",
    accent: "M14 9.5A2 2 0 0012 8h-1a2 2 0 000 4h2a2 2 0 010 4h-1a2 2 0 01-2-1.5M12 6v2M12 16v2",
  },
  // bolt / fast
  bolt: {
    fill:   "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
    line:   "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  },
  // right arrow
  arrow: {
    fill:   "",
    line:   "M4 12h14M13 6l6 6-6 6",
  },
};

function withAlpha(cssColor: string, a: number): string {
  // best-effort: use canvas to resolve then emit rgba
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const px = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${px[0]},${px[1]},${px[2]},${a})`;
  } catch {
    return `rgba(217,119,87,${a})`;
  }
}

function Icon({ name, size = 22, tint, tokens, style }: IconProps) {
  const color = tint || tokens.primaryColor;
  const soft  = tint ? withAlpha(tint, 0.18) : (tokens.primarySoft || "rgba(0,0,0,0.08)");
  const ink   = tokens.ink;
  const p = ICON_PATHS[name];
  if (!p) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    >
      {p.fill && <path d={p.fill} fill={soft} />}
      <path d={p.line} stroke={ink} strokeWidth="1.5" />
      {p.accent && <path d={p.accent} stroke={color} strokeWidth="1.5" fill={soft} />}
    </svg>
  );
}

export { Icon };
