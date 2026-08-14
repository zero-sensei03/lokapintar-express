import "dotenv/config";

export const Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_URL: process.env.APP_URL || "http://localhost:3000",
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

  // stprage
  STORAGE_TYPE: process.env.STORAGE_TYPE || "local",
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR || "storage/uploads",
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
  GCS_BASE_URL: process.env.GCS_BASE_URL,
  GCS_PROJECT_ID: process.env.GCS_PROJECT_ID,
  GCS_KEY_FILE_PATH: process.env.GCS_KEY_FILE_PATH,
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
};

// Validasi saat startup
if (!Env.DATABASE_URL) {
  throw new Error("FATAL: DATABASE_URL is not configured in .env file.");
}