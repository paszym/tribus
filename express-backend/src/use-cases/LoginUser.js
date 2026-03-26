class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(data) {
    if (data.email && data.password) {
      return this.userRepository.login(data);
    }
    throw new Error("User data missing");
  }
}

module.exports = LoginUser;
