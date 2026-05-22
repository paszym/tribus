import type { UserRepositoryInterface } from '@/domain/interfaces/UserRepositoryInterface';
import type { User } from '@/domain/entities/User';
import { UserNotFoundError } from '@/domain/errors';

export class GetUser {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
}
