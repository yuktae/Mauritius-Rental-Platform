"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  Banner,
  Button,
  PasswordInput,
  SubmitBar,
  TextInput,
  useOnlineStatus
} from "@boro/ui";

import { signInAction } from "./actions";
import { initialLoginState } from "./state";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialLoginState);
  const online = useOnlineStatus();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // On a failure, clear the password and put the cursor where the fix is. The
  // email survives, because retyping it is pure friction and it was almost
  // certainly not the mistake.
  useEffect(() => {
    if (state.status !== "error") return;
    if (state.email) setEmail(state.email);

    if (state.fieldErrors?.password || state.message) {
      setPassword("");
      passwordRef.current?.focus();
    } else if (state.fieldErrors?.email) {
      emailRef.current?.focus();
    }
  }, [state]);

  const blocked = !online;

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col">
      <div className="flex flex-col gap-1">
        {state.status === "error" && state.message ? (
          <Banner
            tone={state.retryable ? "warning" : "danger"}
            title={state.message}
            className="mb-4"
          >
            {state.needsVerification
              ? "We sent you a code when you signed up. Check your inbox."
              : null}
          </Banner>
        ) : null}

        {blocked ? (
          <Banner tone="offline" title="You're offline" className="mb-4">
            We&rsquo;ll enable sign in as soon as you reconnect.
          </Banner>
        ) : null}

        <TextInput
          ref={emailRef}
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          placeholder="you@example.com"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={state.fieldErrors?.email}
          disabled={pending}
          required
        />

        <PasswordInput
          ref={passwordRef}
          name="password"
          label="Password"
          autoComplete="current-password"
          enterKeyHint="go"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={state.fieldErrors?.password}
          disabled={pending}
          required
        />

        <div className="-mt-1 flex justify-end">
          <a
            href="/auth/forgot-password"
            className="inline-flex min-h-12 items-center rounded-control px-2 text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <SubmitBar className="mt-auto sm:mt-6">
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={pending}
          loadingLabel="Signing in"
          disabled={blocked}
        >
          Sign in
        </Button>
      </SubmitBar>
    </form>
  );
}
