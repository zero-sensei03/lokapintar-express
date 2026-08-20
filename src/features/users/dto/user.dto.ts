import { z } from "zod";
import { Role, UserStatus } from "../../../generated/prisma/enums";

const nullableOptionalString = (schema: z.ZodString) =>
  schema.optional().nullable();

const nullableOptionalUrl = () =>
  z
    .string()
    .url("Please provide a valid URL.")
    .optional()
    .nullable()
    .or(z.literal(""));

export const GetAllUserSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    search: z
        .string()
        .trim()
        .optional(),

    role: z
        .nativeEnum(Role)
        .optional(),

    status: z
        .nativeEnum(UserStatus)
        .optional(),

    isDeleted: z
        .coerce
        .boolean()
        .default(false),
});
export const createUserSchema = z.object({
  body: z.object({
      // Required
      fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters.")
        .max(100, "Full name must not exceed 100 characters."),
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
      // Required
      fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters.")
        .max(100, "Full name must not exceed 100 characters."),
    
      // Optional
      headline: nullableOptionalString(
        z.string().max(100, "Headline must not exceed 100 characters.")
      ),
    
      bio: nullableOptionalString(
        z.string().max(1000, "Bio must not exceed 1000 characters.")
      ),
    
      phoneNumber: nullableOptionalString(
        z.string().max(30, "Phone number must not exceed 30 characters.")
      ),
    
      location: nullableOptionalString(
        z.string().max(150, "Location must not exceed 150 characters.")
      ),

      address: nullableOptionalString(
        z.string().max(1000, "Address must not exceed 1000 characters.")
      ),

      zipPortal: nullableOptionalString(
        z.string().max(10, "ZIP/Postal code must not exceed 10 characters.")
      ),

      latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90.")
        .max(90, "Latitude must be between -90 and 90.")
        .optional()
        .nullable(),

      longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180.")
        .max(180, "Longitude must be between -180 and 180.")
        .optional()
        .nullable(),
    
      interests: z
        .array(z.string())
        .optional()
        .nullable(),
    
      skills: z
        .array(z.string())
        .optional()
        .nullable(),
    
      websiteUrl: nullableOptionalUrl(),
    
      linkedinUrl: nullableOptionalUrl(),
    
      githubUrl: nullableOptionalUrl(),
    
      twitterUrl: nullableOptionalUrl(),

      
      avatarId: z
        .string()
        .uuid("Avatar ID must be a valid UUID.")
        .optional()
        .nullable(),

      bannerId: z
        .string()
        .uuid("Banner ID must be a valid UUID.")
        .optional()
        .nullable(),
  })
});

export const UpdatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string("Old Password is required")
      .min(8, "Old Password must be at least 8 characters")
      .max(128, "Old Password must not exceed 128 characters"),

    newPassword: z
      .string("New Password is required")
      .min(8, "New Password must be at least 8 characters")
      .max(128, "New Password must not exceed 128 characters")
      .regex(
        /[a-z]/,
        "New Password must contain at least one lowercase letter"
      )
      .regex(
        /[A-Z]/,
        "New Password must contain at least one uppercase letter"
      )
      .regex(
        /[0-9]/,
        "New Password must contain at least one number"
      )
      .regex(
        /[^A-Za-z0-9]/,
        "New Password must contain at least one special character"
      ),

    passwordVerification: z
      .string("Password verification is required")
      .min(1, "Password verification is required")
      .max(128, "Password verification must not exceed 128 characters"),
  }),
})
.superRefine((data, ctx) => {
  if (data.body.newPassword !== data.body.passwordVerification) {
    ctx.addIssue({
      code: "custom",
      path: ["body", "passwordVerification"],
      message: "Password verification does not match password",
    });
  }
});


export type GetAllUserDto = z.infer<typeof GetAllUserSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>["body"];
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordSchema>["body"];