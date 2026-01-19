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
  // First pass: process inline formatting
  let processed = markdown
    // Bold (before italic to handle **text**)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic (single asterisk, but not list items)
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

  // Split into lines and process block-level elements
  const lines = processed.split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line
    if (line === "") {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h3 class="editor-h3">${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h3 class="editor-h3">${line.slice(3)}</h3>`);
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(`<h3 class="editor-h3">${line.slice(2)}</h3>`);
      continue;
    }

    // List items (- or *)
    if (line.match(/^[-*] /)) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${line.slice(2)}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) {
      result.push("</ul>");
      inList = false;
    }
    result.push(`<p>${line}</p>`);
  }

  // Close any open list
  if (inList) {
    result.push("</ul>");
  }

  return result.join("\n");
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
  const { metadata, strategy_notes } = optimization;

  const orgName = metadata.organization || "Organisatie";
  const orgInitials = getOrgInitials(metadata.organization);
  const jobTitle = metadata.job_title;
  const location = metadata.location || "";

  // Convert full_text_markdown to HTML for the editor content
  const editorContent = convertMarkdownToHTML(optimization.full_text_markdown);

  // Generate strategy notes HTML
  const strategyNotesHTML = (strategy_notes || [])
    .slice(0, 6)
    .map(
      (note) => `
      <div class="strategy-note p-4 rounded mb-5 shadow-sm">
        <div class="flex items-center mb-2">
          <i data-lucide="${escapeHtml(note.icon)}" class="w-4 h-4 text-[#FF6B35] mr-2"></i>
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
    body { font-family: 'Inter', sans-serif; background-color: white; }

    /* BRANDING - Orange theme matching landing page */
    .client-primary { background-color: #FF6B35; }
    .client-text { color: #FF6B35; }
    .client-accent { color: #facc15; }
    .client-btn { background-color: #E85D2E; }

    /* BRANDING VACATURE TOVENAAR */
    .wizard-bg { background-color: #1F1B16; border-radius: 0 !important; }

    /* STRATEGY NOTES */
    .strategy-note { border-left: 4px solid #FF6B35; background-color: #FFF8F6; }
    .strategy-note h4 { color: #1F1B16; }
    .strategy-note i { color: #FF6B35; }

    /* EDITOR CONTENT */
    .editor-content h3, .editor-h3 { font-size: 1.125rem; font-weight: 700; color: #FF6B35; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .editor-content p { margin-bottom: 1rem; line-height: 1.6; color: #374151; }
    .editor-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
    .editor-content li { margin-bottom: 0.25rem; }
    .editor-content strong { color: #111827; font-weight: 700; }

    /* PDF specific - no background, no shadow, no spacing */
    html, body { margin: 0; padding: 0; }
    * { box-sizing: border-box; }

    @media print {
      body { background-color: white; }
    }
  </style>
</head>
<body>
<script>
  document.documentElement.style.setProperty('--client-primary', '#007b5f');
  document.documentElement.style.setProperty('--client-text', '#007b5f');
</script>

<div class="w-full min-h-screen overflow-hidden bg-white flex flex-col">
  <!-- Header Banner -->
  <div class="client-primary text-white relative overflow-hidden">
    <div class="flex items-center p-8">
      <!-- Logo and title -->
      <div class="bg-white h-16 w-16 rounded flex items-center justify-center shadow-lg flex-shrink-0">
        <span class="text-2xl font-black client-text tracking-tighter">${escapeHtml(orgInitials)}</span>
      </div>
      <div class="ml-5 min-w-0 flex-grow">
        <span class="bg-yellow-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block">Geoptimaliseerde Versie</span>
        <h1 class="text-2xl font-bold leading-tight mt-1">${escapeHtml(jobTitle)}</h1>
        <p class="text-orange-100 text-sm">Geoptimaliseerd door Vacature Tovenaar</p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="flex flex-col lg:flex-row flex-grow">
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
      
      <!-- Impact Forecast (New) -->
      <div class="bg-[#1F1B16] rounded-xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
         <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
         <h3 class="text-xs font-bold text-orange-300 uppercase tracking-widest mb-4">Impact Forecast</h3>
         
         <div class="grid grid-cols-3 gap-3 mb-3">
             <div>
                 <div class="text-2xl font-black text-white tracking-tighter leading-none mb-1">+20%</div>
                 <div class="text-[10px] text-orange-200 font-medium">Kwaliteit kandidaten</div>
             </div>
             <div>
                 <div class="text-2xl font-black text-white tracking-tighter leading-none mb-1">+25%</div>
                 <div class="text-[10px] text-orange-200 font-medium">Tijdswinst proces</div>
             </div>
             <div>
                 <div class="text-2xl font-black text-white tracking-tighter leading-none mb-1">-14%</div>
                 <div class="text-[10px] text-orange-200 font-medium">Campagnekosten</div>
             </div>
         </div>

         <div class="flex items-center gap-2 text-xs font-bold text-yellow-400 bg-white/10 px-3 py-1.5 rounded-full w-fit">
            <i data-lucide="trending-up" class="w-3 h-3"></i>
            <span>Hogere Conversie</span>
         </div>
      </div>

      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Waarom deze versie beter werkt:</h3>
      ${strategyNotesHTML}
    </div>
  </div>

  <!-- Footer -->
  <div class="wizard-bg p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center text-gray-300 gap-4">
    <div class="flex items-center gap-3">
      <div class="bg-[#FF6B35] p-2 rounded-lg">
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
