import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import { BRAND_NAME } from "@boro/config";

// Self-hosted at build time: no external request, no silent fallback, and no
// layout shift when the face arrives.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} Admin`,
  description: "BORO admin and operator dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
