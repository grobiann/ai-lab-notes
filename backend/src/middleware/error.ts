import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  console.error(`[Error ${status}]: ${message}`, err);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
}
