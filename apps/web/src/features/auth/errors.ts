import type { AuthError } from "@supabase/supabase-js";

export type AuthFailure = {
  /** What the user reads. Never a raw provider string. */
  message: string;
  /** Which field to focus, if the failure belongs to one. */
  field?: "email" | "password";
  /** The account exists but is not yet confirmed, so the OTP screen is next. */
  needsVerification?: boolean;
  /** Nothing the user can fix by editing the form. */
  retryable?: boolean;
};

/**
 * Turns a Supabase auth error into something a person can act on.
 *
 * Two rules. A credential failure never reveals which half was wrong, because
 * "no account with that email" is a free account-existence check for anyone
 * enumerating addresses. And nothing here ever surfaces the provider's own
 * wording, which is written for developers.
 */
export function toAuthFailure(error: AuthError): AuthFailure {
  const code = error.code ?? "";
  const raw = error.message.toLowerCase();

  if (code === "invalid_credentials" || raw.includes("invalid login credentials")) {
    return {
      message: "That email and password don't match.",
      field: "password"
    };
  }

  if (code === "email_not_confirmed" || raw.includes("email not confirmed")) {
    return {
      message: "Confirm your email address to continue.",
      needsVerification: true
    };
  }

  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || error.status === 429) {
    return {
      message: "Too many attempts. Wait a minute, then try again.",
      retryable: true
    };
  }

  if (code === "user_banned") {
    return {
      message: "This account has been suspended. Contact support if you think that's wrong."
    };
  }

  if (code === "validation_failed") {
    return {
      message: "Check the details above and try again.",
      field: "email"
    };
  }

  // Anything unmapped is our problem, not the user's, so it says so and offers
  // a retry rather than blaming their input.
  return {
    message: "Something went wrong on our side. Try again in a moment.",
    retryable: true
  };
}

/**
 * A failed fetch rather than a rejected credential: the request never reached
 * Supabase at all.
 */
export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  );
}
