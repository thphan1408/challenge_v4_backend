import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const wrap =
  <T extends (req: Request, res: Response, next: NextFunction) => any>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
