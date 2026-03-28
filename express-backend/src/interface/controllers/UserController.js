const CreateUser = require("../../use-cases/CreateUser");
const GetUser = require("../../use-cases/GetUser");
const SetUserData = require("../../use-cases/SetUserData");
const LoginUser = require("../../use-cases/LoginUser");
const LogoutUser = require("../../use-cases/LogoutUser");
const VerifyAccessToken = require("../../use-cases/VerifyAccessToken");
const CreateRefreshToken = require("../../use-cases/CreateRefreshToken");
const VerifyRefreshToken = require("../../use-cases/VerifyRefreshToken");

const jwt = require("jsonwebtoken");

class UserController {
  constructor(userRepository, tokenRepository) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
  }

  async createUser(req, res) {
    const createUser = new CreateUser(this.userRepository);
    try {
      const user = await createUser.execute(req.body);
      const userId = user._id.toString();
      const userEmail = user.email.toString();
      const { accessToken, refreshToken } = await this.createTokens(
        userId,
        userEmail
      );
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserData(req, res) {
    const verifyAccessToken = new VerifyAccessToken(this.tokenRepository);
    const getUser = new GetUser(this.userRepository);
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Authorization token required in auth header" });
      }
      const token = authHeader.split(" ")[1];
      const payload = await verifyAccessToken.execute(token);

      const user = await getUser.execute(payload.userId);
      res.status(200).json(user.favourites);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async setUserData(req, res) {
    const verifyAccessToken = new VerifyAccessToken(this.tokenRepository);
    const setUserData = new SetUserData(this.userRepository);
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Authorization token required in auth header" });
      }
      const token = authHeader.split(" ")[1];
      const payload = await verifyAccessToken.execute(token);

      const updatedFavourites = await setUserData.execute(payload.userId, req.body);
      res.status(200).json(updatedFavourites);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async refreshToken(req, res) {
    const verifyRefreshToken = new VerifyRefreshToken(this.tokenRepository);
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Authorization token required in auth header" });
      }
      const token = authHeader.split(" ")[1];
      const payload = await verifyRefreshToken.execute(token);

      const { accessToken, refreshToken } = await this.createTokens(
        payload.userId,
        payload.userEmail
      );
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: error.message });
    }
  }

  async createTokens(userId, userEmail) {
    const createRefreshToken = new CreateRefreshToken(this.tokenRepository);

    const accessToken = jwt.sign(
      { userId, userEmail },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: process.env.JWT_ACCESS_EXPTIME }
    );

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_KEY, {
      expiresIn: process.env.JWT_REFRESH_EXPTIME,
    });

    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await createRefreshToken.execute({
      token: refreshToken,
      userId: userId,
      expiresAt: expiresAt,
    });
    return { accessToken, refreshToken };
  }

  async logoutUser(req, res) {
    const logoutUser = new LogoutUser(this.tokenRepository);
    try {
      await logoutUser.execute(req.body);
      res.status(200).json({ message: "Wylogowano pomyślnie" });;
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async loginUser(req, res) {
    const loginUser = new LoginUser(this.userRepository);
    try {
      const user = await loginUser.execute(req.body);
      const userId = user._id.toString();
      const userEmail = user.email.toString();
      const { accessToken, refreshToken } = await this.createTokens(
        userId,
        userEmail
      );

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    const getUsers = new GetUsers(this.userRepository);
    try {
      const users = await getUsers.execute();
      res.status(200).json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTokens(req, res) {
    const getTokens = new GetTokens(this.tokenRepository);
    try {
      const tokens = await getTokens.execute();
      res.status(200).json(tokens);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
