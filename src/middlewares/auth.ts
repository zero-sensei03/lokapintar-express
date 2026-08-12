import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import { Role } from "../generated/prisma/client";

/**
 * Middleware untuk memverifikasi apakah pengguna terautentikasi (Bearer Token)
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Akses ditolak. Token tidak ditemukan.", null, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Menyimpan data payload JWT (userId & role) ke request
    next();
  } catch (error) {
    return sendError(res, "Token tidak valid atau sudah kadaluwarsa.", null, 401);
  }
};

/**
 * Middleware Role-based Access Control (RBAC)
 * Contoh penggunaan: authorizeRoles("SUPERADMIN", "EDUCATOR")
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", null, 401);
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return sendError(
        res,
        "Anda tidak memiliki hak akses untuk melakukan aksi ini.",
        null,
        403
      );
    }

    next();
  };
};