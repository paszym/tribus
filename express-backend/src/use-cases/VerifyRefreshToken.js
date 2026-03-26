const jwt = require("jsonwebtoken");

class VerifyRefreshToken {
  constructor(tokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  async execute(token) {
    try {
      const storedToken = await this.tokenRepository.findByToken(token);
      if (!storedToken) {
        throw new Error("Invalid refresh token");
      }

      if (storedToken.expiresAt < new Date()) {
        await this.tokenRepository.delete(token);
        throw new Error("Invalid refresh token");
      }

      const payload = jwt.verify(token, process.env.JWT_REFRESH_KEY);
      return payload;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}

module.exports = VerifyRefreshToken;
