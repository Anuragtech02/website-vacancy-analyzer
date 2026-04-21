"use client";

// shader-surface.tsx — WebGL plasma background that reacts to mouse.
// Ported from shader.jsx (React-in-HTML prototype).

import { useRef, useEffect } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { useMotion } from "../motion/use-motion";
import type { Tokens } from "../theme";

// ---------------------------------------------------------------------------
// Shader source strings (verbatim from handoff)
// ---------------------------------------------------------------------------

const SHADER_VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Soft animated plasma — tinted by u_color, brightens toward mouse position.
const SHADER_FRAG = `
precision mediump float;
uniform vec2  u_res;
uniform vec2  u_mouse;      // 0..1 across canvas
uniform float u_time;
uniform float u_hover;      // 0..1 easing toward 1 on hover
uniform vec3  u_color;      // primary tint (RGB 0..1)
uniform vec3  u_bg;         // background tint (RGB 0..1)

// smooth value noise
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * vnoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;

  // Mouse influence: displace the flow toward the cursor so the fluid warps around it.
  vec2 m = u_mouse;
  m.x *= u_res.x / u_res.y;
  float d = distance(p, m);
  float lens = smoothstep(0.45, 0.0, d);           // soft pull radius
  vec2 displaced = p + normalize(p - m + 1e-5) * lens * -0.35; // pull toward cursor

  float t = u_time * 0.14;
  vec2 q = vec2(fbm(displaced + vec2(t, -t)), fbm(displaced + vec2(-t, t * 1.3) + 5.2));
  vec2 r = vec2(fbm(displaced + q * 1.8 + vec2(1.7, 9.2) + t * 0.5),
                fbm(displaced + q * 1.8 + vec2(8.3, 2.8) - t * 0.4));
  float n = fbm(displaced + r * 2.0);

  // Tight spotlight near cursor
  float glow = smoothstep(0.28, 0.0, d);

  // Two accent tints: primary and a brighter warm highlight.
  vec3 warm = mix(u_color, vec3(1.0, 0.92, 0.78), 0.55);

  // High-contrast flow shaping — punchy bands of color.
  float flow = smoothstep(0.28, 0.72, n);
  float k = clamp(flow * (0.55 + 0.45 * u_hover) + glow * (0.55 + 0.45 * u_hover), 0.0, 1.0);

  vec3 col = mix(u_bg, u_color, k);
  col = mix(col, warm, glow * 0.45 + flow * 0.15 * u_hover);

  float v = smoothstep(1.2, 0.3, length(uv - 0.5));
  col *= mix(0.96, 1.0, v);

  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 0.5, 0.2];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

// Resolve any CSS color string to [r,g,b] 0..1 by painting it to a 1x1 canvas.
// Handles hex, rgb, rgba, oklch, oklab, named colors — whatever the browser supports.
function resolveColorRgb(cssColor: string): [number, number, number] {
  if (typeof cssColor === "string" && /^#[0-9a-f]{6}$/i.test(cssColor)) return hexToRgb(cssColor);
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d");
    if (!ctx) return [1, 0.5, 0.2];
    ctx.fillStyle = "#000"; // reset
    ctx.fillStyle = cssColor;
    // If the browser didn't accept it, fillStyle stays as the previous value.
    ctx.fillRect(0, 0, 1, 1);
    const px = ctx.getImageData(0, 0, 1, 1).data;
    return [px[0] / 255, px[1] / 255, px[2] / 255];
  } catch (e) {
    return [1, 0.5, 0.2];
  }
}

// ---------------------------------------------------------------------------
// ShaderSurface
// ---------------------------------------------------------------------------

export interface ShaderSurfaceProps {
  tokens: Tokens;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  idle?: number;
  opacity?: number;
  mouseSource?: RefObject<HTMLElement | null>;
  mouseWindow?: boolean;
}

export function ShaderSurface({
  tokens,
  children,
  className,
  style,
  intensity = 1,
  idle = 0,
  opacity = 1,
  mouseSource,
  mouseWindow = false,
}: ShaderSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef   = useRef<HTMLDivElement | null>(null);
  const stateRef  = useRef<{ mouse: [number, number]; hover: number; target: number; start: number }>({
    mouse: [0.5, 0.5],
    hover: 0,
    target: 0,
    start: performance.now(),
  });
  const m = useMotion(tokens);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (!m.on) return; // still mode — do nothing, static bg shows through

    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); }
      return s;
    };
    const vert = compile(gl.VERTEX_SHADER, SHADER_VERT);
    const frag = compile(gl.FRAGMENT_SHADER, SHADER_FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uHover = gl.getUniformLocation(prog, "u_hover");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uBg    = gl.getUniformLocation(prog, "u_bg");

    const colorRgb = resolveColorRgb(tokens.primaryColor);
    const bgRgb    = resolveColorRgb(tokens.bgRaised);
    gl.uniform3f(uColor, colorRgb[0], colorRgb[1], colorRgb[2]);
    gl.uniform3f(uBg,    bgRgb[0],    bgRgb[1],    bgRgb[2]);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width  = Math.max(2, Math.round(r.width * dpr));
      canvas.height = Math.max(2, Math.round(r.height * dpr));
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e: Event) => {
      const me = e as MouseEvent;
      const r = wrap.getBoundingClientRect();
      const x = (me.clientX - r.left) / r.width;
      const y = 1 - (me.clientY - r.top) / r.height;
      stateRef.current.mouse = [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
    };
    const onEnter = () => { stateRef.current.target = 1 * intensity; };
    const onLeave = () => { stateRef.current.target = idle; };
    stateRef.current.target = idle;
    stateRef.current.hover = idle;
    // Either listen on the surface itself, or on an external source, or on window.
    const evtTarget: EventTarget = mouseWindow
      ? window
      : (mouseSource && mouseSource.current) ? mouseSource.current : wrap;
    evtTarget.addEventListener("mousemove", onMove);
    if (!mouseWindow) {
      evtTarget.addEventListener("mouseenter", onEnter);
      evtTarget.addEventListener("mouseleave", onLeave);
    } else {
      // Window mode: always idle-ish; bloom when mouse moves (reset target on move)
      stateRef.current.target = Math.max(idle, intensity);
    }

    let raf: number;
    const tick = (tms: number) => {
      const s = stateRef.current;
      s.hover += (s.target - s.hover) * 0.08;
      gl.uniform1f(uTime, (tms - s.start) / 1000);
      gl.uniform1f(uHover, s.hover);
      gl.uniform2f(uMouse, s.mouse[0], s.mouse[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      evtTarget.removeEventListener("mousemove", onMove);
      if (!mouseWindow) {
        evtTarget.removeEventListener("mouseenter", onEnter);
        evtTarget.removeEventListener("mouseleave", onLeave);
      }
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [m.on, tokens.primaryColor, tokens.bgRaised, intensity, idle, mouseWindow]);

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", ...style }}>
      {m.on && (
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            borderRadius: "inherit",
            pointerEvents: "none",
            opacity,
            filter: "blur(12px)",
            transform: "scale(1.04)",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
