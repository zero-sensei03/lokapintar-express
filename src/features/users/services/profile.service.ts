import { Decimal } from "@prisma/client/runtime/client";
import { UserProfile } from "../../../generated/prisma/client";
import { prisma } from "../../../libs/prisma";
import { storageService } from "../../../libs/storage.service";
import { AppError } from "../../../utils/AppError";
import { comparePassword, hashPassword } from "../../../utils/bcrypt";
import { agentResult } from "../../../utils/userAgent";
import { AuditService } from "../../audit/service";
import { MediaModel, MediaRepository } from "../../media/repository/media.repository";
import { UpdatePasswordDTO, UpdateProfileDTO } from "../dto/user.dto";
import { ProfileRepository } from "../repositories/profile.repository";
import { UserRepository } from "../repositories/user.respository";

export class ProfileService {
    private userRepository: UserRepository;
    private mediaRepository: MediaRepository;
    private profileRepository: ProfileRepository;
    private auditService: AuditService;

    constructor(){
        this.userRepository = new UserRepository();
        this.mediaRepository = new MediaRepository();
        this.profileRepository = new ProfileRepository();
        this.auditService = new AuditService();
    }

    async me(userId: string) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);
        if (user.status !== "ACTIVE") throw new AppError("Your account is not active.", 403);

        return user;
    }

    async changeAvatar(agent: agentResult, userId: string, file: Express.Multer.File) {
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
                const userData = await this.profileRepository.patchProfile(tx, user.id || "", { avatarId: avatarResult.id })
                await this.auditService.create(
                    prisma, 
                    userId,
                    "UPDATE",
                    "USER AVATAR",
                    userData.id,
                    agent,
                    user,
                    userData
                )
                return userData
            })
        } catch (error) {
            throw error;
        }


    }

    async changeBanner(agent: agentResult, userId: string, file: Express.Multer.File) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);

        const bannerFile = await storageService.upload(file.buffer, file.mimetype, {
            folder: 'banners',
        });

        try {
            return await prisma.$transaction(async (tx) => {
                const payloadMedia: MediaModel = {
                    filename: file.originalname,
                    key: bannerFile.key,
                    url: bannerFile.url,
                    mimetype: bannerFile.mimetype,
                    size: file.size,
                    provider: bannerFile.provider
                }
                const bannerResult = await this.mediaRepository.createMedia(tx, payloadMedia)
                const userData = await this.profileRepository.patchProfile(tx, user.id || "", { bannerId: bannerResult.id })

                await this.auditService.create(
                    prisma, 
                    userId,
                    "UPDATE",
                    "USER BANNER",
                    userData.id,
                    agent,
                    user,
                    userData
                )

                return userData;
            })
        } catch (error) {
            throw error;
        }


    }

    async deleteBanner(agent: agentResult, userId: string) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);

        try {
            return await prisma.$transaction(async (tx) => {
                if(user.profile && user.profile.banner) {
                    await storageService.delete(user.profile.banner.key)
                    await this.mediaRepository.deleteMedia(tx, user.profile.banner.id)
                    const userData = await this.profileRepository.patchProfile(tx, user.id || "", { bannerId: null })
                    await this.auditService.create(
                        prisma, 
                        userId,
                        "DELETE",
                        "USER BANNER",
                        user.profile.bannerId,
                        agent,
                        user
                    )
                    return userData
                } else {
                    throw new AppError("There is no banner found for this user")
                }
            })
        } catch (error) {
            throw error;
        }


    }

    async patchProfile(agent: agentResult, userId: string, payload: UpdateProfileDTO) {
        const user = await this.userRepository.getUserById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);
        
        return await prisma.$transaction(async (prisma) => {
            const payloadToSend: Partial<UserProfile> = {
                ...payload,
                interests: payload.interests ?? [],
                skills: payload.skills ?? [],
                latitude: payload.latitude ? Decimal(payload.latitude) : null,
                longitude: payload.longitude ? Decimal(payload.longitude) : null,
            }
            const profile = await this.profileRepository.patchProfile(
                prisma,
                userId,
                payloadToSend
            );

            await this.auditService.create(
                prisma, 
                userId,
                "UPDATE",
                "PROFILE",
                profile.id,
                agent,
                user,
                profile
            )

            return profile;
        });
    }

    async patchPassword(agent: agentResult, userId: string, payload: UpdatePasswordDTO) {
        const user = await this.userRepository.getUserPasswordById(prisma, userId);
        if (!user) throw new AppError("User account could not be found.", 404);

        const isPasswordValid = await comparePassword(payload.oldPassword, user.passwordHash);
        if (!isPasswordValid) throw new AppError("The old password is incorrect.", 400)
        
        return await prisma.$transaction(async (prisma) => {
            const newPassword = await hashPassword(payload.newPassword);
            const userData = await this.userRepository.patchUser(prisma, userId, { passwordHash: newPassword })

            await this.auditService.create(
                prisma, 
                userId,
                "PASSWORD_CHANGE",
                "PROFILE",
                userData.id,
                agent
            )

            return userData;
        });
    }


}