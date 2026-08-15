import { Router } from "express";
import { formatDateTime, getTimezoneFromReq } from "../utils/date";
import { prisma } from "../libs/prisma";
import { sendSuccess } from "../utils/response";
import { SuperAdminRouter } from "../features/secret/superadmin/superadmin.router";
import { CaptchRouter } from "../features/captcha/captcha.router";
import { authRouter } from "../features/users/routes/auth.route";
import { authenticate } from "../middlewares/auth";
import { profileRouter } from "../features/users/routes/profile.router";
import { UserRouter } from "../features/users/routes/user.route";

const router = Router()

router.use("/secret", SuperAdminRouter)
router.use("/captcha", CaptchRouter)
router.use("/auth", authRouter)

router.use("/profile", authenticate, profileRouter)
router.use("/users", authenticate, UserRouter)


export { router }