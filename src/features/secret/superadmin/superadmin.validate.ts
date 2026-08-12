import { z } from "zod";

// Schema Register
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Nama wajib diisi" })
      .min(3, "Nama minimal 3 karakter"),
    email: z
      .string({ message: "Email wajib diisi" })
      .email("Format email tidak valid"),
    password: z
      .string({ message: "Password wajib diisi" })
      .min(8, "Password minimal 8 karakter"),
    role: z
      .enum(["SUPERADMIN", "EDUCATOR", "CREATOR", "CONSUMER"])
      .optional(),
  }),
});

// Schema Login
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email wajib diisi" })
      .email("Format email tidak valid"),
    password: z
      .string({ message: "Password wajib diisi" }),
  }),
});

// Example Schema Params / Query
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Format ID User tidak valid (wajib UUID)"),
  }),
});