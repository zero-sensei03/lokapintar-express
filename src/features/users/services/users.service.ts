import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../libs/prisma";
import { ProfileRepository } from "../repositories/profile.repository";
import { UserRepository } from "../repositories/user.respository";

export class UserService {
    private userRepository: UserRepository;
    private profileRepository: ProfileRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.profileRepository = new ProfileRepository();
    }

    async getAllUser (userRole: Role, page: number = 1, limit: number = 10, search?: string | null, role?: Role | null, status?: UserStatus | null, isDeleted: boolean = false){
        const data = await this.userRepository.getAllUser(
            prisma,
            {
                page,
                limit,
                search,
                role,
                status,
                roleNotIncluded: userRole === "SUPERADMIN" ? ["SUPERADMIN"] : ( userRole === "ADMIN" ? ["SUPERADMIN", "ADMIN"] : [] ),
                isDeleted
            }
        )

        return {
            items: data.items,
            metadata: {
                total: data.total,
                page: data.page,
                limit: data.limit,
                totalPages: data.totalPages,
            }
        }
    }

    async getUserById (id: string) {
        const user = await this.userRepository.getUserById(prisma, id);
        return user
    }
}