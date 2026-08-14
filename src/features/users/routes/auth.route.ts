import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../../../middlewares/validate";
import { LoginSchema, RegisterSchema, ResetPasswordSchema } from "../dto/auth.dto";
import { OTPVerifySchema } from "../dto/otp.dto";
import { strictAuthLimiter } from "../../../middlewares/security";
import { authenticate } from "../../../middlewares/auth";

const router = Router();
const authController = new AuthController();

router.post("/sign-up", validate(RegisterSchema), authController.register);
router.post("/sign-up/otp/request", authController.requestOtp);
router.post("/sign-up/otp/verify", validate(OTPVerifySchema), authController.verifyOtp);

router.post("/sign-in", strictAuthLimiter, validate(LoginSchema), authController.login);
router.post("/refresh", authController.refresh);

router.post("/forgot-password", authController.forgotPassword);
router.post("/forgot-password/verify", validate(OTPVerifySchema), authController.verifyResetOtp);
router.post("/forgot-password/reset", validate(ResetPasswordSchema), authController.resetPassword);

export { router as authRouter }