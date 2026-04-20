// theme.ts — design system tokens + aesthetics + primaries + pillar colors
// Ported from handoff: theme.jsx (React-in-HTML prototype)

export type AestheticKey = 'editorial' | 'brutalist' | 'minimal' | 'pillowy';
export type PrimaryKey = 'orange' | 'terracotta' | 'amber' | 'rose' | 'forest' | 'ink';
export type BgKey = 'cream' | 'white' | 'sand' | 'dusk';
export type TypographyKey =
  | 'serifDisplay'
  | 'instrumentSans'
  | 'groteskBold'
  | 'humanistSans'
  | 'classicSerif'
  | 'monoHero';
export type DensityKey = 'comfortable' | 'cozy' | 'spacious';
export type MotionKey = 'calm' | 'lively' | 'still';

export interface TweakSettings {
  aesthetic: AestheticKey;
  primary: PrimaryKey;
  bg: BgKey;
  typography: TypographyKey;
  density: DensityKey;
  motion: MotionKey;
}

export const DEFAULT_TWEAKS: TweakSettings = {
  aesthetic: 'editorial',
  primary: 'orange',
  bg: 'white',
  typography: 'groteskBold',
  density: 'comfortable',
  motion: 'lively',
};

// ---------------------------------------------------------------------------
// Pillar colors
// ---------------------------------------------------------------------------

export type PillarKey =
  | 'structure_layout'
  | 'persona_fit'
  | 'evp_brand'
  | 'tone_of_voice'
  | 'inclusion_bias'
  | 'mobile_experience'
  | 'seo_findability'
  | 'neuromarketing';

export interface PillarColorDef {
  hue: number;
  name: string;
}

export const PILLAR_COLORS: Record<PillarKey, PillarColorDef> = {
  structure_layout:  { hue: 230, name: 'Structure & layout' },
  persona_fit:       { hue: 10,  name: 'Persona fit' },
  evp_brand:         { hue: 60,  name: 'EVP & brand' },
  tone_of_voice:     { hue: 40,  name: 'Tone of voice' },
  inclusion_bias:    { hue: 290, name: 'Inclusion & bias' },
  mobile_experience: { hue: 170, name: 'Mobile experience' },
  seo_findability:   { hue: 260, name: 'Findability (SEO)' },
  neuromarketing:    { hue: 140, name: 'Neuromarketing' },
};

export interface PillarColorResult {
  fg: string;
  bg: string;
  border: string;
  dark: string;
}

export function pillarColor(
  key: PillarKey,
  {
    lightness = 0.72,
    chroma = 0.14,
    bgL = 0.96,
    bgC = 0.04,
  }: { lightness?: number; chroma?: number; bgL?: number; bgC?: number } = {},
): PillarColorResult {
  const h = PILLAR_COLORS[key].hue;
  return {
    fg:     `oklch(${lightness} ${chroma} ${h})`,
    bg:     `oklch(${bgL} ${bgC} ${h})`,
    border: `oklch(0.88 0.06 ${h})`,
    dark:   `oklch(0.45 0.12 ${h})`,
  };
}

// ---------------------------------------------------------------------------
// Aesthetics
// ---------------------------------------------------------------------------

interface AestheticDef {
  label: string;
  defaultTypography: TypographyKey;
  displayItalicWord: boolean;
  cardRadius: number;
  cardBorder: string;
  cardShadow: 'none' | 'offset' | 'soft' | 'pillow';
  buttonRadius: number;
  highlightStyle: 'serif-italic' | 'block' | 'underline' | 'pill';
  hairline: boolean;
  /** Aesthetic's default density hint — not used in buildTokens spread */
  density: string;
}

export const AESTHETICS: Record<AestheticKey, AestheticDef> = {
  editorial: {
    label: 'Editorial',
    defaultTypography: 'serifDisplay',
    displayItalicWord: true,
    cardRadius: 4,
    cardBorder: '1px solid',
    cardShadow: 'none',
    buttonRadius: 999,
    highlightStyle: 'serif-italic',
    hairline: true,
    density: 'airy' as DensityKey,
  },
  brutalist: {
    label: 'Brutalist',
    defaultTypography: 'groteskBold',
    displayItalicWord: false,
    cardRadius: 2,
    cardBorder: '1.5px solid',
    cardShadow: 'offset',
    buttonRadius: 2,
    highlightStyle: 'block',
    hairline: false,
    density: 'tight' as DensityKey,
  },
  minimal: {
    label: 'Warm minimal',
    defaultTypography: 'instrumentSans',
    displayItalicWord: false,
    cardRadius: 12,
    cardBorder: '1px solid',
    cardShadow: 'soft',
    buttonRadius: 8,
    highlightStyle: 'underline',
    hairline: true,
    density: 'airy' as DensityKey,
  },
  pillowy: {
    label: 'Pillowy',
    defaultTypography: 'humanistSans',
    displayItalicWord: false,
    cardRadius: 28,
    cardBorder: '1px solid',
    cardShadow: 'pillow',
    buttonRadius: 999,
    highlightStyle: 'pill',
    hairline: true,
    density: 'airy' as DensityKey,
  },
};

// ---------------------------------------------------------------------------
// Typographies
// ---------------------------------------------------------------------------

interface TypographyDef {
  label: string;
  sample: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  displayWeight: number;
  displayTracking: string;
}

export const TYPOGRAPHIES: Record<TypographyKey, TypographyDef> = {
  serifDisplay: {
    label: 'Editorial Serif',
    sample: 'Aa',
    displayFont: "'Fraunces', 'Times New Roman', serif",
    bodyFont: "'Inter Tight', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    displayWeight: 400,
    displayTracking: '-0.035em',
  },
  instrumentSans: {
    label: 'Instrument × Geist',
    sample: 'Aa',
    displayFont: "'Instrument Serif', 'Fraunces', serif",
    bodyFont: "'Geist', 'Inter Tight', system-ui, sans-serif",
    monoFont: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",
    displayWeight: 400,
    displayTracking: '-0.03em',
  },
  groteskBold: {
    label: 'Grotesk Bold',
    sample: 'Aa',
    displayFont: "'Space Grotesk', system-ui, sans-serif",
    bodyFont: "'Space Grotesk', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    displayWeight: 600,
    displayTracking: '-0.025em',
  },
  humanistSans: {
    label: 'Humanist Sans',
    sample: 'Aa',
    displayFont: "'DM Sans', 'Inter Tight', system-ui, sans-serif",
    bodyFont: "'DM Sans', 'Inter Tight', system-ui, sans-serif",
    monoFont: "'DM Mono', 'JetBrains Mono', ui-monospace, monospace",
    displayWeight: 500,
    displayTracking: '-0.03em',
  },
  classicSerif: {
    label: 'Classic Serif',
    sample: 'Aa',
    displayFont: "'Newsreader', 'Fraunces', Georgia, serif",
    bodyFont: "'Newsreader', Georgia, serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    displayWeight: 500,
    displayTracking: '-0.02em',
  },
  monoHero: {
    label: 'Mono Hero',
    sample: 'Aa',
    displayFont: "'JetBrains Mono', ui-monospace, monospace",
    bodyFont: "'Inter Tight', system-ui, sans-serif",
    monoFont: "'JetBrains Mono', ui-monospace, monospace",
    displayWeight: 500,
    displayTracking: '-0.04em',
  },
};

// ---------------------------------------------------------------------------
// Primaries
// ---------------------------------------------------------------------------

interface PrimaryDef {
  label: string;
  oklch: string;
  hex: string;
}

export const PRIMARIES: Record<PrimaryKey, PrimaryDef> = {
  orange:     { label: 'Orange',     oklch: 'oklch(0.70 0.17 42)',  hex: '#F26B35' },
  terracotta: { label: 'Terracotta', oklch: 'oklch(0.62 0.13 38)',  hex: '#C05A3C' },
  amber:      { label: 'Amber',      oklch: 'oklch(0.76 0.16 70)',  hex: '#E4A04B' },
  rose:       { label: 'Rose',       oklch: 'oklch(0.68 0.16 18)',  hex: '#E16B62' },
  forest:     { label: 'Forest',     oklch: 'oklch(0.48 0.12 155)', hex: '#3F7A4E' },
  ink:        { label: 'Ink',        oklch: 'oklch(0.30 0.04 260)', hex: '#333C4B' },
};

// ---------------------------------------------------------------------------
// Backgrounds
// ---------------------------------------------------------------------------

interface BgDef {
  label: string;
  base: string;
  raised: string;
  muted: string;
}

export const BGS: Record<BgKey, BgDef> = {
  cream: { label: 'Cream',     base: 'oklch(0.975 0.012 75)', raised: '#ffffff',                    muted: 'oklch(0.95 0.012 75)' },
  white: { label: 'Off-white', base: 'oklch(0.99 0.003 80)',  raised: '#ffffff',                    muted: 'oklch(0.965 0.005 80)' },
  sand:  { label: 'Sand',      base: 'oklch(0.94 0.018 80)',  raised: 'oklch(0.985 0.008 80)',       muted: 'oklch(0.915 0.02 80)' },
  dusk:  { label: 'Dusk',      base: 'oklch(0.955 0.016 290)',raised: 'oklch(0.99 0.006 290)',       muted: 'oklch(0.93 0.022 290)' },
};

// ---------------------------------------------------------------------------
// Densities
// ---------------------------------------------------------------------------

interface DensityDef {
  label: string;
  scale: number;
  pad: number;
}

export const DENSITIES: Record<DensityKey, DensityDef> = {
  comfortable: { label: 'Comfortable', scale: 1.00, pad: 1.00 },
  cozy:        { label: 'Cozy',        scale: 0.92, pad: 0.85 },
  spacious:    { label: 'Spacious',    scale: 1.08, pad: 1.18 },
};

// ---------------------------------------------------------------------------
// Motions
// ---------------------------------------------------------------------------

interface MotionDef {
  label: string;
  mult: number;
}

export const MOTIONS: Record<MotionKey, MotionDef> = {
  calm:   { label: 'Calm',   mult: 1.0 },
  lively: { label: 'Lively', mult: 1.4 },
  still:  { label: 'Still',  mult: 0.0 },
};

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export interface Tokens {
  // Identity axes
  aesthetic: AestheticKey;
  primary: PrimaryKey;
  bg: BgKey;
  typography: TypographyKey;
  density: DensityKey;
  motion: MotionKey;
  // From aesthetic
  label: string;
  defaultTypography: TypographyKey;
  displayItalicWord: boolean;
  cardRadius: number;
  cardBorder: string;
  cardShadow: 'none' | 'offset' | 'soft' | 'pillow';
  buttonRadius: number;
  highlightStyle: 'serif-italic' | 'block' | 'underline' | 'pill';
  hairline: boolean;
  // From typography
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  displayWeight: number;
  displayTracking: string;
  // From density
  scale: number;
  pad: number;
  // From motion
  motionMult: number;
  // Derived color tokens
  primaryColor: string;
  primaryHex: string;
  primarySoft: string;
  primaryInk: string;
  bgBase: string;
  bgRaised: string;
  bgMuted: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  line: string;
  lineStrong: string;
  ok: string;
  warn: string;
  bad: string;
}

export function buildTokens({
  aesthetic,
  primary,
  bg,
  typography,
  density,
  motion,
}: TweakSettings): Tokens {
  const a = AESTHETICS[aesthetic] ?? AESTHETICS.editorial;
  const p = PRIMARIES[primary] ?? PRIMARIES.orange;
  const b = BGS[bg] ?? BGS.cream;
  const typeKey: TypographyKey =
    typography && TYPOGRAPHIES[typography] ? typography : a.defaultTypography;
  const t = TYPOGRAPHIES[typeKey];
  const d = DENSITIES[density] ?? DENSITIES.comfortable;
  const m = MOTIONS[motion] ?? MOTIONS.calm;

  // Spread aesthetic without its `density` hint (which can be 'airy'/'tight')
  // to avoid overwriting the real density axis value.
  const { density: _aeDensity, ...aRest } = a;

  return {
    aesthetic,
    primary,
    bg,
    typography: typeKey,
    density: density ?? 'comfortable',
    motion: motion ?? 'calm',
    ...aRest,
    ...t,
    scale: d.scale,
    pad: d.pad,
    motionMult: m.mult,
    primaryColor: p.oklch,
    primaryHex: p.hex,
    primarySoft: `color-mix(in oklch, ${p.oklch} 14%, transparent)`,
    primaryInk: `color-mix(in oklch, ${p.oklch} 80%, black 20%)`,
    bgBase: b.base,
    bgRaised: b.raised,
    bgMuted: b.muted,
    ink: 'oklch(0.22 0.015 50)',
    inkSoft: 'oklch(0.42 0.02 50)',
    inkMute: 'oklch(0.58 0.015 50)',
    line: 'oklch(0.88 0.01 60)',
    lineStrong: 'oklch(0.78 0.015 60)',
    ok: 'oklch(0.62 0.14 150)',
    warn: 'oklch(0.72 0.15 75)',
    bad: 'oklch(0.58 0.18 25)',
  };
}
