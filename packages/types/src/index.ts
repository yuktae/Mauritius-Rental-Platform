export const APP_ROLES = ["renter", "owner", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type LocalizedRoleLabel = {
  en: string;
  fr: string;
  mfe: string;
};

export const ROLE_LABELS = {
  renter: {
    en: "Renter",
    fr: "Locataire",
    mfe: "Lokater"
  },
  owner: {
    en: "Owner",
    fr: "Propriétaire",
    mfe: "Propriyeter"
  },
  admin: {
    en: "Admin",
    fr: "Opérateur",
    mfe: "Operater"
  }
} satisfies Record<AppRole, LocalizedRoleLabel>;

export const ID_VERIFICATION_STATUSES = [
  "not_started",
  "id_pending",
  "id_verified",
  "id_rejected",
  "id_expired",
  "manual_review"
] as const;

export type IdVerificationStatus = (typeof ID_VERIFICATION_STATUSES)[number];

export const ACCOUNT_STATUSES = [
  "email_pending",
  "profile_incomplete",
  "active_limited",
  "active_verified",
  "suspended",
  "deleted_requested"
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type UserProfile = {
  id: string;
  email: string;
  fullLegalName: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  locationRegion: string | null;
  preferredLanguage: "en" | "fr" | "mfe";
  profileComplete: boolean;
  phoneVerified: boolean;
  profilePhotoAdded: boolean;
  idVerificationStatus: IdVerificationStatus;
  accountStatus: AccountStatus;
  roles: AppRole[];
  lastUsedRole: Exclude<AppRole, "admin"> | null;
};

export type CategoryKey =
  | "clothing"
  | "accessories"
  | "event_equipment"
  | "tools_equipment"
  | "electronics"
  | "sports_outdoor"
  | "baby_kids"
  | "party_occasion";
