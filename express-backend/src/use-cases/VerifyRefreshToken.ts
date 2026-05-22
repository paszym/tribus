import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import type { TokenRepositoryInterface } from '@/domain/interfaces/TokenRepositoryInterface';
import { TokenInvalidError, TokenExpiredError, TokenNotFoundError } from '@/domain/errors';

export interface RefreshTokenPayload {
  userId: string;
  userEmail: string;
}

export class VerifyRefreshToken {
  constructor(private readonly tokenRepository: TokenRepositoryInterface) {}

  async execute(token: string): Promise<RefreshTokenPayload> {
    const stored = await this.tokenRepository.findByToken(token);
    if (!stored) throw new TokenNotFoundError();

    if (stored.expiresAt < new Date()) {
      await this.tokenRepository.deleteByToken(token);
      throw new TokenExpiredError();
    }

    try {
      const payload = jwt.verify(token, env.jwtRefreshKey) as RefreshTokenPayload;
      return payload;
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) throw new TokenExpiredError();
      throw new TokenInvalidError();
    }
  }
}
