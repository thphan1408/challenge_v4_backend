import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string) || uuid();
  res.setHeader('x-request-id', id);
  (req as any).requestId = id;
  next();
};
