import type { Metadata, Viewport } from "next";
import { Cinzel, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { DocumentLang } from "@/components/i18n/DocumentLang";

const display = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "900"],
});

const body = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

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
      <body className={`${display.variable} ${body.variable} font-body antialiased`}>
        <LanguageProvider>
          <DocumentLang />
          {children}
          <ServiceWorkerRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
