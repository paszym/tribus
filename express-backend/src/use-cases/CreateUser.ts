import type { UserRepositoryInterface } from '@/domain/interfaces/UserRepositoryInterface';
import type { PasswordHasherInterface } from '@/domain/interfaces/PasswordHasherInterface';
import type { User } from '@/domain/entities/User';
import { InvalidUserDataError } from '@/domain/errors';

interface CreateUserInput {
  email: string;
  password: string;
}

export class CreateUser {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  async execute(data: CreateUserInput): Promise<User> {
    if (!data.email || !data.password) {
      throw new InvalidUserDataError('Email and password are required');
    }

    const hashedPassword = await this.passwordHasher.hash(data.password);

    const user: Omit<User, 'id'> = {
      email: data.email,
      password: hashedPassword,
      favourites: { stops: [], lines: [], vehicles: [] },
    };

    // EmailAlreadyExistsError może polecieć z repozytorium — bubluje wyżej
    return this.userRepository.create(user);
  }
}
