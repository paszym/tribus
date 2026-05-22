import type { ObjectId } from 'mongodb';

export interface RefreshTokenDocument {
  _id?: ObjectId;
  token: string;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
}
