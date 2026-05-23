import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { DocumentLang } from "@/components/i18n/DocumentLang";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

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
  themeColor: "#F6F7FB",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
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
