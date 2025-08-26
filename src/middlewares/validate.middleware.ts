import { ZodError, z } from 'zod';
import { NextFunction, Request, Response } from 'express';

export const validateBody = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      const z = e as ZodError;
      res.status(400).json({ error: 'ValidationError', details: z.flatten() });
    }
  };
};
