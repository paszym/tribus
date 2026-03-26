class SetUserData {
    constructor(userRepository) {
      this.userRepository = userRepository;
    }
  
    async execute(userId, favourites) {
      return await this.userRepository.setFavourites(userId, favourites);
    }
  }
  
  module.exports = SetUserData;
  