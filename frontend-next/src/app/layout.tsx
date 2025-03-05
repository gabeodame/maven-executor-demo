import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Footer from "./components/Footer";
import MobileMenu from "./components/Menu";
import SessionProvider from "./components/SessionProvider";
import "./globals.css";
import { MenuProvider } from "./store/MenuContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maven Command Executor | Build & Deploy Maven Projects",
  description:
    "Effortlessly execute Maven lifecycle commands, view build logs, and analyze artifacts in real time. Ideal for developers automating their Java project workflows, as well as for educational and illustrational purposes.",
  keywords: [
    "Maven",
    "Maven Executor",
    "Java Build",
    "Maven Lifecycle",
    "CI/CD",
    "DevOps",
    "Continuous Integration",
    "Continuous Deployment",
    "Java",
    "Software Development",
    "Build Automation",
    "Educational",
    "Illustrational",
  ].join(", "),
  authors: [{ name: "Your Name or Brand", url: "https://yourwebsite.com" }],
  openGraph: {
    title: "Maven Command Executor",
    description:
      "Run Maven lifecycle commands with ease. Get detailed build logs and artifact analysis in a streamlined interface. Perfect for automation, education, and illustration of build processes.",
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
      "Effortlessly execute Maven lifecycle commands, view build logs, and analyze artifacts in real time. Ideal for automation, education, and illustrating Java build workflows.",
    images: ["https://yourwebsite.com/twitter-image.jpg"], // Replace with actual image
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Dynamic Metadata for SEO & Social Sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://anchordiv.com" />
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
          content="https://anchordiv.com/og-image.jpg"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Maven Command Executor" />
        <meta
          name="twitter:description"
          content="Run Maven lifecycle commands with ease."
        />
        <meta
          name="twitter:image"
          content="https://achordiv.com/twitter-image.jpg"
        />
        <meta name="google-adsense-account" content="ca-pub-2067270214726984" />

        {/* ✅ Structured Data for SEO */}
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
              url: "https://anchordiv.com",
              image: "https://anchordiv.com/og-image.jpg",
            }),
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2067270214726984"
          crossOrigin="anonymous" // ✅ Fix: Use camelCase
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col w-full`}
      >
        <SessionProvider>
          <MenuProvider>
            <header className="w-full  h-20 flex justify-between items-center bg-gray-800 shadow-md text-white px-4">
              <h1 className="text-2xl sm:text-2xl font-bold flex items-center gap-2">
                📦 Maven Command Executor
              </h1>
              <MobileMenu />
            </header>
            <main className="w-full h-full flex-grow bg-gray-900">
              {children}
            </main>
            <Footer />
          </MenuProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
