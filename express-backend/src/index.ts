import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { env } from '@/config/env';
import { connectMongo, closeMongo } from '@/infrastructure/database/mongo';
import { createCollections } from '@/infrastructure/database/collections';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { TokenRepository } from '@/infrastructure/repositories/TokenRepository';
import { BcryptPasswordHasher } from '@/infrastructure/BcryptPasswordHasher';
import { UserController } from '@/interface/controllers/UserController';
import { createUserRouter } from '@/interface/routes/userRoutes';
import { errorHandler } from '@/shared/errors/errorHandler';

import ztmRoutes from '@/interface/routes/ztmRoutes';

const isDev = env.nodeEnv !== 'production';
const BASE_URL = isDev ? `http://localhost:${env.port}` : (env.baseUrl ?? '');
const allowedOrigins = isDev ? ['http://localhost:5173'] : ['https://tribus-alpha.vercel.app'];

const previewRegex: RegExp = env.allowedOriginRegex ? new RegExp(env.allowedOriginRegex) : /(?!)/;

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, isDev);
    const isAllowed = allowedOrigins.includes(origin) || previewRegex.test(origin);
    return isAllowed
      ? callback(null, true)
      : callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
};

async function bootstrap(): Promise<void> {
  const app = express();

  console.info(`[Server] Starting...`);

  app.use(helmet());
  app.use(morgan(isDev ? 'dev' : 'combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors(corsOptions));

  const db = await connectMongo();

  if (db) {
    const collections = createCollections(db);
    const userRepository = new UserRepository(collections.users);
    const tokenRepository = new TokenRepository(collections.tokens);
    const passwordHasher = new BcryptPasswordHasher();
    const userController = new UserController(userRepository, tokenRepository, passwordHasher);
    app.use('/users', createUserRouter(userController));
  } else {
    console.warn('[Server] User routes unavailable — no database connection');
    app.use('/users', (_req: Request, res: Response) => {
      res.status(503).json({ code: 'SERVICE_UNAVAILABLE', message: 'User service unavailable' });
    });
  }

  app.use('/ztm', ztmRoutes);

  app.get('/', (_req: Request, res: Response) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TriBus API</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        h1 { color: #333; margin-bottom: 1rem; }
        a { color: #0070f3; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .container {
          padding: 2rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>TriBus API</h1>
        <p>Swagger dostępny pod <a href="/api-docs" target="_blank">/api-docs</a></p>
      </div>
    </body>
    </html>
  `);
  });

  const swaggerOptions: swaggerJsDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: { title: 'TriBus API', version: '1.1.0' },
      servers: [{ url: BASE_URL }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
    apis: ['src/interface/routes/*.ts'],
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Endpoint not found' });
  });

  app.use(errorHandler);

  const server = app.listen(env.port, () => {
    console.info(`[Server] Running at ${BASE_URL}`);
    console.info(`[Server] Swagger at ${BASE_URL}/api-docs`);
  });

  async function gracefulShutdown(signal: string): Promise<void> {
    console.info(`[Server] ${signal} received. Shutting down...`);

    server.close(() => console.info('[Server] HTTP server closed'));

    try {
      await closeMongo();
    } catch (error) {
      if (error instanceof Error) console.error('[Server] Error closing MongoDB:', error.message);
    }

    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);

    process.exit(0);
  }

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
  process.on('unhandledRejection', (reason) =>
    console.error('[Process] Unhandled rejection:', reason),
  );
  process.on('uncaughtException', (error) => {
    console.error('[Process] Uncaught exception:', error);
    process.exit(1);
  });
}
void bootstrap();
