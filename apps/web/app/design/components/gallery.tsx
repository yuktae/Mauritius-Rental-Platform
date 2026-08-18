"use client";

import { useState } from "react";

import {
  AvatarUpload,
  Banner,
  Button,
  ConsentCheckbox,
  OtpInput,
  PasswordInput,
  PhoneInput,
  ProgressSteps,
  RoleChoiceCard,
  Skeleton,
  SubmitBar,
  TextInput,
  ToastProvider,
  useOnlineStatus,
  useToast,
  validatePhoto,
  type OtpStatus
} from "@boro/ui";

function Section({
  title,
  note,
  children
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title font-semibold">{title}</h2>
        {note ? <p className="max-w-prose text-sm text-ink-muted">{note}</p> : null}
      </div>
      <div className="flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-5">
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0">
      <span className="font-mono text-label uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
      {children}
    </div>
  );
}

function ToastDemo() {
  const { showToast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => showToast("Profile saved")}>
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          showToast({
            title: "We couldn't save that",
            description: "Check your connection and try again.",
            tone: "danger"
          })
        }
      >
        Error with detail
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          showToast({
            title: "Code sent again",
            description: "Check your inbox, it can take a minute.",
            tone: "info"
          })
        }
      >
        Info with detail
      </Button>
    </div>
  );
}

function Gallery() {
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [roles, setRoles] = useState<string[]>(["renter"]);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | undefined>(undefined);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const online = useOnlineStatus();

  function toggleRole(role: string) {
    setRoles((current) =>
      current.includes(role) ? current.filter((r) => r !== role) : [...current, role]
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-label">
          <a href="/design" className="text-primary hover:underline">
            &larr; Design tokens
          </a>
          <a href="/design/type" className="text-primary hover:underline">
            Type options
          </a>
          <a href="/design/result" className="text-primary hover:underline">
            Result screens
          </a>
        </div>
        <h1 className="text-display font-extrabold">Components</h1>
        <p className="max-w-prose text-ink-muted">
          Every primitive the auth and onboarding screens are assembled from,
          shown in each state it can reach. If a state is not on this page, it
          does not exist yet.
        </p>
      </header>

      {!online ? (
        <Banner tone="offline" title="You're offline">
          This banner is live. Turn your connection off and it appears on its own.
        </Banner>
      ) : null}

      <Section
        title="Button"
        note="A loading button keeps its label and its colour. It is working, not unavailable, so it must not look disabled."
      >
        <Row label="Variants">
          <div className="flex flex-wrap gap-2">
            <Button>Continue</Button>
            <Button variant="secondary">Filter</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger">Suspend account</Button>
          </div>
        </Row>
        <Row label="Loading, disabled, large">
          <div className="flex flex-wrap items-center gap-2">
            <Button loading loadingLabel="Signing in">
              Sign in
            </Button>
            <Button disabled>Disabled</Button>
            <Button size="lg">Book now</Button>
          </div>
        </Row>
        <Row label="Full width, live">
          <Button
            fullWidth
            loading={loading}
            loadingLabel="Sending code"
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 2000);
            }}
          >
            Send code
          </Button>
        </Row>
      </Section>

      <Section
        title="Text input"
        note="The message row reserves its height, so an error appearing never pushes the form down the screen."
      >
        <TextInput
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <TextInput
          label="Email address"
          type="email"
          defaultValue="not-an-email"
          error="That email and password don't match."
        />
        <TextInput label="Full legal name" hint="As it appears on your ID" />
        <TextInput label="Display name" defaultValue="Two Rentals" disabled />
      </Section>

      <Section
        title="Password"
        note="The strength meter is signup only. A login form should never grade a password the user already has."
      >
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          showStrength
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          defaultValue="wrongpassword"
          error="That email and password don't match."
        />
      </Section>

      <Section
        title="Phone"
        note="Mauritius only for now, so the +230 is fixed rather than a country picker nobody needs."
      >
        <PhoneInput value={phone} onValueChange={setPhone} required />
        <PhoneInput
          value="5712"
          onValueChange={() => undefined}
          error="Enter all 8 digits."
        />
      </Section>

      <Section
        title="One-time code"
        note="Paste fills every box, typing advances, backspace steps back, and the first box carries one-time-code so the phone offers the code straight from the email."
      >
        <OtpInput
          value={otp}
          onValueChange={(code) => {
            setOtp(code);
            setOtpStatus("idle");
          }}
          onComplete={(code) => setOtpStatus(code === "123456" ? "success" : "error")}
          status={otpStatus}
          error={otpStatus === "error" ? "That code isn't right. Check it and try again." : undefined}
        />
        <p className="text-label text-ink-subtle">
          Type or paste <span className="font-mono text-ink">123456</span> to see the
          verified state, anything else for the error state.
        </p>
      </Section>

      <Section
        title="Role choice"
        note="Multi-select, because someone can be both. This is why role selection belongs on signup and not on the login screen."
      >
        <div className="flex flex-col gap-3">
          <RoleChoiceCard
            title="Renter"
            subtitle="Locataire / Lokater"
            description="Browse and book items from owners near you."
            selected={roles.includes("renter")}
            onToggle={() => toggleRole("renter")}
          />
          <RoleChoiceCard
            title="Owner"
            subtitle="Propriétaire / Propriyeter"
            description="List what you own and earn from it between uses."
            selected={roles.includes("owner")}
            onToggle={() => toggleRole("owner")}
          />
        </div>
      </Section>

      <Section title="Consent">
        <ConsentCheckbox
          checked={consent}
          onCheckedChange={(next) => {
            setConsent(next);
            setConsentError(next ? undefined : "You need to accept these to continue.");
          }}
          error={consentError}
        >
          I accept the <span className="font-medium text-ink underline">Terms</span> and the{" "}
          <span className="font-medium text-ink underline">Privacy Policy</span>.
        </ConsentCheckbox>
      </Section>

      <Section
        title="Banner"
        note="A condition, not an event. Offline is a banner; a saved confirmation is a toast."
      >
        <Banner tone="info" title="Verify your ID to start booking">
          It takes about two minutes.
        </Banner>
        <Banner tone="warning" title="ID review in progress">
          We&rsquo;ll email you when it&rsquo;s done, usually within a day.
        </Banner>
        <Banner tone="danger" title="We couldn&rsquo;t sign you in">
          Check your email and password, then try again.
        </Banner>
        <Banner
          tone="offline"
          title="You're offline"
          action={
            <Button variant="secondary" size="md">
              Retry
            </Button>
          }
        >
          We&rsquo;ll enable this when you reconnect.
        </Banner>
      </Section>

      <Section title="Toast" note="Icon, title, optional detail, and a countdown bar that freezes while you hover, so a toast cannot vanish mid-read. Bottom on a phone, top-right from tablet up.">
        <ToastDemo />
      </Section>

      <Section title="Progress">
        <ProgressSteps current={1} total={2} label="About you" />
        <ProgressSteps current={2} total={2} label="Photo and location" />
      </Section>

      <Section
        title="Photo upload"
        note="Validated before the upload starts, so an oversized file fails instantly rather than after a slow round trip."
      >
        <AvatarUpload
          previewUrl={photo}
          error={photoError}
          onSelect={(file) => {
            const problem = validatePhoto(file);
            setPhotoError(problem ?? undefined);
            if (!problem) setPhoto(URL.createObjectURL(file));
          }}
          onRemove={() => {
            setPhoto(null);
            setPhotoError(undefined);
          }}
        />
        <AvatarUpload uploading progress={64} onSelect={() => undefined} />
        <AvatarUpload
          error="That image is over 5MB."
          onSelect={() => undefined}
        />
      </Section>

      <Section title="Skeleton" note="Shaped like the content it replaces, so nothing shifts when the real thing arrives.">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </Section>

      <Section
        title="Submit bar"
        note="Sticky at the bottom on a phone with the safe-area inset, inline from tablet up. Narrow your window to see it change."
      >
        <SubmitBar>
          <Button fullWidth>Continue</Button>
        </SubmitBar>
      </Section>
    </main>
  );
}

export function ComponentGallery() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  );
}
