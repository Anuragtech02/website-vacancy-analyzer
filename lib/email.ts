import nodemailer from "nodemailer";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { OptimizationResult } from "./gemini";
import { generateVacancyPDF } from "./pdf-generator";

// Initialize SES Client
const ses = new SESClient({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Create Nodemailer Transporter for Stream Generation (Buffer)
const mailGenerator = nodemailer.createTransport({
  streamTransport: true,
  newline: "unix",
  buffer: true,
});

interface SendOptimizedVacancyEmailParams {
  to: string;
  optimization: OptimizationResult;
  reportId: string;
  usageCount: number;
}

export async function sendOptimizedVacancyEmail({
  to,
  optimization,
  reportId,
  usageCount,
}: SendOptimizedVacancyEmailParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const jobTitle = optimization.metadata.job_title || "Optimized Vacancy";
    const organization = optimization.metadata.organization || "";

    // Generate PDF from HTML template
    const pdfBuffer = await generateVacancyPDF(optimization);

    // Determines content based on phase
    const isPhase2 = usageCount >= 2;
    
    // --- CONTENT VARIABLES ---
    const introText = isPhase2
      ? `Je hebt inmiddels twee vacatures geanalyseerd met Vacature Tovenaar. Dat betekent meestal dat teams willen weten of deze aanpak ook structureel werkt wanneer meerdere vacatures tegelijkertijd openstaan.`
      : `We hebben jouw vacature voor <strong style="color: #0f172a;">${jobTitle}</strong>${organization ? ` bij ${organization}` : ""} geoptimaliseerd met onze Human AI methode.`;

    const whyMattersTitle = isPhase2
      ? "De kwaliteit van kandidaten lijkt vaak een kwestie van bereik, maar in de praktijk zit het verschil in:"
      : "Waarom dit belangrijk is";

    const whyMattersContent = isPhase2
      ? `
        • Hoe je de tekst formuleert<br>
        • Welke kandidaten zich aangesproken voelen<br>
        • Welke profielen afhaken<br><br>
        <strong>Met deze aanpak zie je:</strong><br>
        • Minder tijd kwijt aan mismatch<br>
        • Lagere advertentiekosten<br>
        • Meer consistente kwaliteit
      `
      : `
        Kleine copy-aanpassingen sturen wie zich wél meldt en wie niet.<br><br>
        <strong>Dat maakt direct verschil in:</strong><br>
        • Kwaliteit van reacties<br>
        • Uitval tijdens selectie<br>
        • Advertentiekosten
      `;
      
    // Phase 2 CTA section (Demo/Reply)
    const phase2CTA = `
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #634033;">
        <strong style="color: #1F1B16;">Wil je weten wat dit voor jullie processen kan betekenen?</strong><br>
        Ik laat je live zien hoe je dit toepast op meerdere vacatures en tot welke resultaten dit leidt bij vergelijkbare organisaties.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="https://meetings-eu1.hubspot.com/jknuvers" style="display: inline-block; padding: 14px 32px; background-color: #FF6B35; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 16px; box-shadow: 0 4px 6px rgba(255, 107, 53, 0.2);">
              Plan een Demo
            </a>
          </td>
        </tr>
      </table>
    `;

    // Phase 1 CTA section (Analyze another)
    const phase1CTA = `
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #634033;">
        <strong style="color: #1F1B16;">Benieuwd hoe je met deze aanpak structureel meer passende kandidaten aantrekt?</strong><br>
        Ik laat je live zien wat deze aanpak voor jullie organisatie kan betekenen.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
        <tr>
          <td align="center">
            <a href="https://meetings-eu1.hubspot.com/jknuvers" style="display: inline-block; padding: 14px 32px; background-color: #FF6B35; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 16px; box-shadow: 0 4px 6px rgba(255, 107, 53, 0.2);">
              Plan een Demo
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #634033;">
        Wil je ondertussen nog een vacature analyseren? Dat kan via de knop hieronder:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="https://analyse.vacaturetovenaar.nl" style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #FF6B35; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 16px; border: 2px solid #FFE4D6;">
              Analyseer Nog Een Vacature
            </a>
          </td>
        </tr>
      </table>
    `;

    const ctaSection = isPhase2 ? phase2CTA : phase1CTA;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #FFF8F6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF8F6; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(31, 27, 22, 0.05); border: 1px solid #FFE4D6;">
                    <!-- Header — full stacked brand asset (icon + wordmark).
                         Served as PNG (rasterised from vt-dark.svg at 800px
                         wide) because Outlook 2007-2019 strips SVG and
                         Gmail's Android client rasterises inconsistently.
                         height:72 / width:192 preserves the native 2.66:1
                         aspect ratio without forcing mail clients to infer. -->
                    <tr>
                      <td style="padding: 36px 40px 28px 40px; border-bottom: 2px solid #FFE4D6; background: linear-gradient(135deg, #FFF8F6 0%, #ffffff 100%); text-align: center;">
                        <img src="https://analyse.vacaturetovenaar.nl/vt-dark.png" alt="Vacature Tovenaar" width="192" height="72" style="height: 72px; width: 192px; display: inline-block; margin: 0 auto; border: 0; outline: none;" />
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #1F1B16; letter-spacing: -0.3px;">
                          ${isPhase2 ? "Je analyse is klaar" : "Jouw geoptimaliseerde vacature is klaar!"}
                        </h2>

                        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #634033;">
                          ${introText}
                        </p>

                        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #634033; background-color: #FFF8F6; padding: 16px; border-radius: 12px; border-left: 4px solid #FF6B35;">
                          <strong style="color: #1F1B16;">De herschreven vacature zit als PDF in de bijlage.</strong> Je kunt de tekst direct kopiëren en plakken in je ATS of vacaturesite.
                        </p>

                        <!-- Variable Improvements Section -->
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1F1B16;">
                          Een paar concrete verbeteringen
                        </h3>
                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #634033;">
                          ${optimization.changes.summary}
                        </p>

                        <!-- Variable 'Why this matters' Section -->
                         <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1F1B16;">
                          ${whyMattersTitle}
                        </h3>
                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #634033;">
                           ${whyMattersContent}
                        </p>

                        <!-- CTA Section (Phase Specific) -->
                        ${ctaSection}

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background-color: #FFF8F6; border-top: 2px solid #FFE4D6; border-radius: 0 0 16px 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #634033; text-align: center;">
                          Vragen? Neem contact op via <a href="mailto:joost@vacaturetovenaar.nl" style="color: #FF6B35; font-weight: 600; text-decoration: none;">joost@vacaturetovenaar.nl</a>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #9C8E85; text-align: center;">
                          © ${new Date().getFullYear()} Vacature Tovenaar. Alle rechten voorbehouden.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
    `;

    // 1. Generate Raw MIME Message using Nodemailer
    const emailInfo = await mailGenerator.sendMail({
      from: process.env.AWS_FROM_EMAIL || "Vacature Tovenaar <noreply@vacaturetovenaar.nl>",
      to: to,
      subject: `Jouw geoptimaliseerde vacature: ${jobTitle}`,
      html: htmlContent,
      attachments: [
        {
          filename: `${jobTitle.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-")}-geoptimaliseerd.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    });

    // 2. Send Raw Message with AWS SES
    const rawMessage = emailInfo.message as Buffer;
    
    const command = new SendRawEmailCommand({
      RawMessage: { Data: rawMessage },
    });

    const result = await ses.send(command);

    console.log("Email sent successfully via SES (Raw):", result.MessageId);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ─── Branded "analysis is ready" notification (mid-flow email) ────────────
// Sent when a user hits "Email me when the report is ready" during the
// loading screen, and again when the analysis finishes in the background
// worker. Visual language matches sendOptimizedVacancyEmail — same palette,
// same container, same tone — so the two emails feel like one family.

type Locale = "en" | "nl";

interface SendAnalysisReadyEmailParams {
  to: string;
  reportUrl: string;
  locale: Locale;
}

export async function sendAnalysisReadyEmail({
  to,
  reportUrl,
  locale,
}: SendAnalysisReadyEmailParams): Promise<{ success: boolean; error?: string }> {
  const copy = locale === "en"
    ? {
        subject: "Your vacancy analysis is ready",
        preheader: "Open your report to see the score, pillar breakdown, and the rewrite suggestions.",
        eyebrow: "Analysis complete",
        heading: "Your report is ready",
        intro:
          "We've finished analysing your vacancy. The full report with score, pillar-by-pillar feedback, and concrete rewrite suggestions is waiting for you.",
        cta: "Open my report",
        insideTitle: "What's inside",
        inside: [
          "An overall quality score and where you stand versus the market",
          "A pillar-by-pillar breakdown (bias, tone, structure, benefits)",
          "Critical points that are most likely costing you candidates",
          "The option to unlock a fully rewritten version, tailored to your role",
        ],
        questions: "Questions?",
        contactPrefix: "Reach us at",
        reportHint: "Your report link:",
        regards: "Kind regards,",
        signature: "Vacature Tovenaar",
      }
    : {
        subject: "Je vacature-analyse is klaar",
        preheader: "Open je rapport voor de score, de pijler-analyse en concrete verbetervoorstellen.",
        eyebrow: "Analyse klaar",
        heading: "Je rapport staat klaar",
        intro:
          "We hebben jouw vacature geanalyseerd. Het volledige rapport met score, feedback per pijler en concrete verbetervoorstellen staat voor je klaar.",
        cta: "Bekijk mijn rapport",
        insideTitle: "Wat je in het rapport vindt",
        inside: [
          "Een totaalscore en hoe jouw vacature zich verhoudt tot de markt",
          "Een analyse per pijler (bias, toon, structuur, voordelen)",
          "De kritieke punten die nu waarschijnlijk kandidaten kosten",
          "De mogelijkheid om de volledig herschreven versie te ontgrendelen",
        ],
        questions: "Vragen?",
        contactPrefix: "Mail ons op",
        reportHint: "Je rapportlink:",
        regards: "Met vriendelijke groet,",
        signature: "Vacature Tovenaar",
      };

  const html = renderNotificationEmail({
    preheader: copy.preheader,
    eyebrow: copy.eyebrow,
    heading: copy.heading,
    headingIcon: "check",
    intro: copy.intro,
    ctaLabel: copy.cta,
    ctaUrl: reportUrl,
    insideTitle: copy.insideTitle,
    insideItems: copy.inside,
    footnote: `${copy.reportHint} <a href="${reportUrl}" style="color: #FF6B35; text-decoration: none; word-break: break-all;">${reportUrl}</a>`,
    questionsLabel: copy.questions,
    contactPrefix: copy.contactPrefix,
    regards: copy.regards,
    signature: copy.signature,
  });

  const text = [
    copy.heading,
    "",
    copy.intro,
    "",
    `${copy.cta}: ${reportUrl}`,
    "",
    copy.insideTitle + ":",
    ...copy.inside.map((i) => `  • ${i}`),
    "",
    `${copy.questions} ${copy.contactPrefix} joost@vacaturetovenaar.nl`,
    "",
    `${copy.regards}`,
    copy.signature,
  ].join("\n");

  return sendHtmlEmail({ to, subject: copy.subject, html, text });
}

// ─── Branded "analysis failed" notification ───────────────────────────────

interface SendAnalysisFailedEmailParams {
  to: string;
  locale: Locale;
  retryUrl?: string;
}

export async function sendAnalysisFailedEmail({
  to,
  locale,
  retryUrl,
}: SendAnalysisFailedEmailParams): Promise<{ success: boolean; error?: string }> {
  const fallbackUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") ?? "https://analyse.vacaturetovenaar.nl";
  const url = retryUrl ?? `${fallbackUrl}/${locale}`;

  const copy = locale === "en"
    ? {
        subject: "We couldn't finish your vacancy analysis",
        preheader: "The analysis didn't complete. You can retry for free, and we're here to help.",
        eyebrow: "Something went wrong",
        heading: "We couldn't finish your analysis",
        intro:
          "Sorry about that — our analysis job didn't complete successfully. This is almost always a transient issue on our side, not something with your vacancy text.",
        cta: "Try again",
        insideTitle: "What you can do",
        inside: [
          "Head back to the analyser and paste your vacancy again; a retry typically works immediately.",
          "If it happens twice in a row, send us your vacancy text and we'll run it manually.",
        ],
        questions: "Need help?",
        contactPrefix: "Email",
        regards: "Sorry for the hiccup,",
        signature: "Vacature Tovenaar",
      }
    : {
        subject: "Je vacature-analyse is niet gelukt",
        preheader: "De analyse is niet afgerond. Je kunt gratis opnieuw proberen, en we helpen graag.",
        eyebrow: "Er ging iets mis",
        heading: "Je analyse is niet gelukt",
        intro:
          "Excuses daarvoor. Onze analyse is niet succesvol afgerond. Dit is bijna altijd een tijdelijke hapering aan onze kant — niet iets met jouw vacaturetekst.",
        cta: "Probeer het opnieuw",
        insideTitle: "Wat je kunt doen",
        inside: [
          "Ga terug naar de analyser en plak je vacature opnieuw; een nieuwe poging werkt meestal direct.",
          "Gebeurt het twee keer achter elkaar? Stuur ons je vacaturetekst, dan draaien we 'm handmatig.",
        ],
        questions: "Hulp nodig?",
        contactPrefix: "Mail",
        regards: "Excuses voor het ongemak,",
        signature: "Vacature Tovenaar",
      };

  const html = renderNotificationEmail({
    preheader: copy.preheader,
    eyebrow: copy.eyebrow,
    heading: copy.heading,
    headingIcon: "alert",
    intro: copy.intro,
    ctaLabel: copy.cta,
    ctaUrl: url,
    insideTitle: copy.insideTitle,
    insideItems: copy.inside,
    questionsLabel: copy.questions,
    contactPrefix: copy.contactPrefix,
    regards: copy.regards,
    signature: copy.signature,
  });

  const text = [
    copy.heading,
    "",
    copy.intro,
    "",
    `${copy.cta}: ${url}`,
    "",
    copy.insideTitle + ":",
    ...copy.inside.map((i) => `  • ${i}`),
    "",
    `${copy.questions} ${copy.contactPrefix} joost@vacaturetovenaar.nl`,
    "",
    copy.regards,
    copy.signature,
  ].join("\n");

  return sendHtmlEmail({ to, subject: copy.subject, html, text });
}

// ─── Shared branded-email renderer ────────────────────────────────────────
// One template, two tones (success/alert). Keeps the visual language
// consistent with sendOptimizedVacancyEmail (same palette, same container,
// same footer), so the user recognises us regardless of which email lands
// in their inbox first.

interface NotificationTemplate {
  preheader: string;
  eyebrow: string;
  heading: string;
  headingIcon: "check" | "alert";
  intro: string;
  ctaLabel: string;
  ctaUrl: string;
  insideTitle: string;
  insideItems: string[];
  footnote?: string;
  questionsLabel: string;
  contactPrefix: string;
  regards: string;
  signature: string;
}

function renderNotificationEmail(t: NotificationTemplate): string {
  const iconSvg = t.headingIcon === "check"
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path d="M5 12.5L10 17.5L19 7.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path d="M12 8V13M12 16.5V16.6M4.5 19H19.5C20.5 19 21.2 18 20.7 17.1L13.2 4.5C12.7 3.7 11.3 3.7 10.8 4.5L3.3 17.1C2.8 18 3.5 19 4.5 19Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const iconBg = t.headingIcon === "check" ? "#16a34a" : "#FF6B35";

  const listItems = t.insideItems
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 24px;">
            <div style="width: 8px; height: 8px; background-color: #FF6B35; border-radius: 50%; margin-top: 8px;"></div>
          </td>
          <td style="padding: 8px 0 8px 8px; font-size: 15px; line-height: 1.55; color: #634033;">
            ${item}
          </td>
        </tr>
      `,
    )
    .join("");

  const footnoteBlock = t.footnote
    ? `
      <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #9C8E85; padding-top: 20px; border-top: 1px solid #FFE4D6;">
        ${t.footnote}
      </p>
    `
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(t.heading)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #FFF8F6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <!-- Preheader (hidden, shown in inbox preview) -->
    <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
      ${escapeHtml(t.preheader)}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF8F6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(31, 27, 22, 0.05); border: 1px solid #FFE4D6; max-width: 600px;">
            <!-- Header — full stacked brand asset (icon + wordmark).
                 PNG, not SVG, so Outlook + Gmail Android render it. Explicit
                 width/height attrs help mail clients reserve space before
                 images load and defeat their "did they mean icon-only?"
                 aspect-ratio guesses. -->
            <tr>
              <td style="padding: 36px 40px 28px 40px; border-bottom: 2px solid #FFE4D6; background: linear-gradient(135deg, #FFF8F6 0%, #ffffff 100%); text-align: center; border-radius: 16px 16px 0 0;">
                <img src="https://analyse.vacaturetovenaar.nl/vt-dark.png" alt="Vacature Tovenaar" width="160" height="60" style="height: 60px; width: 160px; display: inline-block; border: 0; outline: none;" />
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <!-- Status badge -->
                <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                  <tr>
                    <td style="vertical-align: middle;">
                      <div style="display: inline-block; width: 44px; height: 44px; background-color: ${iconBg}; border-radius: 12px; text-align: center; line-height: 44px;">
                        <div style="padding: 8px; display: inline-block;">${iconSvg}</div>
                      </div>
                    </td>
                    <td style="vertical-align: middle; padding-left: 12px;">
                      <span style="font-size: 12px; font-weight: 700; color: #634033; text-transform: uppercase; letter-spacing: 0.8px;">
                        ${escapeHtml(t.eyebrow)}
                      </span>
                    </td>
                  </tr>
                </table>

                <h1 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 700; color: #1F1B16; letter-spacing: -0.4px; line-height: 1.25;">
                  ${escapeHtml(t.heading)}
                </h1>

                <p style="margin: 0 0 28px 0; font-size: 16px; line-height: 1.6; color: #634033;">
                  ${escapeHtml(t.intro)}
                </p>

                <!-- Primary CTA -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                  <tr>
                    <td align="center">
                      <a href="${t.ctaUrl}" style="display: inline-block; padding: 14px 32px; background-color: #FF6B35; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 10px rgba(255, 107, 53, 0.25);">
                        ${escapeHtml(t.ctaLabel)}
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- What's inside -->
                <div style="background-color: #FFF8F6; padding: 20px 24px; border-radius: 12px; border-left: 4px solid #FF6B35;">
                  <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #1F1B16;">
                    ${escapeHtml(t.insideTitle)}
                  </h3>
                  <table cellpadding="0" cellspacing="0" style="width: 100%;">
                    ${listItems}
                  </table>
                </div>

                ${footnoteBlock}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px; background-color: #FFF8F6; border-top: 2px solid #FFE4D6; border-radius: 0 0 16px 16px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #634033; text-align: center;">
                  ${escapeHtml(t.questionsLabel)} ${escapeHtml(t.contactPrefix)}
                  <a href="mailto:joost@vacaturetovenaar.nl" style="color: #FF6B35; font-weight: 600; text-decoration: none;">joost@vacaturetovenaar.nl</a>
                </p>
                <p style="margin: 12px 0 0 0; font-size: 13px; color: #9C8E85; text-align: center;">
                  ${escapeHtml(t.regards)}<br>
                  <strong style="color: #634033;">${escapeHtml(t.signature)}</strong>
                </p>
                <p style="margin: 16px 0 0 0; font-size: 12px; color: #9C8E85; text-align: center;">
                  © ${new Date().getFullYear()} Vacature Tovenaar. Alle rechten voorbehouden.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendHtmlEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const emailInfo = await mailGenerator.sendMail({
      from: process.env.AWS_FROM_EMAIL || "Vacature Tovenaar <noreply@vacaturetovenaar.nl>",
      to,
      subject,
      html,
      text,
    });
    const rawMessage = emailInfo.message as Buffer;
    const command = new SendRawEmailCommand({ RawMessage: { Data: rawMessage } });
    const result = await ses.send(command);
    console.log("sendHtmlEmail: success via SES:", result.MessageId);
    return { success: true };
  } catch (error) {
    console.error("sendHtmlEmail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export async function sendEmail({
  to,
  subject,
  body,
  html,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const emailInfo = await mailGenerator.sendMail({
      from: process.env.AWS_FROM_EMAIL || "Vacature Tovenaar <noreply@vacaturetovenaar.nl>",
      to,
      subject,
      text: body,
      html: html ?? body.replace(/\n/g, "<br/>"),
    });

    const rawMessage = emailInfo.message as Buffer;
    const command = new SendRawEmailCommand({ RawMessage: { Data: rawMessage } });
    const result = await ses.send(command);

    console.log("sendEmail: success via SES:", result.MessageId);
    return { success: true };
  } catch (error) {
    console.error("sendEmail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
