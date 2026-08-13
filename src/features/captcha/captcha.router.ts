import { Router } from "express";
import { generateCaptcha } from "../../utils/captcha";
import { sendSuccess } from "../../utils/response";

const router = Router();

router.post("/", (_req, res) => {
  const { imageSvg, captchaToken } = generateCaptcha();
  return sendSuccess(res, "Captcha berhasil dibuat", {
    imageSvg,
    captchaToken,
  });
})

export { router as CaptchRouter }