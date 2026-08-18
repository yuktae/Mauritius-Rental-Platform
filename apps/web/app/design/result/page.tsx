import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ResultDemo } from "./demo";

export const metadata: Metadata = {
  title: "BORO result screens",
  robots: { index: false, follow: false }
};

export default function ResultPage() {
  if (process.env.BORO_ENV === "production") {
    notFound();
  }

  return <ResultDemo />;
}
