"use client";

// footer.tsx — dark footer with logo, wordmark, tagline, and real links.

import Image from "next/image";
import { useLocale } from "next-intl";
import type { Tokens } from "../theme";
import { useV2T } from "../i18n-context";

interface FooterProps {
  tokens: Tokens;
}

// Link target resolution — keeps all the URL assumptions in one place so we
// can audit/change them without touching the render.
function useFooterLinks(locale: string) {
  return [
    { key: "privacy",  href: `/${locale}/privacy`,                                                   external: false, accent: false },
    { key: "terms",    href: `/${locale}/terms`,                                                     external: false, accent: false },
    { key: "contact",  href: "mailto:joost@vacaturetovenaar.nl",                                     external: true,  accent: false },
    // "Book a demo" — send to a pre-filled mailto so the user lands in their
    // own mail client ready to send. No dependency on a marketing-site anchor
    // that may or may not exist, and matches the contact email used elsewhere.
    { key: "bookDemo", href: "mailto:joost@vacaturetovenaar.nl?subject=Demo%20aanvragen",            external: true,  accent: true  },
  ] as const;
}

export function Footer({ tokens }: FooterProps) {
  const t = useV2T();
  const locale = useLocale();
  const links = useFooterLinks(locale);

  return (
    <footer style={{
      marginTop: 40,
      background: tokens.ink, color: tokens.bgRaised,
      padding: "48px 64px 36px",
    }}>
      <div style={{
        maxWidth: 1360, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "end",
        flexWrap: "wrap", gap: 32,
      }}>
        {/* Left: logo + brand + tagline */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          {/* White tile around the icon — logo is dark + orange, needs a light
              backing to read on the ink-black footer. */}
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: "#fff", padding: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Image
              src="/logo-icon.png"
              alt="Vacature Tovenaar"
              width={36}
              height={36}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{
              fontFamily: tokens.displayFont, fontSize: 26, fontWeight: tokens.displayWeight,
              letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              {t.footer.brand}
            </div>
            <div style={{
              fontFamily: tokens.bodyFont, fontSize: 14, color: "rgba(255,255,255,0.55)",
              marginTop: 8, maxWidth: 380, lineHeight: 1.4,
            }}>
              {t.footer.tagline}
            </div>
          </div>
        </div>

        {/* Right: real anchor links with hover states */}
        <nav style={{
          display: "flex", gap: 32, flexWrap: "wrap",
          fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          {links.map((l) => {
            const label = t.footer[l.key as keyof typeof t.footer];
            return (
              <a
                key={l.key}
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{
                  color: l.accent ? tokens.primaryColor : "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color .15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = l.accent
                    ? tokens.primaryColor
                    : "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = l.accent
                    ? tokens.primaryColor
                    : "rgba(255,255,255,0.55)";
                }}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
