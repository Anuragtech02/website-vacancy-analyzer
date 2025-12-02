import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { GDPRConsent } from "@/components/gdpr-consent";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vacature Tovenaar - AI Vacancy Analyzer",
  description: "Analyze and optimize your vacancy text with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} antialiased`}
      >
        {children}
        <GDPRConsent />
      </body>
    </html>
  );
}
