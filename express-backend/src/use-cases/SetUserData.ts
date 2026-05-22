import type { UserRepositoryInterface } from '@/domain/interfaces/UserRepositoryInterface';
import type { UserFavourites } from '@/domain/entities/User';
import { InvalidUserDataError } from '@/domain/errors';

export class SetUserData {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(userId: string, favourites: UserFavourites): Promise<UserFavourites> {
    if (
      !favourites ||
      !Array.isArray(favourites.stops) ||
      !Array.isArray(favourites.lines) ||
      !Array.isArray(favourites.vehicles)
    ) {
      throw new InvalidUserDataError('Invalid favourites structure');
    }

    return this.userRepository.setFavourites(userId, favourites);
  }
}
