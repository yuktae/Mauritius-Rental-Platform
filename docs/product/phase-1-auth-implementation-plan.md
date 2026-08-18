# Phase 1 Implementation Plan — Login, Signup, OTP, Profile

Scope: everything from a signed-out visitor to a user standing on their role
homepage with a complete profile. The source of truth for behaviour is
`RENTAL SITE/docs/product/phase-1-login-signup-homepage-logic.md`. This document
is how that behaviour gets built in this repo.

## 0. Decisions locked before build

| Decision | Choice | Why |
|---|---|---|
| UI layer | Tailwind v4 mapped to `packages/ui` tokens | Fastest route to genuinely responsive phone-first screens; breakpoints and states stay inline and consistent across 12 screens |
| ID verification | Build all six statuses, do not force upload at onboarding | The Data Protection Act 2017 requires Data Protection Office registration before collecting any ID. Competitors tier by transaction value. Nothing built here is wasted when gating is switched on |
| Google sign-in | Deferred to a follow-up | Needs a Google Cloud OAuth client and consent screen that cannot be created from this repo. The core flow ships testable first |
| Role naming | **Owner**, never Borrower or Lister | Locked in `docs/product/locked-decisions.md`; the database enum is already `renter`, `owner`, `admin` |
| Role selection | On **signup** only, never on login | A returning user's role is already on their account. An Admin chip on a public login advertises an attack surface, and admin lives in a separate app |
| Admin auth | Stays in `apps/admin`, outside this scope | Different app, different domain, different session rules |

## 1. Blockers in the current schema

The database cannot support a signup today. These land first, as migration
`202608190001_auth_prerequisites.sql`.

| Gap | Consequence | Fix |
|---|---|---|
| No row is created in `profiles` when a user signs up | Every post-signup read returns nothing | `handle_new_user()` trigger on `auth.users` insert, security definer, creating the profile and the chosen non-admin roles |
| `profile_complete` is a protected column | Hardened in `202608180001`, so a user can never set it. Nobody can finish onboarding | Derive it in a before-update trigger from the required fields rather than trusting any caller |
| `email_verified` never syncs | Stays false forever after OTP succeeds | Trigger on `auth.users.email_confirmed_at` mirroring into `profiles` |
| `account_status` never advances | Everyone is stuck at `email_pending` | Derive the transitions `email_pending` to `profile_incomplete` to `active_limited`. `suspended` and `deleted_requested` stay admin-only through the existing `admin_set_account_status()` |
| `profile_photo_added` is protected | Cannot be set after an upload | Derive from `profile_photo_path is not null` in the same trigger |
| Storage buckets exist with **no policies** | `202608170001` created five buckets but no `storage.objects` policies, so every upload and read is denied | Policies on `profile-photos` allowing a user to insert, update and read only under their own `auth.uid()` prefix |

Verify with the SQL harness already used for the RLS work: a fake signup should
produce a profile row; filling the required fields should flip `profile_complete`
and `account_status` without the user touching either column; and a user must not
be able to write to another user's photo prefix.

## 2. Screens and routes

`routePaths` in `packages/config` covers most of this already. Add
`forgotPassword`, `resetPassword`, and later `authCallback`.

| Route | Screen | Who reaches it |
|---|---|---|
| `/` | Public browse | Everyone, signed in or not |
| `/auth/login` | Email, password, continue | Signed out |
| `/auth/signup` | Role intent, email, password, consent | Signed out |
| `/auth/otp` | Six-digit code | `email_pending` |
| `/auth/forgot-password` | Request reset link | Signed out |
| `/auth/reset-password` | Set a new password | Holder of a valid reset link |
| `/onboarding/profile` | Mandatory profile, two steps | `profile_incomplete` |
| `/onboarding/id-verification` | Status and explanation, no upload yet | Any signed-in user who opens it |
| `/account/blocked` | Suspended or deletion requested | `suspended`, `deleted_requested` |
| `/renter`, `/owner` | Role homepage shells | Complete profiles |

## 3. The routing gate

Everything in section 14 of the product spec collapses into one pure function.
Write it once in `packages/config`, unit test it as a table, and call it from
middleware. No screen makes its own routing decision.

```ts
resolveDestination({ user, profile }): { path: string; reason: string }
```

Evaluated strictly in this order. First match wins.

| # | Condition | Destination |
|---|---|---|
| 1 | No user | `/` for public routes, `/auth/login` for protected ones |
| 2 | `account_status` is `suspended` or `deleted_requested` | `/account/blocked` |
| 3 | `email_verified` is false | `/auth/otp` |
| 4 | `profile_complete` is false | `/onboarding/profile` |
| 5 | Roles contain `admin` only | The admin app, not this one |
| 6 | Both `renter` and `owner` | `last_used_role`, defaulting to `/renter` |
| 7 | A single role | `/renter` or `/owner` |

Because ID upload is not forced, `id_verification_status` never redirects. It
drives a persistent prompt on the homepage instead. The state machine is fully
built, so switching to hard gating later is a change to this table alone.

The gate runs in middleware, which already refreshes the session. It reads the
profile once per request and attaches the decision to a request header, so server
components do not each re-query.

## 4. Design system

The tokens in `packages/ui` already match the style board. Map them to semantic
roles rather than using raw colour names inside components.

| Role | Token | Use |
|---|---|---|
| `surface` | Ivory `#FFF9F1` | Page background |
| `surface-raised` | White | Cards, inputs |
| `surface-sunken` | Almond `#F4EBDC` | Section bands, disabled fills |
| `ink` | Deep Ink `#10243A` | Body and headings |
| `ink-muted` | `#7B828B` | Hints, captions |
| `primary` | Apricot `#F4A037` | Primary actions |
| `primary-soft` | Peach `#FDBA86` | Hover, decorative gradients |
| `danger` | Coral `#F46F61` | Errors, destructive actions |
| `trust` | Teal `#12AAB5` | Verified states, OTP success, QR |
| `line` | `rgba(16,36,58,0.12)` | Borders, dividers |

Coral is both the error colour and a brand warmth colour in the style board. Keep
those apart: coral signals error only inside forms, and warmth on marketing
surfaces comes from peach and apricot. Otherwise every error reads as decoration.

Font: Inter, self-hosted through `next/font` so there is no external request and
no layout shift. Radii and the type scale come from `packages/ui`.

### Components to build

Each ships with every state listed, not just the happy one.

| Component | States |
|---|---|
| `Button` | default, hover, pressed, focus-visible, loading, disabled, full-width |
| `Field` | label, hint, error, required marker, reserved error space |
| `TextInput` | idle, focus, invalid, disabled, with `inputMode` and `autocomplete` |
| `PasswordInput` | reveal toggle, caps-lock hint, strength meter on signup only |
| `OtpInput` | six boxes, paste whole code, auto-advance, backspace, `autocomplete="one-time-code"` |
| `PhoneInput` | fixed `+230` prefix, Mauritius formatting |
| `RoleChoiceCard` | unselected, selected, multi-select for Renter plus Owner |
| `ConsentCheckbox` | unchecked, checked, error, links opening in a new tab |
| `Banner` | info, warning, error, offline, with an optional retry |
| `Toast` | success, error, auto-dismiss, `aria-live` |
| `Skeleton` | shaped to the content it replaces |
| `ProgressSteps` | onboarding step 1 of 2 |
| `AvatarUpload` | empty, previewing, uploading with progress, error, success |
| `SubmitBar` | bottom-anchored on mobile with safe-area inset, inline on desktop |

## 5. State model

Every async action moves through one machine. No screen invents its own.

```text
idle -> validating -> submitting -> success
                          |
                          +-> error (recoverable) -> idle
                          +-> error (fatal)       -> blocked screen
```

Layered on top is a connectivity state of `online`, `slow` or `offline`, derived
from `navigator.onLine` plus request timing rather than trusting the browser flag
alone, which lies on captive portals.

### Loading

| Rule | Detail |
|---|---|
| Buttons keep their label | "Sign in" becomes "Signing in…" with a spinner. Never replace the text with a bare spinner: the button changes width and the user loses context |
| Minimum visible duration of 400ms | A spinner that flashes for 80ms reads as a glitch |
| Skeletons rather than spinners for content with a known shape | The profile screen loads as field-shaped blocks |
| Slow threshold at 5s | Banner: "Still working. Your connection looks slow." |
| Timeout at 20s | Fail with a retry action, never an infinite spinner |
| Disable the form, not the page | The user can still read what they typed |

### Offline

| Rule | Detail |
|---|---|
| A persistent banner, not a toast | Offline is a condition, not an event |
| Submit disabled with a reason | "You're offline. We'll enable this when you reconnect." |
| Never lose typed input | Form state survives the offline period in memory |
| Auto-retry once on reconnect, for idempotent reads only | Never auto-resubmit a signup or an OTP |
| Passwords and codes are never written to storage | Not `localStorage`, not `sessionStorage`, not a service worker cache |

### Errors

Map every Supabase error to human copy. Never render a raw error string.

| Situation | Message | Recovery |
|---|---|---|
| Wrong email or password | "That email and password don't match." | Stay, keep the email, clear the password, focus it |
| Unregistered email on login | "We couldn't find an account for that email." | Offer signup with the email prefilled |
| Email already registered on signup | "That email already has an account." | Offer login, or a password reset |
| Wrong OTP | "That code isn't right. Check it and try again." | Keep the boxes, focus the first, do not clear until they type |
| Expired OTP | "That code expired. We can send a new one." | Resend, cooldown resets |
| Rate limited | "Too many attempts. Try again in N minutes." | Countdown, submit stays disabled |
| Weak password | Inline as they type, never on submit | Show the rule that is failing |
| Upload too large | "That image is over 5MB." | Offer another file, and state the limit up front too |
| Unknown | "Something went wrong on our side." | Retry, with a reference code logged for support |

Errors are announced with `aria-live="assertive"` and focus moves to the first
invalid field. Field errors reserve their vertical space at render, so the layout
does not jump when one appears.

### Confirmation

| Event | Confirmation |
|---|---|
| OTP verified | Boxes turn teal, brief check animation, auto-advance after 600ms |
| Profile saved | Toast reading "Profile saved", then the role homepage |
| Photo uploaded | The preview replaces the empty state immediately, with a progress ring while uploading |
| Password reset sent | Full-screen confirmation naming the exact address, plus a resend cooldown |
| Password changed | Toast, then login with the email prefilled |
| Signup complete | Never a dead-end success screen. Always continue into the next required step |

The resend cooldown is 60 seconds with a visible countdown, enforced server-side
as well. Supabase rate limits will reject faster attempts regardless, and an
unexplained rejection reads as a broken app.

## 6. Phone-first rules

These are build requirements, not preferences.

| Rule | Reason |
|---|---|
| Inputs at 16px minimum | iOS Safari zooms the page on focus below 16px and never zooms back |
| Tap targets of 48 by 48 CSS px | Below this, thumb accuracy collapses |
| Primary action bottom-anchored on mobile | Top-right buttons are unreachable one-handed on a 6.7 inch phone |
| `env(safe-area-inset-bottom)` on that bar | Otherwise it sits under the home indicator |
| One primary action per screen | Two competing CTAs on a narrow screen halve completion |
| `inputMode`, `autocomplete` and `enterKeyHint` on every field | `email`, `current-password`, `new-password`, `one-time-code`, `tel`. This is what makes autofill and the correct keyboard appear |
| The session must survive app switching | The user leaves to read the OTP email and comes back. The pending email lives in the URL or a cookie, never in component state |
| No layout shift | Reserve error space, size images, self-host the font |
| `prefers-reduced-motion` respected | Skip the check animation, keep the state change |
| Visible focus rings | Never `outline: none` without a replacement |
| The full flow tested on a real phone | Browser device mode does not reproduce keyboard behaviour, autofill, or thumb reach |

## 7. Responsive strategy

Design at 360px, then let it grow. Three layouts, not five.

| Width | Layout |
|---|---|
| 360 to 767 | Single column, edge-to-edge cards with 20px gutters, bottom-anchored CTA, full-width inputs |
| 768 to 1023 | Centred 480px card on the ivory background, CTA inline at the card foot |
| 1024 and up | Two panes. Left is a peach-to-apricot brand panel carrying the value proposition; right is the same 480px card. Max width 1200px, centred |

The form itself is one component across all three. Only the shell changes, so
there is no second implementation to keep in sync.

## 8. File layout

```text
packages/ui/src/
  tokens/            colours, type, spacing, radii
  components/        Button, Field, TextInput, OtpInput, ...
  index.ts

packages/validators/src/
  auth.ts            login, signup, otp, password reset
  profile.ts         mandatory profile, phone, photo constraints

packages/config/src/
  routing.ts         resolveDestination and the decision table

apps/web/
  app/(auth)/login|signup|otp|forgot-password|reset-password/
  app/(onboarding)/profile|id-verification/
  app/(app)/renter|owner/
  app/account/blocked/
  src/features/auth/         server actions, copy, hooks
  src/features/onboarding/
```

Route groups keep the auth shell separate from the app shell without adding URL
segments. Server Actions handle every mutation, so validation runs on the server
with the same schema the client used.

## 9. Validation

`packages/validators` already has `emailPasswordSignupSchema` and
`mandatoryProfileSchema`. Extend those, and use the same schema on both sides.

| Schema | Rules |
|---|---|
| `loginSchema` | Email format, password non-empty. Do not reveal which half failed |
| `signupSchema` | Existing, plus a minimum of 10 characters with a live rule display |
| `otpSchema` | Exactly six digits |
| `profileSchema` | Existing, plus `+230` phone validation and Mauritius regions |
| `photoConstraints` | 5MB, jpeg, png or webp, checked before the upload starts |

## 10. Copy

Every string lives in a per-screen module. English now, with keys shaped for
French and Kreol later. `preferred_language` is already on the profile, so the
plumbing exists. Do not install an i18n library yet, and do not scatter literals
through JSX either, because retrofitting that is the expensive part.

## 11. Build order

| # | Milestone | Done when |
|---|---|---|
| M1 | Auth prerequisites migration | Signup trigger, derived flags and storage policies all proven by SQL tests on a clean database |
| M2 | Tailwind wired to tokens | Both apps build and tokens resolve |
| M3 | Component primitives | Every component above exists with all its states, on one preview page |
| M4 | Login | Real session, error taxonomy, offline banner, tested on a phone |
| M5 | Signup | Role intent, consent timestamps, account created |
| M6 | Email OTP | Code verified, `email_verified` flips, resend cooldown works |
| M7 | Mandatory profile | Two steps, photo upload to storage, `profile_complete` derives itself |
| M8 | Routing gate | Decision table unit-tested, middleware enforces it, no screen routes itself |
| M9 | Password reset | Request, email, set new, back to login |
| M10 | States pass | Loading, slow, offline, error and success verified on every screen |
| M11 | Responsive and accessibility pass | 360, 768 and 1280 verified, keyboard-only pass, real phone run-through |

M1 is genuinely first. Building screens against a database that cannot create a
profile row wastes the screens.

## 12. Testing

| Layer | Approach |
|---|---|
| Validators | Vitest, table-driven, valid and invalid cases per schema |
| Routing gate | Vitest against the section 3 table, every row |
| Database | The SQL harness, extending the existing seven RLS checks |
| Flow | Playwright: signup through to homepage, plus wrong password, wrong OTP, expired OTP and offline submit |
| Device | Manual on a real Android phone and an iPhone before M11 closes |

## 13. Risks and open items

| Risk | Impact | Action |
|---|---|---|
| Supabase built-in email is heavily rate limited | OTP testing on preprod starts failing after a handful of sends, and it looks like a bug | Configure Resend or Postmark SMTP on `boro-preprod` before M6. Local uses Mailpit on port 54324 and is unaffected |
| The default Supabase email template sends a magic link, not a code | The spec calls for a six-digit OTP | Customise the template to use the token variable. Confirm before building the OTP screen |
| Hosted auth redirect URLs are unset | Confirmation and reset links point nowhere | Set the Site URL and redirect allowlist on `boro-preprod` to the Vercel preview domain |
| Data Protection Office registration | Legally required before collecting any ID document | Must complete before ID upload is switched on. Not a blocker for this plan, which collects none |
| `boro-production` is an empty database | Merging to `main` once auth exists would deploy a live app against no schema | Push migrations to production before the first merge to `main` |
| The admin app has no auth | Its production domain is publicly reachable on the current Vercel plan | Add the admin role gate immediately after M8, reusing the same gate |
