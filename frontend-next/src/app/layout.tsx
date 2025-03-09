import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ContextProvider from "./store/ContextProvider";
// import ClientWrapper from "./components/ClientWrapper";

import "./globals.css";
import Footer from "./components/Footer";

import AdSense from "./components/Adsense";
import MobileScrollBehavior from "./components/ui/MobileScrollBehavior";
import MobileMenu from "./components/Menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Centralized metadata for better SEO
export const metadata: Metadata = {
  title: "Maven Command Executor | Build & Deploy Maven Projects",
  description:
    "Execute Maven lifecycle commands, track build logs, and analyze artifacts in real time. Ideal for Java developers and DevOps automation.",
  keywords:
    "Maven, Java Build, CI/CD, DevOps, Continuous Integration, Java Development, Build Automation, Software Development",
  authors: [{ name: "Your Name or Brand", url: "https://yourwebsite.com" }],
  openGraph: {
    title: "Maven Command Executor",
    description:
      "Run Maven lifecycle commands with ease. Get detailed build logs and artifact analysis in a streamlined UI.",
    url: "https://yourwebsite.com",
    siteName: "Maven Command Executor",
    images: [
      {
        url: "https://yourwebsite.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maven Command Executor UI Screenshot",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    title: "Maven Command Executor",
    description:
      "Effortlessly execute Maven lifecycle commands, view logs, and analyze artifacts in real time.",
    images: ["https://yourwebsite.com/twitter-image.jpg"],
  },

  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Dynamic Metadata for SEO */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta
          property="og:image"
          content="https://yourwebsite.com/og-image.jpg"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* <meta name="twitter:card" content="summary_large_image" /> */}

        {/* ✅ Load Google Tag Manager (Async) */}
        <AdSense pId="ca-pub-2067270214726984" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'ca-pub-2067270214726984');
            `,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col w-full overflow-x-hidden overflow-y-auto`}
      >
        <ContextProvider>
          <div className="flex h-screen flex-col w-full overflow-hidden">
            {/* ✅ Dynamic Sticky Header */}
            <div className="flex justify-between items-center w-full">
              <MobileScrollBehavior />
              <MobileMenu />
            </div>

            {/* ✅ Main Layout (Remove Margin, Use Padding Instead) */}
            <main className="w-full flex-1 flex flex-col bg-gray-900 pt-12 sm:pt-16 overflow-hidden">
              {children}
            </main>

            {/* ✅ Footer */}
            <Footer />
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
