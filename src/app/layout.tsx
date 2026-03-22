import type { Metadata } from "next";
import "@/styles/globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { ClientLayout } from "@/components/ClientLayout";

// Sentry error monitoring (initialize early)
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV || "development",
  });
}


export const metadata: Metadata = {
  title: "ImpactClub - Learn, Lead, Impact",
  description:
    "A digital community and growth platform for learning, networks, opportunities, and pathways for leadership, entrepreneurship, and impact. Part of the NCDF ImpactKnowledge ecosystem.",
  keywords: [
    "community",
    "learning",
    "leadership",
    "entrepreneurship",
    "networking",
    "membership",
    "Africa",
    "NCDF",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ImpactClub",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "ImpactClub",
  creator: "NCDF ImpactKnowledge",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body 
        className="font-sans bg-dark-900 text-white" 
        suppressHydrationWarning
        style={{
          backgroundColor: 'rgb(5, 30, 59)',
        }}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
