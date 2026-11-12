import type { Metadata } from "next";
import { Pixelify_Sans, Caveat, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-pixel",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hand",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "University Event Management System",
  description: "University Event Management System - Campus Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${pixelifySans.variable} ${caveat.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink bg-paper">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
