import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { TokenInvalidError, TokenExpiredError } from '@/domain/errors';

export interface AccessTokenPayload {
  userId: string;
  userEmail: string;
}

export class VerifyAccessToken {
  execute(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, env.jwtAccessKey) as AccessTokenPayload;
      return payload;
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
      throw new TokenInvalidError();
    }
  }
}
