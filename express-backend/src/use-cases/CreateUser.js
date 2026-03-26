const User = require("../domain/entities/User");
const bcrypt = require("bcrypt");

class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(data) {
    if (data.email && data.password) {
      const user = new User({
        email: data.email,
        password: bcrypt.hashSync(data.password, 10),
        favourites: {
          stops:
            data.favourites && data.favourites.stops
              ? data.favourites.stops
              : [],
          lines:
            data.favourites && data.favourites.lines
              ? data.favourites.lines
              : [],
          vehicles:
            data.favourites && data.favourites.vehicles
              ? data.favourites.vehicles
              : [],
        },
      });
      await this.userRepository.save(user);
      return user;
    }
    throw new Error("User data missing");
  }
}

module.exports = CreateUser;
