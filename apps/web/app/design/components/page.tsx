import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ComponentGallery } from "./gallery";

export const metadata: Metadata = {
  title: "BORO components",
  robots: { index: false, follow: false }
};

export default function ComponentsPage() {
  if (process.env.BORO_ENV === "production") {
    notFound();
  }

  return <ComponentGallery />;
}
