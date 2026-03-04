import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MainLayout from "@/components/layout/MainLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnalyticsTags from "@/components/marketing/AnalyticsTags";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Viewer — Social Media",
  description: "A premium social media experience for visual storytelling",
  keywords: ["social media", "photos", "sharing", "viewer"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Viewer",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Viewer",
    "apple-mobile-web-app-title": "Viewer",
    "theme-color": "#6366f1",
    "msapplication-navbutton-color": "#6366f1",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-starturl": "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <MainLayout>
            {children}
            <SpeedInsights />
          </MainLayout>
        </ThemeProvider>
        <Suspense fallback={null}>
          <AnalyticsTags />
        </Suspense>
      </body>
    </html>
  );
}
