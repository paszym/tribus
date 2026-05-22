import type { TokenRepositoryInterface } from '@/domain/interfaces/TokenRepositoryInterface';
import { TokenNotFoundError, InvalidUserDataError } from '@/domain/errors';

interface LogoutUserInput {
  refreshToken: string;
}

export class LogoutUser {
  constructor(private readonly tokenRepository: TokenRepositoryInterface) {}

  async execute(data: LogoutUserInput): Promise<void> {
    if (!data.refreshToken) {
      throw new InvalidUserDataError('Refresh token is required');
    }

    const deleted = await this.tokenRepository.deleteByToken(data.refreshToken);
    if (!deleted) throw new TokenNotFoundError();
  }
}
