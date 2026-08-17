import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { BRAND_NAME } from "@boro/config";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
