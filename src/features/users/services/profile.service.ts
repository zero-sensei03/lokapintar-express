import { prisma } from "../../../libs/prisma";
import { storageService } from "../../../libs/storage.service";
import { AppError } from "../../../utils/AppError";
import { MediaModel, MediaRepository } from "../../media/repository/media.repository";
import { UserRepository } from "../repositories/user.respository";

export class ProfileService {
    private userRepository: UserRepository;
    private mediaRepository: MediaRepository;

    constructor(){
        this.userRepository = new UserRepository();
        this.mediaRepository = new MediaRepository();
    }

    async me(userId: string) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);
        if (user.status !== "ACTIVE") throw new AppError("Your account is not active.", 403);

        return user;
    }

    async changeAvatar(userId: string, file: Express.Multer.File) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);

        const avatarFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'avatars',
        });

        try {
            return await prisma.$transaction(async (tx) => {
                const payloadMedia: MediaModel = {
                    filename: file.originalname,
                    key: avatarFile.key,
                    url: avatarFile.url,
                    mimetype: avatarFile.mimetype,
                    size: file.size,
                    provider: avatarFile.provider
                }
                const avatarResult = await this.mediaRepository.createMedia(tx, payloadMedia)
                return await this.userRepository.patchUser(tx, user.id || "", { avatarId: avatarResult.id })
            })
        } catch (error) {
            throw error;
        }


    }


}