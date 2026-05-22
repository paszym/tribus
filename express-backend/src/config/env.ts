import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';

const required = [
  'JWT_ACCESS_KEY',
  'JWT_REFRESH_KEY',
  'JWT_ACCESS_EXPTIME',
  'JWT_REFRESH_EXPTIME',
  'NODE_ENV',
  'MONGO_URI',
  'ALLOWED_ORIGIN_REGEX',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

export const env = {
  jwtAccessKey: process.env.JWT_ACCESS_KEY as string,
  jwtRefreshKey: process.env.JWT_REFRESH_KEY as string,
  jwtAccessExpTime: process.env['JWT_ACCESS_EXPTIME'] as SignOptions['expiresIn'],
  jwtRefreshExpTime: process.env['JWT_REFRESH_EXPTIME'] as SignOptions['expiresIn'],
  nodeEnv: process.env.NODE_ENV as string,
  mongoUri: process.env.MONGO_URI as string,
  allowedOriginRegex: process.env.ALLOWED_ORIGIN_REGEX as string,
  port: process.env.PORT as string,
  baseUrl: process.env.BASE_URL as string,
};
