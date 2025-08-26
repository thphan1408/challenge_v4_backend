import { ApiError } from '@/libs/http.lib';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || undefined;

  res.status(status).json({ status: message, code });
};
