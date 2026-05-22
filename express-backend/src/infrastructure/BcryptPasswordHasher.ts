import bcrypt from 'bcrypt';
import type { PasswordHasherInterface } from '@/domain/interfaces/PasswordHasherInterface';

const SALT_ROUNDS = 10;

export class BcryptPasswordHasher implements PasswordHasherInterface {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
