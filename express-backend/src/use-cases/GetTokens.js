class GetTokens {
    constructor(tokenRepository) {
      this.tokenRepository = tokenRepository;
    }
  
    async execute() {
      return await this.tokenRepository.getAll();
    }
  }
  
  module.exports = GetTokens;
  