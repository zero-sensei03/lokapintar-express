import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterSchema, RequestLoginDTO, RequestRegisterDTO } from "../dto/auth.dto";
import { sendError, sendSuccess } from "../../../utils/response";
import { verifyCaptcha } from "../../../utils/captcha";
import { RequestOTPVerifyDTO } from "../dto/otp.dto";
import { cookieOptions } from "../../../utils/cookie";
import { parseDurationToMs } from "../../../utils/parseDuration";
import { Env } from "../../../config/Env";

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
    requestOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            if(!email) return sendError(res, "Email is required", null, 422);

            const result = await this.authService.requestOtp(email);
            return sendSuccess(res, "OTP has been sent successfully. Please check your email to continue registration.", result, 201);
        } catch (error) {
            next(error)
        }
    }
    verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: RequestOTPVerifyDTO = req.body;

            const result = await this.authService.verifyOtp(payload);
            return sendSuccess(res, "Email verified successfully. You can now login.", result, 200);
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: RequestLoginDTO = req.body;

            const checkCaptcha = verifyCaptcha(payload.captchaAnswer, payload.captchaToken)

            if(!checkCaptcha) {
                return sendError(res, "Invalid or incorrect CAPTCHA", null, 400)
            }

            const result = await this.authService.login(payload);

            res.cookie("accessToken", result.accessToken, {
                ...cookieOptions,
                maxAge: parseDurationToMs(
                    Env.JWT_ACCESS_EXPIRES_IN
                ),
            });
            res.cookie("refreshToken", result.refreshToken, {
                ...cookieOptions,
                maxAge: parseDurationToMs(
                    Env.JWT_REFRESH_EXPIRES_IN
                ),
            });

            return sendSuccess(res, "Congratulation!, You has been login succesfully", { user: result.user }, 200);
        } catch (error) {
            next(error)
        }
    }
}