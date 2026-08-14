import z from "zod";

export const OTPVerifySchema = z.object({
  body: z.object({
    email: z
      .string("Email is required")
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters"),

    otp: z
      .string("OTP code is required")
      .trim()
      .min(1, "OTP code is required")
  }),
})

export type RequestOTPVerifyDTO = z.infer<typeof OTPVerifySchema>["body"];