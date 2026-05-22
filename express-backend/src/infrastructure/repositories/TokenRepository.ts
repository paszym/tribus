import { ObjectId } from 'mongodb';
import type { Collection, WithId } from 'mongodb';
import type { TokenRepositoryInterface } from '@/domain/interfaces/TokenRepositoryInterface';
import type { RefreshToken } from '@/domain/entities/RefreshToken';
import type { RefreshTokenDocument } from '@/infrastructure/database/types/RefreshTokenDocument';

export class TokenRepository implements TokenRepositoryInterface {
  constructor(private readonly collection: Collection<RefreshTokenDocument>) {}

  private toRefreshToken(doc: WithId<RefreshTokenDocument>): RefreshToken {
    return {
      token: doc.token,
      userId: doc.userId.toString(),
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }

  async getAll(): Promise<RefreshToken[] | null> {
    const docs = await this.collection.find().toArray();
    return docs ? docs.map((doc) => this.toRefreshToken(doc)) : null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const doc = await this.collection.findOne({ token });
    return doc ? this.toRefreshToken(doc) : null;
  }

  async save(token: RefreshToken): Promise<void> {
    const doc: RefreshTokenDocument = {
      token: token.token,
      userId: new ObjectId(token.userId),
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    };
    await this.collection.insertOne(doc);
  }

  async deleteByToken(token: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ token });
    return result.deletedCount === 1;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.collection.deleteMany({ userId: new ObjectId(userId) });
  }
}
