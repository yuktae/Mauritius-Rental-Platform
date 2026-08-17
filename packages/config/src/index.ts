export const BRAND_NAME = "BORO";

export const ENVIRONMENTS = ["local", "staging", "production"] as const;

export type BoroEnvironment = (typeof ENVIRONMENTS)[number];

export const routePaths = {
  publicBrowse: "/",
  login: "/auth/login",
  signup: "/auth/signup",
  otpVerification: "/auth/otp",
  mandatoryProfile: "/onboarding/profile",
  idVerification: "/onboarding/id-verification",
  idResubmission: "/onboarding/id-resubmission",
  blockedAccount: "/account/blocked",
  renterHome: "/renter",
  ownerHome: "/owner",
  adminDashboard: "/admin"
} as const;

export const storageBuckets = {
  profilePhotos: "profile-photos",
  listingImages: "listing-images",
  verificationDocuments: "verification-documents",
  listingDocuments: "listing-documents",
  disputeEvidence: "dispute-evidence"
} as const;
