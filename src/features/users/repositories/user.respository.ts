import { Prisma, User } from "../../../generated/prisma/client";
import { Role, UserStatus } from "../../../generated/prisma/enums";

export type UserModel = {
    name: string;
    email: string;
    role: Role;
    passwordHash: string;
    avatarUrl: string | null;
}

export class UserRepository {
    async createUser(prisma: Prisma.TransactionClient, payload: UserModel): Promise<Partial<User>> {
        return await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                passwordHash: payload.passwordHash,
                avatarUrl: payload.avatarUrl,
                role: payload.role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true
            }
        })
    }
    async activatedUser(prisma: Prisma.TransactionClient, email: string, payload: { emailVerifiedAt: Date, status: UserStatus }): Promise<Partial<User>> {
        return await prisma.user.update({
            where: {
                email
            },
            data: {
                emailVerifiedAt: payload.emailVerifiedAt,
                status: payload.status
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true
            }
        })
    }
    async getUserByEmail(prisma: Prisma.TransactionClient, email: string): Promise<Partial<User> | null> {
        return await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                passwordHash: true,
                avatarUrl: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true
            }
        })
    }
}