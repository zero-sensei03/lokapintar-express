import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../../utils/response";
import { comparePassword } from "../../../utils/bcrypt";
import { CreateSuperAdminInterface, CreateUser } from "./superadmin.service";
import { formatDateTimeYMDHIS, getTimezoneFromReq } from "../../../utils/date";
import { signatureLocked } from "../key";

export class SuperAdminController {
    static CreateSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {

        const payload: CreateSuperAdminInterface = req.body;

        const signature = req.headers["x-sa-signature"] as string;
        if(!signature) sendError(res, "Signature not found", null, 404);

        const signCheck = await comparePassword(signature, signatureLocked)
        if(!signCheck) sendError(res, "Signature is not valid", null, 404);

        const timezone = getTimezoneFromReq(req);
        try {
            const result = await CreateUser(payload);

            const userResult = {
                ...result,
                createdAt: formatDateTimeYMDHIS(result.createdAt, timezone), 
                timezone
            }

            return sendSuccess(res, "Data get successfully", userResult, 200)
        } catch (error) {
            next(error);
        }
    }
}