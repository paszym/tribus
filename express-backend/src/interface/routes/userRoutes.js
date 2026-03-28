const express = require("express");
const UserController = require("../controllers/UserController");
const UserRepository = require("../../infrastructure/repositories/UserRepository");
const TokenRepository = require("../../infrastructure/repositories/TokenRepository.js");
const connectDatabase = require("../../infrastructure/database/database");

const router = express.Router();

(async () => {
  try {
    const database = await connectDatabase();
    const userRepository = new UserRepository(database);
    const tokenRepository = new TokenRepository(database);
    const userController = new UserController(userRepository, tokenRepository);

    /**
 * @swagger
 * tags:
 *   name: Users
 *   description: API do zarządzania, autoryzacji i autentykacji użytkowników
 */

/**
 * @swagger
 * /users/user/favourites:
 *   get:
 *     summary: Pobierz ulubione dane użytkownika
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sukces - zwrócone ulubione dane użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favourites:
 *                   type: object
 *                   properties:
 *                     stops:
 *                       type: array
 *                       items:
 *                         type: number
 *                     vehicles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     lines:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Nieautoryzowany - brak poprawnego tokenu w nagłówku Authorization
 */
router.get("/user/favourites", (req, res) => {
  userController.getUserData(req, res);
});

/**
 * @swagger
 * /users/user/favourites:
 *   post:
 *     summary: Ustaw ulubione dane użytkownika
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               favourites:
 *                 type: object
 *                 properties:
 *                   stops:
 *                     type: array
 *                     items:
 *                       type: number
 *                   vehicles:
 *                     type: array
 *                     items:
 *                       type: string
 *                   lines:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Sukces - ulubione dane zostały zapisane
 *       400:
 *         description: Nieprawidłowe dane wejściowe
 *       401:
 *         description: Nieautoryzowany - brak poprawnego tokenu w nagłówku Authorization
 */
router.post("/user/favourites", (req, res) => {
  userController.setUserData(req, res);
});


    /**
     * @swagger
     * /users/add:
     *   post:
     *     summary: Dodaj nowego użytkownika
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       201:
     *         description: Sukces - użytkownik został dodany
     *       400:
     *         description: Nieprawidłowe dane wejściowe
     */
    router.post("/add", (req, res) => {
      userController.createUser(req, res);
    });

    /**
     * @swagger
     * /users/login:
     *   post:
     *     summary: Zaloguj użytkownika
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Sukces - zalogowano użytkownika i zwrócono tokeny
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                 refreshToken:
     *                   type: string
     *       401:
     *         description: Nieautoryzowany - błędne dane logowania
     */
    router.post("/login", (req, res) => {
      userController.loginUser(req, res);
    });

    /**
     * @swagger
     * /users/logout:
     *   post:
     *     summary: Wyloguj użytkownika
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: Sukces - użytkownik został wylogowany
     *       401:
     *         description: Nieautoryzowany - błąd podczas wylogowywania
     */
    router.post("/logout", (req, res) => {
      userController.logoutUser(req, res);
    });

    /**
     * @swagger
     * /users/refresh:
     *   get:
     *     summary: Odśwież token użytkownika
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Sukces - zwrócono nowy token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                 refreshToken:
     *                   type: string
     *       401:
     *         description: Nieautoryzowany - brak poprawnego tokenu w nagłówku Authorization
     */
    router.get("/refresh", (req, res) => {
      userController.refreshToken(req, res);
    });
  } catch (error) {
    console.error("Error initializing router:", error.message);
  }
})();

module.exports = router;
