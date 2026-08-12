import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../../libs/prisma"
import { hashPassword } from "../../../utils/bcrypt";

export interface CreateSuperAdminInterface {
  name: string;
  email: string;
  password: string;
}

export const CreateUser = async (data: CreateSuperAdminInterface) => {
    const payload = {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        passwordHash: await hashPassword(data.password),
        role: Role.SUPERADMIN
    }
    return prisma.user.upsert({
        where: {
            email: data.email
        },
        create: payload,
        update: payload,
        select: {
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    })
}