export abstract class DomainError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'EMAIL_ALREADY_EXISTS_ERROR';
  constructor(email?: string) {
    super(email ? `Email ${email} already exists` : 'Email already exits');
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  constructor(id?: string) {
    super(id ? `User ${id} not found` : 'User not found');
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS_ERROR';
  constructor() {
    super('Invalid credentials');
  }
}

export class InvalidUserDataError extends DomainError {
  readonly code = 'INVALID_USER_DATA_ERROR';
  constructor(message: string) {
    super(message ? `Invalid user data: ${message}` : `Invalid user data`);
  }
}

export class TokenExpiredError extends DomainError {
  readonly code = 'TOKEN_EXPIRED_ERROR';
  constructor(token?: string) {
    super(token ? `Token ${token} expired` : `Token expired`);
  }
}

export class TokenInvalidError extends DomainError {
  readonly code = 'TOKEN_INVALID_ERROR';
  constructor(token?: string) {
    super(token ? `Token ${token} invalid` : `Token invalid`);
  }
}

export class TokenNotFoundError extends DomainError {
  readonly code = 'TOKEN_NOT_FOUND_ERROR';
  constructor(token?: string) {
    super(token ? `Token ${token} not found` : `Token not found`);
  }
}
