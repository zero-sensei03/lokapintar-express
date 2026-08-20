import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/users.service";
import { sendError, sendSuccess } from "../../../utils/response";
import { GetAllUserSchema } from "../dto/user.dto";
import { Role } from "../../../generated/prisma/enums";
import { formatDateTimeYMDHIS, getTimezoneFromReq } from "../../../utils/date";
import { userAgent } from "../../../utils/userAgent";

export class UserController {
    private userService: UserService;

    constructor(){
        this.userService = new UserService();
    }

    getAll = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = req.user;
            if (!userData?.userId) return sendError(res, "User profile not found", null, 404);

            const query = GetAllUserSchema.parse(req.query);
            const serviceResult = await this.userService.getAllUser(
                userData.role as Role || "CONSUMER",
                query.page,
                query.limit,
                query.search,
                query.role,
                query.status,
                query.isDeleted
            );

            const timezone = getTimezoneFromReq(req);
            const userResult = serviceResult.items.map(item => ({
                ...item,
                createdAt: item.createdAt ? formatDateTimeYMDHIS(item.createdAt, timezone) : null, 
                timezone
            }))

            const result = {
                ...serviceResult,
                items: userResult
            }

            return sendSuccess(res, "Users retrieved successfully", result);


        } catch (error) {
            next(error)
        }
    }

    getById = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = req.user;
            if (!userData?.userId) return sendError(res, "User profile not found", null, 404);

            const { id } = req.params;
            const serviceResult = await this.userService.getUserById(id.toString());
            if (!serviceResult) return sendError(res, "User profile not found", null, 404);

            const timezone = getTimezoneFromReq(req);
            const userResult = {
                ...serviceResult,
                createdAt: serviceResult.createdAt ? formatDateTimeYMDHIS(serviceResult.createdAt, timezone) : null, 
                timezone
            }

            const result = {
                ...serviceResult,
                items: userResult
            }

            return sendSuccess(res, "Users retrieved successfully", result);


        } catch (error) {
            next(error)
        }
    }

    createUser = async(req: Request, res: Response, next: NextFunction) => {
        try {

            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }

    updateUser = async(req: Request, res: Response, next: NextFunction) => {
        try {

            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }

    updatePassword = async(req: Request, res: Response, next: NextFunction) => {
        try {

            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }

    updateStatus = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }

    deleteUser = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }

    restoreUser = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }
    permanentlyDelete = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await userAgent(req);
        } catch (error) {
            next(error)
        }
    }
}