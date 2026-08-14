import { Router } from "express";
import { generateCaptcha } from "../../utils/captcha";
import { sendSuccess } from "../../utils/response";

const router = Router();

router.post("/", (_req, res) => {
  const { base64Svg, captchaToken } = generateCaptcha();
  return sendSuccess(res, "Captcha berhasil dibuat", {
    base64Svg,
    captchaToken,
  });
})

export { router as CaptchRouter }