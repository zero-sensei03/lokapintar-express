import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterSchema, RequestRegisterDTO } from "../dto/auth.dto";
import { sendError, sendSuccess } from "../../../utils/response";
import { verifyCaptcha } from "../../../utils/captcha";

export class AuthController {
    private authService: AuthService;

    constructor(){
        this.authService = new AuthService();
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: RequestRegisterDTO = req.body;

            const checkCaptcha = verifyCaptcha(payload.captchaAnswer, payload.captchaToken)

            if(!checkCaptcha) {
                return sendError(res, "Invalid or incorrect CAPTCHA", null, 400)
            }

            const result = await this.authService.register(payload);
            return sendSuccess(res, "Data registered successfully, Check your email to continue registration", result, 201);
        } catch (error) {
            next(error)
        }
    }
}