const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favourites: {
    stops: [{ type: Number }],
    lines: [{ type: Number }],
    vehicles: [{ type: Number }],
  },
});

module.exports = mongoose.model("User", userSchema);
