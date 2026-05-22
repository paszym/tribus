import { MongoError, ObjectId } from 'mongodb';
import type { Collection, WithId } from 'mongodb';
import type { UserRepositoryInterface } from '@/domain/interfaces/UserRepositoryInterface';
import type { User, UserFavourites } from '@/domain/entities/User';
import type { UserDocument } from '@/infrastructure/database/types/UserDocument';
import { UserNotFoundError, UserAlreadyExistsError } from '@/domain/errors';

export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly collection: Collection<UserDocument>) {}

  // ---------------------------------------------------------------------------
  // Mapowanie MongoDB → domena (ObjectId → string, bez szczegółów Mongo)
  // ---------------------------------------------------------------------------
  private toUser(doc: WithId<UserDocument>): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      favourites: doc.favourites,
    };
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    return doc ? this.toUser(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ email: email });
    return doc ? this.toUser(doc) : null;
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    try {
      const result = await this.collection.insertOne(user);
      return { ...user, id: result.insertedId.toString() };
    } catch (error: unknown) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new UserAlreadyExistsError(user.email);
      }
      throw error;
    }
  }

  async setFavourites(userId: string, favourites: UserFavourites): Promise<UserFavourites> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { favourites } },
      { returnDocument: 'after' },
    );

    if (!result) throw new UserNotFoundError(userId);
    return result.favourites;
  }
}
