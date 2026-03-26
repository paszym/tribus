class LogoutUser {
    constructor(tokenRepository) {
      this.tokenRepository = tokenRepository;
    }
  
    async execute(data) {
      if (data.refreshToken) {
        return await this.tokenRepository.deleteByToken(data.refreshToken);
      }
      throw new Error("Token missing");
    }
  }
  
  module.exports = LogoutUser;
  