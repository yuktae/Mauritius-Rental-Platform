import { z } from "zod";

import { APP_ROLES } from "@boro/types";

export const signupRoleSchema = z
  .array(z.enum(APP_ROLES))
  .min(1)
  .refine((roles) => !roles.includes("admin"), {
    message: "Admin signup is not public."
  });

export const emailPasswordSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  roles: signupRoleSchema,
  termsAccepted: z.literal(true),
  privacyAccepted: z.literal(true)
});

export const mandatoryProfileSchema = z.object({
  fullLegalName: z.string().min(2),
  displayName: z.string().min(2).optional(),
  phoneNumber: z.string().min(7),
  locationRegion: z.string().min(2),
  preferredLanguage: z.enum(["en", "fr", "mfe"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
