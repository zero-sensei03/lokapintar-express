import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../libs/prisma"
import { hashPassword } from "../../../utils/bcrypt";

export interface CreateSuperAdminInterface {
  name: string;
  email: string;
  password: string;
}

export const CreateUser = async (data: CreateSuperAdminInterface) => {
    const payload = {
        email: data.email.toLowerCase(),
        passwordHash: await hashPassword(data.password),
        role: Role.SUPERADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
    }
    const profilePayload = {
        fullName: data.name.trim(),
    }

    return prisma.user.upsert({
        where: {
            email: data.email
        },
        create: {
            ...payload,
            profile: {
                create: profilePayload
            }
        },
        update: {
            ...payload,
            profile: {
                upsert: {
                    create: profilePayload,
                    update: profilePayload
                }
            }
        },
        select: {
            email: true,
            role: true,
            status: true,
            emailVerifiedAt: true,
            createdAt: true,
            profile: true
        }
    })
}