const { MongoClient } = require("mongodb");

async function connectDatabase() {
  try {
    const client = new MongoClient("mongodb://localhost:27017", {});
    await client.connect();
    const db = client.db("mydb");
    console.log("Połączono z bazą danych mongodb://localhost:27017");
    return {
      users: db.collection("users"),
      tokens: db.collection("tokens"),
    };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw error;
  }
}

module.exports = connectDatabase;
