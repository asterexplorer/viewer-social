import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MainLayout from "@/components/MainLayout";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      </head>
      <body>
        <ThemeProvider>
          <MainLayout>
            {children}
            <SpeedInsights />
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
