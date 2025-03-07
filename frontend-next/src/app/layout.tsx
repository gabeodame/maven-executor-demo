import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
// import Footer from "./components/Footer";
// import MobileMenu from "./components/Menu";
import ContextProvider from "./store/ContextProvider";

import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import { headers } from "next/headers";

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
  keywords: [
    "Maven",
    "Java Build",
    "CI/CD",
    "DevOps",
    "Continuous Integration",
    "Java Development",
    "Build Automation",
    "Software Development",
  ].join(", "),
  authors: [{ name: "Your Name or Brand", url: "https://yourwebsite.com" }],
  openGraph: {
    title: "Maven Command Executor",
    description:
      "Run Maven lifecycle commands with ease. Get detailed build logs and artifact analysis in a streamlined UI.",
    type: "website",
    url: "https://yourwebsite.com",
    siteName: "Maven Command Executor",
    images: [
      {
        url: "https://yourwebsite.com/og-image.jpg", // Replace with actual image
        width: 1200,
        height: 630,
        alt: "Maven Command Executor UI Screenshot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    title: "Maven Command Executor",
    description:
      "Effortlessly execute Maven lifecycle commands, view logs, and analyze artifacts in real time.",
    images: ["https://yourwebsite.com/twitter-image.jpg"], // Replace with actual image
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const nonce = headerList.get("x-nonce") || undefined;
  return (
    <html lang="en">
      <head>
        {/* ✅ Dynamic Metadata for SEO & Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta
          property="og:title"
          content="Maven Command Executor | Automate Maven Builds"
        />
        <meta
          property="og:description"
          content="Run Maven lifecycle commands, track logs, and analyze artifacts in real time."
        />
        <meta
          property="og:image"
          content="https://yourwebsite.com/og-image.jpg"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Maven Command Executor" />
        <meta
          name="twitter:description"
          content="Run Maven lifecycle commands with ease."
        />
        <meta
          name="twitter:image"
          content="https://yourwebsite.com/twitter-image.jpg"
        />
        <meta name="google-adsense-account" content="ca-pub-2067270214726984" />

        {/* ✅ Structured Data for SEO (JSON-LD Schema) */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Maven Command Executor",
              description:
                "Run Maven lifecycle commands with ease, view logs, and analyze artifacts.",
              applicationCategory: "DeveloperTool",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              url: "https://yourwebsite.com",
              image: "https://yourwebsite.com/og-image.jpg",
            }),
          }}
        />

        {/* ✅ Load Ads and Tracking Asynchronously for Performance */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2067270214726984"
          crossOrigin="anonymous"
          nonce={nonce}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col w-full overflow-hidden`}
      >
        <ContextProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </ContextProvider>
      </body>
    </html>
  );
}
