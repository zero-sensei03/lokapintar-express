import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { sendError } from "../utils/response";

/**
 * Helmet: Mengamankan HTTP Headers (Hide X-Powered-By, Anti-XSS, Clickjacking protection)
 */
export const securityHeaders = helmet();

/**
 * Rate Limiter Umum untuk Seluruh API
 * Maksimal 100 request per 15 menit per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      "Terlalu banyak permintaan dari IP ini. Silakan coba lagi nanti.",
      null,
      429
    );
  },
});

/**
 * Rate Limiter Ketat untuk Endpoint Sensitif (Login / Register / Upsert)
 * Maksimal 5 percobaan per 15 menit per IP
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      "Terlalu banyak percobaan akses. Silakan coba lagi setelah 15 menit.",
      null,
      429
    );
  },
});