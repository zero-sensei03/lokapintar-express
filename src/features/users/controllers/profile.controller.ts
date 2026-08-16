import { NextFunction, Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import { sendError, sendSuccess } from "../../../utils/response";
import { formatDateTimeYMDHIS, getTimezoneFromReq } from "../../../utils/date";
import { createFileTypeSchema } from "../../../types/storage";
import { UpdatePasswordDTO, UpdateProfileDTO } from "../dto/user.dto";

export class ProfileController {
    private profileService: ProfileService;
    
    constructor(){
        this.profileService = new ProfileService();
    }

    me = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId || "";
            if (!userId) return sendError(res, "User profile not found", null, 404);

            const serviceResult = await this.profileService.me(userId);
            const timezone = getTimezoneFromReq(req);

            const result = {
                ...serviceResult,
                createdAt: serviceResult.createdAt ? formatDateTimeYMDHIS(serviceResult.createdAt, timezone) : null, 
                timezone
            }

            return sendSuccess(res, "User profile get successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }

    changeAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId || "";
            if (!userId) return sendError(res, "User profile not found", null, 404);
    
            const file = req.file;
            if (!file) {
                return sendError(res, "File avatar not found", null, 404)
            }

            const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
            const fileSchema = createFileTypeSchema(allowedMime);
            const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

            if (!validation.success) {
                return sendSuccess(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
            }
    
            const serviceResult = await this.profileService.changeAvatar(userId, file);
            const timezone = getTimezoneFromReq(req);

            const result = {
                ...serviceResult,
                createdAt: serviceResult.createdAt ? formatDateTimeYMDHIS(serviceResult.createdAt, timezone) : null, 
                timezone
            }

            return sendSuccess(res, "Avatar profile change successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }

    changeBanner = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId || "";
            if (!userId) return sendError(res, "User profile not found", null, 404);
    
            const file = req.file;
            if (!file) {
                return sendError(res, "File banner not found", null, 404)
            }

            const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
            const fileSchema = createFileTypeSchema(allowedMime);
            const validation = fileSchema.safeParse({ mimetype: file.mimetype, buffer: file.buffer });

            if (!validation.success) {
                return sendSuccess(res, "Error file validation", validation.error.flatten().fieldErrors, 400);
            }
    
            const serviceResult = await this.profileService.changeBanner(userId, file);
            const timezone = getTimezoneFromReq(req);

            const result = {
                ...serviceResult,
                createdAt: serviceResult.createdAt ? formatDateTimeYMDHIS(serviceResult.createdAt, timezone) : null, 
                timezone
            }

            return sendSuccess(res, "Avatar profile change successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }

    deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId || "";
            if (!userId) return sendError(res, "User profile not found", null, 404);
    
            const serviceResult = await this.profileService.deleteBanner(userId);
            const timezone = getTimezoneFromReq(req);

            const result = {
                ...serviceResult,
                createdAt: serviceResult.createdAt ? formatDateTimeYMDHIS(serviceResult.createdAt, timezone) : null, 
                timezone
            }

            return sendSuccess(res, "Banner profile deleted successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }

    patchProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId || "";
            if (!userId) return sendError(res, "User profile not found", null, 404);
    
           const payload: UpdateProfileDTO = req.body;
    
            const profile = await this.profileService.patchProfile(
                userId,
                payload
            );
            const timezone = getTimezoneFromReq(req);

            const result = {
                ...profile,
                createdAt: profile.createdAt ? formatDateTimeYMDHIS(profile.createdAt, timezone) : null, 
                timezone
            }

            return sendSuccess(res, "Data change successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }

    patchPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId || "";
            if (!userId) return sendError(res, "User profile not found", null, 404);
    
           const payload: UpdatePasswordDTO = req.body;
    
            const profile = await this.profileService.patchPassword(
                userId,
                payload
            );
            const timezone = getTimezoneFromReq(req);

            const result = {
                ...profile,
                createdAt: profile.createdAt ? formatDateTimeYMDHIS(profile.createdAt, timezone) : null, 
                timezone
            }

            return sendSuccess(res, "Password change successfully", result, 200);
        } catch (error) {
            next(error)
        }
    }
}