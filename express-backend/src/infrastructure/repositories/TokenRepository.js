const { ObjectId } = require("mongodb");

class TokenRepository {
  constructor(database) {
    this.database = database;
  }

  async getAll() {
    try {
      return await this.database.tokens.find().toArray();
    } catch (error) {
      console.error("Error retrieving tokens:", error);
      throw error;
    }
  }

  async findByToken(token) {
    return await this.database.tokens.findOne({"token": token});
  }

  async save(token) {
    try{
      return await this.database.tokens.insertOne(token);
    }
    catch(error){
      throw error;
    }
  }

  async deleteByToken(token) {
    try {
      return await this.database.tokens.deleteOne({"token": token});
    } catch (error) {
      console.error("Error deleting token:", error);
      throw error;
    }
  }

  async deleteAllByUserId(userId) {
    try {
      return await this.database.tokens.deleteMany({ "userId": ObjectId.createFromHexString(userId) });
    } catch (error) {
      console.error("Error deleting tokens by userId:", error);
      throw error;
    }
  }
}

module.exports = TokenRepository;
