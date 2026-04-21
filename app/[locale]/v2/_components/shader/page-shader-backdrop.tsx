"use client";

// page-shader-backdrop.tsx — fixed, full-viewport shader that follows the mouse everywhere.
// Mounted once at the App level, sits behind all page content.
// Ported from shader.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { ShaderSurface } from "./shader-surface";

interface PageShaderBackdropProps {
  tokens: Tokens;
}

export function PageShaderBackdrop({ tokens }: PageShaderBackdropProps) {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      overflow: "hidden",
    }}>
      <ShaderSurface
        tokens={tokens}
        mouseWindow
        intensity={0.7}
        idle={0.28}
        opacity={0.22}
        style={{ width: "100%", height: "100%" }}
      >
        <div style={{ width: "100%", height: "100%" }} />
      </ShaderSurface>
    </div>
  );
}
