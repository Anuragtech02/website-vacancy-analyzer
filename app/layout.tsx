import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vacature Tovenaar - Gratis Vacature Analyse & Optimalisatie",
  description: "Analyseer en optimaliseer je vacaturetekst in 1 minuut. Trek passende kandidaten aan en laat ongeschikte kandidaten afhaken met onze software.",
  keywords: ["vacature", "vacatureoptimalisatie", "recruitment", "kandidaten", "werving", "selectie", "vacaturetekst", "Nederland"],
  authors: [{ name: "Vacature Tovenaar" }],
  creator: "Vacature Tovenaar",
  publisher: "Vacature Tovenaar",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://analyse.vacaturetovenaar.nl",
    title: "Vacature Tovenaar - Gratis Vacature Analyse",
    description: "Analyseer en optimaliseer je vacaturetekst in 1 minuut. Trek betere kandidaten aan met onze gratis vacature analyse tool.",
    siteName: "Vacature Tovenaar",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Vacature Tovenaar Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vacature Tovenaar - Gratis Vacature Analyse",
    description: "Analyseer en optimaliseer je vacaturetekst in 1 minuut.",
    images: ["/logo.jpg"],
  },
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
