import type { ObjectId } from 'mongodb';
import type { UserFavourites } from '@/domain/entities/User';

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password: string;
  favourites: UserFavourites;
}
