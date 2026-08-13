import svgCaptcha from "svg-captcha";
import jwt from "jsonwebtoken";
import { Env } from "../config/Env";

export interface CaptchaPayload {
  text: string;
}

/**
 * Generate SVG Captcha beserta Encrypted Token
 */
export const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 6, // 4 karakter
    noise: 3, // garis distractor
    color: true,
    background: "#f0f0f0",
    width: 150,
    height: 50,
  });

  // Encrypt teks captcha ke dalam JWT Token berdurasi singkat (misal: 5 menit)
  const captchaToken = jwt.sign(
    { text: captcha.text.toLowerCase() },
    Env.JWT_ACCESS_SECRET,
    { expiresIn: "5m" }
  );

  return {
    imageSvg: captcha.data, // Kembalikan string SVG ke frontend
    captchaToken, // Token JWT dikirim ke frontend untuk dikirim balik saat submit
  };
};

/**
 * Verifikasi apakah input captcha sesuai dengan token
 */
export const verifyCaptcha = (inputText: string, token: string): boolean => {
  try {
    const decoded = jwt.verify(token, Env.JWT_ACCESS_SECRET) as CaptchaPayload;
    return decoded.text === inputText.toLowerCase();
  } catch {
    return false; // Token expired / invalid
  }
};