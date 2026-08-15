import { Prisma, User, UserProfile } from "../../../generated/prisma/client";

export class ProfileRepository {
    async createProfile(prisma: Prisma.TransactionClient, userId: string, payload: Partial<UserProfile>): Promise<Partial<UserProfile>> {
        return await prisma.userProfile.create({
            data: {
                ...payload,
                userId,
                fullName: payload.fullName || ""
            },
        })
    }
    async patchProfile(prisma: Prisma.TransactionClient, id: string, payload: Partial<UserProfile>): Promise<Partial<UserProfile>> {
        return await prisma.userProfile.update({
            where: {
                userId: id
            },
            data: payload,
            include: {
                avatar: {
                    select: {
                        url: true
                    }
                },
                banner: {
                    select: {
                        url: true
                    }
                }
            }
        })
    }
}