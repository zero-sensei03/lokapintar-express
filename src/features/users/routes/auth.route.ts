import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../../../middlewares/validate";
import { LoginSchema, RegisterSchema } from "../dto/auth.dto";
import { OTPVerifySchema } from "../dto/otp.dto";
import { strictAuthLimiter } from "../../../middlewares/security";

const router = Router();
const authController = new AuthController();

router.post("/sign-up", validate(RegisterSchema), authController.register);
router.post("/sign-up/otp/request", authController.requestOtp);
router.post("/sign-up/otp/verify", validate(OTPVerifySchema), authController.verifyOtp);

router.post("/sign-in", strictAuthLimiter, validate(LoginSchema), authController.login);

export { router as authRouter }