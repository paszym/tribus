const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDatabase() {
  if (db) return db;

  try {
    client = new MongoClient(process.env.MONGO_URI);

    await client.connect();
    db = client.db();

    console.log(
      `MongoDB connected (${process.env.NODE_ENV})`
    );

    return {
      users: db.collection("users"),
      tokens: db.collection("tokens"),
    };
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

module.exports = connectDatabase;