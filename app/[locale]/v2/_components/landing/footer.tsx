"use client";

// footer.tsx — light footer that matches the navbar's wordmark treatment.
// Container structure mirrors the other landing sections (section has the
// maxWidth + padding, not an outer-full-width + inner-1360-box), so the
// left edge of the logo aligns with the left edge of the methodology title
// above it.

import Image from "next/image";
import { useLocale } from "next-intl";
import type { Tokens } from "../theme";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile, isTablet } from "../use-breakpoint";
import { DEMO_CALENDAR_URL } from "../demo-link";

interface FooterProps {
  tokens: Tokens;
}

function useFooterLinks(locale: string) {
  return [
    { key: "privacy",  href: `/${locale}/privacy`,                                          external: false, accent: false },
    { key: "terms",    href: `/${locale}/terms`,                                            external: false, accent: false },
    { key: "contact",  href: "mailto:joost@vacaturetovenaar.nl",                            external: true,  accent: false },
    // "Book a demo" → HubSpot calendar, same destination as the DemoModal
    // CTA and the v1 AccessRequestModal's onPlanDemo handler.
    { key: "bookDemo", href: DEMO_CALENDAR_URL,                                             external: true,  accent: true  },
  ] as const;
}

export function Footer({ tokens }: FooterProps) {
  const t = useV2T();
  const locale = useLocale();
  const links = useFooterLinks(locale);
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);

  // Match methodology-section.tsx's container so the left edge aligns.
  const sectionPadding = mobile ? "36px 16px 28px" : tablet ? "44px 24px 32px" : "56px 64px 40px";

  return (
    <footer style={{
      maxWidth: 1360, margin: "0 auto",
      padding: sectionPadding,
      borderTop: `1px solid ${tokens.line}`,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 20,
      }}>
        {/* Left: wordmark — use the brand asset as-is. vt-dark.svg already
            contains the icon + stacked "Vacature Tovenaar" text; pairing it
            with a separate text node (as before) made the wordmark render
            inline, which isn't the brand layout. Light-surface → dark
            asset. */}
        <div>
          {(() => {
            const height = mobile ? 40 : 52;
            const width = Math.round(height * (1172 / 441));
            return (
              <Image
                src="/vt-dark.svg"
                alt="Vacature Tovenaar"
                width={width}
                height={height}
                style={{ display: "block", height, width: "auto" }}
              />
            );
          })()}
          <div style={{
            fontFamily: tokens.bodyFont, fontSize: 13, color: tokens.inkMute,
            marginTop: 14, maxWidth: 420, lineHeight: 1.5,
          }}>
            {t.footer.tagline}
          </div>
        </div>

        {/* Right: real anchor links, muted-ink on light bg, primary accent on
            Book a demo. */}
        <nav style={{
          display: "flex", gap: mobile ? 18 : 28, flexWrap: "wrap",
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
                  color: l.accent ? tokens.primaryColor : tokens.inkMute,
                  textDecoration: "none",
                  transition: "color .15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = l.accent
                    ? tokens.primaryColor
                    : tokens.ink;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = l.accent
                    ? tokens.primaryColor
                    : tokens.inkMute;
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
