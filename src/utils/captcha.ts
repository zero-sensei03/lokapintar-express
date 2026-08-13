import svgCaptcha from "svg-captcha";
import jwt from "jsonwebtoken";
import { Env } from "../config/Env";

export interface CaptchaPayload {
  text: string;
}

export const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 3,
    color: true,
    background: "#f0f0f0",
    width: 150,
    height: 50,
  });

  const captchaToken = jwt.sign(
    { text: captcha.text.toLowerCase() },
    Env.JWT_ACCESS_SECRET,
    { expiresIn: "5m" }
  );

  // SVG asli
  const imageSvg = captcha.data;

  // Konversi SVG menjadi Base64 yang benar
  const base64 = Buffer.from(imageSvg, "utf-8").toString("base64");

  // Data URI untuk langsung digunakan di <img src="">
  const base64Svg = `data:image/svg+xml;base64,${base64}`;

  return {
    imageSvg,
    base64Svg,
    captchaToken,
  };
};

export const verifyCaptcha = (
  inputText: string,
  token: string
): boolean => {
  try {
    const decoded = jwt.verify(
      token,
      Env.JWT_ACCESS_SECRET
    ) as CaptchaPayload;

    return decoded.text === inputText.toLowerCase();
  } catch {
    return false;
  }
};