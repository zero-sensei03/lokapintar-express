import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";
import { parsePrismaError } from "../utils/prismaError";
import { sendError } from "../utils/response";
import { Env } from "../config/Env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Tangani khusus error dari Prisma Client Known Request
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode, message } = parsePrismaError(err);
    return sendError(res, message, null, statusCode);
  }

  // Error umum atau tak terduga
  console.error(`[Unhandled Error]: ${err.message}`, err.stack);
  return sendError(
    res,
    err.message || "Internal Server Error",
    Env.NODE_ENV === "development" ? err.stack : null,
    500
  );
};