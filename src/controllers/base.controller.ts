import { ApiResponse } from '@/types/api.type';
import { NextFunction, Response } from 'express';
export abstract class BaseController {
  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  protected sendError(res: Response, message: string, statusCode: number = 400): void {
    const response: ApiResponse<null> = {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }
}
