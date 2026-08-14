import cors, { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: ["https://app.apidog.com", "http://localhost:3000"], 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-timezone", "x-sa-signature"],
  credentials: true, // Wajib agar Cookie bisa dikirim & diterima
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);