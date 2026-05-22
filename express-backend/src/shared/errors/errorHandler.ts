import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '@/domain/errors';
import { MongoError } from 'mongodb';
import { AppError } from './AppError';
import { ZodError } from 'zod';
import { isAxiosError } from 'axios';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ code: err.code, message: err.message });
    return;
  }
  if (err instanceof DomainError) {
    const appError = AppError.fromDomain(err);
    res.status(appError.statusCode).json({ code: appError.code, message: appError.message });
    return;
  }
  if (err instanceof ZodError) {
    const message = err.message ? err.message : 'Invalid input';
    res.status(422).json({ code: 'VALIDATION_ERROR', message });
    return;
  }
  if (err instanceof MongoError) {
    const message = err.message ? err.message : 'Mongodb error';
    res.status(500).json({ code: 'MONGODB_CONNECTION_ERROR', message });
    return;
  }
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 502;
    res.status(status).json({ code: 'UPSTREAM_ERROR', message: 'External API error' });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
}
