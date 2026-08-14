import svgCaptcha from "svg-captcha";
import jwt from "jsonwebtoken";
import { Env } from "../config/Env";

export interface CaptchaPayload {
  text: string;
}

/**
 * Generate SVG CAPTCHA beserta token verifikasi
 */
export const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 3,
    color: true,
    background: "#f0f0f0",
    width: 150,
    height: 50,
  });

  /**
   * Simpan text CAPTCHA PERSIS seperti yang dibuat.
   *
   * Jangan menggunakan toLowerCase() / toUpperCase()
   * karena CAPTCHA bersifat case-sensitive.
   */
  const captchaToken = jwt.sign(
    {
      text: captcha.text,
    },
    Env.JWT_ACCESS_SECRET,
    {
      expiresIn: "5m",
    }
  );

  /**
   * SVG asli
   */
  const imageSvg = captcha.data;

  /**
   * Konversi SVG menjadi Base64
   */
  const base64 = Buffer
    .from(imageSvg, "utf-8")
    .toString("base64");

  /**
   * Data URI yang bisa langsung digunakan
   * sebagai src pada <img>
   */
  const base64Svg = `data:image/svg+xml;base64,${base64}`;

  return {
    imageSvg,
    base64Svg,
    captchaToken,
  };
};

/**
 * Verify CAPTCHA
 *
 * CAPTCHA bersifat CASE-SENSITIVE.
 *
 * Contoh:
 * CAPTCHA       : Ab7XkP
 * Input benar   : Ab7XkP
 * Input salah   : ab7xkp
 * Input salah   : AB7XKP
 */
export const verifyCaptcha = (
  inputText: string,
  token: string
): boolean => {
  try {
    const decoded = jwt.verify(
      token,
      Env.JWT_ACCESS_SECRET
    ) as CaptchaPayload;

    /**
     * Trim hanya untuk menghindari spasi tidak sengaja
     * di awal / akhir input.
     *
     * Tidak menggunakan lowercase/uppercase,
     * sehingga tetap CASE-SENSITIVE.
     */
    return decoded.text === inputText.trim();
  } catch {
    return false;
  }
};