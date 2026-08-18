"use server";

import { redirect } from "next/navigation";
import { isAuthError } from "@supabase/supabase-js";

import { createBoroServerClient } from "@boro/database/server";
import { loginSchema } from "@boro/validators";

import { isNetworkFailure, toAuthFailure } from "./errors";
import type { LoginState } from "./state";


/**
 * Signs a user in and hands them to the result screen.
 *
 * Runs on the server so the session cookies are set by the server client, and
 * so validation uses the same schema the browser used rather than a second
 * copy that can drift.
 */
export async function signInAction(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "password") {
        fieldErrors[field] ??= issue.message;
      }
    }
    return { status: "error", fieldErrors, email };
  }

  try {
    const supabase = await createBoroServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });

    if (error) {
      const failure = toAuthFailure(error);
      return {
        status: "error",
        message: failure.field ? undefined : failure.message,
        fieldErrors: failure.field ? { [failure.field]: failure.message } : undefined,
        email: parsed.data.email,
        needsVerification: failure.needsVerification,
        retryable: failure.retryable
      };
    }
  } catch (error) {
    if (isAuthError(error)) {
      const failure = toAuthFailure(error);
      return { status: "error", message: failure.message, email: parsed.data.email };
    }
    if (isNetworkFailure(error)) {
      return {
        status: "error",
        message: "We couldn't reach BORO. Check your connection and try again.",
        email: parsed.data.email,
        retryable: true
      };
    }
    throw error;
  }

  // Outside the try: redirect() signals by throwing, and catching it here would
  // swallow the navigation and report it as an unknown error.
  redirect("/auth/signed-in");
}

export async function signOutAction() {
  const supabase = await createBoroServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
