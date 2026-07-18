import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

type Schemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details: error.errors,
          },
        });
      }
      return next(error);
    }
  };
}
