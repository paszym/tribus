import type { UserRepositoryInterface } from '@/domain/interfaces/UserRepositoryInterface';
import type { PasswordHasherInterface } from '@/domain/interfaces/PasswordHasherInterface';
import type { User } from '@/domain/entities/User';
import { InvalidCredentialsError } from '@/domain/errors';

interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  async execute(data: LoginUserInput): Promise<User> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new InvalidCredentialsError();

    const isValid = await this.passwordHasher.compare(data.password, user.password);
    if (!isValid) throw new InvalidCredentialsError();

    return user;
  }
}
