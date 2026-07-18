import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: err.errors,
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "Erro interno"
          : err instanceof Error
            ? err.message
            : "Erro interno",
    },
  });
}
