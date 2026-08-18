/**
 * BORO design tokens, described for tooling.
 *
 * `theme.css` is the source of truth for styling: it is what Tailwind reads and
 * what every component ultimately resolves to. This module exists so the design
 * preview page can enumerate the system, and so anything that genuinely needs a
 * value in JavaScript has one place to ask.
 *
 * Components should use the utility classes, never these strings.
 */

export type Swatch = {
  step: string;
  value: string;
  note?: string;
  chosen?: boolean;
};

export type Ramp = {
  name: string;
  token: string;
  description: string;
  swatches: Swatch[];
};

export const brandRamp: Ramp = {
  name: "Brand",
  token: "brand",
  description:
    "The BORO orange, anchored on the wordmark. 500 is the brand colour; 600 and 700 exist so hover and pressed states are the same hue rather than a new one.",
  swatches: [
    { step: "50", value: "#fff6ec" },
    { step: "100", value: "#ffe8d1", note: "Soft fills, selected chips" },
    { step: "200", value: "#ffcfa3" },
    { step: "300", value: "#fdb073" },
    { step: "400", value: "#fb8f42" },
    { step: "500", value: "#f5761c", note: "Primary actions" },
    { step: "600", value: "#dd5d0c", note: "Hover" },
    { step: "700", value: "#b7460d", note: "Pressed, text on light" },
    { step: "800", value: "#8f3812" },
    { step: "900", value: "#742f13" }
  ]
};

export const sandRamp: Ramp = {
  name: "Sand",
  token: "sand",
  description:
    "Warm neutrals, hue-biased toward the brand so a grey border never reads blue beside a cream panel. 900 is the text colour: a warm near-black rather than the old navy, which competed with the orange.",
  swatches: [
    { step: "50", value: "#fdfaf6" },
    { step: "100", value: "#f8f2e9", note: "Page background" },
    { step: "200", value: "#f0e7da", note: "Sunken panels" },
    { step: "300", value: "#e3d7c6", note: "Borders" },
    { step: "400", value: "#c7b9a4" },
    { step: "500", value: "#9e9182" },
    { step: "600", value: "#776c60", note: "Muted text" },
    { step: "700", value: "#574e45" },
    { step: "800", value: "#38322c" },
    { step: "900", value: "#221e1a", note: "Body text" }
  ]
};

export const statusColors: Swatch[] = [
  { step: "success", value: "#12805c", note: "Completed, verified owner" },
  { step: "warning", value: "#d9a400", note: "Pending, action needed" },
  { step: "danger", value: "#c8372b", note: "Form errors, destructive" },
  { step: "trust", value: "#0e8e9b", note: "ID verified, QR handover" }
];

/**
 * Accents for the Owner surface. Ink navy is the chosen one.
 *
 * Renter and Owner share every other token and differ only in `--color-accent`,
 * so the distinction stays one deliberate line rather than two themes that
 * drift apart. The rejected options are kept here because the reasoning is
 * worth more than the result if this is ever revisited.
 */
export const ownerAccentCandidates: Swatch[] = [
  {
    step: "Brand orange",
    value: "#f5761c",
    note: "Renter uses this. Rejected for Owner: no distinction at all"
  },
  {
    step: "Deep teal",
    value: "#0e8e9b",
    note: "Rejected: teal already means verified on badges and QR handover, and an accent that doubles as a status stops the status reading as one"
  },
  {
    step: "Ink navy",
    value: "#1b3a5c",
    note: "Chosen. Collides with no status colour, suits a management surface rather than a shopping one, and keeps the style board's navy-for-trust intent without reintroducing navy as a second neutral",
    chosen: true
  },
  {
    step: "Ember",
    value: "#8f3812",
    note: "Rejected: too close to the brand, so it reads as a muted or disabled orange button rather than a different surface"
  }
];

export const typeScale = [
  { name: "display", token: "text-display", use: "Landing, onboarding, empty states" },
  { name: "title", token: "text-title", use: "Screen headings" },
  { name: "base", token: "text-base", use: "Body copy and inputs" },
  { name: "label", token: "text-label", use: "Field labels, captions" }
];

export const radii = [
  { name: "control", token: "rounded-control", use: "Buttons and chips" },
  { name: "field", token: "rounded-field", use: "Inputs" },
  { name: "card", token: "rounded-card", use: "Cards and list rows" },
  { name: "panel", token: "rounded-panel", use: "Sheets and large surfaces" }
];
