import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

import { CreateUser } from '@/use-cases/CreateUser';
import { LoginUser } from '@/use-cases/LoginUser';
import { LogoutUser } from '@/use-cases/LogoutUser';
import { GetUser } from '@/use-cases/GetUser';
import { SetUserData } from '@/use-cases/SetUserData';
import { CreateRefreshToken } from '@/use-cases/CreateRefreshToken';
import { VerifyAccessToken } from '@/use-cases/VerifyAccessToken';
import { VerifyRefreshToken } from '@/use-cases/VerifyRefreshToken';

import type { UserRepositoryInterface } from '@/domain/interfaces/UserRepositoryInterface';
import type { TokenRepositoryInterface } from '@/domain/interfaces/TokenRepositoryInterface';
import type { PasswordHasherInterface } from '@/domain/interfaces/PasswordHasherInterface';
import { TokenInvalidError } from '@/domain/errors';
import { CreateUserSchema, FavouritesSchema, LogoutSchema } from '@/shared/schemas/userSchemas';

export class UserController {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly tokenRepository: TokenRepositoryInterface,
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  private extractBearerToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new TokenInvalidError();
    return authHeader.split(' ')[1] ?? '';
  }

  private async issueTokenPair(
    userId: string,
    userEmail: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId, userEmail }, env.jwtAccessKey, {
      expiresIn: env.jwtAccessExpTime,
    });

    const refreshToken = jwt.sign({ userId, userEmail }, env.jwtRefreshKey, {
      expiresIn: env.jwtRefreshExpTime,
    });

    const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;
    const expiresAt = new Date((decoded.exp ?? 0) * 1000);

    await new CreateRefreshToken(this.tokenRepository).execute({
      token: refreshToken,
      userId,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = CreateUserSchema.parse(req.body);
      const user = await new CreateUser(this.userRepository, this.passwordHasher).execute(body);
      const tokens = await this.issueTokenPair(user.id, user.email);
      res.status(201).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = CreateUserSchema.parse(req.body);
      const user = await new LoginUser(this.userRepository, this.passwordHasher).execute(body);
      const tokens = await this.issueTokenPair(user.id, user.email);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = LogoutSchema.parse(req.body);
      await new LogoutUser(this.tokenRepository).execute(body);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getFavourites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractBearerToken(req);
      const { userId } = new VerifyAccessToken().execute(token);
      const user = await new GetUser(this.userRepository).execute(userId);
      res.status(200).json(user.favourites);
    } catch (error) {
      next(error);
    }
  }

  async setFavourites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractBearerToken(req);
      const { userId } = new VerifyAccessToken().execute(token);
      const body = FavouritesSchema.parse(req.body);
      const updatedFavourites = await new SetUserData(this.userRepository).execute(userId, body);
      res.status(200).json(updatedFavourites);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractBearerToken(req);
      const { userId, userEmail } = await new VerifyRefreshToken(this.tokenRepository).execute(
        token,
      );
      const tokens = await this.issueTokenPair(userId, userEmail);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }
}
