const { ObjectId } = require("mongodb");

const UserRepositoryInterface = require("../../domain/interfaces/UserRepositoryInterface");
const bcrypt = require("bcrypt");

class UserRepository extends UserRepositoryInterface {
  constructor(database) {
    super();
    this.database = database;
  }

  async findById(id) {
    return await this.database.users.findOne({
      _id: ObjectId.createFromHexString(id),
    });
  }

  async getAll() {
    try {
      return await this.database.users.find().toArray();
    } catch (error) {
      console.error("Error retrieving users:", error);
      throw error;
    }
  }

  async setFavourites(userId, favourites) {
    try {
      if (!favourites || typeof favourites !== "object" || !("stops" in favourites) || !("lines" in favourites) || !("vehicles" in favourites)) {
        throw new Error("Invalid favourites structure");
      }

      const updatedUser = await this.database.users.findOneAndUpdate(
        { _id: ObjectId.createFromHexString(userId) },
        { $set: { favourites: favourites } },
        { returnDocument: "after" }
      );

      if (!updatedUser.favourites) {
        throw new Error("User not found");
      }

      return updatedUser.favourites;
    } catch (error) {
      console.error("Error retrieving users:", error);
      throw new Error("Error updating user data");
    }
  }

  async login(user) {
    const existingUser = await this.database.users.findOne({
      email: user.email,
    });
    if (!existingUser) {
      throw new Error("Incorrect email or password");
    }
    const isPasswordValid = await bcrypt.compare(
      user.password,
      existingUser.password
    );
    if (!isPasswordValid) {
      throw new Error("Incorrect email or password");
    }
    return existingUser;
  }

  async save(user) {
    const existingUser = await this.database.users.findOne({
      email: user.email,
    });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    return await this.database.users.insertOne(user);
  }
}

module.exports = UserRepository;
