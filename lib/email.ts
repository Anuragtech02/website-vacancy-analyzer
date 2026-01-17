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
    const score = Math.round(optimization.estimated_scores.weighted_score);

    // Generate PDF from HTML template
    const pdfBuffer = await generateVacancyPDF(optimization);

    // Determines content based on phase
    const isPhase2 = usageCount >= 2;
    
    // --- CONTENT VARIABLES ---
    const introText = isPhase2
      ? `Je hebt inmiddels twee vacatures geanalyseerd met Vacature Tovenaar. Dat betekent meestal dat teams willen weten of deze aanpak ook structureel werkt wanneer meerdere vacatures tegelijkertijd openstaan.`
      : `We hebben jouw vacature voor <strong style="color: #0f172a;">${jobTitle}</strong>${organization ? ` bij ${organization}` : ""} geoptimaliseerd met onze Human AI methode.`;

    const whyMattersTitle = isPhase2 
      ? "🧠 De kwaliteit van kandidaten lijkt vaak een kwestie van bereik, maar in de praktijk zit het verschil in:"
      : "Waarom dit belangrijk is:";

    const whyMattersContent = isPhase2
      ? `
        hoe je de tekst formuleert<br>
        welke kandidaten zich aangesproken voelen<br>
        welke profielen afhaken<br><br>
        <strong>Met deze aanpak zie je:</strong><br>
        ✅ minder tijd kwijt aan mismatch<br>
        ✅ sneller shortlist<br>
        ✅ lagere advertentiekosten<br>
        ✅ meer consistente kwaliteit
      `
      : `
        kleine copy-aanpassingen sturen wie zich wél meldt en wie niet.<br>
        Dat maakt direct verschil in:<br>
        ✅ kwaliteit van reacties<br>
        ✅ uitval tijdens selectie<br>
        ✅ advertentiekosten
      `;
      
    // Phase 2 CTA section (Demo/Reply)
    const phase2CTA = `
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #475569;">
        💬 <strong>Wil je weten wat dit voor jullie processen kan betekenen?</strong><br>
        Reply op deze mail – dan laat ik je live zien hoe je dit toepast op meerdere vacatures en tot welke resultaten dit leidt bij vergelijkbare organisaties.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="https://calendly.com/vacaturetovenaar/demo" style="display: inline-block; padding: 14px 32px; background-color: #007b5f; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
              Plan Direct Een Moment
            </a>
          </td>
        </tr>
      </table>
    `;

    // Phase 1 CTA section (Analyze another)
    const phase1CTA = `
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #475569;">
        💬 <strong>Benieuwd hoe je met deze aanpak structureel meer passende kandidaten aantrekt?</strong><br>
        Reply op deze mail, dan laat ik je live zien wat deze aanpak voor jullie organisatie kan betekenen.
      </p>
      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
        Wil je ondertussen nog een vacature analyseren? Dat kan via de knop hieronder:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="https://analyse.vacaturetovenaar.nl" style="display: inline-block; padding: 14px 32px; background-color: #007b5f; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
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
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 32px 40px; border-bottom: 1px solid #e2e8f0;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #007b5f;">✨ Vacature Tovenaar</h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #0f172a;">
                          ${isPhase2 ? "Je analyse is klaar" : "Jouw geoptimaliseerde vacature is klaar!"}
                        </h2>

                        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          ${introText}
                        </p>

                        <!-- Score Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #007b5f;">
                          <tr>
                            <td style="padding: 20px;">
                              <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534;">Nieuwe Effectiviteit Score</p>
                              <p style="margin: 0; font-size: 32px; font-weight: 700; color: #007b5f;">
                                ${score}<span style="font-size: 18px; color: #94a3b8;">/100</span>
                              </p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                          📎 <strong>De herschreven vacature zit als PDF in de bijlage.</strong> Je kunt de tekst direct kopiëren en plakken in je ATS of vacaturesite.
                        </p>

                        <!-- Variable Improvements Section -->
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
                          🧾 Een paar concrete verbeteringen:
                        </h3>
                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                          ${optimization.changes.summary}
                        </p>

                        <!-- Variable 'Why this matters' Section -->
                         <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
                          ${whyMattersTitle}
                        </h3>
                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                           ${whyMattersContent}
                        </p>

                        <!-- CTA Section (Phase Specific) -->
                        ${ctaSection}

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; text-align: center;">
                          Vragen? Neem contact op via <a href="mailto:joost@vacaturetovenaar.nl" style="color: #007b5f;">joost@vacaturetovenaar.nl</a>
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
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
      subject: `Jouw Geoptimaliseerde Vacature: ${jobTitle}`,
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
