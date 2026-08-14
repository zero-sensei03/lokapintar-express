import cors, { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: "*", // Mengizinkan semua origin/domain
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: "*", // Mengizinkan semua custom header (termasuk x-timezone, Authorization, dll)
  optionsSuccessStatus: 200,
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);