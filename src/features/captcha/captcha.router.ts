import { Router } from "express";
import { generateCaptcha } from "../../utils/captcha";
import { sendSuccess } from "../../utils/response";

const router = Router();

router.post("/", (_req, res) => {
  const { imageSvg, base64Svg, captchaToken } = generateCaptcha();
  return sendSuccess(res, "Captcha berhasil dibuat", {
    imageSvg,
    base64Svg,
    captchaToken,
  });
})

export { router as CaptchRouter }