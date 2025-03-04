import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import Footer from "./components/Footer";
import MobileMenu from "./components/Menu";
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
  title: "Maven Command Executor",
  description: "Run Maven lifecycle commands with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}
      >
        <SessionProvider>
          <MenuProvider>
            {/* Header (Mobile Menu Inside) */}
            <header className="w-full h-16 flex justify-between items-center bg-gray-800 shadow-md text-white px-4">
              <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                📦 Maven Command Executor
              </h1>
              <MobileMenu />
            </header>

            {/* Main Content (Auto-Grows) */}
            <main className="flex-grow bg-gray-900">{children}</main>

            {/* Fixed Footer */}
            <Footer />
          </MenuProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
