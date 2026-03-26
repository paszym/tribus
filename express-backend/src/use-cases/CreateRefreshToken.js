const RefreshToken = require("../domain/entities/RefreshToken");

class CreateRefreshToken {
  constructor(tokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  async execute(data) {
    try {
      const refreshToken = new RefreshToken({
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      });

      await this.tokenRepository.deleteAllByUserId(data.userId);
      await this.tokenRepository.save(refreshToken);
    } catch (error) {
      throw new Error("Error creating access token");
    }
  }
}

module.exports = CreateRefreshToken;
