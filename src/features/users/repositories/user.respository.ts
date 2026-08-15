import { Prisma, User } from "../../../generated/prisma/client";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { PaginationResponse } from "../../../types/response.type";

export type UserModel = {
    name: string;
    email: string;
    role: Role;
    passwordHash: string;
}


export type GetAllUserFilter = {
    page: number;
    limit: number;
    search?: string | null;
    role?: Role | null;
    status?: UserStatus | null;
    roleNotIncluded?: Role[];
    isDeleted?: boolean;
}

export class UserRepository {
    async createUser(prisma: Prisma.TransactionClient, payload: UserModel): Promise<Partial<User>> {
        return await prisma.user.create({
            data: {
                email: payload.email,
                passwordHash: payload.passwordHash,
                role: payload.role,
                profile: {
                    create: {
                        fullName: payload.name
                    }
                }
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true,
                profile: {
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
                }
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
                email: true,
                role: true,
                passwordHash: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true,
                profile: {
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
                }
            }
        })
    }
    async getUserById(prisma: Prisma.TransactionClient, id: string): Promise<Partial<User> | null> {
        return await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true,
                profile: {
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
                }
            }
        })
    }
    async patchUser(prisma: Prisma.TransactionClient, id: string, payload: Partial<User>): Promise<Partial<User>> {
        return await prisma.user.update({
            where: {
                id
            },
            data: payload,
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                emailVerifiedAt: true,
                createdAt: true,
                profile: {
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
                }
            }
        })
    }
    async getAllUser(prisma: Prisma.TransactionClient, filter: GetAllUserFilter): Promise<PaginationResponse<Partial<User>[]>> {
        const {
            page,
            limit,
            search,
            role,
            status,
            roleNotIncluded = [],
            isDeleted = false
        } = filter;

        const skip = (page - 1) * limit;

        const roleFilter: Prisma.EnumRoleFilter = {
            ...(role
                ? {
                    equals: role,
                }
                : {}),

            ...(roleNotIncluded.length > 0
                ? {
                    notIn: roleNotIncluded,
                }
                : {}),
        };

        const where: Prisma.UserWhereInput = {
            ...(search
                ? {
                    OR: [
                        {
                            email: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            profile: {
                                fullName: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        },
                    ],
                }
                : {}),

            ...(Object.keys(roleFilter).length > 0
                ? {
                    role: roleFilter,
                }
                : {}),

            ...(status
                ? {
                    status,
                }
                : {}),

            ...(isDeleted
                ? {
                    deletedAt: {
                        not: null,
                    },
                }
                : {
                    deletedAt: null,
                }),
        };

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    emailVerifiedAt: true,
                    createdAt: true,

                    profile: {
                        select: {
                            fullName: true,
                            bio: true,
                            headline: true,
                            phoneNumber: true,
                            location: true,

                            avatar: {
                                select: {
                                    url: true,
                                },
                            },

                            banner: {
                                select: {
                                    url: true,
                                },
                            },
                        },
                    },
                },
            }),

            prisma.user.count({
                where,
            }),
        ]);

        return {
            items: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}