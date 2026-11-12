import type { Metadata } from "next";
import "@fontsource/pixelify-sans/700.css";
import "@fontsource/caveat/600.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans text-ink bg-paper">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className:
              "border-2 border-ink rounded-[3px] shadow-hard font-mono text-xs",
          }}
        />
      </body>
    </html>
  );
}
