/** @format */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    type: String,
    default: undefined,
  },
  displayName: {
    type: String,
    default: undefined,
  },
  image: {
    type: String,
    default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/1200px-Circle-icons-profile.svg.png",
  },
  cartItems: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
