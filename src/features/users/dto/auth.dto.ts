import z from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    email: z
      .string("Email is required")
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters"),

    name: z
      .string("Name is required")
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must not exceed 120 characters")
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        "Name can only contain letters, spaces, apostrophes, and hyphens"
      ),

    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter"
      )
      .regex(
        /[0-9]/,
        "Password must contain at least one number"
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    captchaToken: z
      .string("Captcha token is required")
      .trim()
      .min(1, "Captcha token is required"),

    captchaAnswer: z
      .string("Captcha answer is required")
      .trim()
      .min(1, "Captcha answer is required"),
  }),
});

export type RequestRegisterDTO = z.infer<typeof RegisterSchema>["body"];