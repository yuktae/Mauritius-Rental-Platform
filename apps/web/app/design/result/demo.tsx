"use client";

import { useState } from "react";

import { Button, ResultScreen, type ResultStatus } from "@boro/ui";

type Scene = {
  key: string;
  label: string;
  status: ResultStatus;
  title: string;
  description: string;
  primary: string;
  secondary?: string;
  reference?: string;
};

const scenes: Scene[] = [
  {
    key: "signed-in",
    label: "Signed in",
    status: "success",
    title: "You're in",
    description: "Welcome back. Let's pick up where you left off.",
    primary: "Continue to BORO"
  },
  {
    key: "signup",
    label: "Account created",
    status: "success",
    title: "Account created",
    description:
      "Next we need a few details before you can book or list anything. It takes about a minute.",
    primary: "Set up my profile",
    secondary: "I'll do it later"
  },
  {
    key: "payment-ok",
    label: "Payment taken",
    status: "success",
    title: "Booking confirmed",
    description:
      "Rs 2,900 paid, with Rs 1,000 held as a deposit and released after return. Your pickup code is in Bookings.",
    primary: "View booking",
    secondary: "Back to browsing",
    reference: "BORO-4821-KQ"
  },
  {
    key: "payment-fail",
    label: "Payment failed",
    status: "error",
    title: "That payment didn't go through",
    description:
      "Your card was declined and nothing has been charged. The item is still held for you for 10 minutes.",
    primary: "Try another card",
    secondary: "Cancel this booking",
    reference: "BORO-4822-LM"
  },
  {
    key: "id-pending",
    label: "ID under review",
    status: "pending",
    title: "We're checking your ID",
    description:
      "This usually takes under a day. You can browse and save items in the meantime, and we'll email you when it's done.",
    primary: "Keep browsing",
    secondary: "Check status"
  }
];

export function ResultDemo() {
  const [active, setActive] = useState(0);
  const [nonce, setNonce] = useState(0);
  const scene = scenes[active]!;

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center p-3">
        <div className="pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-control border border-line bg-surface-raised p-1 shadow-card">
          {scenes.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActive(index);
                setNonce((n) => n + 1);
              }}
              className={`min-h-10 shrink-0 rounded-control px-3 text-xs font-semibold transition-colors ${
                index === active
                  ? "bg-primary text-on-primary"
                  : "text-ink-muted hover:bg-surface-sunken"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            className="min-h-10 shrink-0 rounded-control px-3 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            Replay
          </button>
        </div>
      </div>

      <ResultScreen
        // Remounting is what restarts the animation, so Replay actually replays.
        key={`${scene.key}-${nonce}`}
        status={scene.status}
        title={scene.title}
        description={scene.description}
        reference={scene.reference}
        primaryAction={<Button fullWidth>{scene.primary}</Button>}
        secondaryAction={
          scene.secondary ? (
            <Button variant="ghost" fullWidth>
              {scene.secondary}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
