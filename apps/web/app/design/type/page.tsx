import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  Manrope,
  DM_Sans,
  Figtree,
  Bricolage_Grotesque
} from "next/font/google";

export const metadata: Metadata = {
  title: "BORO type options",
  robots: { index: false, follow: false }
};

// Weights are inlined rather than shared from a variable so TypeScript can
// contextually type them: each family declares its own allowed weight literals.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

type Candidate = {
  name: string;
  className: string;
  verdict: string;
  note: string;
  bodyClassName?: string;
  bodyName?: string;
};

const candidates: Candidate[] = [
  {
    name: "Inter",
    className: inter.className,
    verdict: "Current",
    note: "The safe default. Neutral, superb at small sizes, and on roughly every product you have ever used, which is exactly the criticism: it says nothing about BORO."
  },
  {
    name: "Plus Jakarta Sans",
    className: jakarta.className,
    verdict: "Recommended",
    note: "Named as an option on your own style board. Geometric but humanist, with warmer, rounder shapes than Inter. Friendly enough for renters, structured enough for the admin side, and its heavy weights carry a display headline without needing a second face."
  },
  {
    name: "Figtree",
    className: figtree.className,
    verdict: "Warmest",
    note: "Softer and rounder still. The most approachable of the set and a natural match for the peach and apricot, though it is a touch less authoritative on the Owner and Admin surfaces."
  },
  {
    name: "Manrope",
    className: manrope.className,
    verdict: "Most distinctive",
    note: "Semi-condensed with unusual letterforms, so it is the most recognisable option here. Space-efficient on a narrow phone. The character that makes it memorable also makes it tiring in long paragraphs."
  },
  {
    name: "DM Sans",
    className: dmSans.className,
    verdict: "Cleanest",
    note: "Low contrast, geometric, quietly modern. Reads beautifully at 14 to 16px, which is where most of a rental app actually lives. Less personality in headlines than Jakarta."
  },
  {
    name: "Bricolage Grotesque",
    className: bricolage.className,
    bodyClassName: dmSans.className,
    bodyName: "DM Sans",
    verdict: "Editorial pairing",
    note: "A characterful display face over DM Sans for body. The most opinionated route, and the only one here that needs two families loaded. Worth it only if BORO wants to look like a brand first and an app second."
  }
];

function Specimen({ candidate }: { candidate: Candidate }) {
  const body = candidate.bodyClassName ?? candidate.className;

  return (
    <section className="flex flex-col gap-5 rounded-card border border-line bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-bold">
          {candidate.name}
          {candidate.bodyName ? (
            <span className="text-ink-muted"> + {candidate.bodyName}</span>
          ) : null}
        </h2>
        <span className="rounded-control bg-surface-sunken px-3 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
          {candidate.verdict}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <p
          className={`${candidate.className} text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance`}
        >
          Rent what you need, list what you own.
        </p>

        <p className={`${body} max-w-prose leading-relaxed text-ink-muted`}>
          BORO runs from a web link on phones, tablets and desktop. Réservez un
          appareil photo pour le week-end, ou louez votre propre matériel entre
          deux usages.
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
          <span className={`${candidate.className} text-xl font-bold tabular-nums`}>
            Rs 1,200<span className="text-sm font-medium text-ink-muted">/day</span>
          </span>
          <span
            className={`${candidate.className} text-xl font-semibold tabular-nums tracking-[0.3em] text-trust`}
          >
            712898
          </span>
          <span
            className={`${candidate.className} rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary`}
          >
            Book now
          </span>
          <span className={`${body} text-label uppercase tracking-wider text-ink-subtle`}>
            Propriétaire &middot; Locataire
          </span>
        </div>
      </div>

      <p className={`${body} text-sm leading-relaxed text-ink-muted`}>{candidate.note}</p>
    </section>
  );
}

export default function TypePage() {
  if (process.env.BORO_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-3">
        <a href="/design" className="font-mono text-label text-primary hover:underline">
          &larr; Design tokens
        </a>
        <h1 className="text-display font-extrabold">Type options</h1>
        <p className="max-w-prose text-ink-muted">
          Each candidate shown on the things BORO actually renders: a headline, a
          paragraph with French accents, a price, a verification code, a button
          and a pair of role labels. Pick by looking, and tell me the name.
        </p>
      </header>

      {candidates.map((candidate) => (
        <Specimen key={candidate.name} candidate={candidate} />
      ))}

      <p className="text-sm text-ink-muted">
        Whichever you choose is one line in each app layout plus one token in{" "}
        <code className="font-mono text-xs text-ink">theme.css</code>. Nothing
        else changes.
      </p>
    </main>
  );
}
