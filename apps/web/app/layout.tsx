import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

// Self-hosted at build time: no external request, no silent fallback, and no
// layout shift when the face arrives.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-boro",
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
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
