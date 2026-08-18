/**
 * Form state shared between the Server Action and the client form.
 *
 * Kept out of actions.ts because a "use server" module may only export async
 * functions. Exporting the initial-state object from there fails the build with
 * "a use server file can only export async functions, found object".
 */
export type LoginState = {
  status: "idle" | "error";
  message?: string;
  /** Per-field messages, keyed to the input they belong under. */
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  /** Kept so the form can repopulate without echoing the password back. */
  email?: string;
  needsVerification?: boolean;
  retryable?: boolean;
};

export const initialLoginState: LoginState = { status: "idle" };
