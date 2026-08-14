import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "../libs/prisma";
import { errorHandler } from "../middlewares/errorHandler";
import { authenticate, authorizeRoles } from "../middlewares/auth"
import { Env } from "./Env";
import { formatDateTime, getTimezoneFromReq } from "../utils/date";
import { sendSuccess } from "../utils/response";
import { corsMiddleware } from "./cors";
import { router } from "./router";
import { globalLimiter, securityHeaders } from "../middlewares/security";

const PORT = Env.PORT;

const app = express();
app.use(securityHeaders);
app.use(globalLimiter);
app.use(corsMiddleware)
app.use(cookieParser())

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/health", async (req, res) => {
  res.json({
    message: "Service is healthy",
    data: {
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: Env.NODE_ENV || "development",
    }
  })
});

app.use("/api", router)

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});