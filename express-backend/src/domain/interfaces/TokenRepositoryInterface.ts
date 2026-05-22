import type { RefreshToken } from '@/domain/entities/RefreshToken';

export interface TokenRepositoryInterface {
  findByToken(token: string): Promise<RefreshToken | null>;
  save(token: RefreshToken): Promise<void>;
  deleteByToken(token: string): Promise<boolean>;
  deleteAllByUserId(userId: string): Promise<void>;
}
