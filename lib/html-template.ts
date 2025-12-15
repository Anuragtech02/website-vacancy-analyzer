import { OptimizationResult } from "./gemini";

function getOrgInitials(org: string | null): string {
  if (!org) return "VT";
  const words = org.split(" ").filter((w) => w.length > 0);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="editor-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h3 class="editor-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h3 class="editor-h3">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Lists
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    // Paragraphs (lines that aren't already wrapped)
    .split("\n\n")
    .map((block) => {
      if (
        block.startsWith("<h") ||
        block.startsWith("<li") ||
        block.trim() === ""
      ) {
        return block;
      }
      // Wrap consecutive <li> items in <ul>
      if (block.includes("<li>")) {
        return `<ul>${block}</ul>`;
      }
      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateVacancyHTML(optimization: OptimizationResult): string {
  const { metadata, content, estimated_scores, strategy_notes } = optimization;

  const orgName = metadata.organization || "Organisatie";
  const orgInitials = getOrgInitials(metadata.organization);
  const jobTitle = metadata.job_title;
  const location = metadata.location || "";
  const score = Math.round(estimated_scores.weighted_score);

  // Convert full_text_markdown to HTML for the editor content
  const editorContent = convertMarkdownToHTML(optimization.full_text_markdown);

  // Generate strategy notes HTML
  const strategyNotesHTML = (strategy_notes || [])
    .slice(0, 6)
    .map(
      (note) => `
      <div class="strategy-note p-4 rounded mb-5 shadow-sm">
        <div class="flex items-center mb-2">
          <i data-lucide="${escapeHtml(note.icon)}" class="w-4 h-4 text-green-700 mr-2"></i>
          <h4 class="font-bold text-gray-800 text-sm">${escapeHtml(note.title)}</h4>
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          ${escapeHtml(note.description)}
        </p>
      </div>
    `
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(jobTitle)} - ${escapeHtml(orgName)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; }

    /* BRANDING CLIENT */
    .client-primary { background-color: #007b5f; }
    .client-text { color: #007b5f; }
    .client-accent { color: #facc15; }
    .client-btn { background-color: #005f4b; }

    /* BRANDING VACATURE TOVENAAR */
    .wizard-bg { background-color: #1f2937; }

    /* STRATEGY NOTES */
    .strategy-note { border-left: 4px solid #007b5f; background-color: #f0fdf4; }
    .strategy-note h4 { color: #1f2937; }
    .strategy-note i { color: #007b5f; }

    /* EDITOR CONTENT */
    .editor-content h3, .editor-h3 { font-size: 1.125rem; font-weight: 700; color: #007b5f; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .editor-content p { margin-bottom: 1rem; line-height: 1.6; color: #374151; }
    .editor-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
    .editor-content li { margin-bottom: 0.25rem; }
    .editor-content strong { color: #111827; font-weight: 700; }

    /* SCORE VISUAL */
    .score-box { background-color: #005f4b; }
    .score-text { font-size: 3.5rem; line-height: 1; font-weight: 900; }

    @media print {
      body { background-color: white; }
      .max-w-6xl { max-width: 100%; margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
<script>
  document.documentElement.style.setProperty('--client-primary', '#007b5f');
  document.documentElement.style.setProperty('--client-text', '#007b5f');
</script>

<div class="max-w-6xl mx-auto my-8 sm:my-12 shadow-2xl rounded-xl overflow-hidden bg-white">
  <!-- Header Banner -->
  <div class="client-primary p-8 text-white flex justify-between items-center relative overflow-hidden">
    <div class="relative z-10 flex items-center gap-5">
      <div class="bg-white h-16 w-16 rounded flex items-center justify-center shadow-lg">
        <span class="text-2xl font-black client-text tracking-tighter">${escapeHtml(orgInitials)}</span>
      </div>
      <div>
        <span class="bg-yellow-400 text-green-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Herschreven Versie</span>
        <h1 class="text-2xl font-bold leading-tight mt-1">${escapeHtml(jobTitle)}</h1>
        <p class="text-green-100 text-sm">Focus: Anti-Bureaucratie, Psychologische Veiligheid & Conversie</p>
      </div>
    </div>

    <div class="score-box absolute right-0 top-0 bottom-0 px-8 py-3 flex flex-col justify-center items-center text-white text-center">
      <span class="text-xs font-bold uppercase tracking-widest">EFFECTIVITEIT SCORE</span>
      <div class="score-text mt-1">${score}<span class="text-2xl">/100</span></div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex flex-col lg:flex-row">
    <!-- Left Column: Vacancy Text -->
    <div class="w-full lg:w-2/3 p-8 sm:p-12 bg-white">
      <!-- Title Bar -->
      <div class="border-b border-gray-100 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-1">${escapeHtml(jobTitle)}</h2>
          <p class="text-gray-500 text-sm">
            <i data-lucide="map-pin" class="inline w-3 h-3 mr-1"></i>${escapeHtml(location || "Nederland")} |
            <i data-lucide="building-2" class="inline w-3 h-3 mr-1"></i>${escapeHtml(orgName)}
          </p>
        </div>
        <button class="client-btn text-white font-bold py-2 px-6 rounded hover:opacity-90 transition shadow-sm text-sm">
          Solliciteren
        </button>
      </div>

      <!-- Editor Content -->
      <div class="editor-content">
        ${editorContent}
      </div>

      <!-- CTA Button -->
      <div class="mt-8 pt-6 border-t border-gray-100">
        <button class="client-btn text-white font-bold py-2 px-6 rounded hover:opacity-90 transition shadow-sm text-sm">
          Direct Solliciteren
        </button>
      </div>
    </div>

    <!-- Right Column: Strategy Notes -->
    <div class="w-full lg:w-1/3 bg-gray-50 border-l border-gray-200 p-8">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Waarom deze versie beter werkt:</h3>
      ${strategyNotesHTML}
    </div>
  </div>

  <!-- Footer -->
  <div class="wizard-bg p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center text-gray-300 gap-4">
    <div class="flex items-center gap-3">
      <div class="bg-green-600 p-2 rounded-lg">
        <i data-lucide="wand-2" class="text-white w-5 h-5"></i>
      </div>
      <div>
        <span class="block text-white font-bold text-sm tracking-wide">VACATURE TOVENAAR</span>
        <span class="block text-xs text-gray-400">Recruitment Marketing & Optimalisatie</span>
      </div>
    </div>

    <div class="text-sm flex flex-col sm:flex-row gap-4 sm:gap-8 text-center sm:text-right">
      <a href="https://www.vacaturetovenaar.nl" class="hover:text-white transition flex items-center justify-center sm:justify-end gap-2">
        <i data-lucide="globe" class="w-4 h-4"></i> www.vacaturetovenaar.nl
      </a>
      <a href="mailto:joost@vacaturetovenaar.nl" class="hover:text-white transition flex items-center justify-center sm:justify-end gap-2">
        <i data-lucide="mail" class="w-4 h-4"></i> joost@vacaturetovenaar.nl
      </a>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
  });
</script>
</body>
</html>`;
}
