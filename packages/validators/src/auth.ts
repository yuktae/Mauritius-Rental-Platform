import { z } from "zod";

/**
 * Sign-in.
 *
 * Deliberately loose: a login form must never tell an attacker which half of
 * the pair was wrong, so there is no format or length check on the password
 * here beyond it being present. The server returns one message for any
 * credential failure.
 */
export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like an email address"),
  password: z.string().min(1, "Enter your password")
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Six digits, nothing else. */
export const otpSchema = z.object({
  email: z.string().email(),
  token: z
    .string()
    .regex(/^\d{6}$/, "Enter all six digits")
});

export type OtpInput = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like an email address")
});

/**
 * Setting a new password, at signup or after a reset.
 *
 * Ten characters minimum, matching the existing signup schema. Length is the
 * rule that actually matters; character-class requirements mostly push people
 * toward Password1! and a sticky note.
 */
export const newPasswordSchema = z.object({
  password: z.string().min(10, "Use at least 10 characters")
});
