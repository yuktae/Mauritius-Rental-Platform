import type { AccountStatus, AppRole, IdVerificationStatus } from "@boro/types";

export type AuthRouteDecisionInput = {
  isLoggedIn: boolean;
  authProvider?: "email" | "google";
  emailVerified: boolean;
  accountStatus: AccountStatus;
  profileComplete: boolean;
  idVerificationStatus: IdVerificationStatus;
  roles: AppRole[];
  lastUsedRole?: Exclude<AppRole, "admin">;
};

export type AppDestination =
  | "public-browse"
  | "otp-verification"
  | "mandatory-profile"
  | "blocked-account"
  | "id-resubmission"
  | "limited-renter-home"
  | "limited-owner-home"
  | "renter-home"
  | "owner-home"
  | "admin-dashboard";

export function decidePostLoginDestination(
  input: AuthRouteDecisionInput
): AppDestination {
  if (!input.isLoggedIn) {
    return "public-browse";
  }

  if (input.accountStatus === "suspended") {
    return "blocked-account";
  }

  if (!input.emailVerified) {
    return "otp-verification";
  }

  if (!input.profileComplete) {
    return "mandatory-profile";
  }

  if (input.roles.includes("admin")) {
    return "admin-dashboard";
  }

  if (
    input.idVerificationStatus === "id_rejected" ||
    input.idVerificationStatus === "id_expired"
  ) {
    return "id-resubmission";
  }

  const preferredRole = resolvePreferredRole(input.roles, input.lastUsedRole);
  const isVerified = input.idVerificationStatus === "id_verified";

  if (preferredRole === "owner") {
    return isVerified ? "owner-home" : "limited-owner-home";
  }

  return isVerified ? "renter-home" : "limited-renter-home";
}

function resolvePreferredRole(
  roles: AppRole[],
  lastUsedRole?: Exclude<AppRole, "admin">
): Exclude<AppRole, "admin"> {
  if (lastUsedRole && roles.includes(lastUsedRole)) {
    return lastUsedRole;
  }

  if (roles.includes("renter")) {
    return "renter";
  }

  return "owner";
}
