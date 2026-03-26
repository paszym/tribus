const jwt = require('jsonwebtoken');

class VerifyAccessToken {
  constructor(tokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  async execute(token) {
    try {
      if (token.expiresAt < new Date()) {
        throw new Error("Invalid access token");
      }
      const payload = jwt.verify(token, process.env.JWT_ACCESS_KEY);
      return payload;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }
}

module.exports = VerifyAccessToken;
