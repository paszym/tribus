import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LogoutSchema = z.object({
  refreshToken: z.string(),
});

export const FavouritesSchema = z.object({
  stops: z.array(z.number()),
  lines: z.array(z.number()),
  vehicles: z.array(z.number()),
});
