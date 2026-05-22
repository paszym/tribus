import type { DomainError } from '@/domain/errors';
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidUserDataError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
  TokenNotFoundError,
} from '@/domain/errors';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }

  static fromDomain(e: DomainError): AppError {
    if (e instanceof UserNotFoundError) return new AppError(404, e.code, e.message);
    if (e instanceof InvalidCredentialsError) return new AppError(401, e.code, e.message);
    if (e instanceof UserAlreadyExistsError) return new AppError(409, e.code, e.message);
    if (e instanceof TokenExpiredError) return new AppError(401, e.code, e.message);
    if (e instanceof TokenInvalidError) return new AppError(401, e.code, e.message);
    if (e instanceof InvalidUserDataError) return new AppError(422, e.code, e.message);
    if (e instanceof TokenNotFoundError) return new AppError(401, e.code, e.message);

    return new AppError(500, 'INTERNAL_ERROR', 'Internal server error');
  }
}
