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
  title: "ImpactApp - Learning. Building. Leading.",
  description:
    "NCDF Impact Club digital platform for financial literacy, entrepreneurship development, and community participation",
  keywords: [
    "education",
    "entrepreneurship",
    "financial literacy",
    "Nigeria",
    "learning",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ImpactApp",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "ImpactApp",
  creator: "NCDF Impact Club",
};

export const viewport = "width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=yes";

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
