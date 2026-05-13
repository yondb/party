import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { DocumentLang } from "@/components/i18n/DocumentLang";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  title: "PartyFinder",
  description: "Find your party. Live the adventure.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PartyFinder",
  },
};

export const viewport: Viewport = {
  themeColor: "#c9963a",
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
