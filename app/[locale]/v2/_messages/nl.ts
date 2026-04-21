// nl.ts — Dutch strings for the v2 vacancy analyzer page.
// Business-casual Dutch, uses "je" (informal), active voice.

import type en from './en';
type V2Messages = typeof en;

const nl = {
  common: {
    dismiss: "Sluiten",
  },
  errors: {
    analysisFailed: "Analyse mislukt — probeer het opnieuw.",
    analysisTimeout: "De analyse duurt langer dan verwacht. Probeer opnieuw of laat het resultaat mailen.",
    optimizeFailed: "Het lukte niet om de herschrijving te genereren. Probeer het opnieuw.",
    reportNotAvailable: "Rapport niet beschikbaar — voer de analyse opnieuw uit.",
    rateLimited: "Je hebt je gratis herschrijvingen voor deze browser opgebruikt.",
    networkError: "Netwerkfout. Controleer je verbinding en probeer opnieuw.",
  },
  nav: {
    analyzeVacancy: "Analyseer vacature",
    langEn: "EN",
    langNl: "NL",
    freeLeft: "{count} gratis over",
  },
  hero: {
    title: {
      part1: "Ontdek waarom de ",
      highlight: "juiste",
      part2: " mensen niet solliciteren.",
    },
    subtitle:
      "Plak je vacature. In minder dan een minuut beoordeelt ons model hem op acht dimensies en vertelt je exact wat er beter moet — inclusief een herschreven versie die je direct kunt publiceren.",
    bullets: [
      {
        title: "Achtpuntsdiagnose",
        desc: "Structuur, persona fit, EVP, toon, inclusie, mobiel, SEO, neuromarketing.",
      },
      {
        title: "Uitleg in normale taal",
        desc: "Bij elke score de exacte zin die ervoor verantwoordelijk is.",
      },
      {
        title: "Een herschreven versie, klaar voor publicatie",
        desc: "Geen suggestie — een afgeronde tekst die je direct kunt gebruiken.",
      },
    ],
  },
  analyzerCard: {
    header: {
      title: "Vacature invoer",
    },
    steps: [
      { title: "Plakken",    desc: "Je huidige vacature" },
      { title: "Analyseren", desc: "8-puntsdiagnose" },
      { title: "Ontvangen",  desc: "Score + herschreven versie" },
    ],
    placeholder:
      "Plak hier je vacature — platte tekst is prima. We behouden de structuur.",
    trySample: "Probeer met een voorbeeldvacature",
    charsCount: "{count} / {max} tekens",
    overLimit: "limiet overschreden",
    submit: "Analyseer vacature",
    category: {
      label:               "Functiecategorie",
      general:             "Algemeen (Standaard)",
      government:          "Overheid / Publiek",
      tech:                "Tech / IT",
      healthcareEducation: "Zorg / Onderwijs",
      legalCorporate:      "Zakelijk / Corporate",
      blueCollar:          "Bouw / Techniek",
    },
    sampleVacancy: `Senior Full-Stack Engineer (m/v/x)
Amsterdam · Hybride · Vast contract

Over ons
Wij zijn een snelgroeiende SaaS-scaleup die al ruim 10 jaar actief is in de markt. Ons dynamische team werkt in een agile omgeving en wij prijzen onszelf als een rockstar-organisatie met een no-nonsense cultuur. Wij zijn op zoek naar iemand met moedertaal Nederlands die geen uitdaging uit de weg gaat en vanaf dag één impact wil maken.

Wat ga je doen
- Schaalbare systemen bouwen in een microservices-architectuur
- Nauw samenwerken met stakeholders binnen de hele organisatie
- Innovatie aanjagen en out-of-the-box denken
- Ownership nemen over je werk en veel petten dragen
- Snel handelen en niet bang zijn om dingen te breken; we kiezen snelheid boven perfectie
- Junior developers begeleiden en helpen groeien

Wat breng je mee
- 7+ jaar professionele ervaring met React, Node.js, TypeScript, GraphQL en AWS
- HBO- of WO-opleiding in Informatica of gelijkwaardig
- Uitstekende communicatieve vaardigheden (moedertaal Nederlands vereist)
- Sterk gevoel voor urgentie en het vermogen om onder druk te werken
- Ervaring in een dynamische startup-omgeving is een grote pre
- Een proactieve, hands-on mentaliteit

Wat bieden wij
- Marktconform salaris
- Een leuke en dynamische teamcultuur
- Pizza Fridays en een pingpongtafel op kantoor
- 25 vakantiedagen per jaar
- Modern kantoor in het centrum van Amsterdam
- Informele werksfeer met een open-deur-beleid

Hoe solliciteren
Stuur je CV en motivatiebrief naar jobs@bedrijf.nl. We komen bij je terug als er een match is. Geen acquisitie alstublieft.`,
  },
  floatingReassurance: {
    noSpam:  "Geen spam",
    private: "Privé",
    aPlus:   "A+ beoordeling",
  },
  statsBand: [
    {
      big: "+20%",
      mid: "kandidaat\u00ADkwaliteit",
      sub: "Gemeten over 1.240 herschreven vacatures.",
    },
    {
      big: "+25%",
      mid: "tijd bespaard door recruiters",
      sub: "Gemiddelde, per vacature, in de eerste maand.",
    },
    {
      big: "−14%",
      mid: "campagnekosten",
      sub: "Minder uitgaven door beter gerichte kandidaten.",
    },
  ],
  problemSection: {
    eyebrow: "Het probleem",
    title: {
      part1: "De meeste vacatures zijn ",
      highlight: "stilletjes",
      part2: " kapot.",
    },
    cards: [
      {
        title: "Te vaag",
        desc: "Verantwoordelijkheden lezen als holle frasen. Kandidaten weten niet wat de baan werkelijk inhoudt.",
      },
      {
        title: "Per ongeluk uitsluitend",
        desc: '"Rockstar", "ninja", 7-jaar-eisen en moedertaal-clausules filteren stilletjes je beste kandidaten weg.',
      },
      {
        title: "Vraagt zonder te geven",
        desc: "Lange eisenlijsten, weinig over groei, beloning, flexibiliteit of hoe het team echt is.",
      },
    ],
  },
  methodology: {
    eyebrow: "De methode",
    title: "Acht dimensies, beoordeeld zoals een senior recruiter dat zou doen.",
    sidebar:
      "Opgebouwd met 18 interne recruiters en gevalideerd tegen een corpus van 14.000 sollicitaties.",
    pillars: {
      structure_layout:  "Structuur & opmaak",
      persona_fit:       "Persona fit",
      evp_brand:         "EVP & merk",
      tone_of_voice:     "Tone of voice",
      inclusion_bias:    "Inclusie & bias",
      mobile_experience: "Mobiele ervaring",
      seo_findability:   "Vindbaarheid (SEO)",
      neuromarketing:    "Neuromarketing",
    },
  },
  footer: {
    brand:    "Vacature Analyzer",
    tagline:  "Een diagnostisch instrument voor recruiters. Onderdeel van de Vacature Tovenaar suite.",
    privacy:  "Privacy",
    terms:    "Voorwaarden",
    contact:  "Contact",
    bookDemo: "Plan een demo",
  },
  loading: {
    header: {
      working: "Onze software is aan het werk",
      elapsed: "{seconds}s verstreken",
    },
    stepCounter: "Stap {current} van {total}",
    steps: {
      parse: {
        label:  "Vacature lezen",
        detail: "Secties en rolsignalen analyseren.",
      },
      bias: {
        label:  "Scannen op bias",
        detail: "Controleren op gecodeerde taal en uitsluitingspatronen.",
      },
      tone: {
        label:  "Tone of voice controleren",
        detail: "Warmte versus autoriteit afwegen.",
      },
      structure: {
        label:  "Helderheid beoordelen",
        detail: "Verantwoordelijkheden, eisen, CTA.",
      },
      benefits: {
        label:  "Voorwaarden wegen",
        detail: "Salaris, groei, flexibiliteit, cultuursignalen.",
      },
      rewrite: {
        label:  "Herschrijving opstellen",
        detail: "Een publicatie-klare versie samenstellen.",
      },
    },
    slowBanner: {
      text: "Duurt het langer dan gewoonlijk? We kunnen het volledige rapport mailen zodra het klaar is — je hoeft niet te wachten.",
      cta:  "Mail het naar me",
    },
  },
  report: {
    header: {
      title:        "Rapport",
      titlePrefix:  "Rapport",
      generatedNow: "Zojuist gegenereerd",
      rewritesLeft: "{count} gratis herschrijvingen over",
      downloadPdf:  "Download PDF",
      pdfSentInfo:  "Je rapport is als PDF gemaild toen je ontgrendelde — bekijk je inbox (en spam folder).",
    },
    scoreCard: {
      eyebrow: "Oordeel",
      verdict: {
        excellent:        "Uitstekend",
        good:             "Goed",
        needsImprovement: "Verbetering nodig",
        weak:             "Zwak",
      },
      summary:
        "Een capabele vacature die wordt tegengehouden door twee kritieke zwaktes: per ongeluk uitsluitende taal en een voorwaardensectie die als bijzaak leest. De toon en cultuursignalen zijn echt sterk — verlies die niet in de herschrijving.",
      stats: {
        words:       "Woorden",
        readTime:    "Leestijd",
        applicants:  "Gesch. sollicitanten",
        qualityLift: "Kwaliteits\u00ADwinst",
      },
      scoreRingLabel: "Totaalscore",
    },
    gate: {
      eyebrow:       "Ontgrendel de herschrijving",
      headline: {
        prefix: "Je vacature kan van ",
        to:     " naar ",
        suffix: ".",
      },
      currentLabel:   "Huidig",
      potentialLabel: "Potentieel",
      unlockButton:   "Ontgrendel verbeterde versie",
      trust: {
        noSpam:      "Geen spam",
        gdpr:        "AVG-proof",
        unsubscribe: "Altijd uitschrijven",
      },
    },
    critical: {
      eyebrow: "Kritieke punten",
      title:   "Begin hiermee.",
      points: [
        {
          title:  "De 7-jaar-ervaringseis",
          detail: "Verkleint de gekwalificeerde groep met ~31% terwijl jaar 4+ nauwelijks extra signaal geeft.",
        },
        {
          title:  '"Moedertaal-Engels"',
          detail: "Juridisch riskant in Nederland en sluit sterke niet-moedertaalsprekers uit.",
        },
        {
          title:  "Geen salarisindicatie",
          detail: "Sollicitanten die geen range zien, solliciteren ~40% minder vaak.",
        },
        {
          title:  '"Werken onder druk"-zin',
          detail: "Leest als waarschuwingssignaal voor senior kandidaten.",
        },
        {
          title:  "Vage CTA",
          detail: "Geen procesbeschrijving, geen tijdlijn, geen mens aan de andere kant.",
        },
      ],
    },
    pillars: {
      eyebrow:  "Diagnose per dimensie",
      title:    "De acht-punts uitsplitsing",
      sortedBy: "Gesorteerd op ernst",
      labels: {
        excellent: "Sterk",
        good:      "Goed",
        fair:      "Redelijk",
        needsWork: "Verbetering nodig",
        critical:  "Kritiek",
      },
    },
    rewrite: {
      badgePrefix: "Herschreven",
      badgeUnit:   "pt",
      projected: {
        prefix: "Voorspelde totaalscore na herschrijving: ",
        score:  "8,2 / 10",
      },
      actions: {
        copy:         "Kopiëren",
        copied:       "Gekopieerd!",
        downloadDocx: "Download .docx",
        emailToMe:    "Mail naar mij",
      },
      alreadySent: "De herschrijving is naar je e-mail gestuurd toen je ontgrendelde. Bekijk je inbox (en spam folder).",
    },
    accordion: {
      show:   "Toon de tekst die je hebt ingediend",
      toggle: {
        hide: "VERBERG",
        show: "TOON",
      },
    },
    disclaimer:
      "Scores worden gegenereerd door een taalmodel dat is afgestemd op 14.000 geanonimiseerde vacatures en sollicitatieresultaten. Behandel ze als second opinion, niet als uitspraak. Jouw vakkennis wint altijd.",
    stickyBanner: {
      title:    "De herschrijving is klaar — voorspelling {score} / 10",
      subtitle: "Voer je e-mail in om te ontgrendelen. Geen marketingmail, altijd uitschrijven.",
      cta:      "Ontgrendel herschrijving →",
    },
  },
  modals: {
    email: {
      eyebrow: "Ontgrendel herschrijving · Stap 2 van 2",
      title: {
        part1:     "Waar mogen we het ",
        highlight: "heen",
        part2:     " sturen?",
      },
      body:
        "We sturen de herschreven vacature direct naar je inbox en tonen hem ook op deze pagina. Altijd met één klik uitschrijfbaar.",
      fieldLabel:  "Werk-e-mail",
      placeholder: "naam@bedrijf.nl",
      submit:      "Stuur me de herschrijving",
      trust: {
        free:   "Gratis te gebruiken",
        noCard: "Geen creditcard",
        gdpr:   "AVG",
      },
      busy: [
        "Formuleringen voor inclusiviteit optimaliseren…",
        "Voorwaarden versus eisen opnieuw afwegen…",
        "De call to action aanscherpen…",
        "De tone of voice bijslijpen…",
      ],
      busyHint: "Duurt ongeveer 3 seconden — even geduld.",
    },
    limit: {
      eyebrow: "Limiet gratis versie",
      title: {
        part1:     "De smaak ",
        highlight: "beet",
        part2:     "?",
      },
      body:    "Je hebt beide gratis herschrijvingen gebruikt. Teams die de tool fijn vinden, willen meestal onbeperkte herschrijvingen, opgeslagen vacatures en ATS-koppeling — dat is wat de betaalde versie biedt.",
      seeDemo: "Bekijk wat je zou krijgen",
      later:   "Misschien later",
    },
    demo: {
      eyebrow: "Wat het volledige product doet",
      title:   "Deze tool is het topje van de ijsberg.",
      body:    "De analyzer is een gratis kennismaking. Het échte platform is waar je recruiters dagelijks in werken.",
      features: [
        {
          title: "Onbeperkte herschrijvingen",
          desc:  "Geen daglimieten — herschrijf elke vacature die je team uitbrengt.",
        },
        {
          title: "Persona matching",
          desc:  "Richt je op specifieke kandidaatpersona's, niet alleen op 'goede tekst'.",
        },
        {
          title: "Wervingsstrategieën",
          desc:  "Distributieplannen per rol, per kanaal.",
        },
        {
          title: "ATS-koppelingen",
          desc:  "Greenhouse, Workday, Recruitee, Homerun, Teamtailor, SmartRecruiters.",
        },
      ],
      cta:  "Plan een 20-min demo",
      note: "Geen verkooppraatje. Een echte recruiter aan de lijn. Neem een echte vacature mee.",
    },
  },
} satisfies V2Messages;

export default nl;
