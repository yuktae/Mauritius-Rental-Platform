import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

// Self-hosted at build time: no external request, no silent fallback, and no
// layout shift when the face arrives.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "BORO",
  description: "BORO rental platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
