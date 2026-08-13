import "dotenv/config";

export const Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000",

  // JWT Configuration
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "default_access_secret_key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Mail Server
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER || "",
  EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD || "",
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  EMAIL_SERVER_PORT: Number(process.env.EMAIL_SERVER_PORT || "587"),
  EMAIL_SERVER_SECURE: process.env.EMAIL_SERVER_SECURE ? process.env.EMAIL_SERVER_SECURE.toLowerCase() === "true" ? true : false : false,
  EMAIL_FROM: process.env.EMAIL_FROM || "",
};

// Validasi saat startup
if (!Env.DATABASE_URL) {
  throw new Error("FATAL: DATABASE_URL is not configured in .env file.");
}