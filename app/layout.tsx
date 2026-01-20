import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://analyse.vacaturetovenaar.nl'),
  title: "Gratis AI Vacature Analyse | Vacature Tovenaar - Optimaliseer je Vacaturetekst",
  description: "Analyseer je vacature met AI in 60 seconden. Ontdek waarom goede kandidaten afhaken en verbeter direct je vacaturetekst voor meer kwalitatieve sollicitaties. Gratis AI-gedreven vacature optimalisatie tool.",
  keywords: [
    "AI vacature analyse",
    "vacature optimalisatie tool",
    "vacaturetekst analyseren",
    "recruitment AI",
    "gratis vacature check",
    "vacature schrijven tips",
    "kandidaten aantrekken",
    "werving en selectie software",
    "inclusieve vacaturetekst",
    "vacature conversie optimalisatie",
    "HR recruitment tool Nederland",
    "AI recruitment assistent",
    "vacature scanner",
    "job posting optimizer",
  ],
  authors: [{ name: "Vacature Tovenaar" }],
  creator: "Vacature Tovenaar",
  publisher: "Vacature Tovenaar",
  alternates: {
    canonical: "https://analyse.vacaturetovenaar.nl",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-icon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#FF6B35",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://analyse.vacaturetovenaar.nl",
    title: "Gratis AI Vacature Analyse | Vacature Tovenaar",
    description: "Analyseer je vacature met AI in 60 seconden. Ontdek waarom goede kandidaten afhaken en krijg concrete verbeterpunten voor meer kwalitatieve sollicitaties.",
    siteName: "Vacature Tovenaar",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Vacature Tovenaar - AI-gedreven vacature analyse en optimalisatie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gratis AI Vacature Analyse | Vacature Tovenaar",
    description: "Analyseer je vacature met AI in 60 seconden en krijg concrete verbeterpunten.",
    images: ["/logo.png"],
    creator: "@VacatureTovenaar",
  },
  category: "Business Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K26W26T2');`}
        </Script>

        {/* Structured Data - Organization */}
        <Script id="structured-data-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Vacature Tovenaar",
            "url": "https://analyse.vacaturetovenaar.nl",
            "logo": {
              "@type": "ImageObject",
              "url": "https://analyse.vacaturetovenaar.nl/logo.png",
              "width": 1200,
              "height": 630
            },
            "description": "AI-gedreven vacature analyse en optimalisatie platform. Helpt recruiters en HR-professionals betere vacatureteksten schrijven die kwalitatieve kandidaten aantrekken.",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "email": "joost@vacaturetovenaar.nl",
              "availableLanguage": ["nl"]
            },
            "sameAs": [
              "https://www.linkedin.com/company/vacature-tovenaar"
            ]
          })}
        </Script>

        {/* Structured Data - SoftwareApplication */}
        <Script id="structured-data-software" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Vacature Tovenaar AI Analyzer",
            "applicationCategory": "BusinessApplication",
            "applicationSubCategory": "Recruitment Software",
            "operatingSystem": "Web Browser",
            "url": "https://analyse.vacaturetovenaar.nl",
            "description": "AI-gedreven vacature analyse tool die in 60 seconden concrete verbeterpunten geeft voor je vacaturetekst. Verhoog de kwaliteit van sollicitaties met data-driven inzichten over inclusiviteit, helderheid en conversie-optimalisatie.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127",
              "bestRating": "5",
              "worstRating": "1"
            },
            "featureList": [
              "AI-gedreven vacature analyse",
              "Inclusiviteit score",
              "Helderheid & leesbaarheid check",
              "Conversie optimalisatie tips",
              "Gratis vacature herschrijving",
              "Instant PDF rapport",
              "Email delivery"
            ],
            "softwareVersion": "2.0",
            "author": {
              "@type": "Organization",
              "name": "Vacature Tovenaar"
            }
          })}
        </Script>

        {/* Structured Data - FAQPage */}
        <Script id="structured-data-faq" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Hoe werkt de AI vacature analyse?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Onze AI analyseert je vacaturetekst op basis van psychologische veiligheid, inclusiviteit, helderheid en conversie-optimalisatie. In 60 seconden krijg je een gedetailleerd rapport met concrete verbeterpunten en een geoptimaliseerde versie van je vacature."
                }
              },
              {
                "@type": "Question",
                "name": "Is de vacature analyse gratis?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ja, je kunt 2 vacatures gratis analyseren en optimaliseren. Je ontvangt direct een PDF rapport met de verbeterde vacaturetekst en concrete tips per e-mail."
                }
              },
              {
                "@type": "Question",
                "name": "Welke aspecten worden geanalyseerd?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "De AI analyseert je vacature op: psychologische veiligheid, inclusiviteit (gender bias, leeftijd, handicap), helderheid en leesbaarheid, conversie-optimalisatie, en employer branding. Je krijgt per aspect een score en concrete verbeterpunten."
                }
              },
              {
                "@type": "Question",
                "name": "Hoe snel krijg ik de resultaten?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "De analyse duurt gemiddeld 60 seconden. Je ziet direct je score en kritieke punten op het scherm. De geoptimaliseerde vacaturetekst wordt binnen 2 minuten naar je e-mail gestuurd als PDF."
                }
              }
            ]
          })}
        </Script>

        {/* Structured Data - BreadcrumbList */}
        <Script id="structured-data-breadcrumb" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://analyse.vacaturetovenaar.nl"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Gratis Vacature Analyse",
                "item": "https://analyse.vacaturetovenaar.nl"
              }
            ]
          })}
        </Script>

        {/* Structured Data - Service */}
        <Script id="structured-data-service" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "AI Recruitment Software",
            "name": "Vacature Analyse & Optimalisatie",
            "description": "AI-gedreven service die vacatureteksten analyseert en optimaliseert voor betere kandidaten. Verbeter je recruitment proces met data-driven inzichten.",
            "provider": {
              "@type": "Organization",
              "name": "Vacature Tovenaar"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Nederland"
            },
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://analyse.vacaturetovenaar.nl",
              "serviceType": "Online Service"
            },
            "termsOfService": "https://analyse.vacaturetovenaar.nl/terms",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127"
            }
          })}
        </Script>
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K26W26T2"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
