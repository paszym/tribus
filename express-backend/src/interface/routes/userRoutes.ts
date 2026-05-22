import { Router } from 'express';
import type { UserController } from '@/interface/controllers/UserController';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Zarządzanie, autoryzacja i autentykacja użytkowników
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     UserFavourites:
 *       type: object
 *       properties:
 *         stops:
 *           type: array
 *           items:
 *             type: number
 *         lines:
 *           type: array
 *           items:
 *             type: number
 *         vehicles:
 *           type: array
 *           items:
 *             type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: ERROR_NAME
 *         message:
 *           type: string
 *           example: Error description
 */

export function createUserRouter(controller: UserController): Router {
  const router = Router();

  /**
   * @swagger
   * /users/register:
   *   post:
   *     summary: Rejestracja nowego użytkownika
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       201:
   *         description: Użytkownik zarejestrowany
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthTokens'
   *       409:
   *         description: Email już istnieje
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       422:
   *         description: Nieprawidłowe dane wejściowe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/add', (req, res, next) => controller.register(req, res, next));

  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Logowanie użytkownika
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Zalogowano pomyślnie
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthTokens'
   *       401:
   *         description: Nieprawidłowe dane logowania
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/login', (req, res, next) => controller.login(req, res, next));

  /**
   * @swagger
   * /users/logout:
   *   post:
   *     summary: Wylogowanie użytkownika
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [refreshToken]
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Wylogowano pomyślnie
   *       401:
   *         description: Token nie znaleziony
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/logout', (req, res, next) => controller.logout(req, res, next));

  /**
   * @swagger
   * /users/refresh:
   *   get:
   *     summary: Odświeżenie pary tokenów
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tokeny odświeżone
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthTokens'
   *       401:
   *         description: Token nieważny lub wygasły
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/refresh', (req, res, next) => controller.refreshToken(req, res, next));

  /**
   * @swagger
   * /users/favourites:
   *   get:
   *     summary: Pobierz ulubione użytkownika
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Ulubione użytkownika
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserFavourites'
   *       401:
   *         description: Brak lub nieważny token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Użytkownik nie znaleziony
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get('/user/favourites', (req, res, next) => controller.getFavourites(req, res, next));

  /**
   * @swagger
   * /users/favourites:
   *   post:
   *     summary: Zapisz ulubione użytkownika
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserFavourites'
   *     responses:
   *       200:
   *         description: Ulubione zapisane
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserFavourites'
   *       401:
   *         description: Brak lub nieważny token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       422:
   *         description: Nieprawidłowa struktura ulubionych
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/user/favourites', (req, res, next) => controller.setFavourites(req, res, next));

  return router;
}
