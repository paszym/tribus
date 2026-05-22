import type { User, UserFavourites } from '@/domain/entities/User';

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  setFavourites(userId: string, favourites: UserFavourites): Promise<UserFavourites>;
}
