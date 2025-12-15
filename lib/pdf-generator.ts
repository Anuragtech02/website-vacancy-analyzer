import puppeteer from "puppeteer";
import { OptimizationResult } from "./gemini";
import { generateVacancyHTML } from "./html-template";

export async function generateVacancyPDF(
  optimization: OptimizationResult
): Promise<Buffer> {
  const htmlContent = generateVacancyHTML(optimization);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for resources to load
    await page.setContent(htmlContent, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    // Wait a bit for Tailwind and Lucide to render
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // Give extra time for external resources
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
