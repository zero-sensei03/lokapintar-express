import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../../../middlewares/validate";
import { RegisterSchema } from "../dto/auth.dto";

const router = Router();
const authController = new AuthController();

router.post("/sign-up", validate(RegisterSchema), authController.register);

export { router as authRouter }