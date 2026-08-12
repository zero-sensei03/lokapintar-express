import { Response } from "express";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message: string,
  error: unknown = null,
  statusCode: number = 500
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    ...(error !== null && { error }),
  };
  return res.status(statusCode).json(responsePayload);
};