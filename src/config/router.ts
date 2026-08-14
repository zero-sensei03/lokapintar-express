import { Router } from "express";
import { formatDateTime, getTimezoneFromReq } from "../utils/date";
import { prisma } from "../libs/prisma";
import { sendSuccess } from "../utils/response";
import { SuperAdminRouter } from "../features/secret/superadmin/superadmin.router";
import { CaptchRouter } from "../features/captcha/captcha.router";
import { authRouter } from "../features/users/routes/auth.route";
import { authenticate } from "../middlewares/auth";
import { profileRouter } from "../features/users/routes/profile.router";

const router = Router()

router.get("/users", async (req, res, next) => {
  try {
    const timezone = getTimezoneFromReq(req);
    console.log("timezone1", timezone)
    const users = await prisma.user.findMany();

    // Format tanggal createdAt sesuai timezone client
    const formattedUsers = users.map((user) => ({
      ...user,
      createdAtFormatted: formatDateTime(user.createdAt, timezone),
    }));

    return sendSuccess(res, "Data users berhasil diambil", formattedUsers);
  } catch (err) {
    next(err);
  }
});

router.use("/secret", SuperAdminRouter)
router.use("/captcha", CaptchRouter)
router.use("/auth", authRouter)
router.use("/profile", authenticate, profileRouter)


export { router }