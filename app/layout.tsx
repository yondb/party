import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { DocumentLang } from "@/components/i18n/DocumentLang";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: SITE_NAME,
  description: SITE_TAGLINE,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} antialiased`}>
        <LanguageProvider>
          <DocumentLang />
          <ToastProvider>
            {children}
            <ServiceWorkerRegister />
            <CookieConsent />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
