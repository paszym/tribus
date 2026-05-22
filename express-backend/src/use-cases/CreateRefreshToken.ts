import type { TokenRepositoryInterface } from '@/domain/interfaces/TokenRepositoryInterface';
import type { RefreshToken } from '@/domain/entities/RefreshToken';

interface CreateRefreshTokenInput {
  token: string;
  userId: string;
  expiresAt: Date;
}

export class CreateRefreshToken {
  constructor(private readonly tokenRepository: TokenRepositoryInterface) {}

  async execute(data: CreateRefreshTokenInput): Promise<void> {
    await this.tokenRepository.deleteAllByUserId(data.userId);

    const refreshToken: RefreshToken = {
      token: data.token,
      userId: data.userId,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };

    await this.tokenRepository.save(refreshToken);
  }
}
