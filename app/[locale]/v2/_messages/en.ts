// en.ts — English strings for the v2 vacancy analyzer page.
// Kept self-contained in _messages/ so they don't mix with the main messages/{nl,en}.json.

const en = {
  nav: {
    analyzeVacancy: "Analyze vacancy",
    langEn: "EN",
    langNl: "NL",
    freeLeft: "{count} free left",
  },
  hero: {
    title: {
      part1: "Find out why the ",
      highlight: "right",
      part2: " people aren't applying.",
    },
    subtitle:
      "Paste your job posting. In under a minute, our model grades it across eight dimensions and tells you exactly what to fix — with a rewritten version ready to publish.",
    bullets: [
      {
        title: "Eight-point diagnostic",
        desc: "Clarity, inclusion, tone, benefits, role, growth, culture, CTA.",
      },
      {
        title: "Plain-English explanations",
        desc: "Every score comes with the exact sentence that caused it.",
      },
      {
        title: "A ready-to-publish rewrite",
        desc: "Not a suggestion — a finished draft you can ship.",
      },
    ],
  },
  analyzerCard: {
    header: {
      title: "Vacancy input",
    },
    steps: [
      { title: "Paste",   desc: "Your existing posting" },
      { title: "Analyze", desc: "8-point diagnostic" },
      { title: "Receive", desc: "Score + rewritten version" },
    ],
    placeholder:
      "Paste your vacancy here — plain text is fine. We'll preserve the structure.",
    trySample: "Try with a sample posting",
    charsCount: "{count} / {min} chars",
    submit: "Analyze vacancy",
    sampleVacancy: `Senior Full-Stack Engineer (m/f/x)
Amsterdam · Hybrid · Permanent contract

About us
We are a fast-growing SaaS scale-up that has been active in the market for over 10 years. Our dynamic team works in an agile environment and we pride ourselves on being a rockstar organisation with a no-nonsense culture. We are looking for a native-level English speaker who is not afraid of a challenge and can hit the ground running from day one.

What you will do
- Build scalable systems in a microservices architecture
- Work closely with stakeholders across the business
- Drive innovation and think outside the box
- Take ownership of your work and wear many hats
- Move fast and break things; we value speed over perfection
- Mentor junior developers and help them grow

What you bring
- 7+ years of professional experience with React, Node.js, TypeScript, GraphQL and AWS
- Bachelor's or Master's degree in Computer Science
- Excellent communication skills (native-level English required)
- Strong sense of urgency and the ability to work under pressure
- Experience in a fast-paced startup environment is a big plus
- A proactive, hands-on attitude

What we offer
- Competitive salary
- A fun and dynamic team culture
- Pizza Fridays and a ping-pong table in the office
- 25 vacation days per year
- Modern office in the centre of Amsterdam
- Informal work atmosphere with an open-door policy

How to apply
Send your CV and motivation letter to jobs@company.example. We will come back to you if there is a fit. No agencies please.`,
  },
  floatingReassurance: {
    noSpam:  "No spam",
    private: "Private",
    aPlus:   "A+ grade",
  },
  statsBand: [
    {
      big: "+20%",
      mid: "candidate quality",
      sub: "Measured across 1,240 rewritten postings.",
    },
    {
      big: "+25%",
      mid: "recruiter time saved",
      sub: "Average, per posting, in the first month.",
    },
    {
      big: "−14%",
      mid: "campaign costs",
      sub: "Lower spend from better-targeted applicants.",
    },
  ],
  problemSection: {
    eyebrow: "The problem",
    title: {
      part1: "Most postings are ",
      highlight: "quietly",
      part2: " broken.",
    },
    cards: [
      {
        title: "Too vague",
        desc: "Responsibilities read as platitudes. Candidates can't tell what the job actually is.",
      },
      {
        title: "Accidentally exclusive",
        desc: '"Rockstar", "ninja", 7-year gates and native-language clauses quietly filter out your best hires.',
      },
      {
        title: "Asks without giving",
        desc: "Long requirements lists, thin on growth, comp, flexibility or what the team is actually like.",
      },
    ],
  },
  methodology: {
    eyebrow: "The methodology",
    title: "Eight dimensions, graded the way a senior recruiter would.",
    sidebar:
      "Built with 18 in-house recruiters and validated against a corpus of 14,000 applications.",
    pillars: {
      clarity:   "Clarity & structure",
      inclusion: "Inclusivity",
      tone:      "Tone of voice",
      benefits:  "Benefits framing",
      role:      "Role definition",
      growth:    "Growth & learning",
      culture:   "Culture signal",
      cta:       "Call to action",
    },
  },
  footer: {
    brand:    "Vacancy Analyzer",
    tagline:  "A diagnostic instrument for recruiters. Part of the Vacancy Wizard suite.",
    privacy:  "Privacy",
    terms:    "Terms",
    contact:  "Contact",
    bookDemo: "Book a demo",
  },
  loading: {
    header: {
      working: "Our software is at work",
      elapsed: "{seconds}s elapsed",
    },
    stepCounter: "Step {current} of {total}",
    steps: {
      parse: {
        label:  "Reading the posting",
        detail: "Segmenting sections and role signals.",
      },
      bias: {
        label:  "Scanning for bias",
        detail: "Checking coded language and exclusion patterns.",
      },
      tone: {
        label:  "Checking tone of voice",
        detail: "Balancing warmth against authority.",
      },
      structure: {
        label:  "Grading clarity",
        detail: "Responsibilities, requirements, CTA.",
      },
      benefits: {
        label:  "Weighing benefits",
        detail: "Comp, growth, flexibility, culture signals.",
      },
      rewrite: {
        label:  "Drafting the rewrite",
        detail: "Assembling a publishable version.",
      },
    },
    slowBanner: {
      text: "Taking longer than usual? We can email the full report when it's ready — no need to wait.",
      cta:  "Email it to me",
    },
  },
  report: {
    header: {
      title:         "Report · Senior Full-Stack Engineer",
      generatedNow:  "Generated just now",
      rewritesLeft:  "{count} free rewrites left",
      downloadPdf:   "Download PDF",
    },
    scoreCard: {
      eyebrow: "Verdict",
      verdict: {
        excellent:        "Excellent",
        good:             "Good",
        needsImprovement: "Needs improvement",
        weak:             "Weak",
      },
      summary:
        "A capable posting that's being held back by two critical weaknesses: accidentally exclusive language and a benefits section that reads like an afterthought. The tone and culture signals are genuinely strong — don't lose those in the rewrite.",
      stats: {
        words:        "Words",
        readTime:     "Read time",
        applicants:   "Est. applicants",
        qualityLift:  "Quality lift",
      },
      scoreRingLabel: "Overall score",
    },
    gate: {
      eyebrow:        "Unlock the rewrite",
      headline: {
        prefix: "Your posting can go from ",
        to:     " to ",
        suffix: ".",
      },
      currentLabel:   "Current",
      potentialLabel: "Potential",
      unlockButton:   "Unlock improved version",
      trust: {
        noSpam:      "No spam",
        gdpr:        "GDPR safe",
        unsubscribe: "Unsubscribe any time",
      },
    },
    critical: {
      eyebrow: "Critical points",
      title:   "Fix these first.",
      points: [
        {
          title:  "The 7-year experience gate",
          detail: "Drops the qualified pool by ~31% with minimal signal gain above year 4.",
        },
        {
          title:  '"Native-level English"',
          detail: "Legally risky in NL and excludes strong non-native speakers.",
        },
        {
          title:  "Missing comp range",
          detail: "Applicants who see no range apply ~40% less often.",
        },
        {
          title:  '"Work under pressure" line',
          detail: "Reads as a warning signal to senior candidates.",
        },
        {
          title:  "Vague CTA",
          detail: "No process description, no timeline, no human on the other side.",
        },
      ],
    },
    pillars: {
      eyebrow:  "Per-dimension diagnosis",
      title:    "The eight-point breakdown",
      sortedBy: "Sorted by severity",
      labels: {
        excellent:   "Strong",
        good:        "Good",
        fair:        "Fair",
        needsWork:   "Needs work",
        critical:    "Critical",
      },
    },
    rewrite: {
      badge:   "Rewritten · +2.4 pts",
      projected: {
        prefix: "Projected overall score after rewrite: ",
        score:  "8.2 / 10",
      },
      actions: {
        copy:          "Copy",
        downloadDocx:  "Download .docx",
        emailToMe:     "Email to me",
      },
    },
    accordion: {
      show:   "Show the text you submitted",
      toggle: {
        hide: "HIDE",
        show: "SHOW",
      },
    },
    disclaimer:
      "Scores are produced by a large language model tuned on 14,000 anonymized postings and applicant outcomes. Treat them as a second opinion, not a verdict. Your domain knowledge wins every tie.",
    stickyBanner: {
      title:    "The rewrite is ready — projected 8.2 / 10",
      subtitle: "Enter your email to unlock. No marketing spam, unsubscribe any time.",
      cta:      "Unlock rewrite →",
    },
  },
  modals: {
    email: {
      eyebrow: "Unlock rewrite · Step 2 of 2",
      title: {
        part1:     "Where should we ",
        highlight: "send",
        part2:     " it?",
      },
      body:
        "We'll drop the rewritten posting straight in your inbox and show it on this page too. One-click unsubscribe, always.",
      fieldLabel:  "Work email",
      placeholder: "name@company.example",
      submit:      "Send me the rewrite",
      trust: {
        free:   "Free to use",
        noCard: "No credit card",
        gdpr:   "GDPR",
      },
      busy: [
        "Optimizing phrasing for inclusivity…",
        "Rebalancing benefits vs. requirements…",
        "Tightening the call to action…",
        "Polishing tone of voice…",
      ],
      busyHint: "Takes about 3 seconds — hang tight.",
    },
    limit: {
      eyebrow: "Free tier limit",
      title: {
        part1:     "Got a ",
        highlight: "taste",
        part2:     " for it?",
      },
      body:     "You've used both free rewrites. Teams that like the tool usually want unlimited rewrites, saved postings, and the ATS sync — that's what the paid plan is.",
      seeDemo:  "See what you'd get",
      later:    "Maybe later",
    },
    demo: {
      eyebrow: "What the full product does",
      title:   "This tool is the tip of it.",
      body:    "The analyzer is a free taster. The actual platform is what your recruiters live in every day.",
      features: [
        {
          title: "Unlimited rewrites",
          desc:  "No daily caps — rewrite every posting your team ships.",
        },
        {
          title: "Persona matching",
          desc:  "Target specific candidate personas, not just 'good writing'.",
        },
        {
          title: "Recruitment strategies",
          desc:  "Distribution playbooks per role, by channel.",
        },
        {
          title: "ATS integrations",
          desc:  "Greenhouse, Workday, Recruitee, Homerun, Teamtailor, SmartRecruiters.",
        },
      ],
      cta:  "Plan a 20-min demo",
      note: "No deck. A real recruiter on the call. Bring a real posting.",
    },
  },
};

export default en;
