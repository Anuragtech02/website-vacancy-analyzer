import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from "next/script";
import "../globals.css";
import { locales } from '@/i18n';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

// Separate viewport export (Next.js 15 requirement)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF6B35",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const isEnglish = locale === 'en';
  const baseUrl = 'https://analyse.vacaturetovenaar.nl';
  const canonicalUrl = `${baseUrl}/${locale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(', '),
    authors: [{ name: "Vacature Tovenaar" }],
    creator: "Vacature Tovenaar",
    publisher: "Vacature Tovenaar",
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'nl': `${baseUrl}/nl`,
        'en': `${baseUrl}/en`,
      },
    },
    // Icons are auto-discovered by Next.js App Router from
    // app/icon.png and app/apple-icon.png. No manual entry needed.
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
      locale: isEnglish ? "en_US" : "nl_NL",
      url: canonicalUrl,
      title: t('title'),
      description: t('description'),
      siteName: isEnglish ? "Vacancy Wizard" : "Vacature Tovenaar",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t('title'),
      description: t('description'),
      images: ["/logo.png"],
      creator: "@VacatureTovenaar",
    },
    category: "Business Software",
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const isEnglish = locale === 'en';

  return (
    <html lang={locale}>
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
            "name": isEnglish ? "Vacancy Wizard" : "Vacature Tovenaar",
            "url": "https://analyse.vacaturetovenaar.nl",
            "logo": {
              "@type": "ImageObject",
              "url": "https://analyse.vacaturetovenaar.nl/logo.png",
              "width": 1200,
              "height": 630
            },
            "description": isEnglish
              ? "AI-powered vacancy analysis and optimization platform. Helps recruiters and HR professionals write better job postings that attract quality candidates."
              : "AI-gedreven vacature analyse en optimalisatie platform. Helpt recruiters en HR-professionals betere vacatureteksten schrijven die kwalitatieve kandidaten aantrekken.",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "email": "joost@vacaturetovenaar.nl",
              "availableLanguage": isEnglish ? ["en", "nl"] : ["nl", "en"]
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
            "name": isEnglish ? "Vacancy Wizard AI Analyzer" : "Vacature Tovenaar AI Analyzer",
            "applicationCategory": "BusinessApplication",
            "applicationSubCategory": "Recruitment Software",
            "operatingSystem": "Web Browser",
            "url": "https://analyse.vacaturetovenaar.nl",
            "description": isEnglish
              ? "AI-powered vacancy analysis tool that provides concrete improvement points for your job posting in 60 seconds. Increase application quality with data-driven insights about inclusivity, clarity and conversion optimization."
              : "AI-gedreven vacature analyse tool die in 60 seconden concrete verbeterpunten geeft voor je vacaturetekst. Verhoog de kwaliteit van sollicitaties met data-driven inzichten over inclusiviteit, helderheid en conversie-optimalisatie.",
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
            "featureList": isEnglish ? [
              "AI-powered vacancy analysis",
              "Inclusivity score",
              "Clarity & readability check",
              "Conversion optimization tips",
              "Free vacancy rewrite",
              "Instant PDF report",
              "Email delivery"
            ] : [
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
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K26W26T2"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
