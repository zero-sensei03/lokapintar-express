import { CookieOptions } from "express";
import { Env } from "../config/Env";

const isProduction = Env.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
};

export { cookieOptions }