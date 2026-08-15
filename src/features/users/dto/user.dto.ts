import { z } from "zod";
import { Role, UserStatus } from "../../../generated/prisma/enums";

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

export type GetAllUserDto = z.infer<typeof GetAllUserSchema>;